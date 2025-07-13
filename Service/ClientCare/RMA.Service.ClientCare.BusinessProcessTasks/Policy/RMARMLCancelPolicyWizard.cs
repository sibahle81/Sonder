using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
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
    public class RMARMLCancelPolicyWizard : IWizardProcess
    {
        private readonly IPolicyService _policyService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IClaimService _claimService;
        private readonly IDeclarationService _declarationService;
        private readonly ILetterOfGoodStandingService _letterOfGoodStandingService;
        private readonly IMemberService _memberService;

        public RMARMLCancelPolicyWizard(
            IPolicyService policyService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService,
            IClaimService claimService,
            IDeclarationService declarationService,
            ILetterOfGoodStandingService letterOfGoodStandingService,
            IMemberService memberService)
        {
            _policyService = policyService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _claimService = claimService;
            _declarationService = declarationService;
            _letterOfGoodStandingService = letterOfGoodStandingService;
            _memberService = memberService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var policyStatusChangeAudit = context?.Deserialize<PolicyStatusChangeAudit>(context.Data);

            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyStatusChangeAudit.PolicyId);

            policyStatusChangeAudit.Policy.PolicyStatus = PolicyStatusEnum.PendingCancelled;
            policyStatusChangeAudit.Policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
            policyStatusChangeAudit.EffectiveFrom = policyStatusChangeAudit.Policy.PolicyInceptionDate.Value;

            var rolePlayerPolicyDeclarations = await _declarationService.GetRolePlayerPolicyDeclarations(policy.PolicyId);
            policyStatusChangeAudit.Policy.RolePlayerPolicyDeclarations = rolePlayerPolicyDeclarations.GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();

            if (policyStatusChangeAudit.Policy.RolePlayerPolicyDeclarations?.Count > 0)
            {
                foreach (var rolePlayerPolicyDeclaration in policyStatusChangeAudit.Policy.RolePlayerPolicyDeclarations)
                {
                    rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions = await _declarationService.GetRolePlayerPolicyTransactionsForCoverPeriod(policyStatusChangeAudit.Policy.PolicyId, rolePlayerPolicyDeclaration.DeclarationYear);
                    rolePlayerPolicyDeclaration.OriginalTotalPremium = rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Sum(rolePlayerPolicyTransaction => rolePlayerPolicyTransaction.TotalAmount);
                }
            }

            if (policyStatusChangeAudit.VapsPolicies?.Count > 0)
            {
                foreach (var vapsPolicy in policyStatusChangeAudit.VapsPolicies)
                {
                    vapsPolicy.PolicyStatus = PolicyStatusEnum.PendingCancelled;
                    vapsPolicy.PolicyOwner = policyStatusChangeAudit.Policy.PolicyOwner;

                    var vapsPolicyRolePlayerPolicyDeclarations = await _declarationService.GetRolePlayerPolicyDeclarations(vapsPolicy.PolicyId);
                    vapsPolicy.RolePlayerPolicyDeclarations = vapsPolicyRolePlayerPolicyDeclarations.GroupBy(x => x.DeclarationYear, (key, g) => g.OrderByDescending(e => e.CreatedDate).First()).ToList();

                    if (vapsPolicy.RolePlayerPolicyDeclarations?.Count > 0)
                    {
                        foreach (var rolePlayerPolicyDeclaration in vapsPolicy.RolePlayerPolicyDeclarations)
                        {
                            rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions = await _declarationService.GetRolePlayerPolicyTransactionsForCoverPeriod(vapsPolicy.PolicyId, rolePlayerPolicyDeclaration.DeclarationYear);
                            rolePlayerPolicyDeclaration.OriginalTotalPremium = rolePlayerPolicyDeclaration.RolePlayerPolicyTransactions.Sum(rolePlayerPolicyTransaction => rolePlayerPolicyTransaction.TotalAmount);
                        }
                    }
                }
            }

            var productOptionName = policy.ProductOption.Name;

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.PendingCancelled);

            policyStatusChangeAudit.EffectiveFrom = policy.PolicyInceptionDate.Value;
            policyStatusChangeAudit.RequestedDate = DateTimeHelper.SaNow;

            var label = $"Cancel {productOptionName} policy {policy.PolicyNumber} for ({policyStatusChangeAudit.Policy.PolicyOwner.FinPayee.FinPayeNumber}) {policyStatusChangeAudit.Policy.PolicyOwner.DisplayName}";
            var stepData = new ArrayList() { policyStatusChangeAudit };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Policy.CancellationDate = policyStatusChangeAudit.EffectiveFrom;
            policyStatusChangeAudit.Policy.CancellationInitiatedBy = policyStatusChangeAudit.RequestedBy;
            policyStatusChangeAudit.Policy.CancellationInitiatedDate = policyStatusChangeAudit.RequestedDate;

            policyStatusChangeAudit.Policy.LastReinstateDate = null;
            policyStatusChangeAudit.Policy.ReinstateReason = null;

            var converted = Enum.TryParse(policyStatusChangeAudit.Reason, out PolicyCancelReasonEnum reason);
            policyStatusChangeAudit.Policy.PolicyCancelReason = converted ? reason : PolicyCancelReasonEnum.Unknown;

            policyStatusChangeAudit.Policy.Covers = await _policyService.GetPolicyCover(policyStatusChangeAudit.Policy.PolicyId);
            if (policyStatusChangeAudit.Policy.Covers?.Count > 0)
            {
                foreach (var cover in policyStatusChangeAudit.Policy.Covers)
                {
                    if (cover.EffectiveTo == null)
                    {
                        cover.EffectiveTo = policyStatusChangeAudit.Policy.CancellationDate < cover.EffectiveFrom ? cover.EffectiveFrom : policyStatusChangeAudit.Policy.CancellationDate;
                    }
                }
            }

            await _declarationService.RaiseTransactions(policyStatusChangeAudit.Policy);
            await _policyService.EditPolicy(policyStatusChangeAudit.Policy, false);

            var underwriter = await _policyService.GetUnderwriter(policyStatusChangeAudit.Policy);
            if (underwriter == UnderwriterEnum.RMAMutualAssurance && policyStatusChangeAudit.Policy.ProductOption.Product.ProductClass == ProductClassEnum.Statutory)
            {
                await _letterOfGoodStandingService.ExpireLettersOfGoodStanding(policyStatusChangeAudit.Policy.PolicyOwnerId, policyStatusChangeAudit.Policy.CancellationDate.Value);
            }

            await SendCommunication(policyStatusChangeAudit.Policy);

            if (policyStatusChangeAudit.VapsPolicies != null && policyStatusChangeAudit.VapsPolicies.Count > 0)
            {
                foreach (var vapsPolicy in policyStatusChangeAudit.VapsPolicies)
                {
                    vapsPolicy.CancellationDate = policyStatusChangeAudit.EffectiveFrom.Date < vapsPolicy.PolicyInceptionDate.Value.Date ? vapsPolicy.PolicyInceptionDate.Value.Date : policyStatusChangeAudit.EffectiveFrom.Date;
                    vapsPolicy.CancellationInitiatedBy = policyStatusChangeAudit.RequestedBy;
                    vapsPolicy.CancellationInitiatedDate = policyStatusChangeAudit.RequestedDate;
                    vapsPolicy.PolicyCancelReason = PolicyCancelReasonEnum.ParentPolicyCancelled;

                    vapsPolicy.LastReinstateDate = null;
                    vapsPolicy.ReinstateReason = null;

                    vapsPolicy.Covers = await _policyService.GetPolicyCover(vapsPolicy.PolicyId);
                    if (vapsPolicy.Covers?.Count > 0)
                    {
                        foreach (var cover in vapsPolicy.Covers)
                        {
                            if (cover.EffectiveTo == null)
                            {
                                cover.EffectiveTo = vapsPolicy.CancellationDate < cover.EffectiveFrom ? cover.EffectiveFrom : vapsPolicy.CancellationDate;
                            }
                        }
                    }

                    await _declarationService.RaiseTransactions(vapsPolicy);
                    await _policyService.EditPolicy(vapsPolicy, false);
                    await SendCommunication(vapsPolicy);
                }
            }

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Cancelled);
            await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.PolicyManager, "WizardId", wizard.Id.ToString(), "PolicyId", policyStatusChangeAudit.PolicyId.ToString());
            await UpdateMemberStatus(policyStatusChangeAudit.Policy.PolicyOwnerId);
        }

        private async Task UpdateMemberStatus(int policyOwnerId)
        {
            var member = await _memberService.GetMemberById(policyOwnerId);
            if (!member.HasActiveCoidPolicies && !member.HasActiveFuneralPolicies && !member.HasActiveVapsPolicies)
            {
                member.MemberStatus = MemberStatusEnum.Inactive;
                await _memberService.UpdateMember(member);
            }
        }

        private async Task SendCommunication(Contracts.Entities.Policy.Policy policy)
        {
            try
            {
                policy.PolicyOwner = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                _ = Task.Run(() => _policyCommunicationService.SendCancelPolicySchedule(policy));
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
                audit.Reason = string.IsNullOrEmpty(Convert.ToString(policy.PolicyCancelReason)) ? policyStatusChangeAudit.Reason : Convert.ToString(policy.PolicyCancelReason);

                await _policyService.UpdatePolicyStatus(audit);
            }
        }

        public async Task CancelWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Reason = "Policy cancellation wizard was cancelled";

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Active);
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            policyStatusChangeAudit.Reason = "Policy cancellation wizard was rejected";

            await UpdatePolicyStatus(policyStatusChangeAudit, PolicyStatusEnum.Active);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyStatusChangeAudit = context.Deserialize<PolicyStatusChangeAudit>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            var claims = await _claimService.GetClaimsByPolicyId(policyStatusChangeAudit.Policy.PolicyId);
            if (claims?.Count > 0)
            {
                var hasActiveClaims = claims.Exists(s => s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.Closed
                && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.Cancelled
                && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.Declined
                && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.ClaimClosed
                && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.NoClaim);

                if (hasActiveClaims)
                {
                    var ruleResult = new RuleResult
                    {
                        RuleName = "Has active claims",
                        Passed = false
                    };

                    ruleResult.MessageList.Add($"Policy {policyStatusChangeAudit.Policy.PolicyNumber} has active claims");
                    ruleResults.Add(ruleResult);
                }
            }

            if (policyStatusChangeAudit.VapsPolicies?.Count > 0)
            {
                foreach (var vapsPolicy in policyStatusChangeAudit.VapsPolicies)
                {
                    var vapsClaims = await _claimService.GetClaimsByPolicyId(vapsPolicy.PolicyId);
                    if (vapsClaims?.Count > 0)
                    {
                        var hasActiveClaims = claims.Exists(s => s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.Closed
                        && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.Cancelled
                        && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.Declined
                        && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.ClaimClosed
                        && s.ClaimStatus != ClaimCare.Contracts.Enums.ClaimStatusEnum.NoClaim);

                        var ruleResult = new RuleResult
                        {
                            RuleName = "Has active claims",
                            Passed = false
                        };

                        ruleResult.MessageList.Add($"VAPS policy {vapsPolicy.PolicyNumber} has active claims");
                        ruleResults.Add(ruleResult);
                    }
                }
            }

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

        #region Not Implemented
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
