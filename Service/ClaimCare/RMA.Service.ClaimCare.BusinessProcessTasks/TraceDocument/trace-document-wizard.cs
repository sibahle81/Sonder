using Newtonsoft.Json;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks.TraceDocument
{
    public class TraceDocumentWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IWizardService _wizardService;
        private readonly IDocumentIndexService _documentIndexService;

        public TraceDocumentWizard(
                IClaimService claimService
              , IWizardService wizardService
                , IDocumentIndexService documentIndexService)
        {
            _claimService = claimService;
            _wizardService = wizardService;
            _documentIndexService = documentIndexService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            const string newBeneficiary = "New trace Document";
            var tracerDocument = new Contracts.Entities.TraceDocumentModel();
            tracerDocument.ClaimId = context.LinkedItemId;
            var stepData = new ArrayList { tracerDocument };

            return await context.CreateWizard(newBeneficiary, stepData);
        }

        public Task SubmitWizard(IWizardContext context)
        {
           return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");
          
            var overallSuccess = true;
            var ruleResult = new RuleResult();
            var ruleResults = new List<RuleResult>();

            var keys = new Dictionary<string, string>();
            keys.Add("TraceDocument", context.LinkedItemId.ToString());

            var isDocument = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.TraceDocument, keys); ;

            if (isDocument[0].DocumentStatus == DocumentStatusEnum.Awaiting || isDocument[0].DocumentStatus == DocumentStatusEnum.Deleted)
            {
                ruleResult.Passed = false;
                ruleResult.RuleName = "Document Upload";
                ruleResult.MessageList.Add("No Document Uploaded");
                overallSuccess = false;
            }
            else
            {
                ruleResult.Passed = true;
                ruleResult.RuleName = "Document Upload";
                ruleResult.MessageList.Add("Document Uploaded");
            }

            ruleResults.Add(ruleResult);

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = overallSuccess,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
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
                await AddClaimNote(rejectWizardRequest);
                await SendRejectedNotification(wizard, rejectWizardRequest);
            }
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            if (rejectWizardRequest != null)
            {
                await AddClaimNote(rejectWizardRequest);
            }
        }

        public  Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public  Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        private async Task AddClaimNote(RejectWizardRequest rejectWizardRequest)
        {
            var claimId = (await _wizardService.GetWizard(rejectWizardRequest.WizardId)).LinkedItemId;
            var personEventId = (await _claimService.GetClaim(claimId)).PersonEventId;
            var claimNote = new ClaimNote()
            {
                PersonEventId = personEventId,
                ClaimId = claimId,
                Text = rejectWizardRequest.Comment
            };
            await _claimService.AddClaimNote(claimNote);
        }

        private async Task SendRejectedNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest)
        {
            var notification = new Notification()
            {
                HasBeenReadAndUnderstood = false,
                Message = rejectWizardRequest.Comment,
                Title = "Request for Trace document was Rejected}"
            };

            var startWizardRequest = new StartWizardRequest()
            {
                Type = "claims-rejection-notification",
                Data = JsonConvert.SerializeObject(notification),
                LinkedItemId = wizard.LinkedItemId,
                LockedToUser = wizard.CreatedBy
            };

            await _wizardService.StartWizard(startWizardRequest);

        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
