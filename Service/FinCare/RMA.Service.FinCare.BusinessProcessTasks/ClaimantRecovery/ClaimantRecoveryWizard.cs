using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

using Action = RMA.Service.ClaimCare.Contracts.Entities.Action;

namespace RMA.Service.FinCare.BusinessProcessTasks.ClaimantRecovery
{
    public class ClaimantRecoveryWizard : IWizardProcess
    {
        private readonly IClaimRecoveryInvoiceService _invoiceService;
        private readonly ITransactionService _transactionService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimService;
        private readonly IWizardService _wizardService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private const string WizardLabel = "Claimant Recovery";

        public ClaimantRecoveryWizard(IRolePlayerService rolePlayerService
            , IClaimService claimService
            , IClaimRecoveryInvoiceService invoiceService
            , ITransactionService transactionService
            , IWizardService wizardService
            , IDocumentGeneratorService documentGeneratorService)
        {
            _rolePlayerService = rolePlayerService;
            _claimService = claimService;
            _invoiceService = invoiceService;
            _transactionService = transactionService;
            _wizardService = wizardService;
            _documentGeneratorService = documentGeneratorService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var claimInvoiceAndAllocations = await _claimService.GetClaimInvoiceAndAllocationsByClaimId(context.LinkedItemId);
            var rolePlayer = await _rolePlayerService.GetRolePlayer(claimInvoiceAndAllocations.InvoiceAllocations[0].BeneificaryRolePlayerId);

            var recoveryModel = new ClaimantRecoveryModel()
            {
                RolePlayer = rolePlayer,
                ClaimId = context.LinkedItemId,
                RecoveryAmount = claimInvoiceAndAllocations.AuthorisedAmount

            };
            var stepData = new ArrayList() { recoveryModel };

            return await context.CreateWizard(WizardLabel, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var claimantRecoveryModel = context.Deserialize<ClaimantRecoveryModel>(stepData[0].ToString());

            await CreateRecoveryInvoice(claimantRecoveryModel, wizard.CreatedBy);
            await ClaimRecoveryProcess(claimantRecoveryModel);
            await UpdateClaimStatus(claimantRecoveryModel);
        }

        private async Task CreateRecoveryInvoice(ClaimantRecoveryModel claimantRecoveryModel, string createdByUser)
        {
            //create Billing.ClaimRecoveryInvoice
            var billingClaimRecovery =
                new ClaimRecoveryInvoice
                {
                    Amount = claimantRecoveryModel.RecoveryAmount.GetValueOrDefault(),
                    ClaimId = claimantRecoveryModel.ClaimId,
                    InvoiceStatus = InvoiceStatusEnum.Pending
                };
            var claimRecoveryInvoiceId = await _invoiceService.AddInvoice(billingClaimRecovery);

            await _rolePlayerService.CreateClaimantFinPayee(claimantRecoveryModel.RolePlayer);

            //create Billing.Transaction
            var claim = await _claimService.GetClaim(claimantRecoveryModel.ClaimId);
            var transaction = new Transaction
            {
                Amount = claimantRecoveryModel.RecoveryAmount.GetValueOrDefault(),
                RolePlayerId = claimantRecoveryModel.RolePlayer.RolePlayerId,
                TransactionDate = DateTimeHelper.SaNow,
                TransactionType = TransactionTypeEnum.ClaimRecoveryInvoice,
                TransactionTypeLinkId = (int)TransactionActionType.Debit,
                Reason = "Claim recovery process",
                BankReference = claim.ClaimReferenceNumber,
                ClaimRecoveryInvoiceId = claimRecoveryInvoiceId
            };

            await _transactionService.AddClaimRecoveryInvoiceTransaction(transaction);

            //create Claim.ClaimsRecovery
            var claimRecovery = new ClaimRecovery
            {
                ClaimId = claimantRecoveryModel.ClaimId,
                ClaimNumber = claim.PersonEventId,
                ClaimStatus = ClaimCare.Contracts.Enums.ClaimStatusEnum.PaymentRecovery,
                ClaimStatusId = (int)ClaimCare.Contracts.Enums.ClaimStatusEnum.PaymentRecovery,
                IdNumber = claimantRecoveryModel.RolePlayer.Person.IdNumber,
                Name = claimantRecoveryModel.RolePlayer.DisplayName,
                RolePlayerId = claimantRecoveryModel.RolePlayer.RolePlayerId,
                RecoveryInvokedBy = createdByUser,
                WorkPool = WorkPoolEnum.IndividualAssessorpool,
                ClaimRecoveryInvoiceId = claimRecoveryInvoiceId,
                PaymentPlan = claimantRecoveryModel.PaymentPlan,
                PaymentDay = claimantRecoveryModel.PaymentDay,
                ClaimRecoveryReason = claimantRecoveryModel.RecoveryReason
            };
            await _claimService.CreateClaimRecovery(claimRecovery);
        }

        private async Task ClaimRecoveryProcess(ClaimantRecoveryModel claimantRecoveryModel)
        {
            await _claimService.ClaimRecovery(claimantRecoveryModel.ClaimId);
        }

        private async Task UpdateClaimStatus(ClaimantRecoveryModel claimantRecoveryModel)
        {
            Action action = new Action();
            action.ItemId = claimantRecoveryModel.ClaimId;
            action.UserId = null;
            action.Status = ClaimCare.Contracts.Enums.ClaimStatusEnum.PaymentRecovery;
            action.ItemType = ItemTypeEnum.Claim.DisplayAttributeValue();

            await _claimService.UpdateStatus(action);
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
            if (rejectWizardRequest != null)
            {
                var wizard = await _wizardService.GetWizard(rejectWizardRequest.WizardId);
                await SendRejectedNotification(wizard, rejectWizardRequest);
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
        private async Task SendRejectedNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.SendWizardNotification("claims-rejection-notification", "Request for Claimant Recovery was Rejected"
                , rejectWizardRequest.Comment, null, wizard.LinkedItemId, wizard.CreatedBy);
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
