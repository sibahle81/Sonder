using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.PensCare.Contracts.Entities.PensionCase;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;
using RMA.Service.PensCare.Contracts.Interfaces.PensionCase;
using RMA.Service.PensCare.Contracts.Interfaces.PensionLedger;
using RMA.Service.PensCare.Contracts.Entities.PMP;
using RMA.Service.PensCare.Contracts.Interfaces.PMP;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.PMPScheduleWizard
{
    public class PMPScheduleFormWizard : IWizardProcess
    {
        private readonly IPensionCaseService _pensionCaseService;
        private readonly IConfigurationService _configuration;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IPensionLedgerService _pensionLedgerService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        private readonly IClaimService _claimService;
        private readonly IEventService _eventService;
        private readonly IPMPService _pmpService;

        public PMPScheduleFormWizard(IConfigurationService configuration,
            IPensionCaseService pensionCaseService,
            IRoleService roleService,
            IUserService userService,
            IRolePlayerService rolePlayerService,
            IPensionLedgerService pensionLedgerService,
            IPensionClaimMapService pensionClaimMapService,
            IClaimService claimService,
            IEventService eventService,
            IPMPService pmpService)
        {
            _configuration = configuration;
            _pensionCaseService = pensionCaseService;
            _roleService = roleService;
            _userService = userService;
            _rolePlayerService = rolePlayerService;
            _pensionLedgerService = pensionLedgerService;
            _pensionClaimMapService = pensionClaimMapService;
            _claimService = claimService;
            _eventService = eventService;
            _pmpService = pmpService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                return await Task.FromResult(-1).ConfigureAwait(false);

            var pensionerDetail = context.Deserialize<PensionClaimResponse>(context.Data);

            string label = $"Add PMP Schedule Details {pensionerDetail.PensionCaseNumber}";

            var stepData = new ArrayList() { pensionerDetail };
            var wizardId = await context.CreateWizard(label, stepData).ConfigureAwait(false);

            return await Task.FromResult(wizardId).ConfigureAwait(false);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) return;

            try
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var pensionClaimResponse = context.Deserialize<PensionClaimResponse>(stepData[0].ToString());

                await _pmpService.UpdatePMPSchedule(pensionClaimResponse).ConfigureAwait(true);

                await context.UpdateWizard(wizard).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                ex.LogException();
                throw;
            }
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            if (context == null) return;

            try
            {
                // use this if you want to do custom actions

                return;
            }
            catch (Exception ex)
            {
                ex.LogException();
                throw;
            }
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var ruleResults = new List<RuleResult>();

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var pensionClaimResponse = context.Deserialize<PensionClaimResponse>(stepData[0].ToString());

            var failedResult = ruleResults.FirstOrDefault(a => !a.Passed);

            var overallSuccess = failedResult == null ? true : false;

            return new RuleRequestResult()
            {
                OverallSuccess = overallSuccess,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            };
        }

        private RuleResult GenerateRuleResult(bool success, string ruleName, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = ruleName,
                MessageList = new List<string>() { message }
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            if (context == null) return;
            return;
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        public async Task<bool> CanApproveAsync(decimal cvAmount, RoleEnum role)
        {
            return true;
        }

        private static Wizard Approve(Wizard wizard)
        {
            wizard.WizardStatusId = (int)WizardStatusEnum.Completed;
            wizard.WizardStatusText = WizardStatusEnum.Completed.DisplayAttributeValue();
            wizard.CanApprove = true;
            wizard.HasApproval = true;

            return wizard;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
