using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

namespace RMA.Service.FinCare.BusinessProcessTasks.ManageGroupRiskBilling
{
    public class ManageGroupRiskBilling : IWizardProcess
    {
        private readonly IInvoiceService _invoiceService;
        private readonly IRolePlayerService _roleplayerService;
        private readonly IGroupRiskPolicyCaseService _groupRiskService;
        private readonly IUserService _userService;
        private readonly IUserReminderService _userReminderService;

        public ManageGroupRiskBilling(IInvoiceService invoiceService,
            IRolePlayerService roleplayerService,
            IGroupRiskPolicyCaseService groupRiskService,
            IUserService userService,
            IUserReminderService userReminderService)
        {
            _invoiceService = invoiceService;
            _roleplayerService = roleplayerService;
            _groupRiskService = groupRiskService;
            _userService = userService;
            _userReminderService = userReminderService;
        }
        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var payrollModel = context?.Deserialize<GroupRiskBenefitPayroll>(stepData[0].ToString());
            var ruleResults = new List<RuleResult>();

            foreach (var payroll in payrollModel.BenefitPayrolls)
            {
                if(payroll.EffectiveDate.Date != DateTimeHelper.StartOfTheMonth(payroll.EffectiveDate.Date))
                {
                    ruleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = "Payroll",
                        MessageList = new List<string> { "Effective date has to be the first of the month" }
                    });
                }

                var policyBenefitRate = await _groupRiskService.GetPolicyBenefitRate(payroll.BenefitDetailId, payroll.BenefitCategoryId, payroll.EffectiveDate);
                if(policyBenefitRate.BenefitRateId == 0)
                    ruleResults.Add(new RuleResult
                    {
                        Passed = false,
                        RuleName = "Payroll",
                        MessageList = new List<string> { "No valid benefit rate found" }
                    });
                if(policyBenefitRate.BenefitRateId > 0)
                    if(policyBenefitRate.EffectiveDate > payroll.EffectiveDate.Date)
                        ruleResults.Add(new RuleResult
                        {
                            Passed = false,
                            RuleName = "Payroll",
                            MessageList = new List<string> { "Payroll effective date has to be after the benefit rate effective date" }
                        });
            }

            return new RuleRequestResult
            {
                OverallSuccess = ruleResults.All(x => x.Passed),
                RuleResults = ruleResults,
                RequestId = Guid.NewGuid()
            };
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

        public async Task OnRequestForApproval(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);
            var groupRiskBenefitPayrollModel = context?.Deserialize<GroupRiskBenefitPayroll>(stepData[0].ToString());
            var rolePlayer = await _roleplayerService.GetRolePlayerWithoutReferenceData(groupRiskBenefitPayrollModel.RolePlayerId);

            try
            {
                var link = $"/fincare/billing-manager/manage-grouprisk-billing/continue/{wizard.Id}";
                var recipients = await _userService.SearchUsersByPermission("Approve Group Risk Billing");

                var userReminders = recipients.Select(recipient => new UserReminder
                {
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    UserReminderItemType = UserReminderItemTypeEnum.PolicyPremiumRate,
                    AlertDateTime = DateTimeHelper.SaNow,
                    Text = $"Approval request for wizard Billing : {rolePlayer.DisplayName}",
                    LinkUrl = link,
                    AssignedToUserId = recipient.Id
                }).ToList();

                _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));

            }
            catch (Exception e)
            {
                e.LogException();
            }
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var wizardId = await AddWizard(context);
            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context)
        {
            var benefitPayrollModel = new GroupRiskBenefitPayroll();
            benefitPayrollModel.RolePlayerId = context.LinkedItemId;
            benefitPayrollModel.BenefitPayrolls = new List<BenefitPayroll>();
            var isNew = context.LinkedItemId <= 0;



            if(isNew)
            {
                benefitPayrollModel = context.Deserialize<GroupRiskBenefitPayroll>(context?.Data);
            }
            else
            {
                var benefitPayroll = await _groupRiskService.GetBenefitPayrollById(context.LinkedItemId);
                benefitPayrollModel.RolePlayerId = benefitPayroll.RolePlayerId;
                benefitPayrollModel.BenefitPayrolls = new List<BenefitPayroll> { benefitPayroll };
            }

            var stepData = new ArrayList() { benefitPayrollModel };

            var rolePlayer = await _roleplayerService.GetRolePlayerWithoutReferenceData(benefitPayrollModel.RolePlayerId);

            string label = "";
            if (rolePlayer != null)
            {
                label = !isNew
               ? $"Update Policy Billing for-{rolePlayer.DisplayName}"
               : $"Policy Billing for {rolePlayer.DisplayName}";
            }

            return await context.CreateWizard(label, stepData);

        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var benefitPayrolls = context.Deserialize<GroupRiskBenefitPayroll>(stepData[0].ToString());

            foreach (var benefitPayroll in benefitPayrolls.BenefitPayrolls)
            {
              await _groupRiskService.GroupRiskBenefitPayrollUpsert(benefitPayroll);
            }
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
