using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Quote;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.Policy
{
    public class RMALifeAssurancePolicyWizard : IWizardProcess
    {
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IDeclarationService _declarationService;
        private readonly ILeadService _leadService;
        private readonly IMemberService _memberService;
        private readonly IQuoteService _quoteService;
        private readonly IProductOptionService _productOptionService;
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyService _policyService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly ISLAService _slaService;

        public RMALifeAssurancePolicyWizard(
            IDocumentGeneratorService documentGeneratorService,
            IDeclarationService declarationService,
            ILeadService leadService,
            IMemberService memberService,
            IProductOptionService productOptionService,
            IQuoteService quoteService,
            IPolicyService policyService,
            IPolicyCommunicationService policyCommunicationService,
            ISLAService slaService,
            IConfigurationService configurationService)
        {
            _configurationService = configurationService;
            _documentGeneratorService = documentGeneratorService;
            _declarationService = declarationService;
            _leadService = leadService;
            _memberService = memberService;
            _productOptionService = productOptionService;
            _quoteService = quoteService;
            _policyService = policyService;
            _policyCommunicationService = policyCommunicationService;
            _slaService = slaService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var quote = context?.Deserialize<QuoteV2>(context.Data);
            var lead = await _leadService.GetLead(quote.LeadId);
            var rolePlayer = await _memberService.GetMemberById(Convert.ToInt32(lead.RolePlayerId));

            var industryClass = lead.Company.IndustryClass;
            var policyInceptionDate = await GetDefaultRenewalPeriodStartDate(industryClass, DateTimeHelper.SaNow);
            var policyExpiryDate = policyInceptionDate.AddYears(1);
            var productOptions = await _productOptionService.GetProductOptions();

            var policies = new List<Contracts.Entities.Policy.Policy>();
            foreach (var quoteDetail in quote.QuoteDetailsV2)
            {
                var index = policies.FindIndex(s => s.ProductOptionId == quoteDetail.ProductOptionId);

                if (index <= -1)
                {
                    int paymentFrequency = (int)PaymentFrequencyEnum.Annually;

                    if (industryClass == IndustryClassEnum.Metals)
                    {
                        paymentFrequency = (int)PaymentFrequencyEnum.Annually;
                    }
                    else if (industryClass == IndustryClassEnum.Mining)
                    {
                        paymentFrequency = (int)PaymentFrequencyEnum.BiAnnually;
                    }

                    var productOption = productOptions.Find(s => s.Id == quoteDetail.ProductOptionId);
                    var preffix = productOption != null ? productOption.Code : "02";

                    var productCategoryType = await _productOptionService.GetProductCategoryType(productOption.Id);

                    var policy = new Contracts.Entities.Policy.Policy
                    {
                        PolicyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber),
                        PolicyNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PolicyNumber, preffix),
                        QuoteId = quote.QuoteId,
                        ProductOptionId = quoteDetail.ProductOptionId,
                        PolicyOwnerId = rolePlayer.RolePlayerId,
                        PolicyOwner = rolePlayer,
                        PolicyPayeeId = rolePlayer.RolePlayerId,
                        PolicyInceptionDate = policyInceptionDate,
                        TargetedPolicyInceptionDate = policyInceptionDate,
                        ExpiryDate = policyExpiryDate,
                        PremiumAdjustmentPercentage = 0,
                        PaymentFrequencyId = paymentFrequency,
                        PolicyStatus = PolicyStatusEnum.New,
                        ProductCategoryType = productCategoryType
                    };

                    policies.Add(policy);

                    await StartPolicySla(policy);
                }
            }

            var productOptionNames = string.Empty;

            foreach (var policy in policies)
            {
                policy.RolePlayerPolicyDeclarations = await MapDeclarationsFromQuote(policy);
                policy.ProductOption = productOptions.Find(s => s.Id == policy.ProductOptionId);

                var productOption = productOptions.Find(s => s.Id == policy.ProductOptionId);
                productOptionNames += productOption.Name + " (" + productOption.Code + ") + ";
            }

            productOptionNames = productOptionNames.Remove(productOptionNames.LastIndexOf(" + "), 3).Trim();
            var plural = policies.Count > 1 ? "policies" : "policy";

            var label = $"New {productOptionNames.Trim()} {plural} for ({rolePlayer.FinPayee.FinPayeNumber}) {rolePlayer.DisplayName}";
            var stepData = new ArrayList() { policies };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policies = context.Deserialize<List<Contracts.Entities.Policy.Policy>>(stepData[0].ToString());

            var policyOwner = await _memberService.GetMemberById(policies[0].PolicyOwnerId);

            foreach (var policy in policies)
            {
                policy.BrokerageId = Convert.ToInt16(await _configurationService.GetModuleSetting(SystemSettings.DefaultBrokerage));
                policy.RepresentativeId = policyOwner.RepresentativeId != null ? Convert.ToInt32(policyOwner.RepresentativeId) : 2;
                policy.PolicyStatus = PolicyStatusEnum.Active;
                policy.PolicyInceptionDate = policy.TargetedPolicyInceptionDate;
                policy.ExpiryDate = Convert.ToDateTime(policy.ExpiryDate).AddDays(-1);

                policy.FirstInstallmentDate = DateTimeHelper.SaNow;
                policy.LastInstallmentDate = DateTimeHelper.SaNow;
                policy.InstallmentPremium = 0;
                policy.AnnualPremium = 0;

                policy.Covers = new List<Cover>
                {
                    new Cover
                    {
                        PolicyId = policy.PolicyId,
                        EffectiveFrom = policy.PolicyInceptionDate.Value
                    }
                };


                await _policyService.AddPolicy(policy);
                policy.PolicyOwner = policyOwner;
                await _declarationService.RaiseTransactions(policy);

                await StopPolicySla(policy);

                var policyStatusChangeAudit = new PolicyStatusChangeAudit
                {
                    PolicyId = policy.PolicyId,
                    RequestedBy = RmaIdentity.Username,
                    RequestedDate = DateTime.Now,
                    EffectiveFrom = DateTime.Now,
                    PolicyStatus = PolicyStatusEnum.Active,
                    Reason = "New Policy was created"
                };

                await _policyService.UpdatePolicyStatus(policyStatusChangeAudit);

                try // COMMUNICATION ERRORS MUST NOT STOP THE PROCESS
                {
                    _ = Task.Run(() => _policyCommunicationService.SendRMAAssurancePolicySchedule(policy, wizard.Id));
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            }

            await UpdateMemberStatus(policyOwner);
        }

        private async Task UpdateMemberStatus(RolePlayer member)
        {
            if (member.MemberStatus == MemberStatusEnum.ActiveWithoutPolicies)
            {
                member.MemberStatus = MemberStatusEnum.Active;
                await _memberService.UpdateMember(member);
            }
        }

        private async Task StartPolicySla(Contracts.Entities.Policy.Policy policy)
        {
            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = SLAItemTypeEnum.Policy,
                ItemId = policy.PolicyId,
                Status = policy.PolicyStatus.ToString(),
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = "new policy wizard was started"
            };

            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        private async Task StopPolicySla(Contracts.Entities.Policy.Policy policy)
        {
            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = SLAItemTypeEnum.Policy,
                ItemId = policy.PolicyId,
                Status = policy.PolicyStatus.ToString(),
                EffectiveFrom = DateTimeHelper.SaNow,
                EffictiveTo = DateTimeHelper.SaNow,
                Reason = $"policy status updated from New to {policy.PolicyStatus}"
            };

            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        private async Task<DateTime> GetDefaultRenewalPeriodStartDate(IndustryClassEnum industryClass, DateTime date)
        {
            var industryClassDeclarationConfiguration = await _declarationService.GetIndustryClassDeclarationConfiguration(industryClass);

            var year = date.Month < industryClassDeclarationConfiguration.RenewalPeriodStartMonth || date.Month == industryClassDeclarationConfiguration.RenewalPeriodStartMonth && date.Day < industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth ? date.Year - 1 : date.Year;
            return new DateTime(year, industryClassDeclarationConfiguration.RenewalPeriodStartMonth, industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth);
        }

        private async Task<List<RolePlayerPolicyDeclaration>> MapDeclarationsFromQuote(Contracts.Entities.Policy.Policy policy)
        {
            policy.QuoteV2 = await _quoteService.GetQuoteV2(Convert.ToInt32(policy.QuoteId));
            policy.QuoteV2.QuoteDetailsV2.RemoveAll(s => s.ProductOptionId != policy.ProductOptionId);

            policy.QuoteV2.TotalPremium = 0;
            foreach (var quoteDetail in policy.QuoteV2.QuoteDetailsV2)
            {
                if (!quoteDetail.IsDeleted)
                {
                    policy.QuoteV2.TotalPremium += quoteDetail.Premium;
                }
            }

            var rolePlayerPolicyDeclarations = new List<RolePlayerPolicyDeclaration>();

            var roleplayerPolicyDeclaration = new RolePlayerPolicyDeclaration
            {
                OriginalTotalPremium = 0,
                DeclarationYear = policy.PolicyInceptionDate.Value.Year,
                PolicyId = policy.PolicyId,
                ProductId = policy.QuoteV2.ProductId,
                RolePlayerId = policy.PolicyOwnerId,
                RolePlayerPolicyDeclarationStatus = RolePlayerPolicyDeclarationStatusEnum.Current,
                RolePlayerPolicyDeclarationType = RolePlayerPolicyDeclarationTypeEnum.Budgeted,
                TotalPremium = Convert.ToDecimal(policy.QuoteV2.TotalPremium),
                RolePlayerPolicyDeclarationDetails = new List<RolePlayerPolicyDeclarationDetail>()
            };

            foreach (var quoteDetail in policy.QuoteV2.QuoteDetailsV2)
            {
                var rolePlayerPolicyDeclarationDetail = new RolePlayerPolicyDeclarationDetail
                {
                    AverageEmployeeEarnings = quoteDetail.AverageEmployeeEarnings == null ? 0 : Convert.ToDecimal(quoteDetail.AverageEmployeeEarnings),
                    AverageNumberOfEmployees = Convert.ToInt32(quoteDetail.AverageNumberOfEmployees),
                    CategoryInsured = quoteDetail.CategoryInsured,
                    LiveInAllowance = quoteDetail.LiveInAllowance == null ? 0 : Convert.ToInt32(quoteDetail.LiveInAllowance),
                    Premium = quoteDetail.Premium == null ? 0 : Convert.ToDecimal(quoteDetail.Premium),
                    ProductOptionId = quoteDetail.ProductOptionId,
                    Rate = quoteDetail.IndustryRate.Value,
                    IsDeleted = quoteDetail.IsDeleted,
                    EffectiveFrom = policy.PolicyInceptionDate.Value.Date,
                    EffectiveTo = policy.ExpiryDate.Value.Date
                };

                roleplayerPolicyDeclaration.RolePlayerPolicyDeclarationDetails.Add(rolePlayerPolicyDeclarationDetail);
            }

            rolePlayerPolicyDeclarations.Add(roleplayerPolicyDeclaration);

            return rolePlayerPolicyDeclarations;
        }

        public async Task CancelWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policies = context.Deserialize<List<Contracts.Entities.Policy.Policy>>(stepData[0].ToString());

            foreach (var policy in policies)
            {
                var quote = await _quoteService.GetQuoteV2(policy.QuoteId.Value);
                quote.QuoteStatus = QuoteStatusEnum.Rejected;
                await _quoteService.UpdateQuote(quote);
            }
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policies = context.Deserialize<List<Contracts.Entities.Policy.Policy>>(stepData[0].ToString());

            foreach (var policy in policies)
            {
                var quote = await _quoteService.GetQuoteV2(policy.QuoteId.Value);
                quote.QuoteStatus = QuoteStatusEnum.Rejected;
                await _quoteService.UpdateQuote(quote);
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
            return await Task.FromResult(string.Empty);
        }

        public async Task UpdateStatus(IWizardContext context)
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
