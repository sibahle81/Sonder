using RMA.Common.Interfaces;
using RMA.Common.Security;
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
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ManagePolicyGroupWizard
{
    public class ManagePolicyGroup : IWizardProcess
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyCaseService _caseService;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyService _policyService;
        private readonly IUserService _userService;
        private readonly IInvoiceService _invoiceService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;


        private const string PolicyAmendmentNotificationFlag = "AmendmentLetterFlag";
        public const string PolicyChangesQueueName = "mcc.fin.billingpolicychanges";

        private class CaseAmendmentData : Case
        {
            public bool AmendEmail { get; set; }
            public bool AmendContact { get; set; }
            public bool AmendPostal { get; set; }
            public bool AmendBanking { get; set; }

        };

        public ManagePolicyGroup(IRolePlayerPolicyService rolePlayerPolicyService,
             IPolicyCaseService caseService,
             IWizardService wizardService,
             ISerializerService serializer,
             IUserService userService,
             ITransactionCreatorService transactionCreatorService,
             IPolicyService policyService,
             IConfigurationService configurationService,
             IPolicyCommunicationService communicationService,
             IRolePlayerService rolePlayerService,
             IInvoiceService invoiceService,
             IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService)
        {
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _caseService = caseService;
            _wizardService = wizardService;
            _serializer = serializer;
            _rolePlayerService = rolePlayerService;
            _transactionCreatorService = transactionCreatorService;
            _configurationService = configurationService;
            _userService = userService;
            _policyService = policyService;
            _invoiceService = invoiceService;
            _communicationService = communicationService;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            RmaIdentity.DemandPermission(Permissions.CreateManagePolicyCaseWizard);
            var data = context.Deserialize<Case>(context.Data);
            var caseModel = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
            caseModel.CaseTypeId = (int)CaseTypeEnum.MaintainPolicyChanges;
            caseModel.Code = data.Code;
            var stepData = new ArrayList() { caseModel };

            var label = $"Maintain Policy: {caseModel.Code} - {caseModel.MainMember.DisplayName}";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var approveGroupPolicyEnabled = await _configurationService.GetModuleSetting("ApproveGroupPolicyEnabled");

            if (approveGroupPolicyEnabled?.ToLower() == "true" && context != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());
                var amendmentData = context.Deserialize<CaseAmendmentData>(stepData[0].ToString());
                var sharePolicyChanges = await _configurationService.IsFeatureFlagSettingEnabled(PolicyAmendmentNotificationFlag);

                if (sharePolicyChanges)
                {
                    await _communicationService.SendContactChangeMessages(@case, amendmentData.AmendEmail, amendmentData.AmendContact, amendmentData.AmendPostal, amendmentData.AmendBanking, true);
                }

                var policy = @case.MainMember.Policies[0];
                var existingPolicyDetail = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policy.PolicyId);
                var existingChildMemberCount = await _policyService.GetChildPolicyCount(policy.PolicyId);

                await _rolePlayerPolicyService.EditGroupPolicyWizard(@case);
                await _rolePlayerPolicyService.UpdateChildPolicyPremiums(policy.PolicyId);

                var entity = await _policyService.GetPolicyByPolicyId(policy.PolicyId);
                var newChildMemberCount = await _policyService.GetChildPolicyCount(policy.PolicyId);

                if (entity.PolicyOwner == null)
                    entity.PolicyOwner = existingPolicyDetail.PolicyOwner;

                decimal invoiceTotal = entity.InstallmentPremium - existingPolicyDetail.InstallmentPremium;

                if (newChildMemberCount != existingChildMemberCount && invoiceTotal != 0)
                {
                    var basePremiumAmount = Math.Abs(invoiceTotal);
                    
                    // Queue PolicyChanged message for billing processing
                    var billingPolicyChangeDetail = new BillingPolicyChangeMessage()
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
                            AdministrationPercentage = entity.AdminPercentage,
                            BinderFeePercentage = entity.BinderFeePercentage,
                            CommissionPercentage = entity.CommissionPercentage,
                            PremiumAdjustmentPercentage = entity.PremiumAdjustmentPercentage
                        },
                        RequestedByUsername = SystemSettings.SystemUserAccount,
                        IsGroupPolicy = false,
                        PolicyChangeMessageType = PolicyChangeMessageTypeEnum.MemberCountChange,
                        SourceModule = SourceModuleEnum.ClientCare,
                        AdjustmentAmount = basePremiumAmount
                    };
                    
                    await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeDetail);
                }

                if (policy.PolicyInceptionDate.Date != existingPolicyDetail.PolicyInceptionDate.Date)
                {
                    var basePremiumAmount = Math.Abs(invoiceTotal);
                    
                    // Queue PolicyChanged message for billing processing
                    var billingPolicyChangeDetail = new BillingPolicyChangeMessage()
                    {
                        OldPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = existingPolicyDetail.PolicyId,
                            DecemberInstallmentDayOfMonth = existingPolicyDetail.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = existingPolicyDetail.FirstInstallmentDate,
                            PolicyInceptionDate = existingPolicyDetail.PolicyInceptionDate,
                            PolicyStatus = existingPolicyDetail.PolicyStatus,
                            AdministrationPercentage = existingPolicyDetail.AdminPercentage,
                            BinderFeePercentage = existingPolicyDetail.BinderFeePercentage,
                            CommissionPercentage = existingPolicyDetail.CommissionPercentage,
                            PremiumAdjustmentPercentage = existingPolicyDetail.PremiumAdjustmentPercentage
                        },
                        NewPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = policy.PolicyId,
                            DecemberInstallmentDayOfMonth = policy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = policy.FirstInstallmentDate,
                            PolicyInceptionDate = policy.PolicyInceptionDate,
                            PolicyStatus = policy.PolicyStatus,
                            AdministrationPercentage = policy.AdminPercentage,
                            BinderFeePercentage = policy.BinderFeePercentage,
                            CommissionPercentage = policy.CommissionPercentage,
                            PremiumAdjustmentPercentage= policy.PremiumAdjustmentPercentage
                        },
                        RequestedByUsername = SystemSettings.SystemUserAccount,
                        IsGroupPolicy = true,
                        PolicyChangeMessageType = PolicyChangeMessageTypeEnum.InceptionDateChange,
                        AdjustmentAmount = basePremiumAmount,
                        SourceModule = SourceModuleEnum.ClientCare,
                        TransactionReason = "Inception Date Change"
                    };

                    await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeDetail);
                }

                await _wizardService.SendWizardNotification("clientcare-notification", "Policy Change Request Actioned", $"Your request to update policy {policy.PolicyNumber} has been successfully completed", "", policy.PolicyId, wizard.CreatedBy);

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.ModifiedBy);

                if (isBrokerOnPortal != null)
                {
                    var approvedMessage = await _configurationService.GetModuleSetting(SystemSettings.CaseApprovedMessage);
                    var request = new RejectWizardRequest()
                    {
                        WizardId = wizard.Id,
                        Comment = @case.Code + ":" + approvedMessage,
                        RejectedBy = wizard.CreatedBy
                    };
                    await SendNotification(wizard, request, $": Update Group Case {@case.Code} was Approved");
                }
            }
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return Task.FromResult(GetRuleRequestResult(true, ruleResults));
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult<string>(string.Empty);
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
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $"Update Group Case {@case.Code} was Rejected");
                }
            }
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $": Update Group Case {@case.Code} was Disputed");

                    wizard.LockedToUser = wizard.CreatedBy;
                    wizard.WizardStatus = WizardStatusEnum.Disputed;
                    wizard.WizardStatusId = (int)WizardStatusEnum.Disputed;
                    await _wizardService.UpdateWizard(wizard);
                }
            }
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
                rejectWizardRequest.Comment, null, 0, wizard.ModifiedBy);
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}

