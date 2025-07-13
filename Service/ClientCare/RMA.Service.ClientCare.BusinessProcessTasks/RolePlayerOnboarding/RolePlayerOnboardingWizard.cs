using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using RMA.Common.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.RolePlayerOnboardingWizard
{
    public class RolePlayerOnboardingWizard : IWizardProcess
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRolePlayerNoteService _rolePlayerNoteService;
        private readonly IDocumentIndexService _documentIndexService;

        public RolePlayerOnboardingWizard(
            IRolePlayerService rolePlayerService,
            IRolePlayerNoteService rolePlayerNoteService,            
            IDocumentIndexService documentIndexService)
        {
            _rolePlayerService = rolePlayerService;
            _rolePlayerNoteService = rolePlayerNoteService;
            _documentIndexService = documentIndexService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var roleplayer = context.Deserialize<RolePlayer>(context.Data);

            var label = $"New Roleplayer Onboarding";
            var stepData = new ArrayList() { roleplayer };
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var rolePlayer = context.Deserialize<RolePlayer>(stepData[0].ToString());

            rolePlayer.MemberStatus = MemberStatusEnum.ActiveWithoutPolicies;

            var rolePlayerId = await _rolePlayerService.CreateRolePlayer(rolePlayer);
            await _rolePlayerService.CreateDebtor(rolePlayerId);
            await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.RolePlayerDocuments, "WizardId", wizard.Id.ToString(), "RolePlayerId", rolePlayerId.ToString());

            var rolePlayerNotes = await _rolePlayerNoteService.GetRolePlayerNotes(wizard.Id);
            foreach (var note in rolePlayerNotes)
            {
                note.RolePlayerId = rolePlayerId;
                await _rolePlayerNoteService.EditRolePlayerNote(note);
            }
        }

        #region Not Implemented
        public Task CancelWizard(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
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

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            return;
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }

}
