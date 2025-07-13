using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.MyValuePlusOnboarding
{
    public class MyValuePlusOnboarding : IWizardProcess
    {
        private readonly IMyValuePlusService _myValuePlusService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyService _policyService;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;
        private readonly IPeriodService _periodService;

        public MyValuePlusOnboarding(
            IMyValuePlusService myValuePlusService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyService policyService,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService,
            IPeriodService periodService
        )
        {
            _myValuePlusService = myValuePlusService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _policyService = policyService;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
            _periodService = periodService;
        }

        public Task<int> StartWizard(IWizardContext context)
        {
            return Task.FromResult(-999);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var listing = GetWizardData(context, wizard.Data);

            if (listing.PolicyOnboardOption == null)
            {
                listing.PolicyOnboardOption = PolicyOnboardOptionEnum.UpdateDefaultPolicy;

                if (listing.CreateNewPolicies.HasValue)
                {
                    listing.PolicyOnboardOption = listing.CreateNewPolicies.Value
                        ? PolicyOnboardOptionEnum.CreateNewPolicy
                        : PolicyOnboardOptionEnum.UpdateDefaultPolicy;
                }
            }

            Dictionary<int,string> policyIds = new Dictionary<int,string>();
            List<RolePlayerPolicy> ExistingRolePlayerPolicies = new List<RolePlayerPolicy>();
            List<PolicyInsuredLife> ExistingPolicyDependentMembers = new List<PolicyInsuredLife>();

            if (listing.PolicyOnboardOption != PolicyOnboardOptionEnum.CreateNewPolicy)
            {
                // Get List of previous policy ids related to the main member
                policyIds = await _myValuePlusService.GetPoliciesForRoleplayer(listing.FileIdentifier);
                ExistingRolePlayerPolicies = await GetExistingPolicies(policyIds);
                ExistingPolicyDependentMembers = await _policyService.GetPolicyInsuredLives(policyIds.Keys.ToList<int>());
            }

            var task = await _myValuePlusService.ImportMyValuePlusPolicies(
                wizard.Id,
                wizard.Name,
                listing.FileIdentifier,
                listing.PolicyOnboardOption.Value,
                false,
                true);

            if (listing.PolicyOnboardOption != PolicyOnboardOptionEnum.CreateNewPolicy)
            {
                var existingPolicyId = task.ExistingPolicyId;
                var existingPolicy = ExistingRolePlayerPolicies.FirstOrDefault(x => x.PolicyId.Equals(existingPolicyId));
                var existingDependentMembers = ExistingPolicyDependentMembers.Where(x => x.PolicyId.Equals(existingPolicyId)).ToList();

                if (existingPolicyId > 0)
                {
                    // Create premium adjustments
                    var newPolicy = await _policyService.GetPolicyByPolicyId(existingPolicyId);
                    var newDependentMembers = await _policyService.GetPolicyInsuredLives(new List<int>() { existingPolicyId });

                    decimal invoiceTotal = newPolicy.InstallmentPremium - existingPolicy.InstallmentPremium;

                    if (invoiceTotal != 0)
                    {
                        var newMembers = new List<PolicyInsuredLife>();

                        var effectiveDate = DateTime.Now;

                        foreach (var dependent in newDependentMembers)
                        {
                            if (!existingDependentMembers.Exists(x => x.RolePlayerId == dependent.RolePlayerId))
                            {
                                newMembers.Add(dependent);
                            }
                        }

                        if (newMembers.Any())
                        {
                            effectiveDate = newMembers.Min(x => x.StartDate.Value);
                        }

                        var basePremiumAmount = Math.Abs(invoiceTotal);

                        var billingPolicyChangeMessage = new BillingPolicyChangeMessage()
                        {
                            OldPolicyDetails = new BillingPolicyChangeDetail
                            {
                                PolicyId = existingPolicy.PolicyId,
                                DecemberInstallmentDayOfMonth = existingPolicy.DecemberInstallmentDayOfMonth,
                                FirstInstallmentDate = existingPolicy.FirstInstallmentDate,
                                PolicyInceptionDate = existingPolicy.PolicyInceptionDate,
                                PolicyStatus = existingPolicy.PolicyStatus,
                                InstallmentPremium = existingPolicy.InstallmentPremium,
                                ExtendedFamilyPolicyInsuredLives = existingDependentMembers,
                                ChildBillingPolicyChangeDetails = new List<BillingPolicyChangeDetail>(),
                            },
                            NewPolicyDetails = new BillingPolicyChangeDetail
                            {
                                PolicyId = newPolicy.PolicyId,
                                DecemberInstallmentDayOfMonth = newPolicy.DecemberInstallmentDayOfMonth,
                                FirstInstallmentDate = newPolicy.FirstInstallmentDate,
                                PolicyInceptionDate = (DateTime)newPolicy.PolicyInceptionDate,
                                PolicyStatus = newPolicy.PolicyStatus,
                                InstallmentPremium = newPolicy.InstallmentPremium,
                                EffectiveDate = effectiveDate,
                                ExtendedFamilyPolicyInsuredLives = newDependentMembers,
                                AdministrationPercentage = newPolicy.AdminPercentage,
                                BinderFeePercentage = newPolicy.BinderFeePercentage,
                                CommissionPercentage = newPolicy.CommissionPercentage,
                                PremiumAdjustmentPercentage = newPolicy.PremiumAdjustmentPercentage,
                                ChildBillingPolicyChangeDetails = new List<BillingPolicyChangeDetail>(),
                            },
                            RequestedByUsername = SystemSettings.SystemUserAccount,
                            IsGroupPolicy = false,
                            PolicyChangeMessageType = PolicyChangeMessageTypeEnum.AnnualPremiumIncrease,
                            SourceModule = SourceModuleEnum.ClientCare,
                            AdjustmentAmount = basePremiumAmount
                        };

                        await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeMessage);
                    }
                }
            }
        }

        private async Task<RolePlayerPolicy> GetExistingPolicy(string policyNumber)
        {
            return await _rolePlayerPolicyService.GetRolePlayerPolicyByNumber(policyNumber);
        }

        private async Task<List<RolePlayerPolicy>> GetExistingPolicies(Dictionary<int, string> policKeys)
        {
            List<RolePlayerPolicy> rolePlayerPolicies = new List<RolePlayerPolicy>();

            foreach (var policyKey in policKeys)
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyByNumber(policyKey.Value);
                rolePlayerPolicies.Add(policy);

            }
            return rolePlayerPolicies;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var listing = GetWizardData(context, wizard.Data);

            if (wizard.WizardStatus == WizardStatusEnum.InProgress)
            {
                var ruleResult = await _myValuePlusService.GetMyValuePlusImportErrors(listing.FileIdentifier);
                return ruleResult;
            }
            else
            {
                var result = new RuleRequestResult()
                {
                    OverallSuccess = true,
                    RequestId = Guid.NewGuid(),
                    RuleResults = new List<RuleResult>()
                };
                return result;
            }
        }

        private MyValuePlusRequest GetWizardData(IWizardContext context, string json)
        {
            var stepData = context.Deserialize<List<MyValuePlusRequest>>(json);
            return stepData[0];
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
