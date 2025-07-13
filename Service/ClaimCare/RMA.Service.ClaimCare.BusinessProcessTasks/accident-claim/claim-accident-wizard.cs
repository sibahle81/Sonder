using Newtonsoft.Json;

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
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ClaimAccidentWizard : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IWizardService _wizardService;
        private readonly IAccidentService _accidentService;
        private readonly IClaimService _claimService;
        private readonly ISerializerService _serializerService;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISLAService _slaService;
        private readonly IPolicyService _policyService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;
        private readonly IMedicalEstimatesService _medicalEstimatesService;

        public ClaimAccidentWizard(
              IEventService eventService
            , IRolePlayerService rolePlayerService
            , IWizardService wizardService
            , IAccidentService accidentService
            , IClaimService claimService
            , ISerializerService serializerService
            , IPoolWorkFlowService poolWorkFlowService
            , ISLAService slaService
            , IPolicyService policyService
            , ICommonSystemNoteService commonSystemNoteService
            , IMedicalEstimatesService medicalEstimatesService)
        {
            _eventService = eventService;
            _rolePlayerService = rolePlayerService;
            _wizardService = wizardService;
            _accidentService = accidentService;
            _claimService = claimService;
            _serializerService = serializerService;
            _poolWorkFlowService = poolWorkFlowService;
            _slaService = slaService;
            _policyService = policyService;
            _commonSystemNoteService = commonSystemNoteService;
            _medicalEstimatesService = medicalEstimatesService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) return 0;

            var _event = context.Deserialize<Event>(context.Data);

            var action = _event.EventId > 0 ? "Edit" : "Add";

            var companyRolePlayer = await _rolePlayerService.GetRolePlayer((int)_event.MemberSiteId);
            _event.CompanyRolePlayer = companyRolePlayer;

            if (_event.EventId > 0)
            {
                if (_event?.PersonEvents?.Count > 0)
                {
                    foreach (var personEvent in _event?.PersonEvents)
                    {
                        personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

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

                        personEvent.FirstMedicalReport = await _accidentService.GetFirstMedicalReportForm(personEvent.PersonEventId);
                    }
                }
            }
            else
            {
                _event.MemberSiteId = companyRolePlayer.RolePlayerId;
                _event.EventReferenceNumber = await _eventService.GenerateEventUniqueReferenceNumber();
                _event.EventType = EventTypeEnum.Accident;
                _event.EventStatus = EventStatusEnum.Notified;
                _event.AdviseMethod = AdviseMethodEnum.CompCare;
                _event.PersonEvents = new List<PersonEvent>();
            }

            var wizardDescription = $"{action} {_event.EventType.DisplayAttributeValue()} Notification Event Ref: {_event.EventReferenceNumber} Member Site: {companyRolePlayer.DisplayName}";
            var stepData = new ArrayList { _event };
            return await context.CreateWizard(wizardDescription, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null) { return; }

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var _event = context.Deserialize<Event>(stepData[0].ToString());

            var newPersonEvents = _event.PersonEvents.FindAll(s => s.PersonEventStatus == PersonEventStatusEnum.New);
            var d2fPersonEvents = await IdentifyD2FCases(_event.PersonEvents);

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
                personEvent.IsFatal = personEvent.PersonEventDeathDetail != null;

                var isSTPReasonId = await _accidentService.ValidateIsStraigthThroughProcessing(personEvent, _event.EventDate);

                if (isSTPReasonId == -1)
                {
                    personEvent.IsStraightThroughProcess = true;
                }
                else if (isSTPReasonId != -1)
                {
                    personEvent.IsStraightThroughProcess = false;
                    (personEvent.PersonEventStpExitReasons ?? (personEvent.PersonEventStpExitReasons = new List<PersonEventStpExitReason>())).Add(new PersonEventStpExitReason
                    {
                        PersonEventId = personEvent.PersonEventId,
                        StpExitReasonId = isSTPReasonId,
                        CreatedBy = RmaIdentity.Username,
                        ModifiedBy = RmaIdentity.Username
                    });
                }

                if (personEvent.FirstMedicalReport != null)
                {
                    await CreateIcd10CodesAndInjuryRank(_event, personEvent);
                }

                var result = await _accidentService.SetNotificationOnlyOrSTP(_event, personEvent);
                personEvent.IsStraightThroughProcess = result.IsStraightThroughProcess;
                personEvent.PersonEventStatus = result.PersonEventStatus;
            }

            if (_event.EventId > 0)
            {
                await _eventService.UpdateEvent(_event);
            }
            else
            {
                _event.EventId = await _eventService.CreateEventDetails(_event);
            }

            await ProcessSAIDForPersonEvents(_event);

            foreach (var personEvent in newPersonEvents)
            {
                personEvent.EventId = _event.EventId;
                await _accidentService.SaveFirstMedicalReport(personEvent);

                var personEventDB = await _eventService.GetPersonEvent(personEvent.PersonEventId);

                personEvent.RolePlayer.DisplayName = personEventDB.RolePlayer.DisplayName;
                personEvent.RolePlayer.Person.Surname = personEventDB.RolePlayer.Person.Surname;

                if ((bool)personEvent.IsFatal || (bool)personEventDB.IsFatal)
                {
                    await CreatePoolWorkFlow(personEvent, WorkPoolEnum.CmcPool, "Acknowledgement Required");

                    _ = Task.Run(() => CreateInvestigationWizard(personEvent));
                    _ = Task.Run(() => CreateCaptureEarningsWizard(personEvent));

                    await CreateSystemAddedCommonNotes(personEvent.PersonEventId, "Investigation and earnings workflows started. PEV assigned to CMC pool due to fatality");
                }
                else if (!personEvent.IsStraightThroughProcess)
                {
                    await CreatePoolWorkFlow(personEvent, WorkPoolEnum.CadPool, "Acknowledgement Required");
                }

                if (personEvent.IsStraightThroughProcess && personEvent.PersonEventStatus == PersonEventStatusEnum.PendingAcknowledgement)
                {
                    // Run in the background, because will time out when called from the scheduler
                    // Notification is a potential STP claim, awaiting validations
                    _ = Task.Run(() => AutoAcknowledgeSTP(personEvent));
                }
            }

            if (d2fPersonEvents?.Count > 0)
            {
                await ProcessD2FCases(d2fPersonEvents);
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

        private async Task ProcessD2FCases(List<PersonEvent> d2fPersonEvents)
        {
            foreach (var d2fPersonEvent in d2fPersonEvents)
            {
                await CreatePoolWorkFlow(d2fPersonEvent, WorkPoolEnum.CmcPool, "D2F Initiated");

                _ = Task.Run(() => CreateInvestigationWizard(d2fPersonEvent));
                _ = Task.Run(() => CreateCaptureEarningsWizard(d2fPersonEvent));

                await CreateSystemAddedCommonNotes(d2fPersonEvent.PersonEventId, "D2F initiated. Investigation and earnings workflows started. PEV re-assigned to CMC pool due to fatality");
            }
        }

        private async Task<List<PersonEvent>> IdentifyD2FCases(List<PersonEvent> personEvents)
        {
            var d2fPersonEvents = new List<PersonEvent>();

            var fatalPersonEvents = personEvents.Where(s => s.IsFatal.GetValueOrDefault() && s.PersonEventStatus != PersonEventStatusEnum.New).ToList();

            if (fatalPersonEvents?.Count > 0)
            {
                foreach (var targetFatalPersonEvent in fatalPersonEvents)
                {
                    var originalPersonEvent = await _eventService.GetPersonEvent(targetFatalPersonEvent.PersonEventId);
                    if (!originalPersonEvent.IsFatal.Value)
                    {
                        d2fPersonEvents.Add(targetFatalPersonEvent);
                    }
                }
            }

            return d2fPersonEvents;
        }

        private async Task AutoAcknowledgeSTP(PersonEvent personEvent)
        {
            var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer((int)personEvent.CompanyRolePlayerId);

            policies.RemoveAll(p => p.ProductCategoryType != ProductCategoryTypeEnum.Coid);
            await _claimService.AcknowledgeClaims(policies, personEvent.PersonEventId, true);
        }

        private async Task CreatePoolWorkFlow(PersonEvent personEvent, WorkPoolEnum workPool, string instruction)
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
                Instruction = instruction //"Acknowledgement Required"
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
                Reason = "Notification was created"
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

        private async Task CreateInvestigationWizard(PersonEvent personEvent)
        {
            var startWizardRequest = new StartWizardRequest()
            {
                Type = "claim-investigation-coid",
                Data = _serializerService.Serialize(personEvent),
                LinkedItemId = personEvent.PersonEventId
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

        private async Task CreateIcd10CodesAndInjuryRank(Event _event, PersonEvent personEvent)
        {
            var icd10Codes = JsonConvert.DeserializeObject<List<ICD10Code>>(personEvent.FirstMedicalReport.MedicalReportForm.Icd10CodesJson);

            foreach (var icd10Code in icd10Codes)
            {
                var defaultEstimateBasis = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter { EventType = _event.EventType, Icd10Codes = icd10Code.Icd10Code, ReportDate = personEvent.FirstMedicalReport.MedicalReportForm.ReportDate });
                var defaultEstimateMMI = 0M;

                if (defaultEstimateBasis?.Count > 0)
                {
                    switch (icd10Code.Severity)
                    {
                        case InjurySeverityTypeEnum.Mild: defaultEstimateMMI = defaultEstimateBasis[0].DaysOffMinimum; break;
                        case InjurySeverityTypeEnum.Moderate: defaultEstimateMMI = defaultEstimateBasis[0].DaysOffAverage; break;
                        case InjurySeverityTypeEnum.Severe: defaultEstimateMMI = defaultEstimateBasis[0].DaysOffMaximum; break;
                    }
                }

                personEvent.PhysicalDamages[0].Injuries.Add(new Injury
                {
                    BodySideAffectedType = icd10Code.BodySideAffected,
                    InjurySeverityType = icd10Code.Severity,
                    Icd10CodeId = icd10Code.Icd10CodeId,
                    Icd10DiagnosticGroupId = icd10Code.Icd10DiagnosticGroupId,
                    IcdCategoryId = icd10Code.Icd10CategoryId,
                    IcdSubCategoryId = icd10Code.Icd10SubCategoryId,
                    MmiDays = Convert.ToInt32(defaultEstimateMMI)
                });
            }

            foreach (var injury in personEvent.PhysicalDamages[0].Injuries)
            {
                if (injury.Icd10CodeId == 2)
                {
                    injury.IsDeleted = true;
                }
            }

            personEvent.PhysicalDamages[0].Injuries = personEvent.PhysicalDamages[0].Injuries.OrderByDescending(s => s.MmiDays).ToList();

            for (int i = 0; i < personEvent.PhysicalDamages[0].Injuries.Count - 1; i++)
            {
                if (!personEvent.PhysicalDamages[0].Injuries[i].IsDeleted)
                {
                    personEvent.PhysicalDamages[0].Injuries[i].InjuryRank = i + 1;
                }
            }
        }

        private async Task ProcessSAIDForPersonEvents(Event _event)
        {
            foreach (var personEvent in _event.PersonEvents)
            {
                if (personEvent.InsuredLifeId > 0 && personEvent.RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
                {
                    await _claimService.ProcessVOPDReponse(personEvent.InsuredLifeId);
                }
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
                ? $"There is already an existing event with these details. See Event Reference Number: { eventsReferenceNumbers[0] }"
                : $"There are {eventsReferenceNumbers.Count} existing events with these details. See Event Reference Numbers: { string.Join(", ", eventsReferenceNumbers) }";

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

        public  Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return Task.FromResult<string>(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
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

        public Task OnSaveStep(IWizardContext context)
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
