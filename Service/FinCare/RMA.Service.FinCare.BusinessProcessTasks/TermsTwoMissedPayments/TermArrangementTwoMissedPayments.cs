using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.TermsTwoMissedPayments
{
    public class TermArrangementTwoMissedPayments : IWizardProcess
    {
        private readonly ITermsArrangementService _termsArrangementService;
        public TermArrangementTwoMissedPayments(ITermsArrangementService termsArrangementService)
        {
            _termsArrangementService = termsArrangementService;
        }
        public async Task<int> StartWizard(IWizardContext context)
        {
            var termArrangementSchedule = context.Deserialize<TermArrangementSchedule>(context.Data);

            var notification = new Admin.BusinessProcessManager.Contracts.Entities.Notification()
            {
                Title = $"Debtor:{termArrangementSchedule.MemberNumber}",
                Message = termArrangementSchedule.NotificationMessage,
                ActionLink = null,
                HasBeenReadAndUnderstood = false
            };

            var label = $"{notification.Title}";
            var stepData = new ArrayList() { notification };
            var wizardId = await context.CreateWizard(label, stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context?.Deserialize<ArrayList>(wizard.Data);

            var termsArrangementschedule = context?.Deserialize<TermArrangementSchedule>(stepData[0].ToString());
            if (termsArrangementschedule != null)
                await _termsArrangementService.MissedTwoPayments();
        }

        public Task CancelWizard(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            throw new NotImplementedException();
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OnApprove(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OnSaveStep(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task OverrideWizard(IWizardContext context)
        {
            throw new NotImplementedException();
        }

        public Task UpdateStatus(IWizardContext context)
        {
            throw new NotImplementedException();
        }
    }
}
