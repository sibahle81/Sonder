using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Constants;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ExpenseBasedPolicyWizard
{
    public class ExpenseBasedPolicyWizard : IWizardProcess
    {
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ILeadService _leadService;
        private readonly IPolicyService _policyService;
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IIndustryService _industryService;
        private readonly IDeclarationService _declarationService;
        private readonly IRateIndustryService _rateIndustryService;
        private readonly ILookupService _lookupService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;

        public ExpenseBasedPolicyWizard(
            IDocumentGeneratorService documentGeneratorService,
            ILeadService leadService,
            IPolicyService policyService,
            IConfigurationService configurationService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerService rolePlayerService,
            IIndustryService industryService,
            IDeclarationService declarationService,
            IRateIndustryService rateIndustryService,
            ILookupService lookupService,
            IProductService productService,
            IProductOptionService productOptionService)
        {
            _documentGeneratorService = documentGeneratorService;
            _leadService = leadService;
            _policyService = policyService;
            _configurationService = configurationService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerService = rolePlayerService;
            _industryService = industryService;
            _declarationService = declarationService;
            _rateIndustryService = rateIndustryService;
            _lookupService = lookupService;
            _productService = productService;
            _productOptionService = productOptionService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var quote = context.Deserialize<Quote>(context.Data);

            var existingPolicy = await _policyService.GetPolicyByQuoteId(quote.QuoteId);
            var policyId = existingPolicy == null ? await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber) : existingPolicy.PolicyId;
            var policyNumber = existingPolicy == null ? await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, "02") : existingPolicy.PolicyNumber;

            if (quote.DependentQuotes != null)
            {
                foreach (var dependentQuote in quote.DependentQuotes)
                {
                    var existingDependentPolicy = await _policyService.GetPolicyByQuoteId(quote.QuoteId);
                    dependentQuote.PolicyId = existingPolicy == null ? await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber) : existingPolicy.PolicyId;
                    dependentQuote.PolicyNumber = existingPolicy == null ? await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, "02") : existingPolicy.PolicyNumber; // GET FROM PO CONFIG TO BE ADDED
                }
            }

            var isNew = existingPolicy == null;
            string action;

            //set wizard task lable per case type
            switch (quote.CaseType)
            {
                case CaseTypeEnum.MaintainPolicyChanges: action = "Update"; break;
                case CaseTypeEnum.CancelPolicy: action = "Cancel"; break;
                case CaseTypeEnum.ReinstatePolicy: action = "Reinstate"; break;
                default: action = "New"; break;
            }

            var policy = existingPolicy;

            if (isNew)
            {
                var industryClassId = (await _leadService.GetLeadByQuoteId(quote.QuoteId)).Company.IndustryClass;
                var now = DateTime.Now;
                var industryClassDeclarationConfiguration = await _declarationService.GetIndustryClassDeclarationConfiguration(industryClassId);
                var expiryDate = industryClassDeclarationConfiguration != null ? new DateTime(now.Year + 1, industryClassDeclarationConfiguration.RenewalPeriodEndMonth, industryClassDeclarationConfiguration.RenewalPeriodEndDayOfMonth) : new DateTime(now.Year + 1, now.Month, now.Day);

                var policyOwner = await _rolePlayerService.GetRolePlayer(context.LinkedItemId);
                var industries = await _lookupService.GetIndustries();
                var industryGroup = Convert.ToString(policyOwner.Company.IndustryClass);
                var industry = industries.FindLast(s => s.Id == policyOwner.Company.IndustryId);
                policyOwner.Company.IndustryRates = await _rateIndustryService.GetRatesForIndustry(industry.Name, industryGroup);

                policy = new Policy
                {
                    PolicyId = policyId,
                    PolicyNumber = policyNumber,
                    PolicyOwnerId = context.LinkedItemId,
                    PolicyOwner = policyOwner,
                    ProductOptionId = quote.ProductOptionId,
                    QuoteId = quote.QuoteId,
                    Quote = quote,
                    ExpiryDate = expiryDate,
                    PolicyPayeeId = context.LinkedItemId
                };
            }
            else
            {
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                policy.Quote = quote;
            }

            policy.PremiumAdjustmentPercentage = 0;

            var productOptionNames = string.Empty;
            productOptionNames += (await _productOptionService.GetProductOption(quote.ProductOptionId)).Name;

            if (policy.Quote.DependentQuotes != null)
            {
                foreach (var dependentQuote in policy.Quote.DependentQuotes)
                {
                    productOptionNames += ", " + (await _productOptionService.GetProductOption(dependentQuote.Quote.ProductOptionId)).Name;
                }
            }

            var label = $"{action} {productOptionNames} Policy(s): {policy.PolicyOwner.DisplayName}";
            var stepData = new ArrayList() { policy };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policy = context.Deserialize<Policy>(stepData[0].ToString());

            //TODO: Have to add a drop down and get the field
            policy.BrokerageId = Convert.ToInt16(await _configurationService.GetModuleSetting(SystemSettings.DefaultBrokerage));
            policy.RepresentativeId = 2;
            // ------------------------------------------------

            //Set policy status per case type
            switch (policy.Quote.CaseType)
            {
                case CaseTypeEnum.MaintainPolicyChanges: break; // Do nothing, maintain original status;
                case CaseTypeEnum.CancelPolicy: policy.PolicyStatus = PolicyStatusEnum.Cancelled; break;
                case CaseTypeEnum.ReinstatePolicy: policy.PolicyStatus = PolicyStatusEnum.Reinstated; break;
                default: // new policies will follow default
                    policy.PolicyStatus = PolicyStatusEnum.PendingFirstPremium; // PendingRelease status is the flag for bundle raise
                    policy.FirstInstallmentDate = new DateTime(DateTime.Now.Month > 11 ? DateTime.Now.Year + 1 : DateTime.Now.Year, DateTime.Now.Month > 11 ? 1 : DateTime.Now.Month + 1, 1); break;
            }

            var annualPremium = Convert.ToDecimal(policy.Quote.Premium);
            var multiplier = CommonConstants.AnnuallyMultiplier;

            switch (policy.PaymentFrequency)
            {
                case PaymentFrequencyEnum.Monthly:
                    multiplier = CommonConstants.MonthlyMultiplier;
                    break;
                case PaymentFrequencyEnum.Quarterly:
                    multiplier = CommonConstants.QuarterlyMultiplier;
                    break;
                case PaymentFrequencyEnum.BiAnnually:
                    multiplier = CommonConstants.BiAnnuallyMultiplier;
                    break;
            }

            var policyOwner = policy.PolicyOwner;
            if (policy.PolicyOwner?.Declarations != null && policy.PolicyOwner.Declarations.Count > 0)
            {
                await _declarationService.CreateDeclarations(policy.PolicyOwner.Declarations);
                policy.PolicyOwner = null;
            }

            policy.AnnualPremium = annualPremium;
            policy.InstallmentPremium = annualPremium / multiplier;

            var existingPolicy = await _policyService.GetPolicyByQuoteId(Convert.ToInt32(policy.QuoteId));

            if (existingPolicy == null)
            {
                await _policyService.AddPolicy(policy);

                if (policy.Quote.DependentQuotes != null)
                {
                    foreach (var dependentQuote in policy.Quote.DependentQuotes)
                    {
                        var dependentPolicy = policy;
                        dependentPolicy.PolicyId = dependentQuote.PolicyId;
                        dependentPolicy.PolicyNumber = dependentQuote.PolicyNumber;
                        dependentPolicy.ProductOptionId = dependentQuote.Quote.ProductOptionId;
                        dependentPolicy.AnnualPremium = annualPremium;
                        dependentPolicy.InstallmentPremium = annualPremium / multiplier;

                        if (policyOwner?.Declarations != null && policyOwner.Declarations.Count > 0)
                        {
                            foreach (var declaration in policyOwner.Declarations)
                            {
                                var dependentDeclarations = declaration.DependentDeclarations.FindAll(s => s.ProductOptionId == dependentPolicy.ProductOptionId);
                                await _declarationService.CreateDeclarations(dependentDeclarations);
                            }
                        }

                        await _policyService.AddPolicy(dependentPolicy);
                    }
                }
            }
            else
            {
                await _policyService.EditPolicy(policy);
            }

            try // failing to send the policy documents must not stop the process...handle the error
            {
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                switch (policy.Quote.CaseType)
                {
                    case CaseTypeEnum.MaintainPolicyChanges: _ = Task.Run(() => _policyCommunicationService.SendModifiedCOIDPolicySchedule(policy, wizard.Id)); break;
                    case CaseTypeEnum.CancelPolicy: _ = Task.Run(() => _policyCommunicationService.SendCancelCOIDPolicySchedule(policy)); break;
                    case CaseTypeEnum.ReinstatePolicy: _ = Task.Run(() => _policyCommunicationService.SendReinstateCOIDPolicySchedule(policy, wizard.Id)); break;
                    default: // new policies will follow default
                        var industry = await _industryService.GetIndustry(policy.PolicyOwner.FinPayee.IndustryId);
                        _ = Task.Run(() => _policyCommunicationService.SendNewCOIDPolicySchedule(policy, wizard.Id, industry.IndustryClass));
                        break;
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
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

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task CancelWizard(IWizardContext context)
        {
            return;
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
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
