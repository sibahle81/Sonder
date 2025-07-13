using Newtonsoft.Json;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

using Informant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Informant;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ClaimBeneficiaryWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IWizardService _wizardService;

        public ClaimBeneficiaryWizard(
                IClaimService claimService
              , IRolePlayerService rolePlayerService
              , IWizardService wizardService)
        {
            _claimService = claimService;
            _rolePlayerService = rolePlayerService;
            _wizardService = wizardService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            const string newBeneficiary = "New beneficiary";
            var result = CreateClaimBeneficiaryBankingModel();
            var stepData = new ArrayList { result };

            return await context.CreateWizard(newBeneficiary, stepData);
        }

        private static ClaimRolePlayerBankingModel CreateClaimBeneficiaryBankingModel()
        {
            return new ClaimRolePlayerBankingModel()
            {
                RolePlayer = new RolePlayer()
                {
                    Person = new Person(),
                    Informant = new Informant(),
                    HealthCareProvider = new HealthCareProviderModel(),
                    ForensicPathologist = new ForensicPathologist(),
                    FuneralParlor = new FuneralParlor(),
                    Undertaker = new Undertaker(),
                    BodyCollector = new BodyCollector()
                }
            };
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var claimBeneficiaryBankingModel = context.Deserialize<ClaimRolePlayerBankingModel>(stepData[0].ToString());

            var newRolePlayer = claimBeneficiaryBankingModel.RolePlayer;

            // Getting the policyId from the claim to get the mainMember
            var claim = await _claimService.GetClaim(wizard.LinkedItemId);
            var personEvent = await _claimService.GetPersonEventByClaimId(claim.ClaimId);
            var isMainMember = await _rolePlayerService.CheckIfMainMember(claim.PolicyId.Value, personEvent.InsuredLifeId);

            var mainMemberRolePlayerId = 0;
            if (!isMainMember)
            {
                mainMemberRolePlayerId = (await _rolePlayerService.GetMainMemberByPolicyId(claim.PolicyId.Value)).ToRolePlayerId;
            }
            else
            {
                mainMemberRolePlayerId = personEvent.InsuredLifeId;
            }

            // Checking if the Role player exists
            var rolePlayerExist = await _rolePlayerService.GetPersonRolePlayerByIdNumber(newRolePlayer.Person.IdType, newRolePlayer.Person.IdNumber);

            // If the client does not exist, create a new rolePlayer, banking details and insert into rolePlayerRelation table
            if (rolePlayerExist.Count <= 0)
            {
                newRolePlayer.ForensicPathologist = null;
                newRolePlayer.FuneralParlor = null;
                newRolePlayer.BodyCollector = null;
                newRolePlayer.HealthCareProvider = null;
                newRolePlayer.Undertaker = null;
                newRolePlayer.Informant = null;
                newRolePlayer.PolicyId = claim.PolicyId.Value;
                await _rolePlayerService.SaveRolePlayer(newRolePlayer, mainMemberRolePlayerId, RolePlayerTypeEnum.Beneficiary);
            }
            else
            {
                var newRelation = AddRelation(claim.PolicyId.Value, rolePlayerExist, mainMemberRolePlayerId);
                var getBeneficiaryRelationship = await _rolePlayerService.GetRelationByRolePlayerType(newRelation.FromRolePlayerId, RolePlayerTypeEnum.Beneficiary, Convert.ToInt32(newRelation.PolicyId));

                if (getBeneficiaryRelationship == null)
                {
                    await _rolePlayerService.AddRolePlayerRelation(newRelation);
                }
            }

            await _claimService.UpdateStatus(new Contracts.Entities.Action
            {
                ItemType = "claim",
                ItemId = claim.ClaimId,
                Status = ClaimStatusEnum.PolicyAdminCompleted,
                StatusId = Convert.ToInt32(ClaimStatusEnum.PolicyAdminCompleted),
                UserId = null,
            });
        }

        

        private static RolePlayerRelation AddRelation(int policyId, List<RolePlayer> rolePlayerExist, int mainMemberRolePlayerId)
        {
            return new RolePlayerRelation()
            {
                FromRolePlayerId = rolePlayerExist[0].RolePlayerId,
                ToRolePlayerId = mainMemberRolePlayerId,
                RolePlayerTypeId = Convert.ToInt32(RolePlayerTypeEnum.Beneficiary),
                PolicyId = policyId
            };
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            const bool overallSuccess = true;
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

        public async Task UpdateStatus(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var updatedWizard = await _wizardService.GetWizard(wizard.Id);
            var claim = await _claimService.GetClaim(wizard.LinkedItemId);
            var action = new Contracts.Entities.Action()
            {
                ActionDate = DateTime.Now,
                ItemId = claim.ClaimId
            };

            switch (updatedWizard.WizardStatus)
            {
                case WizardStatusEnum.AwaitingApproval:
                    action.Status = ClaimStatusEnum.PendingPolicyAdmin;
                    await _claimService.UpdateStatus(action);
                    return;
                case WizardStatusEnum.Disputed:
                case WizardStatusEnum.Rejected:
                    action.Status = ClaimStatusEnum.PolicyAdminCompleted;
                    await _claimService.UpdateStatus(action);
                    return;
            }
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

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRequestForApproval(IWizardContext context)
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
                Title = "Request for Beneficiary Approval was Rejected}"
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
