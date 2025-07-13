using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ClaimDiseaseWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IDiseaseService _diseaseService;
        private readonly IWizardService _wizardService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimService;
        private readonly ISerializerService _serializerService;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public ClaimDiseaseWizard(
                IEventService eventService
              , IWizardService wizardService
              , IRolePlayerService rolePlayerService
              , IDiseaseService diseaseService
              , IClaimService claimService
              , ISerializerService serializerService
              , IPoolWorkFlowService poolWorkFlowService
              , ISLAService slaService
              , ICommonSystemNoteService commonSystemNoteService)
        {
            _eventService = eventService;
            _diseaseService = diseaseService;
            _wizardService = wizardService;
            _rolePlayerService = rolePlayerService;
            _claimService = claimService;
            _serializerService = serializerService;
            _poolWorkFlowService = poolWorkFlowService;
            _slaService = slaService;
            _commonSystemNoteService = commonSystemNoteService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) { return 0; }

            var _event = context.Deserialize<Event>(context.Data);
            var action = _event.EventId > 0 ? "Edit" : "Add";

            var rolePlayer = await _rolePlayerService.GetRolePlayer((int)_event.MemberSiteId);
            _event.CompanyRolePlayer = rolePlayer;

            if (_event.EventId > 0)
            {
                foreach (var personEvent in _event.PersonEvents)
                {
                    personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                    _event.MemberSiteId = rolePlayer.RolePlayerId;

                    if (personEvent.PersonEmploymentId != null)
                    {
                        var employment = await _rolePlayerService.GetPersonEmploymentByPersonEmploymentId((int)personEvent.PersonEmploymentId);
                        if (employment != null)
                        {
                            personEvent.RolePlayer.Person.PersonEmployments = new List<PersonEmployment>
                            {
                                employment
                            };
                        }
                    }
                }
            }
            else
            {
                _event.MemberSiteId = rolePlayer.RolePlayerId;
                _event.EventReferenceNumber = await _eventService.GenerateEventUniqueReferenceNumber();
                _event.EventType = EventTypeEnum.Disease;
                _event.EventStatus = EventStatusEnum.Notified;
                _event.AdviseMethod = AdviseMethodEnum.CompCare;

                _event.PersonEvents = new List<PersonEvent>();

                var personEventRefNumber = await _eventService.GeneratePersonEventReferenceNumber();

                var personEvent = new PersonEvent()
                {
                    PersonEventId = Convert.ToInt32(personEventRefNumber),
                    PersonEventReferenceNumber = personEventRefNumber,
                    CompanyRolePlayerId = rolePlayer.RolePlayerId,
                    ClaimantId = rolePlayer.RolePlayerId,
                    PersonEventStatus = PersonEventStatusEnum.New
                };

                _event.PersonEvents.Add(personEvent);
            }

            var wizardDescription = $"{action} {_event.EventType.DisplayAttributeValue()} Notification Event Ref: {_event.EventReferenceNumber} Member Site: {rolePlayer.DisplayName}";

            var stepData = new ArrayList { _event };
            return await context.CreateWizard(wizardDescription, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                return;

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var _event = context.Deserialize<Event>(stepData[0].ToString());

            foreach (var personEvent in _event.PersonEvents)
            {
                personEvent.PersonEventStatus = personEvent.PersonEventStatus != PersonEventStatusEnum.New ? personEvent.PersonEventStatus : PersonEventStatusEnum.Submitted;

                if (personEvent.RolePlayer.RolePlayerId > 0)
                {
                    await EnsureRolePlayerRelationExists(personEvent.RolePlayer.RolePlayerId);
                    personEvent.RolePlayer.Person.IsVopdVerified = false;
                    await _rolePlayerService.EditRolePlayer(personEvent.RolePlayer);
                }
                else
                {
                    personEvent.RolePlayer.MemberStatus = MemberStatusEnum.Active;

                    personEvent.InsuredLifeId = await _rolePlayerService.CreateRolePlayer(personEvent.RolePlayer);

                    await EnsureRolePlayerRelationExists(personEvent.InsuredLifeId);

                    if (personEvent.RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
                    {
                        personEvent.RolePlayer.RolePlayerId = personEvent.InsuredLifeId;
                        personEvent.RolePlayer.Person.RolePlayerId = personEvent.InsuredLifeId;
                        await _rolePlayerService.RolePlayerVopdMultipleRequest(personEvent.RolePlayer.Person);
                    }
                }

                personEvent.PersonEmploymentId = (await _rolePlayerService.GetPersonEmployment(personEvent.InsuredLifeId, personEvent.CompanyRolePlayerId.Value))?.PersonEmpoymentId;
            }

            if (_event.EventId > 0)
            {
                await _eventService.UpdateEvent(_event);
            }
            else
            {
                _event.EventId = await _eventService.CreateEventDetails(_event);

                foreach (var personEvent in _event.PersonEvents)
                {
                    personEvent.EventId = _event.EventId;

                    await _diseaseService.SaveFirstMedicalReport(personEvent);

                    await VOPDProcessSAID(personEvent);

                    if ((bool)personEvent.IsFatal)
                    {
                        await CreatePoolWorkFlow(personEvent, WorkPoolEnum.CmcPool);

                        _ = Task.Run(() => CreateInvestigationWizard(personEvent));
                        _ = Task.Run(() => CreateCaptureEarningsWizard(personEvent));

                        await CreateSystemAddedCommonNotes(personEvent.PersonEventId, "PEV sent for investigation due to fatality");
                    }
                    else if (!personEvent.IsStraightThroughProcess)
                    {
                        await CreatePoolWorkFlow(personEvent, WorkPoolEnum.CadPool);
                    }
                }
            }
        }

        private async Task EnsureRolePlayerRelationExists(int rolePlayerId)
        {
            List<RolePlayerRelation> relations = await _rolePlayerService.GetAllRolePlayerRelations(rolePlayerId);

            bool hasRolePlayerId = false;

            foreach (var relation in relations)
            {
                if (relation.ToRolePlayerId == rolePlayerId)
                {
                    hasRolePlayerId = true;
                    break;
                }
            }

            if (!hasRolePlayerId)
            {
                var rolePlayerRelation = new RolePlayerRelation
                {
                    FromRolePlayerId = rolePlayerId,
                    ToRolePlayerId = rolePlayerId,
                    RolePlayerTypeId = (int)RolePlayerTypeEnum.PolicyOwner
                };

                await _rolePlayerService.AddRolePlayerRelation(rolePlayerRelation);
            }
        }

        private async Task CreatePoolWorkFlow(PersonEvent personEvent, WorkPoolEnum workPool)
        {
            var poolWorkFlow = new PoolWorkFlow()
            {
                PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent,
                ItemId = personEvent.PersonEventId,
                WorkPool = workPool,
                AssignedByUserId = RmaIdentity.UserId,
                AssignedToUserId = null,
                EffectiveFrom = DateTimeHelper.SaNow,
                EffectiveTo = null,
                Instruction = "Acknowledgement Required"
            };

            await UpdateSLAForPersonEvent(personEvent, workPool);
            await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
        }

        private async Task UpdateSLAForPersonEvent(PersonEvent personEvent, WorkPoolEnum workPool)
        {
            var slaItemType = workPool == WorkPoolEnum.CadPool ? SLAItemTypeEnum.CadPool
                            : workPool == WorkPoolEnum.CmcPool ? SLAItemTypeEnum.CmcPool
                            : workPool == WorkPoolEnum.ScaPool ? SLAItemTypeEnum.ScaPool
                            : workPool == WorkPoolEnum.CcaPool ? SLAItemTypeEnum.CcaPool
                            : workPool == WorkPoolEnum.ClaimsAssessorPool ? SLAItemTypeEnum.CaPool : SLAItemTypeEnum.Claim;

            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = slaItemType,
                ItemId = personEvent.PersonEventId,
                Status = personEvent.PersonEventStatus.ToString(),
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = "notification was created"
            };

            DateTime? effectiveTo = null;
            switch (slaItemType)
            {
                case SLAItemTypeEnum.Claim:
                    if (personEvent.PersonEventStatus == PersonEventStatusEnum.Closed)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }
                    break;
                case SLAItemTypeEnum.CadPool:
                case SLAItemTypeEnum.CmcPool:
                    if (personEvent.PersonEventStatus == PersonEventStatusEnum.ManuallyAcknowledged || personEvent.PersonEventStatus == PersonEventStatusEnum.AutoAcknowledged)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }
                    break;
                default:
                    effectiveTo = DateTimeHelper.SaNow;
                    break;
            }

            slaStatusChangeAudit.EffictiveTo = effectiveTo;
            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        private async Task VOPDProcessSAID(PersonEvent personEvent)
        {
            if (personEvent.InsuredLifeId > 0 && personEvent.RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
            {
                await _claimService.ProcessVOPDReponse(personEvent.InsuredLifeId);
            }
        }

        private async Task CreateSystemAddedCommonNotes(int personEventId, string noteText)
        {
            var hasNoteBeenAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEventId, noteText);
            if (!hasNoteBeenAdded)
            {
                var newSystemNote = new CommonSystemNote
                {
                    ItemId = personEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = noteText,
                    IsActive = true
                };
                await _commonSystemNoteService.CreateCommonSystemNote(newSystemNote);
            }
        }

        private async Task CreateInvestigationWizard(PersonEvent personEvent)
        {
            var startWizardRequest = new StartWizardRequest()
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "claim-investigation-coid",
                Data = _serializerService.Serialize(personEvent)
            };

            await _wizardService.StartWizard(startWizardRequest);
        }

        private async Task CreateCaptureEarningsWizard(PersonEvent personEvent)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "capture-earnings",
                Data = _serializerService.Serialize(personEvent)
            };

            await _wizardService.StartWizard(startWizardRequest);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var _event = context.Deserialize<Event>(stepData[0].ToString());

            var ruleResults = await CheckDuplicateEvents(_event);

            return GetRuleRequestResult(ruleResults.Passed, new List<RuleResult>() { ruleResults });
        }

        private async Task<RuleResult> CheckDuplicateEvents(Event eventBE)
        {
            var existingEvents = await _eventService.GetDuplicateEventsCheck(eventBE);

            if (!existingEvents.Any())
            {
                return GetRuleResult(true, "No duplicate events found.");
            }

            var eventsReferenceNumbers = existingEvents.Select(e => e.EventReferenceNumber.Trim())
                        .Distinct()
                        .ToList();

            var message = eventsReferenceNumbers.Count == 1
                ? $"There is already an existing event with these details. See Event Reference Number: {eventsReferenceNumbers[0]}"
                : $"There are {eventsReferenceNumbers.Count} existing events with these details. See Event Reference Numbers: {string.Join(", ", eventsReferenceNumbers)}";

            return GetRuleResult(true, message);
        }

        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Duplicate Event",
                MessageList = new List<string>() { message }
            };
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
