using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.QuotationWizard
{
    public class QuotationWizard : IWizardProcess
    {
        private readonly ILeadService _leadService;
        private readonly IQuoteService _quoteService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ILeadCommunicationService _leadCommunicationService;
        private readonly IRateIndustryService _rateIndustryService;
        private readonly ILookupService _lookupService;
        private readonly IWizardService _wizardService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRolePlayerService _rolePlayerService;

        public QuotationWizard(
            ILeadService leadService,
            IQuoteService quoteService,
            IDocumentGeneratorService documentGeneratorService,
            ILeadCommunicationService leadCommunicationService,
            IRateIndustryService rateIndustryService,
            ILookupService lookupService,
            IWizardService wizardService,
            IProductService productService,
            IProductOptionService productOptionService,
            IRolePlayerService rolePlayerService)
        {
            _leadService = leadService;
            _quoteService = quoteService;
            _documentGeneratorService = documentGeneratorService;
            _leadCommunicationService = leadCommunicationService;
            _rateIndustryService = rateIndustryService;
            _lookupService = lookupService;
            _wizardService = wizardService;
            _productService = productService;
            _productOptionService = productOptionService;
            _rolePlayerService = rolePlayerService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var lead = context.Deserialize<Lead>(context.Data);

            var isUpdate = lead.LeadProducts[0].Quote != null;

            var action = isUpdate ? "Update" : "New";
            var products = string.Empty;

            foreach (var leadProduct in lead.LeadProducts)
            {
                var product = await _productService.GetProduct(leadProduct.ProductId);

                var productOption = await _productOptionService.GetProductOption(Convert.ToInt32(leadProduct.ProductOptionId));
                products += " " + productOption.Name + ",";

                if (!isUpdate)
                {
                    var quoteNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Quote, "QT");
                    var productClass = product.ProductClass;
                    var categoryInsuredEnum = productOption.ProductOptionCategoryInsureds[0].CategoryInsured;
                    CategoryInsuredEnum categoryInsured = CategoryInsuredEnum.Skilled;

                    if (categoryInsuredEnum != null)
                    {
                        categoryInsured = categoryInsuredEnum.Value;
                    }

                    leadProduct.Quote = new Quote
                    {
                        ProductClass = productClass,
                        QuoteNumber = quoteNumber,
                        QuoteStatus = QuoteStatusEnum.New,
                        AverageEarnings = 0,
                        AverageEmployeeCount = 0,
                        Premium = 0,
                        Rate = await GetRate(lead, categoryInsured, productOption),
                        CategoryInsured = productOption.ProductOptionCategoryInsureds[0].CategoryInsured
                    };
                }
            }

            if (isUpdate)
            {
                await setQuoteStatusPending(lead);
            }

            var label = $"{action}{products.TrimEnd(',')} Quote(s): {lead.DisplayName} ({lead.Code})";

            var stepData = new ArrayList() { lead };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var lead = context.Deserialize<Lead>(stepData[0].ToString());

            var parentQuoteId = 0;
            var parentOptionId = 0;
            bool isSendEmail = false;

            var dependencies = await _productService.GetProductOptionDependecies();

            foreach (var leadProduct in lead.LeadProducts)
            {
                var product = await _productService.GetProduct(leadProduct.ProductId);

                if (lead.Company?.IndustryClass == IndustryClassEnum.Metals && product.ProductClass == ProductClassEnum.Statutory)
                {
                    leadProduct.Quote.QuoteStatus = QuoteStatusEnum.AutoAccepted;
                }
                else
                {
                    leadProduct.Quote.QuoteStatus = QuoteStatusEnum.Quoted;
                }

                var isUpdate = leadProduct.Quote.QuoteId > 0;
                if (isUpdate)
                {
                    await _quoteService.UpdateQuote(leadProduct.Quote);
                }
                else
                {
                    await _leadService.UpdateLead(lead);
                    leadProduct.LeadId = lead.LeadId;

                    leadProduct.Quote.QuoteId = await _leadService.CreateLeadProduct(leadProduct);

                    var appliedParentDependencies = dependencies.FindAll(s => s.ProductOptionId == leadProduct.ProductOptionId && s.IndustryClass == lead.Company?.IndustryClass);
                    if (appliedParentDependencies.Count > 0)
                    {
                        parentOptionId = Convert.ToInt32(leadProduct.ProductOptionId);
                        parentQuoteId = leadProduct.Quote.QuoteId;
                    }

                    var appliedChildDependency = dependencies.Find(s => s.ProductOptionId == parentOptionId && s.ChildOptionId == leadProduct.ProductOptionId && s.IndustryClass == lead.Company?.IndustryClass);
                    if (appliedChildDependency != null)
                    {
                        var quote = await _quoteService.GetQuote(leadProduct.Quote.QuoteId);
                        quote.ParentQuoteId = parentQuoteId;
                        await _quoteService.UpdateQuoteDependency(quote);
                    }
                }

                // Start member wizard if class XIII because class XIII is auto accepted
                if (lead.Company?.IndustryClass == IndustryClassEnum.Metals && product.ProductClass == ProductClassEnum.Statutory)
                {
                    var existingMember = await _rolePlayerService.RolePlayerExists(Convert.ToInt32(lead.RolePlayerId));
                    if (!existingMember)
                    {
                        await StartMemberWizard(lead, context);
                    }

                    string wizardType = "expense-based-policy";
                    await StartPolicyWizard(wizardType, Convert.ToInt32(lead.RolePlayerId), leadProduct.Quote, context);
                }
                else
                {
                    // Do not send communication(Quote) if member is class XIII because class XIII is auto accepted
                    try // Failed Communication must not stop wizard from completing successfully
                    {
                        isSendEmail = true;
                    }
                    catch (Exception ex)
                    {
                        var exception = ex;
                    }
                }
            }

            if (isSendEmail)
            {
                await EmailQuote(wizard.Id, lead);
            }
        }

        private async Task EmailQuote(int wizardId, Lead lead)
        {
            string parameters = string.Empty;
            string reportUrl = string.Empty;
            foreach (var leadProduct in lead.LeadProducts)
            {
                switch (leadProduct.Quote.ProductClass)
                {
                    case ProductClassEnum.Statutory:
                        {
                            var _quote = await _quoteService.GetQuoteByParentQuoteId(leadProduct.Quote.QuoteId);
                            if (_quote != null)
                            {
                                parameters = $"&QuoteId={leadProduct.Quote.QuoteId}&rs:Command=ClearSession";
                                reportUrl = "DependencyProductQuote/RMADependencyProductQuoteDB";
                                _ = Task.Run(() => _leadCommunicationService.SendQuote(wizardId, lead, parameters, reportUrl));
                                break;
                            }
                            parameters = $"&QuoteId={leadProduct.Quote.QuoteId}&rs:Command=ClearSession";
                            reportUrl = "StatutoryQuote/RMAStatutoryProductsQuoteDB";
                            _ = Task.Run(() => _leadCommunicationService.SendQuote(wizardId, lead, parameters, reportUrl));
                            break;
                        }
                    case ProductClassEnum.NonStatutory:
                        {
                            parameters = $"&QuoteId={leadProduct.Quote.QuoteId}&rs:Command=ClearSession";
                            reportUrl = "NonStatutoryQuote/RMANonStatutoryProductsQuoteDB";
                            _ = Task.Run(() => _leadCommunicationService.SendQuote(wizardId, lead, parameters, reportUrl));
                            break;
                        }
                    case ProductClassEnum.Assistance:
                        {
                            var _quote = await _quoteService.GetQuote(leadProduct.Quote.QuoteId);
                            if (_quote.ParentQuoteId == null)
                            {
                                parameters = $"&QuoteId={leadProduct.Quote.QuoteId}&rs:Command=ClearSession";
                                reportUrl = "AssistanceQuote/RMAAssistanceProductsQuoteDB";
                                _ = Task.Run(() => _leadCommunicationService.SendQuote(wizardId, lead, parameters, reportUrl));
                            }
                            break;
                        }
                    default:
                        {
                            parameters = $"&QuoteId={leadProduct.Quote.QuoteId}&rs:Command=ClearSession";
                            reportUrl = "StatutoryQuote/RMAStatutoryProductsQuoteDB";
                            _ = Task.Run(() => _leadCommunicationService.SendQuote(wizardId, lead, parameters, reportUrl));
                            break;
                        }
                }
            }
        }

        private async Task<decimal> GetRate(Lead lead, CategoryInsuredEnum categoryInsured, ProductOption productOption)
        {
            decimal rate = 0;
            var skillCategory = SkillSubCategoryEnum.Skilled;
            if (categoryInsured == CategoryInsuredEnum.Skilled)
            {
                skillCategory = SkillSubCategoryEnum.Skilled;
            }
            else if (categoryInsured == CategoryInsuredEnum.UnSkilled)
            {
                skillCategory = SkillSubCategoryEnum.Unskilled;
            }

            if (lead.Company != null)
            {
                if (productOption.BaseRate == null)
                {
                    var industries = await _lookupService.GetIndustries();
                    var industryGroup = Convert.ToString(lead.Company.IndustryClass);
                    var industry = industries.FindLast(s => s.Id == lead.Company.IndustryTypeId);
                    var ratingYear = DateTime.Now.Year;

                    var rates = await _rateIndustryService.GetRates(industry.Name, industryGroup, ratingYear);
                    if (rates?.Count > 0)
                    {
                        rate = rates.Find(s => s.SkillSubCategory == skillCategory).IndRate;
                    }
                }
                else
                {
                    rate = Convert.ToDecimal(productOption.BaseRate);
                }
            }

            return rate;
        }

        private async Task setQuoteStatusPending(Lead lead)
        {
            foreach (var leadProduct in lead.LeadProducts)
            {
                leadProduct.Quote.QuoteStatus = QuoteStatusEnum.PendingApproval;
            }

            await _leadService.UpdateLead(lead);
        }

        public async Task CancelWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var lead = context.Deserialize<Lead>(stepData[0].ToString());

            if (lead.LeadProducts[0].Quote.QuoteStatus == QuoteStatusEnum.PendingApproval)
            {
                lead.LeadProducts[0].Quote.QuoteStatus = QuoteStatusEnum.Quoted;
                await _leadService.UpdateLead(lead);
            }
        }

        public async Task StartMemberWizard(Lead lead, IWizardContext context)
        {
            var startWizardRequest = new StartWizardRequest();
            var member = new RolePlayer();
            member.RolePlayerId = Convert.ToInt32(lead.RolePlayerId);
            member.DisplayName = lead.DisplayName;
            member.RolePlayerBenefitWaitingPeriod = lead.RolePlayerBenefitWaitingPeriod;
            member.PreferredCommunicationTypeId = lead.Contacts.Find(s => s.IsPreferred).CommunicationTypeId;
            member.ClientType = lead.ClientType;

            if (member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email)
            {
                member.EmailAddress = (lead.Contacts.Find(s => s.CommunicationTypeId == (int)CommunicationTypeEnum.Email).CommunicationTypeValue);
            }
            else if (member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS)
            {
                var sms = lead.Contacts.Find(s => s.CommunicationTypeId == (int)CommunicationTypeEnum.SMS);
                member.CellNumber = sms.CommunicationTypeValue;
            }
            else if (member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Phone)
            {
                var phone = lead.Contacts.Find(s => s.CommunicationTypeId == (int)CommunicationTypeEnum.Phone);
                member.TellNumber = phone.CommunicationTypeValue;
            }

            member.RolePlayerIdentificationType = (lead.ClientTypeId == (int)ClientTypeEnum.Individual) ? RolePlayerIdentificationTypeEnum.Person : RolePlayerIdentificationTypeEnum.Company;
            member.JoinDate = DateTime.Now;

            if (member.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person)
            {
                member.Company = null;
                member.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                member.Person = new Person
                {
                    IdType = (IdTypeEnum)lead.Person.IdTypeId,
                    IdNumber = lead.Person.IdNumber,
                    FirstName = lead.Person.FirstName,
                    Surname = lead.Person.Surname
                };
            }
            else
            {
                member.Person = null;
                member.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;
                member.Company = new Company
                {
                    Name = lead.Company.Name,
                    CompanyIdType = (CompanyIdTypeEnum)lead.Company.RegistrationTypeId,
                    IndustryClass = (IndustryClassEnum)lead.Company.IndustryClassId,
                    IndustryId = lead.Company.IndustryTypeId,
                    ReferenceNumber = lead.Company.CompensationFundRegistrationNumber,
                    IdNumber = lead.Company.RegistrationNumber,
                    CompensationFundReferenceNumber = lead.Company.CompensationFundReferenceNumber
                };
            }

            lead.Addresses.ForEach(s =>
            {
                var rolePlayerAddress = new RolePlayerAddress
                {
                    AddressType = (AddressTypeEnum)s.AddressTypeId,
                    City = s.City,
                    CountryId = (int)s.CountryId,
                    PostalCode = s.PostalCode,
                    Province = s.Province,
                    AddressLine1 = s.AddressLine1,
                    AddressLine2 = s.AddressLine2,
                    EffectiveDate = s.CreatedDate
                };

                if (member.RolePlayerAddresses == null)
                {
                    member.RolePlayerAddresses = new List<RolePlayerAddress>();
                }

                member.RolePlayerAddresses.Add(rolePlayerAddress);

            });

            var emailContact = lead.Contacts.Find(s => s.CommunicationTypeId == Convert.ToInt32(CommunicationTypeEnum.Email));
            var rolePlayerContact = new RolePlayerContact
            {
                CommunicationType = CommunicationTypeEnum.Email,
                ContactDesignationType = ContactDesignationTypeEnum.PrimaryContact,
                EmailAddress = emailContact.CommunicationTypeValue,
                Firstname = emailContact.Name,
                Surname = string.Empty,
                RolePlayerId = member.RolePlayerId,
                Title = TitleEnum.Mr
            };
            member.RolePlayerContacts = member.RolePlayerContacts != null ? member.RolePlayerContacts : new List<RolePlayerContact>();
            member.RolePlayerContacts.Add(rolePlayerContact);

            startWizardRequest.Data = context.Serialize(member);
            startWizardRequest.LinkedItemId = lead.LeadId;
            startWizardRequest.Type = "new-member";
            await _wizardService.StartWizard(startWizardRequest);
        }

        public async Task StartPolicyWizard(string wizardType, int rolePlayerId, Quote quote, IWizardContext context)
        {
            var startWizardRequest = new StartWizardRequest
            {
                Type = wizardType,  //This is dynamic based on the Product/Option set above
                LinkedItemId = rolePlayerId,
                Data = context.Serialize(quote),
                RequestInitiatedByBackgroundProcess = true
            };

            await _wizardService.StartWizard(startWizardRequest);
        }

        #region Not Implemented
        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
        }

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }
        private RuleResult GetRuleResult(bool success, string message, string ruleName)
        {
            var messages = new List<string> { message };

            return new RuleResult
            {
                MessageList = messages,
                Passed = success,
                RuleName = ruleName
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var lead = context.Deserialize<Lead>(stepData[0].ToString());
            lead.LeadProducts[0].Quote.QuoteStatus = QuoteStatusEnum.Rejected;
            await _leadService.UpdateLead(lead);
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            return;
        }
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }
}
