using Newtonsoft.Json;

using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Informant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Informant;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class RolePlayerApproval : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IProductService _productService;
        private readonly IWizardService _wizardService;
        private readonly IRolePlayerService _rolePlayerRelationService;

        public RolePlayerApproval(
            IEventService eventService,
            IPolicyService policyService,
            IRolePlayerService rolePlayerService,
            IProductService productService,
            IWizardService wizardService,
            IRolePlayerService rolePlayerRelationService)
        {
            _eventService = eventService;
            _policyService = policyService;
            _rolePlayerService = rolePlayerService;
            _productService = productService;
            _wizardService = wizardService;
            _rolePlayerRelationService = rolePlayerRelationService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var reference = "Member Added";
            await _eventService.SubmitRolePlayerForApproval(reference, context.Data);
            return await _wizardService.GetLastWizard();
        }


        public async Task SubmitWizard(IWizardContext context)
        {
            if (context != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<MemberApproval>(wizard.Data);
                var eventEntity = stepData.Event;
                var rolePlayer = stepData.RolePlayer;
                var rolePlayerTypeId = rolePlayer.ToRolePlayers[0].RolePlayerTypeId;
                var personEvents = eventEntity.PersonEvents;
                eventEntity.PersonEvents = null;
                var insuredLifeId = await _rolePlayerService.CreateRolePLayerWithoutRelation(rolePlayer);


                // add rolePlayer relation
                await AddRolePlayerRelationPolicies(insuredLifeId, rolePlayer.ToRolePlayers[0].ToRolePlayerId, rolePlayerTypeId, rolePlayer.ToRolePlayers[0].PolicyId);

                foreach (var item in personEvents)
                {
                    item.InsuredLifeId = insuredLifeId;
                }

                eventEntity.EventReferenceNumber = await _eventService.GenerateEventUniqueReferenceNumber();
                var eventId = await _eventService.AddEventAndPersonEventDetails(eventEntity, personEvents);

                var startWizard = new StartWizardRequest()
                {
                    Type = "register-funeral-claim",
                    LinkedItemId = eventId
                };
                await _wizardService.StartWizard(startWizard);
            }
        }

        public async Task AddRolePlayerRelationPolicies(int fromRolePLayerId, int toRolePlayerId, int rolePlayerTypeId, int? policyId)
        {
            var policy = await _policyService.GetPolicy(Convert.ToInt32(policyId));

            var product = await _productService.GetProduct(policy.ProductOption.ProductId);
            if (product.ProductClassId == (int)ProductClassEnum.Assistance || product.ProductClassId == (int)ProductClassEnum.Life)
            {
                var rolePlayerRelation = new RolePlayerRelation();
                rolePlayerRelation.FromRolePlayerId = fromRolePLayerId;
                rolePlayerRelation.ToRolePlayerId = toRolePlayerId;
                rolePlayerRelation.PolicyId = policyId;
                rolePlayerRelation.RolePlayerTypeId = rolePlayerTypeId;
                await _rolePlayerService.AddRolePlayerRelation(rolePlayerRelation);

                var policyInsuredLife = new PolicyInsuredLife();
                policyInsuredLife.PolicyId = Convert.ToInt32(policyId);
                policyInsuredLife.RolePlayerId = fromRolePLayerId;

                if (rolePlayerTypeId != (int)RolePlayerTypeEnum.MainMemberSelf
                    || rolePlayerTypeId != (int)RolePlayerTypeEnum.Spouse
                    || rolePlayerTypeId != (int)RolePlayerTypeEnum.Husband
                    || rolePlayerTypeId != (int)RolePlayerTypeEnum.Wife
                    || rolePlayerTypeId != (int)RolePlayerTypeEnum.Child
                    || rolePlayerTypeId != (int)RolePlayerTypeEnum.Son
                    || rolePlayerTypeId != (int)RolePlayerTypeEnum.Daughter)
                {
                    policyInsuredLife.RolePlayerTypeId = (int)RolePlayerTypeEnum.Extended;
                }

                if (rolePlayerTypeId == (int)RolePlayerTypeEnum.Husband
                   || rolePlayerTypeId == (int)RolePlayerTypeEnum.Wife
                   || rolePlayerTypeId == (int)RolePlayerTypeEnum.Spouse)
                {
                    policyInsuredLife.RolePlayerTypeId = (int)RolePlayerTypeEnum.Spouse;
                }

                if (rolePlayerTypeId == (int)RolePlayerTypeEnum.Son
                    || rolePlayerTypeId == (int)RolePlayerTypeEnum.Child
                    || rolePlayerTypeId == (int)RolePlayerTypeEnum.Daughter)
                {
                    policyInsuredLife.RolePlayerTypeId = (int)RolePlayerTypeEnum.Child;
                }
                await _policyService.CreatePolicyInsuredLife(policyInsuredLife);
            }
        }

     

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
            return Task.FromResult(result);
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

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            if (rejectWizardRequest == null)
                throw new ArgumentNullException(nameof(rejectWizardRequest), "The provided rejectWizardRequest is null.");

            var wizard = await _wizardService.GetWizard(rejectWizardRequest.WizardId);
            await SendRejectedNotification(wizard, rejectWizardRequest);
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
        private async Task SendRejectedNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest)
        {
            var notification = new Notification()
            {
                HasBeenReadAndUnderstood = false,
                Message = rejectWizardRequest.Comment,
                Title = "Request for Add Member Approval was Rejected}"
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
