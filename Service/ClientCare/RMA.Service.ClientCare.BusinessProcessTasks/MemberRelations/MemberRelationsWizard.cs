using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.MemberRelations
{
    public class MemberRelationsWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IProductOptionService _productOptionService;
        private readonly IPolicyCommunicationService _policyCommunicationService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyInsuredLifeService _policyInsuredLifeService;
        private readonly IPolicyService _policyService;
        private readonly IRepresentativeService _representativeService;
        private readonly IPolicyCaseService _caseService;


        public MemberRelationsWizard(
            IRolePlayerService rolePlayerService,
            IProductOptionService productOptionService,
            IPolicyCommunicationService policyCommunicationService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyInsuredLifeService policyInsuredLifeService,
            IPolicyService policyService,
            IRepresentativeService representativeService,
            IPolicyCaseService caseService
        )
        {
            _rolePlayerService = rolePlayerService;
            _productOptionService = productOptionService;
            _policyCommunicationService = policyCommunicationService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _policyInsuredLifeService = policyInsuredLifeService;
            _policyService = policyService;
            _representativeService = representativeService;
            _caseService = caseService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            RmaIdentity.DemandPermission(Permissions.CreateMainMemberRelationsWizard);
            var caseModel = new Case();
            caseModel = context?.Deserialize<Case>(context.Data);
            var label = $"Member Relations: {caseModel.Code}";

            var policies = await _rolePlayerPolicyService.SearchPoliciesByRolePlayerForRelationsCase(caseModel.MainMember.RolePlayerId, true);
            if (policies.Count > 0)
            {
                caseModel.ProductId = policies[0].ProductOption.ProductId;
                caseModel.MainMember.Policies = policies;
                foreach (var policy in policies)
                {
                    policy.InsuredLives = await _policyInsuredLifeService.GetPolicyInsuredLives(policy.PolicyId);
                }
            }

            caseModel.Spouse = await _rolePlayerService.GetRolePlayerRelations(
                caseModel.MainMember.RolePlayerId,
                new List<RolePlayerTypeEnum> {
                    RolePlayerTypeEnum.Spouse
                }
            );

            caseModel.Children = await _rolePlayerService.GetRolePlayerRelations(
                caseModel.MainMember.RolePlayerId,
                new List<RolePlayerTypeEnum> {
                    RolePlayerTypeEnum.Child
                }
            );

            caseModel.ExtendedFamily = await _rolePlayerService.GetRolePlayerRelations(
                caseModel.MainMember.RolePlayerId,
                new List<RolePlayerTypeEnum> {
                    RolePlayerTypeEnum.Daughter,
                    RolePlayerTypeEnum.DaughterInlaw,
                    RolePlayerTypeEnum.SonInlaw,
                    RolePlayerTypeEnum.Son,
                    RolePlayerTypeEnum.ParentInlaw,
                    RolePlayerTypeEnum.Grandparent,
                    RolePlayerTypeEnum.Mother,
                    RolePlayerTypeEnum.MotherInlaw,
                    RolePlayerTypeEnum.Father,
                    RolePlayerTypeEnum.FatherInlaw,
                    RolePlayerTypeEnum.Brother,
                    RolePlayerTypeEnum.BrotherInlaw,
                    RolePlayerTypeEnum.Sister,
                    RolePlayerTypeEnum.SisterInlaw,
                    RolePlayerTypeEnum.Aunt,
                    RolePlayerTypeEnum.Niece,
                    RolePlayerTypeEnum.Nephew,
                    RolePlayerTypeEnum.Husband,
                    RolePlayerTypeEnum.Wife,
                    RolePlayerTypeEnum.Other,
                    RolePlayerTypeEnum.Uncle,
                    RolePlayerTypeEnum.Cousin,
                    RolePlayerTypeEnum.GrandChild,
                    RolePlayerTypeEnum.Friend
                }
            );

            caseModel.Beneficiaries = await _rolePlayerService.GetRolePlayerRelations(
                caseModel.MainMember.RolePlayerId,
                new List<RolePlayerTypeEnum> {
                    RolePlayerTypeEnum.Beneficiary
                }
            );

            caseModel.Representative = null;
            caseModel.Brokerage = null;
            caseModel.JuristicRepresentative = null;

            var stepData = new ArrayList() { caseModel };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var newCase = context.Deserialize<Case>(stepData[0].ToString());

            Case parentPolicyCase = null;
            if (newCase.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                parentPolicyCase = await _caseService.GetCaseByPolicyId(newCase.MainMember.Policies[0].ParentPolicyId.Value);
            }

            var mainMember = newCase.MainMember;
            foreach (var policy in mainMember.Policies)
            {
                // Get the spouses, children and extended family members on the policy
                var spouses = newCase.Spouse.Where(s => s.Policies != null && s.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();
                var children = newCase.Children.Where(s => s.Policies != null && s.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();
                var members = newCase.ExtendedFamily.Where(s => s.Policies != null && s.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();
                // Save the insured lives in the policy
                var lives = policy.InsuredLives;
                var beneficiaries = newCase.Beneficiaries.Where(b => b.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();
                await _policyService.UpdateMemberRelations(policy, mainMember, spouses, children, members, beneficiaries);
                // Update policy premiums
                await _rolePlayerPolicyService.UpdatePolicyPremiums(newCase);
            }

            try
            {
                newCase.Representative = await _representativeService.GetRepresentativeWithNoRefData(newCase.MainMember.Policies[0].RepresentativeId);
                await _policyCommunicationService.SendFuneralPolicyDocuments(
                    wizard.Id,
                    newCase,
                    parentPolicyCase,
                    (newCase.CaseTypeId == (int)CaseTypeEnum.GroupNewBusiness)
                        ? PolicySendDocsProcessTypeEnum.SendGroupFuneralPolicyMembershipCertificate
                        : PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var newCase = context.Deserialize<Case>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            if (newCase.MainMember == null)
                return GetRuleRequestResult(false, "Main member has not been added");
            if (newCase.MainMember.Policies == null)
                return GetRuleRequestResult(false, "No policy information has been added");
            if (newCase.MainMember.Policies.Count == 0)
                return GetRuleRequestResult(false, "No policy information has been added");

            foreach (var policy in newCase.MainMember.Policies)
            {
                var benefits = await _productOptionService.GetBenefitsForOption(policy.ProductOptionId);

                var spouses = newCase.Spouse.Where(s => s.Policies != null && s.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();
                var children = newCase.Children.Where(s => s.Policies != null && s.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();
                var members = newCase.ExtendedFamily.Where(s => s.Policies != null && s.Policies.Any(p => p.PolicyId == policy.PolicyId)).ToList();

                var spouseBenefits = benefits.Where(s => s.CoverMemberType == CoverMemberTypeEnum.Spouse).ToList();
                var childBenefits = benefits.Where(s => s.CoverMemberType == CoverMemberTypeEnum.Child).ToList();
                var memberBenefits = benefits.Where(s => s.CoverMemberType == CoverMemberTypeEnum.ExtendedFamily).ToList();

                if (spouses.Count > 0 && spouseBenefits.Count == 0)
                    ruleResults.Add(GetRuleResult(false, $"Cannot add a spouse to policy {policy.PolicyNumber}. No applicable benefits defined for this policy."));
                if (children.Count > 0 && childBenefits.Count == 0)
                    ruleResults.Add(GetRuleResult(false, $"Cannot add children to policy {policy.PolicyNumber}. No applicable benefits defined for this policy."));
                if (members.Count > 0 && memberBenefits.Count == 0)
                    ruleResults.Add(GetRuleResult(false, $"Cannot add exetended family members to policy {policy.PolicyNumber}. No applicable benefits defined for this policy."));
            }

            var errors = ruleResults.Where(rr => !rr.Passed).ToList().Count;
            return GetRuleRequestResult(errors == 0, ruleResults);
        }


        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Member Relations",
                MessageList = new List<string>() { message }
            };
        }

        private RuleRequestResult GetRuleRequestResult(bool success, string message)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>() { GetRuleResult(success, message) },
                OverallSuccess = success
            };
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
    }
}
