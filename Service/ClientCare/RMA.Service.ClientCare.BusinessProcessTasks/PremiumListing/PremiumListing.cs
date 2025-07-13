using RMA.Common.Extensions;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.PremiumListing
{
    public class PremiumListing : IWizardProcess
    {
        private readonly IPremiumListingService _premiumListingService;
        private readonly IWizardService _wizardService;
        private readonly IConfigurationService _configurationService;
        private readonly IUserService _userService;
        private readonly IPremiumListingFileAuditService _premiumListingFileAuditService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyService _policyService;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;
        private readonly IPeriodService _periodService;

        public const string PolicyChangesQueueName = "mcc.fin.billingpolicychanges";

        public PremiumListing(
            IPremiumListingService premiumListingService,
            IWizardService wizardService,
            IConfigurationService configurationService,
            IUserService userService,
            IPremiumListingFileAuditService premiumListingFileAuditService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyService policyService,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService,
            IPeriodService periodService
        )
        {
            _premiumListingService = premiumListingService;
            _wizardService = wizardService;
            _configurationService = configurationService;
            _userService = userService;
            _premiumListingFileAuditService = premiumListingFileAuditService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _policyService = policyService;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
            _periodService = periodService;
        }

        public Task<int> StartWizard(IWizardContext context)
        {
            //THIS WIZARD IS INJECTED BY THE SYSTEM USING STORED PROC [policy].[GeneratePremiumListingTask]
            return Task.FromResult(-999);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            List<BillingPolicyChangeDetail> oldChildBillingPolicyChangeDetails = new List<BillingPolicyChangeDetail>();
            List<BillingPolicyChangeDetail> newChildBillingPolicyChangeDetails = new List<BillingPolicyChangeDetail>();

            var wizard = context.Deserialize<Wizard>(context.Data);
            var data = GetWizardData(context, wizard.Data);

            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var @case = context.Deserialize<Case>(stepData[0].ToString());

            var policyNumber = await _premiumListingFileAuditService.GetPolicyNumber(new Guid(data.FileIdentifier));

            var existingPolicyDetail = await _rolePlayerPolicyService.GetRolePlayerPolicyByNumber(policyNumber);
            var existingChildMemberCount = await _policyService.GetChildPolicyCount(existingPolicyDetail.PolicyId);

            var existingDependentPolicies = await _policyService.GetDependentPolicies(existingPolicyDetail.PolicyId);

            var request = new ImportInsuredLivesRequest
            {
                Company = data.Company,
                FileIdentifier = data.FileIdentifier,
                SaveInsuredLives = true,
                CreateNewPolicies = data.CreateNewPolicies,
                WizardId = wizard.Id
            };

            // Run in background thread, because there is a very good chance that it
            // will time out, especially if the number of members in the file exceeds 2,000.

            // Removed background thread, causing uncommitted read
            var summary = await _premiumListingService.ImportGroupPolicy(wizard.Name, request);

            var entity = await _policyService.GetPolicyByPolicyId(existingPolicyDetail.PolicyId);
            var newChildMemberCount = await _policyService.GetChildPolicyCount(existingPolicyDetail.PolicyId);

            decimal invoiceTotal = entity.InstallmentPremium - existingPolicyDetail.InstallmentPremium;

            var premiumListingMembersPaged = await _premiumListingService.GetPremiumListingMembers(
                new Common.Entities.DatabaseQuery.PagedRequest(data.FileIdentifier, 1, 1000));

            if (newChildMemberCount != existingChildMemberCount && invoiceTotal != 0)
            {
                // Queue PolicyChanged message for billing processing
                foreach (var premiumListingMember in premiumListingMembersPaged.Data)
                {
                    if (new string(premiumListingMember.MemberType.Where(x => !char.IsWhiteSpace(x)).ToArray()).Contains(CoverMemberTypeEnum.MainMember.GetDescription()))
                    {
                        // Validate if we need to raise adjustments
                        var joinPeriod = await _periodService.GetPeriodByDate(premiumListingMember.JoinDate);
                        var currentPeriod = await _periodService.GetPeriodByDate(DateTimeHelper.SaNow);

                        if (joinPeriod.StartDate >= currentPeriod.StartDate)
                        {
                            continue;
                        }

                        // Get old child policy change
                        var existingDependentPolicy = existingDependentPolicies.FirstOrDefault(x => x.PolicyId == premiumListingMember.PolicyId);

                        if (existingDependentPolicy == null && premiumListingMember.PolicyPremium.HasValue && premiumListingMember.PolicyPremium.Value > 0)
                        {
                            var newChildPolicy = await _policyService.GetPolicyByPolicyId(premiumListingMember.PolicyId);
                            // Add new child policy change
                            newChildBillingPolicyChangeDetails.Add(new BillingPolicyChangeDetail
                            {
                                PolicyId = premiumListingMember.PolicyId,
                                DecemberInstallmentDayOfMonth = newChildPolicy.DecemberInstallmentDayOfMonth,
                                FirstInstallmentDate = newChildPolicy.FirstInstallmentDate,
                                PolicyInceptionDate = newChildPolicy.PolicyInceptionDate.Value,
                                PolicyStatus = newChildPolicy.PolicyStatus,
                                InstallmentPremium = premiumListingMember.PolicyPremium.Value,
                                EffectiveDate = premiumListingMember.JoinDate
                            });
                        }

                        if (existingDependentPolicy != null)
                        {
                            if (existingDependentPolicy.InstallmentPremium != premiumListingMember.PolicyPremium)
                            {
                                var updatedChildPolicy = await _policyService.GetPolicyByPolicyId(premiumListingMember.PolicyId);
                                // Add old child policy change
                                oldChildBillingPolicyChangeDetails.Add(new BillingPolicyChangeDetail
                                {
                                    PolicyId = existingDependentPolicy.PolicyId,
                                    DecemberInstallmentDayOfMonth = existingDependentPolicy.DecemberInstallmentDayOfMonth,
                                    FirstInstallmentDate = existingPolicyDetail.FirstInstallmentDate,
                                    PolicyInceptionDate = (DateTime)existingDependentPolicy.PolicyInceptionDate,
                                    PolicyStatus = existingDependentPolicy.PolicyStatus,
                                    InstallmentPremium = existingDependentPolicy.InstallmentPremium
                                });

                                // Add new child policy change
                                newChildBillingPolicyChangeDetails.Add(new BillingPolicyChangeDetail
                                {
                                    PolicyId = premiumListingMember.PolicyId,
                                    DecemberInstallmentDayOfMonth = updatedChildPolicy.DecemberInstallmentDayOfMonth,
                                    FirstInstallmentDate = updatedChildPolicy.FirstInstallmentDate,
                                    PolicyInceptionDate = updatedChildPolicy.PolicyInceptionDate.Value,
                                    PolicyStatus = updatedChildPolicy.PolicyStatus,
                                    InstallmentPremium = premiumListingMember.PolicyPremium.Value,
                                    EffectiveDate = premiumListingMember.JoinDate
                                });
                            }
                        }
                    }
                }

                var basePremiumAmount = Math.Abs(invoiceTotal);

                var billingPolicyChangeMessage = new BillingPolicyChangeMessage()
                {
                    OldPolicyDetails = new BillingPolicyChangeDetail
                    {
                        PolicyId = existingPolicyDetail.PolicyId,
                        DecemberInstallmentDayOfMonth = existingPolicyDetail.DecemberInstallmentDayOfMonth,
                        FirstInstallmentDate = existingPolicyDetail.FirstInstallmentDate,
                        PolicyInceptionDate = existingPolicyDetail.PolicyInceptionDate,
                        PolicyStatus = existingPolicyDetail.PolicyStatus,
                        InstallmentPremium = existingPolicyDetail.InstallmentPremium
                    },
                    NewPolicyDetails = new BillingPolicyChangeDetail
                    {
                        PolicyId = entity.PolicyId,
                        DecemberInstallmentDayOfMonth = entity.DecemberInstallmentDayOfMonth,
                        FirstInstallmentDate = entity.FirstInstallmentDate,
                        PolicyInceptionDate = (DateTime)entity.PolicyInceptionDate,
                        PolicyStatus = entity.PolicyStatus,
                        InstallmentPremium = entity.InstallmentPremium,
                        // Fees already included in the installment premium
                        AdministrationPercentage = 0M,
                        BinderFeePercentage = 0M,
                        CommissionPercentage = 0M,
                        PremiumAdjustmentPercentage = 0M
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

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var listing = GetWizardData(context, wizard.Data);

            if (wizard.WizardStatus == WizardStatusEnum.InProgress)
            {
                var ruleResult = await _premiumListingService.GetGroupPolicyImportErrors(listing.FileIdentifier);
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

        private ImportInsuredLivesRequest GetWizardData(IWizardContext context, string json)
        {
            if (json.StartsWith("[", StringComparison.OrdinalIgnoreCase))
            {
                var stepData = context.Deserialize<List<ImportInsuredLivesRequest>>(json);
                return stepData[0];
            }
            else
            {
                return context.Deserialize<ImportInsuredLivesRequest>(json);
            }
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, "Premium Listing Upload was Rejected");

                    var fileIdentifier = wizard.Data;

                    await _premiumListingFileAuditService.UpdatePremiumListingStatusByFileIdentifier(fileIdentifier, PremiumListingStatusEnum.Rejected);
                }
            }
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
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

        private async Task SendNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest, string title)
        {
            await _wizardService.SendWizardNotification("member-portal-notification", title,
                rejectWizardRequest.Comment, null, wizard.LinkedItemId, wizard.CreatedBy);
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
