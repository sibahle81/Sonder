using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.InterBankTransfer
{
    public class InterBankTransferWizard : IWizardProcess
    {
        private readonly IInterBankTransferService _interBankTransferService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IBillingService _billingService;

        public InterBankTransferWizard(
            IInterBankTransferService interBankTransferService,
            IDocumentIndexService documentIndexService,
            IBillingService billingService)
        {
            _interBankTransferService = interBankTransferService;
            _documentIndexService = documentIndexService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var interBankTransfer = context.Deserialize<Billing.Contracts.Entities.InterBankTransfer>(context.Data);

            if (!interBankTransfer.IsInitiatedByClaimPayment)
            {
                RmaIdentity.DemandPermission(Permissions.CreateinterbanktransferWizard);
            }

            var label = $"transfer from: {interBankTransfer.FromAccountNumber} to {interBankTransfer.ReceiverDebtorNumber} ({interBankTransfer.ToAccountNumber}) : amount {interBankTransfer.TransferAmount:#.##}";

            var stepData = new ArrayList() { interBankTransfer };
            return await context.CreateWizard(label, stepData);

        }

        public async Task SubmitWizard(IWizardContext context)
        {
            try
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var interBankTransfer = context.Deserialize<Billing.Contracts.Entities.InterBankTransfer>(stepData[0].ToString());

                await _interBankTransferService.InitiateTransferToBank(interBankTransfer, wizard.Id);

                await _documentIndexService.UpdateDocumentKeyValues(interBankTransfer.RequestCode, interBankTransfer.ReceiverDebtorNumber);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
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
            var interBankTransfer = context.Deserialize<Billing.Contracts.Entities.InterBankTransfer>(stepData[0].ToString());

            var fromDebtorNumber = interBankTransfer.InterDebtorTransfer != null ? interBankTransfer.InterDebtorTransfer.FromDebtorNumber : interBankTransfer.ReceiverDebtorNumber;

            if (!string.IsNullOrEmpty(fromDebtorNumber))
            {
                var debtorAccount = await _billingService.GetFinPayeeAccountByFinPayeeNumber(fromDebtorNumber);
                var note = new BillingNote
                {
                    ItemId = debtorAccount.RolePlayerId,
                    ItemType = "Inter Bank Transfer Rejected",
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
