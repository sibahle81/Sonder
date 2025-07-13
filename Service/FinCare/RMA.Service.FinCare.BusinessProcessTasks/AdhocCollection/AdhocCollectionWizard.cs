using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.BusinessProcessTasks.AdhocCollection
{
    public class AdhocCollectionWizard : IWizardProcess
    {
        private readonly ICollectionService _collectionService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IBillingService _billingService;

        public AdhocCollectionWizard(
            ICollectionService collectionService,
            IRolePlayerService rolePlayerService,
            IDocumentGeneratorService documentGeneratorService,
            IBillingService billingService
        )
        {
            _collectionService = collectionService;
            _rolePlayerService = rolePlayerService;
            _documentGeneratorService = documentGeneratorService;
            _billingService = billingService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var stepData = new ArrayList();

            if (context.RequestInitiatedByBackgroundProcess)
            {
                var adhocDebitOrder = context.Deserialize<AdhocPaymentInstruction>(context.Data);
                var adhocList = new List<AdhocPaymentInstruction>() { adhocDebitOrder };
                stepData.Add(adhocList);
            }
            else
            {
                RmaIdentity.DemandPermission(Permissions.CaptureAdhocPremiumCollectionWizard);
                stepData.Add(new List<AdhocPaymentInstruction>());
            }

            var label = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.AdhocCollection, "");
            var wizardId = await context.CreateWizard($"Ad hoc Collection : {label}", stepData);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var collections = context.Deserialize<List<AdhocPaymentInstruction>>(stepData[0].ToString());

            await _collectionService.AddhocCollections(collections);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var collections = context.Deserialize<List<AdhocPaymentInstruction>>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();
            foreach (var collection in collections)
            {
                var rolePlayer = await _rolePlayerService.GetRolePlayer(collection.RolePlayerId);
                if (rolePlayer is null) ruleResults.Add(GetRuleResult("Role Player", $"Roleplayer {collection.RolePlayerName} does not exist."));
                if (rolePlayer != null) //Sonar Sube
                {
                    if (rolePlayer.RolePlayerBankingDetails is null)
                    {
                        ruleResults.Add(
                            GetRuleResult(
                                "Banking Details",
                                $"{collection.RolePlayerName} does not have a registered bank account"
                            )
                        );
                    }
                }
            }
            return GetRuleRequestResult(ruleResults.Count == 0, ruleResults);
        }

        private RuleResult GetRuleResult(string ruleName, string message)
        {
            var ruleResult = new RuleResult
            {
                RuleName = ruleName,
                Passed = false,
                MessageList = new List<string> { message }
            };
            return ruleResult;
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
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var collections = context.Deserialize<List<AdhocPaymentInstruction>>(stepData[0].ToString());

            foreach (var collection in collections)
            {
                var note = new BillingNote
                {
                    ItemId = collection.RolePlayerId,
                    ItemType = "Adhoc Collection Rejected",
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
    }
}
