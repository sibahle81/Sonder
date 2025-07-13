using DocumentFormat.OpenXml.Office2010.ExcelAc;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
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
using RMA.Service.ClientCare.Services.Policy;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ConsolidatedFuneralOnboarding
{
    public class ConsolidatedFuneralOnboarding : IWizardProcess
    {
        private readonly IConsolidatedFuneralService _consolidatedFuneralService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyService _policyService;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;
        private readonly IPeriodService _periodService;

        public ConsolidatedFuneralOnboarding(
            IConsolidatedFuneralService consolidatedFuneralService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyService policyService,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService,
            IPeriodService periodService)
        {
            _consolidatedFuneralService = consolidatedFuneralService;
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
            List<BillingPolicyChangeDetail> oldChildBillingPolicyChangeDetails = new List<BillingPolicyChangeDetail>();
            List<BillingPolicyChangeDetail> newChildBillingPolicyChangeDetails = new List<BillingPolicyChangeDetail>();

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

            var policyNumber = await _consolidatedFuneralService.GetPolicyNumber(listing.FileIdentifier);

            var policyIds = new List<int>();
            RolePlayerPolicy existingPolicy = null; 
            var existingDependentMembers = new List<PolicyInsuredLife>();

            // Policy might not exist already, it could be a new policy
            if (!string.IsNullOrEmpty(policyNumber))
            {
                existingPolicy = await GetExistingPolicy(policyNumber);
                if (existingPolicy != null)
                {
                    policyIds.Add(existingPolicy.PolicyId);
                    var existingMembers = await _policyService.GetPolicyInsuredLives(policyIds);
                    existingDependentMembers.AddRange(existingMembers);
                }
            }

            var task = _consolidatedFuneralService.ImportConsolidatedFuneralPolicies(
                wizard.Id,
                wizard.Name,
                listing.FileIdentifier,
                listing.PolicyOnboardOption.Value,
                false,
                true);

            Task.WaitAll(task);

            if (task.IsCompleted)
            {
                if (existingPolicy != null)
                {
                    // Create premium adjustments
                    var newPolicy = await _policyService.GetPolicyByPolicyId(existingPolicy.PolicyId);
                    var newDependentMembers = await _policyService.GetPolicyInsuredLives(policyIds);

                    decimal invoiceTotal = newPolicy.InstallmentPremium - existingPolicy.InstallmentPremium;

                    if (newDependentMembers.Count != existingDependentMembers.Count && invoiceTotal != 0)
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

                        var consolidatedFuneralPolicyMembers = await _consolidatedFuneralService.GetFuneralMembers(listing.FileIdentifier);

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
                                ExtendedFamilyPolicyInsuredLives = existingDependentMembers
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
                            },
                            RequestedByUsername = SystemSettings.SystemUserAccount,
                            IsGroupPolicy = true,
                            PolicyChangeMessageType = PolicyChangeMessageTypeEnum.MemberCountChange,
                            SourceModule = SourceModuleEnum.ClientCare,
                            AdjustmentAmount = basePremiumAmount
                        };

                        billingPolicyChangeMessage.OldPolicyDetails.ChildBillingPolicyChangeDetails = oldChildBillingPolicyChangeDetails;
                        billingPolicyChangeMessage.NewPolicyDetails.ChildBillingPolicyChangeDetails = newChildBillingPolicyChangeDetails;

                        await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeMessage);
                    }
                }
            }
        }

        private async Task<RolePlayerPolicy> GetExistingPolicy(string policyNumber)
        {
            try
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyByNumber(policyNumber);
                return policy;
            }
            catch
            {
                return null;
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var listing = GetWizardData(context, wizard.Data);

            if (wizard.WizardStatus == WizardStatusEnum.InProgress)
            {
                var ruleResult = await _consolidatedFuneralService.GetConsolidatedFuneralImportErrors(listing.FileIdentifier);
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

        private ConsolidatedFuneralRequest GetWizardData(IWizardContext context, string json)
        {
            var stepData = context.Deserialize<List<ConsolidatedFuneralRequest>>(json);
            return stepData[0];
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
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
