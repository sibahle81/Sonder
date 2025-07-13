using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Claimant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Claimant;
using Informant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Informant;
namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class RegisterFuneralTask : IWizardProcess
    {
        private readonly IEventService _eventService;
        private readonly IClaimService _claimService;
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IStateProvinceService _stateProvinceService;
        private readonly IConfigurationService _configurationService;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly IBrokerageService _brokerageService;

        public RegisterFuneralTask(
            IClaimService claimService,
            IEventService eventService,
            IPolicyService policyService,
            IRolePlayerService rolePlayerService,
            IStateProvinceService stateProvinceService,
            IConfigurationService configurationService,
            IClaimCommunicationService claimCommunicationService,
            IBrokerageService brokerageService)
        {
            _claimService = claimService;
            _eventService = eventService;
            _policyService = policyService;
            _rolePlayerService = rolePlayerService;
            _stateProvinceService = stateProvinceService;
            _configurationService = configurationService;
            _claimCommunicationService = claimCommunicationService;
            _brokerageService = brokerageService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var eventEntity = await _eventService.GetEvent(context.LinkedItemId);

            var personEvent = eventEntity.PersonEvents.FirstOrDefault();
            personEvent.PersonEventDeathDetail = await _eventService.GetPersonEventDeathDetailByPersonEventId(personEvent.PersonEventId);

            var polices = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);
            var isIndividual = false;

            foreach (var policy in polices)
            {
                isIndividual = await _policyService.CheckIfPolicyIsGroupOrIndividual(policy.PolicyId);
            }

            personEvent.DocumentSetEnum = await _claimService.GetDocumentSetName(personEvent.PersonEventDeathDetail.DeathType, isIndividual);

            var name = $"New funeral claim: - {personEvent.PersonEventId}";

            var deceased = CreateRolePlayer(null);

            var values = EnumHelper.ToList<KeyRoleEnum>();
            personEvent.RolePlayers = new List<RolePlayer>();
            foreach (var role in values)
            {
                switch (role)
                {
                    case KeyRoleEnum.InsuredLife:
                        // Getting the deceased details
                        deceased = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                        deceased.KeyRoleType = KeyRoleEnum.InsuredLife.DisplayAttributeValue();
                        personEvent.RolePlayers.Add(deceased);
                        break;

                    case KeyRoleEnum.Claimant:
                        // Getting the Claimant details
                        var claimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                        claimant.Claimant = new Claimant();
                        claimant.KeyRoleType = KeyRoleEnum.Claimant.DisplayAttributeValue();
                        personEvent.RolePlayers.Add(claimant);
                        break;

                    case KeyRoleEnum.Informant:
                        // Getting the Informant details
                        var informant = CreateRolePlayer(null);
                        informant.Informant = new Informant();
                        informant.KeyRoleType = KeyRoleEnum.Informant.DisplayAttributeValue();
                        personEvent.RolePlayers.Add(informant);
                        break;

                    case KeyRoleEnum.MedicalServiceProvider:
                        var medicalServiceProvider = CreateRolePlayer(null);
                        medicalServiceProvider.KeyRoleType = KeyRoleEnum.MedicalServiceProvider.DisplayAttributeValue();
                        personEvent.RolePlayers.Add(medicalServiceProvider);
                        break;

                    case KeyRoleEnum.ForensicPathologist:
                        var forensicPathologist = CreateRolePlayer(null);
                        forensicPathologist.KeyRoleType = KeyRoleEnum.ForensicPathologist.DisplayAttributeValue();
                        forensicPathologist.ForensicPathologist.DateOfPostMortem = null;
                        personEvent.RolePlayers.Add(forensicPathologist);
                        break;

                    case KeyRoleEnum.FuneralParlor:
                        var funeralParlor = CreateRolePlayer(null);
                        funeralParlor.KeyRoleType = KeyRoleEnum.FuneralParlor.DisplayAttributeValue();
                        personEvent.RolePlayers.Add(funeralParlor);
                        break;

                    case KeyRoleEnum.Undertaker:
                        var undertaker = CreateRolePlayer(null);
                        undertaker.KeyRoleType = KeyRoleEnum.Undertaker.DisplayAttributeValue();
                        undertaker.Undertaker.DateOfBurial = null;
                        undertaker.Undertaker.DateOfBirth = null;
                        personEvent.RolePlayers.Add(undertaker);
                        break;

                    case KeyRoleEnum.BodyCollector:
                        var bodyCollector = CreateRolePlayer(null);
                        bodyCollector.KeyRoleType = KeyRoleEnum.BodyCollector.DisplayAttributeValue();
                        bodyCollector.BodyCollector.CollectionOfBodyDate = null;
                        bodyCollector.BodyCollector.DateOfBirth = null;
                        personEvent.RolePlayers.Add(bodyCollector);
                        break;
                }
            }

            var stepData = new ArrayList
                {
                    personEvent
                };

            // Verifying deceased            
            if (deceased.Person.IdType == IdTypeEnum.SAIDDocument && deceased.Person.IdNumber.Length == 13) // ????
            {
                await _rolePlayerService.RolePlayerVopdRequest(deceased.Person);
            }

            var funeralPolicy = polices[0];
            var brokerage = await _brokerageService.GetBrokerage(polices[0].BrokerageId);
            await _claimCommunicationService.SendCommunication(personEvent, funeralPolicy, brokerage);

            return await context.CreateWizard(name, stepData);
        }

        private RolePlayer CreateRolePlayer(RolePlayer rolePlayer)
        {
            if (rolePlayer == null)
            {
                return new RolePlayer()
                {
                    Person = new Person(),
                    Informant = new Informant(),
                    Claimant = new Claimant(),
                    HealthCareProvider = new HealthCareProviderModel(),
                    ForensicPathologist = new ForensicPathologist(),
                    FuneralParlor = new FuneralParlor(),
                    Undertaker = new Undertaker(),
                    BodyCollector = new BodyCollector(),
                };
            }
            else
            {
                return new RolePlayer()
                {
                    BodyCollector = string.IsNullOrEmpty(rolePlayer.BodyCollector.RegistrationNumber) ? null : rolePlayer.BodyCollector,
                    ForensicPathologist = string.IsNullOrEmpty(rolePlayer.ForensicPathologist.RegistrationNumber) ? null : rolePlayer.ForensicPathologist,
                    FuneralParlor = string.IsNullOrEmpty(rolePlayer.FuneralParlor.RegistrationNumber) ? null : rolePlayer.FuneralParlor,
                    Informant = string.IsNullOrEmpty(rolePlayer.Informant.IdNumber) ? null : rolePlayer.Informant,
                    Claimant = string.IsNullOrEmpty(rolePlayer.Claimant.IdNumber) ? null : rolePlayer.Claimant,
                    HealthCareProvider = string.IsNullOrEmpty(rolePlayer.HealthCareProvider.PracticeNumber) ? null : rolePlayer.HealthCareProvider,
                    Undertaker = string.IsNullOrEmpty(rolePlayer.Undertaker.RegistrationNumber) ? null : rolePlayer.Undertaker,
                    RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                    IsDeleted = false,
                    Person = CreatePerson(rolePlayer.Person),
                    DisplayName = rolePlayer.Person.FirstName + " " + rolePlayer.Person.Surname,
                    CellNumber = rolePlayer.TellNumber,
                    TellNumber = rolePlayer.TellNumber
                };
            }
        }

        private async Task<int> CreateRolePlayerRole(int rolePlayerId, RolePlayer rolePlayer, KeyRoleEnum roleType)
        {
            if (roleType == KeyRoleEnum.FuneralParlor)
            {
                rolePlayer.FuneralParlor.RolePlayerId = rolePlayerId;
                return await _rolePlayerService.CreateFuneralParlor(rolePlayer.FuneralParlor);
            }
            else if (roleType == KeyRoleEnum.Undertaker)
            {
                rolePlayer.Undertaker.RolePlayerId = rolePlayerId;
                return await _rolePlayerService.CreateUndertaker(rolePlayer.Undertaker);
            }
            else if (roleType == KeyRoleEnum.BodyCollector)
            {
                rolePlayer.BodyCollector.RolePlayerId = rolePlayerId;
                return await _rolePlayerService.CreateBodyCollector(rolePlayer.BodyCollector);
            }

            return rolePlayerId;
        }

        private async Task<int> UpdateRolePlayerRole(int rolePlayerId, RolePlayer rolePlayer, KeyRoleEnum roleType)
        {
            if (roleType == KeyRoleEnum.FuneralParlor && !string.IsNullOrEmpty(rolePlayer.FuneralParlor.RegistrationNumber))
            {
                rolePlayer.FuneralParlor.RolePlayerId = rolePlayerId;
                return await _rolePlayerService.UpdateFuneralParlor(rolePlayer.FuneralParlor);
            }
            else if (roleType == KeyRoleEnum.Undertaker && !string.IsNullOrEmpty(rolePlayer.Undertaker.RegistrationNumber))
            {
                rolePlayer.Undertaker.RolePlayerId = rolePlayerId;
                return await _rolePlayerService.UpdateUndertaker(rolePlayer.Undertaker);
            }
            else if (roleType == KeyRoleEnum.BodyCollector && !string.IsNullOrEmpty(rolePlayer.BodyCollector.RegistrationNumber))
            {
                rolePlayer.BodyCollector.RolePlayerId = rolePlayerId;
                return await _rolePlayerService.UpdateBodyCollector(rolePlayer.BodyCollector);
            }

            return rolePlayerId;
        }

        private Person CreatePerson(Person person)
        {
            return new Person()
            {
                FirstName = person.FirstName,
                Surname = person.Surname,
                DateOfBirth = person.DateOfBirth,
                IdNumber = string.IsNullOrEmpty(person.IdNumber) ? person.PassportNumber : person.IdNumber,
                IdType = string.IsNullOrEmpty(person.IdNumber) ? IdTypeEnum.PassportDocument : IdTypeEnum.SAIDDocument,
                IsAlive = true
            };
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEventDetails = context.Deserialize<PersonEvent>(stepData[0].ToString());

            var provinceName = await _stateProvinceService.GetStateProvinceById(Convert.ToInt32(personEventDetails.PersonEventDeathDetail.PlaceOfDeath));
            personEventDetails.PersonEventDeathDetail.PlaceOfDeath = provinceName.Name;

            var informantRole = GetRoleByKeyRoleType(personEventDetails, KeyRoleEnum.Informant);
            var isInformantMandatory = await CheckMandatoryFields(informantRole.Informant.FirstName, informantRole.Informant.LastName
                , informantRole.Informant.IdNumber, informantRole.Informant.PassportNumber);
            if (isInformantMandatory)
            {
                IdTypeEnum idType;
                string identityNumber;
                GetIdentity(informantRole.Person, out idType, out identityNumber);
                personEventDetails.InformantId = await InsertOrUpdateRolePlayer(informantRole.RolePlayerId, idType, identityNumber, KeyRoleEnum.Informant, informantRole);
            }

            var funeralParlorRole = GetRoleByKeyRoleType(personEventDetails, KeyRoleEnum.FuneralParlor);
            var isFuneralMandatory = await CheckMandatoryFields(funeralParlorRole.Person.FirstName, funeralParlorRole.Person.Surname
                , funeralParlorRole.Person.IdNumber, funeralParlorRole.Person.PassportNumber);
            if (isFuneralMandatory)
            {
                IdTypeEnum idType;
                string identityNumber;
                GetIdentity(funeralParlorRole.Person, out idType, out identityNumber);
                personEventDetails.PersonEventDeathDetail.FuneralParlorId = await InsertOrUpdateRolePlayer(funeralParlorRole.RolePlayerId, idType, identityNumber, KeyRoleEnum.FuneralParlor, funeralParlorRole);
            }

            var undertakerRole = GetRoleByKeyRoleType(personEventDetails, KeyRoleEnum.Undertaker);
            var isUnderTakerMandatory = await CheckMandatoryFields(undertakerRole.Person.FirstName, undertakerRole.Person.Surname
                , undertakerRole.Person.IdNumber, undertakerRole.Person.PassportNumber);

            if (isUnderTakerMandatory)
            {
                IdTypeEnum idType;
                string identityNumber;
                GetIdentity(undertakerRole.Person, out idType, out identityNumber);
                personEventDetails.PersonEventDeathDetail.UnderTakerId = await InsertOrUpdateRolePlayer(undertakerRole.RolePlayerId, idType, identityNumber, KeyRoleEnum.Undertaker, undertakerRole);
            }

            var bodyCollectorRole = GetRoleByKeyRoleType(personEventDetails, KeyRoleEnum.BodyCollector);
            var isBodyCollectorMandatory = await CheckMandatoryFields(bodyCollectorRole.Person.FirstName, bodyCollectorRole.Person.Surname
                , bodyCollectorRole.Person.IdNumber, bodyCollectorRole.Person.PassportNumber);

            if (isBodyCollectorMandatory)
            {
                IdTypeEnum idType;
                string identityNumber;
                GetIdentity(bodyCollectorRole.Person, out idType, out identityNumber);
                personEventDetails.PersonEventDeathDetail.BodyCollectorId = await InsertOrUpdateRolePlayer(bodyCollectorRole.RolePlayerId, idType, identityNumber, KeyRoleEnum.BodyCollector, bodyCollectorRole);
            }

            personEventDetails.PersonEventStatus = PersonEventStatusEnum.Open;
            personEventDetails.PersonEventDeathDetail.DoctorId = GetRoleByKeyRoleType(personEventDetails, KeyRoleEnum.MedicalServiceProvider).RolePlayerId;
            personEventDetails.PersonEventDeathDetail.ForensicPathologistId = GetRoleByKeyRoleType(personEventDetails, KeyRoleEnum.MedicalServiceProvider).RolePlayerId;

            await _eventService.UpdatePersonEventDetails(personEventDetails);
            await _eventService.UpdatePersonEventDeathDetail(personEventDetails.PersonEventDeathDetail);
            var personEvents = new List<PersonEvent> { personEventDetails };
            await _claimService.GenerateClaims(personEvents);
        }

        private static void GetIdentity(Person person, out IdTypeEnum idType, out string identityNumber)
        {
            if (string.IsNullOrEmpty(person.IdNumber))
            {
                idType = IdTypeEnum.PassportDocument;
                identityNumber = person.PassportNumber;
            }
            else
            {
                idType = IdTypeEnum.SAIDDocument;
                identityNumber = person.IdNumber;
            }
        }

        public static RolePlayer GetRoleByKeyRoleType(PersonEvent personEventDetails, KeyRoleEnum keyRoleEnum)
        {
            return personEventDetails?.RolePlayers.FirstOrDefault(a => a.KeyRoleType == keyRoleEnum.DisplayDescriptionAttributeValue());
        }

        private static Task<bool> CheckMandatoryFields(string firstName, string lastName, string idNumber, string passportNumber)
        {
            var isMandatory = !(string.IsNullOrEmpty(firstName) && string.IsNullOrEmpty(lastName) && (string.IsNullOrEmpty(idNumber) || string.IsNullOrEmpty(passportNumber)));

            return Task.FromResult(isMandatory);
        }

        private async Task<int> InsertOrUpdateRolePlayer(int id, IdTypeEnum idType, string identityNumber, KeyRoleEnum roleType, RolePlayer rolePlayer)
        {
            if (roleType == KeyRoleEnum.FuneralParlor || roleType == KeyRoleEnum.Undertaker || roleType == KeyRoleEnum.BodyCollector)
            {
                var roleplayer_person = await _rolePlayerService.GetPersonDetailsByIdNumber(idType, identityNumber);
                if (roleplayer_person != null && roleplayer_person.RolePlayerId > 0)
                {
                    var roleplayer_role = await _rolePlayerService.GetRolePlayerRole(roleplayer_person.RolePlayerId, roleType);

                    if (roleplayer_role != null && roleplayer_role.RolePlayerId > 0)
                        return await UpdateRolePlayerRole(roleplayer_role.RolePlayerId, rolePlayer, roleType);
                    else
                        return await CreateRolePlayerRole(roleplayer_person.RolePlayerId, rolePlayer, roleType);
                }
            }
            else if (id > 0) return id;
            var roleplayer = CreateRolePlayer(rolePlayer);
            return await _rolePlayerService.CreateRolePlayer(roleplayer);
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEventDetails = context.Deserialize<PersonEvent>(stepData[0].ToString());

            var deceasedRolePlayer = await _rolePlayerService.GetRolePlayer(personEventDetails.InsuredLifeId);

            var overallSuccess = true;
            var ruleResult = new RuleResult();
            var ruleResults = new List<RuleResult>();

            if (personEventDetails.IsVopdOverridden
                || deceasedRolePlayer.Person.IsVopdVerified
                && deceasedRolePlayer.Person.IdType == IdTypeEnum.SAIDDocument && !string.IsNullOrEmpty(deceasedRolePlayer.Person.IdNumber)
                || deceasedRolePlayer.Person.IdType == IdTypeEnum.PassportDocument && !string.IsNullOrEmpty(deceasedRolePlayer.Person.PassportNumber)
                || personEventDetails.PersonEventDeathDetail.DeathType == DeathTypeEnum.Stillborn
                )
            {
                ruleResult.Passed = true;
                ruleResult.RuleName = "VOPD Check";
                ruleResult.MessageList.Add("Death Verified");
            }
            else
            {
                ruleResult.Passed = false;
                ruleResult.RuleName = "VOPD Check";
                ruleResult.MessageList.Add("Death for deceased not yet verified");
                overallSuccess = false;
            }

            var eligibleRuleResult = new RuleResult();
            if (personEventDetails.anyEligiblePolicies)
            {
                eligibleRuleResult.Passed = true;
                eligibleRuleResult.RuleName = "Eligible Policies";
                eligibleRuleResult.MessageList.Add("You have eligible policies");
            }
            else
            {
                eligibleRuleResult.Passed = false;
                eligibleRuleResult.RuleName = "Eligible Policies";
                eligibleRuleResult.MessageList.Add("No eligible Policies, can't generate individual claims");
                overallSuccess = false;
            }

            ruleResults.Add(ruleResult);
            ruleResults.Add(eligibleRuleResult);

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

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
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