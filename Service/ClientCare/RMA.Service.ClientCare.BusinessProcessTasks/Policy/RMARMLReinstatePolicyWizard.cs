using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.Policy
{
    public class RMARMLReinstatePolicyWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDeclarationService _declarationService;
        private readonly IMemberService _memberService;

        public RMARMLReinstatePolicyWizard(
            IPolicyService policyService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService,
            IDeclarationService declarationService,
            IMemberService memberService)
        {
            _policyService = policyService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _declarationService = declarationService;
            _memberService = memberService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var policyStatusChangeAudit = context?.Deserialize<PolicyStatusChangeAudit>(context.Data);

            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyStatusChangeAudit.PolicyId);

            policyStatusChangeAudit.Policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
            policyStatusChangeAudit.RequestedDate = DateTimeHelper.SaNow;

            policyStatusChangeAudit.Policy.PolicyStatus = PolicyStatusEnum.PendingReinstatement;
            var rolePlayerPolicyDeclarations = await _declarationService.GetRolePlayerPolicyDeclarations(policyStatusChangeAudit.Policy.PolicyId);

            policyStatusChangeAudit.Policy.RolePlayerPolicyDeclarations = rolePlayerPolicyDeclarations.GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();

            var cancellationCoverPeriodStartDate = await _declarationService.GetDefaultRenewalPeriodStartDate(policyStatusChangeAudit.Policy.PolicyOwner.Company.IndustryClass.Value, policyStatusChangeAudit.Policy.CancellationDate.Value);
            policyStatusChangeAudit.Policy.RolePlayerPolicyDeclarations.RemoveAll(s => s.DeclarationYear < cancellationCoverPeriodStartDate.Year);

            if (policyStatusChangeAudit.VapsPolicies?.Count > 0)
            {
                foreach (var vapsPolicy in policyStatusChangeAudit.VapsPolicies)
                {
                    vapsPolicy.PolicyOwner = policyStatusChangeAudit.Policy.PolicyOwner;

                    vapsPolicy.PolicyStatus = PolicyStatusEnum.PendingReinstatement;
                    var vapsRolePlayerPolicyDeclarations = await _declarationService.GetRolePlayerPolicyDeclarations(vapsPolicy.PolicyId);
                    vapsPolicy.RolePlayerPolicyDeclarations = vapsRolePlayerPolicyDeclarations.GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();

                    var vapsCancellationCoverPeriodStartDate = await _declarationService.GetDefaultRenewalPeriodStartDate(policyStatusChangeAudit.Policy.PolicyOwner.Company.IndustryClass.Value, vapsPolicy.CancellationDate.Value);
                    vapsPolicy.RolePlayerPolicyDeclarations.RemoveAll(s => s.DeclarationYear < vapsCancellationCoverPeriodStartDate.Year);
                }
            }

            var productOptionName = policy.ProductOption.Name;

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.PendingReinstatement);

            policyStatusChangeAudit.EffectiveFrom = Convert.ToDateTime(policy.CancellationDate);

            var label = $"Reinstate {productOptionName} policy {policy.PolicyNumber} for ({policyStatusChangeAudit.Policy.PolicyOwner.FinPayee.FinPayeNumber}) {policyStatusChangeAudit.Policy.PolicyOwner.DisplayName}";
            var stepData = new ArrayList() { policyStatusChangeAudit };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Policy.LastReinstateDate = policyStatusChangeAudit.EffectiveFrom;

            var converted = Enum.TryParse(policyStatusChangeAudit.Reason, out ReinstateReasonEnum reason);
            policyStatusChangeAudit.Policy.ReinstateReason = converted ? reason : ReinstateReasonEnum.Unknown;

            policyStatusChangeAudit.Policy.Covers = await _policyService.GetPolicyCover(policyStatusChangeAudit.Policy.PolicyId);
            if (policyStatusChangeAudit.Policy.LastReinstateDate.Value.Date == policyStatusChangeAudit.Policy.CancellationDate.Value.Date)
            {
                var inceptionDate = policyStatusChangeAudit.Policy.LastReinstateDate.Value.Date;
                for (int i = policyStatusChangeAudit.Policy.Covers.Count - 1; i >= 0; i--)
                {
                    if (policyStatusChangeAudit.Policy.Covers[i].EffectiveTo.Value.Date == inceptionDate.Date)
                    {
                        inceptionDate = policyStatusChangeAudit.Policy.Covers[i].EffectiveFrom.Date;
                        policyStatusChangeAudit.Policy.Covers[i].EffectiveTo = null;
                    }
                }
                policyStatusChangeAudit.Policy.PolicyInceptionDate = inceptionDate;
            }
            else
            {
                policyStatusChangeAudit.Policy.PolicyInceptionDate = policyStatusChangeAudit.Policy.LastReinstateDate;
                var cover = new Cover
                {
                    PolicyId = policyStatusChangeAudit.Policy.PolicyId,
                    EffectiveFrom = policyStatusChangeAudit.Policy.LastReinstateDate.Value
                };

                policyStatusChangeAudit.Policy.Covers.Add(cover);
            }

            policyStatusChangeAudit.Policy.CancellationDate = null;
            policyStatusChangeAudit.Policy.CancellationInitiatedBy = null;
            policyStatusChangeAudit.Policy.CancellationInitiatedDate = null;
            policyStatusChangeAudit.Policy.PolicyCancelReason = null;

            var reinstateDateDeclarationYear = await GetDefaultRenewalPeriodStartYear(policyStatusChangeAudit.Policy.PolicyOwner.Company.IndustryClass.Value, policyStatusChangeAudit.EffectiveFrom);
            foreach (var rolePlayerPolicyDeclaration in policyStatusChangeAudit.Policy.RolePlayerPolicyDeclarations)
            {
                rolePlayerPolicyDeclaration.RequiresTransactionModification = rolePlayerPolicyDeclaration.DeclarationYear >= reinstateDateDeclarationYear;
            }

            await _declarationService.RaiseTransactions(policyStatusChangeAudit.Policy);
            await _policyService.EditPolicy(policyStatusChangeAudit.Policy, false);

            await SendCommunication(policyStatusChangeAudit.Policy, wizard.Id);

            if (policyStatusChangeAudit.VapsPolicies != null && policyStatusChangeAudit.VapsPolicies.Count > 0)
            {
                foreach (var vapsPolicy in policyStatusChangeAudit.VapsPolicies)
                {
                    vapsPolicy.LastReinstateDate = policyStatusChangeAudit.EffectiveFrom.Date < vapsPolicy.PolicyInceptionDate.Value.Date ? vapsPolicy.PolicyInceptionDate.Value.Date : policyStatusChangeAudit.EffectiveFrom.Date;
                    vapsPolicy.ReinstateReason = ReinstateReasonEnum.ParentPolicyReinstated;

                    vapsPolicy.Covers = await _policyService.GetPolicyCover(vapsPolicy.PolicyId);
                    if (vapsPolicy.LastReinstateDate.Value.Date == vapsPolicy.CancellationDate.Value.Date)
                    {
                        var inceptionDate = vapsPolicy.LastReinstateDate.Value.Date;
                        for (int i = vapsPolicy.Covers.Count - 1; i >= 0; i--)
                        {
                            if (vapsPolicy.Covers[i].EffectiveTo.Value.Date == inceptionDate.Date)
                            {
                                inceptionDate = vapsPolicy.Covers[i].EffectiveFrom.Date;
                                vapsPolicy.Covers[i].EffectiveTo = null;
                            }
                        }
                        vapsPolicy.PolicyInceptionDate = inceptionDate;
                    }
                    else
                    {
                        vapsPolicy.PolicyInceptionDate = vapsPolicy.LastReinstateDate;
                        var cover = new Cover
                        {
                            PolicyId = vapsPolicy.PolicyId,
                            EffectiveFrom = vapsPolicy.PolicyInceptionDate.Value
                        };

                        vapsPolicy.Covers.Add(cover);
                    }

                    vapsPolicy.CancellationDate = null;
                    vapsPolicy.CancellationInitiatedBy = null;
                    vapsPolicy.CancellationInitiatedDate = null;
                    vapsPolicy.PolicyCancelReason = null;

                    foreach (var rolePlayerPolicyDeclaration in vapsPolicy.RolePlayerPolicyDeclarations)
                    {
                        rolePlayerPolicyDeclaration.RequiresTransactionModification = rolePlayerPolicyDeclaration.DeclarationYear >= reinstateDateDeclarationYear;
                    }

                    await _declarationService.RaiseTransactions(vapsPolicy);
                    await _policyService.EditPolicy(vapsPolicy, false);

                    await SendCommunication(vapsPolicy, wizard.Id);
                }
            }

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Active);
            await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.PolicyManager, "WizardId", wizard.Id.ToString(), "PolicyId", policyStatusChangeAudit.PolicyId.ToString());
            await UpdateMemberStatus(policyStatusChangeAudit.Policy.PolicyOwnerId);
        }

        private async Task UpdateMemberStatus(int policyOwnerId)
        {
            var member = await _memberService.GetMemberById(policyOwnerId);
            if (member.HasActiveCoidPolicies || member.HasActiveFuneralPolicies || member.HasActiveVapsPolicies)
            {
                member.MemberStatus = MemberStatusEnum.Active;
                await _memberService.UpdateMember(member);
            }
        }

        private async Task<int> GetDefaultRenewalPeriodStartYear(IndustryClassEnum industryClass, DateTime date)
        {
            var industryClassDeclarationConfiguration = await _declarationService.GetIndustryClassDeclarationConfiguration(industryClass);

            return date.Month < industryClassDeclarationConfiguration.RenewalPeriodStartMonth || date.Month == industryClassDeclarationConfiguration.RenewalPeriodStartMonth && date.Day < industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth ? date.Year - 1 : date.Year;
        }

        private async Task SendCommunication(Contracts.Entities.Policy.Policy policy, int wizardId)
        {
            try
            {
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                _ = Task.Run(() => _policyCommunicationService.SendReinstatePolicySchedule(policy, wizardId));
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private async Task UpdatePolicyStatus(PolicyStatusChangeAudit policyStatusChangeAudit, PolicyStatusEnum policyStatus)
        {
            var policies = new List<Contracts.Entities.Policy.Policy>
            {
                policyStatusChangeAudit.Policy
            };

            if (policyStatusChangeAudit.VapsPolicies != null)
            {
                policies.AddRange(policyStatusChangeAudit.VapsPolicies);
            }

            foreach (var policy in policies)
            {
                var audit = new PolicyStatusChangeAudit();
                audit.PolicyId = policy.PolicyId;
                audit.RequestedBy = policyStatusChangeAudit.RequestedBy;
                audit.RequestedDate = DateTime.Now;
                audit.EffectiveFrom = DateTime.Now;
                audit.PolicyStatus = policyStatus;
                audit.Reason = string.IsNullOrEmpty(Convert.ToString(policy.ReinstateReason)) ? policyStatusChangeAudit.Reason : Convert.ToString(policy.ReinstateReason);

                await _policyService.UpdatePolicyStatus(audit);
            }
        }

        public async Task CancelWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Reason = "Policy reinstatement wizard was cancelled";

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Cancelled);
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Reason = "Policy reinstatement wizard was rejected";

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Cancelled);
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
