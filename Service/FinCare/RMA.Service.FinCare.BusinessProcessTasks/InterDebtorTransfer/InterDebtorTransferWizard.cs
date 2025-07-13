using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.InterDebtorTransfer
{
    public class InterDebtorTransferWizard : IWizardProcess
    {
        private readonly IInterDebtorTransferService _interDebtorTransferService;
        private readonly IBillingService _billingService;

        public InterDebtorTransferWizard(
            IInterDebtorTransferService interDebtorTransferService,
            IBillingService billingService)
        {
            _interDebtorTransferService = interDebtorTransferService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            RmaIdentity.DemandPermission(Permissions.CreateInterDebtorTransferWizard);

            var transactionTransfer = context.Deserialize<Billing.Contracts.Entities.InterDebtorTransfer>(context.Data);

            var label = $"Inter Debtor Transfer from {transactionTransfer.FromDebtorNumber} to {transactionTransfer.ReceiverDebtorNumber}";
            var stepData = new ArrayList() { transactionTransfer };
            return await context.CreateWizard(label, stepData);

        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var interDebtorTransfer = context.Deserialize<Billing.Contracts.Entities.InterDebtorTransfer>(stepData[0].ToString());
            await _interDebtorTransferService.InitiateTransferToDebtor(interDebtorTransfer);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            return await Task.FromResult(new RuleRequestResult
            {
                OverallSuccess = true,
                RuleResults = new List<RuleResult>(),
                RequestId = Guid.NewGuid()
            });
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        #region Unused interfaces for this wizard
        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var interDebtorTransfer = context.Deserialize<Billing.Contracts.Entities.InterDebtorTransfer>(stepData[0].ToString());

            var fromDebtorNumber = interDebtorTransfer.FromDebtorNumber;

            if (!string.IsNullOrEmpty(fromDebtorNumber))
            {
                var debtorAccount = await _billingService.GetFinPayeeAccountByFinPayeeNumber(fromDebtorNumber);
                var note = new BillingNote
                {
                    ItemId = debtorAccount.RolePlayerId,
                    ItemType = "Inter Debtor Transfer Rejected",
                    Text = wizard.Name + ' ' + rejectWizardRequest.Comment
                };
                await _billingService.AddBillingNote(note);
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
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion

    }
}
