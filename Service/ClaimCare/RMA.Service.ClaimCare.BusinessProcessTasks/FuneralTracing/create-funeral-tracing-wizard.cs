using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks.FuneralTracing
{
    public class CreateFuneralTracingWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimCareService;

        public CreateFuneralTracingWizard(
              IClaimService claimService
            , IRolePlayerService rolePlayerService
            , IClaimService claimCareService)
        {
            _claimService = claimService;
            _rolePlayerService = rolePlayerService;
            _claimCareService = claimCareService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            const string newTracer = "Create Funeral Tracing";
            var rolePlayer = CreateRolePlayer();

            var stepData = new ArrayList { rolePlayer };

            return await context.CreateWizard(newTracer, stepData);
        }

        private static RolePlayer CreateRolePlayer()
        {
            return new RolePlayer()
            {
                Person = new Person(),
            };
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var newRolePlayer = context.Deserialize<RolePlayer>(stepData[0].ToString());

            var existingRolePlayer = await _rolePlayerService.GetPersonDetailsByIdNumber(newRolePlayer.Person.IdType, newRolePlayer.Person.IdNumber);

            var rolePlayerId = existingRolePlayer.RolePlayerId == 0 ? await _rolePlayerService.CreateOnlyRolePlayer(newRolePlayer) : existingRolePlayer.RolePlayerId;

            var claimsTracer = new ClaimsTracing()
            {
                ClaimId = wizard.LinkedItemId,
                RolePlayerId = rolePlayerId,
                RolePlayerBankingId = null,
                IsDeleted = false
            };

            await _claimService.CreateClaimsTracer(claimsTracer);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var overallSuccess = true;
            var ruleResults = new List<RuleResult>();


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

        public  Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
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
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
