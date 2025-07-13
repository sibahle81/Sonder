using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Enums;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Claimant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Claimant;
using Informant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Informant;
using INoteService = RMA.Service.ClaimCare.Contracts.Interfaces.Claim.INoteService;
using SuspiciousTransactionRequest = RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionRequest;

namespace RMA.Service.ClaimCare.Services.Event
{
    public partial class EventFacade : RemotingStatelessService, IEventService
    {
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";
        private const string AddEventPermission = "Add Event";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_PersonEventDeathDetail> _personEventDeathDetailRepository;
        private readonly IRepository<claim_PersonEventAccidentDetail> _personEventAccidentDetailRepository;
        private readonly IRepository<claim_PersonEventDiseaseDetail> _personEventDiseaseDetailRepository;
        private readonly IRepository<claim_PersonEventNoiseDetail> _personEventNoiseDetailRepository;
        private readonly IRepository<claim_Event> _eventRepository;
        private readonly IRepository<claim_Injury> _injuryRepository;
        private readonly IRepository<claim_PersonEventStpExitReason> _personEventStpExitReasonRepository;
        private readonly IRepository<claim_StpExitReason> _stpExitReasonRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<claim_ClaimEstimate> _claimEstimateRepository;

        private readonly IEmailTemplateService _emailTemplateService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRepository<claim_DocumentRule> _documentRuleRepository;
        private readonly IDocumentTemplateService _documentTemplateService;
        private readonly IRepository<claim_RuleDocumentType> _ruleDocumentTypeRepository;
        private readonly ISendEmailService _emailService;
        private readonly ISendSmsService _smsService;
        private readonly IBrokerageService _brokerageService;
        private readonly IPolicyService _policyService;
        private readonly IProductService _productService;
        private readonly IProductOptionRuleService _productOptionRuleService;
        private readonly IProductOptionService _productOptionService;
        private readonly IConfigurationService _configurationService;
        private readonly IWorkPoolService _workPoolService;
        private readonly IRepository<claim_PhysicalDamage> _physicalDamageRepository;
        private readonly MediCare.Contracts.Interfaces.Medical.IICD10CodeService _iCD10CodeService;
        private readonly ISuspiciousTransactionModelService _suspiciousTransactionModelService;
        private readonly INoteService _noteService;
        private readonly ISLAService _slaService;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;

        private readonly IMedicalFormService _medicalFormService;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly IClaimRequirementService _claimRequirementService;
        private readonly IRepository<claim_ClaimAdditionalRequiredDocument> _claimAdditionalRequiredDocumentRepository;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        public EventFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_PersonEventDeathDetail> personEventDeathDetailRepository
            , IRepository<claim_PersonEventAccidentDetail> personEventAccidentDetailRepository
            , IRepository<claim_PersonEventDiseaseDetail> personEventDiseaseDetailRepository
            , IRepository<claim_PersonEventNoiseDetail> personEventNoiseDetailRepository
            , IRepository<claim_DocumentRule> documentRuleRepository
            , IRepository<claim_Injury> injuryRepository
            , IRepository<claim_PersonEventStpExitReason> personEventStpExitReasonRepository
            , IRepository<claim_StpExitReason> stpExitReasonRepository
            , IDocumentGeneratorService documentGeneratorService
            , IProductService productService
            , IEmailTemplateService emailTemplateService
            , IRolePlayerService rolePlayerService
            , IRolePlayerPolicyService rolePlayerPolicyService
            , ISendEmailService emailService
            , ISendSmsService smsService
            , IBrokerageService brokerageService
            , IDocumentTemplateService documentTemplateService
            , IRepository<claim_RuleDocumentType> ruleDocumentTypeRepository
            , IRepository<claim_Event> eventRepository
            , IPolicyService policyService
            , IProductOptionRuleService productOptionRuleService
            , IConfigurationService configurationService
            , IProductOptionService productOptionService
            , IWorkPoolService workPoolService
            , MediCare.Contracts.Interfaces.Medical.IICD10CodeService iCD10CodeService
            , ISuspiciousTransactionModelService suspiciousTransactionModelService
            , INoteService noteService
            , ISLAService slaService
            , IPoolWorkFlowService poolWorkFlowService
            , IRepository<claim_PhysicalDamage> physicalDamageRepository
            , IMedicalFormService medicalFormService
            , IClaimCommunicationService claimCommunicationService
            , ISerializerService serializer
            , IWizardService wizardService
            , IClaimRequirementService claimRequirementService
            , IRepository<claim_ClaimEstimate> claimEstimateRepository
            , IRepository<claim_ClaimAdditionalRequiredDocument> claimAdditionalRequiredDocumentRepository
            , ICommonSystemNoteService commonSystemNoteService)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _personEventRepository = personEventRepository;
            _eventRepository = eventRepository;
            _policyService = policyService;
            _personEventDeathDetailRepository = personEventDeathDetailRepository;
            _personEventAccidentDetailRepository = personEventAccidentDetailRepository;
            _personEventDiseaseDetailRepository = personEventDiseaseDetailRepository;
            _personEventNoiseDetailRepository = personEventNoiseDetailRepository;
            _documentGeneratorService = documentGeneratorService;
            _emailTemplateService = emailTemplateService;
            _documentRuleRepository = documentRuleRepository;
            _rolePlayerService = rolePlayerService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _documentTemplateService = documentTemplateService;
            _ruleDocumentTypeRepository = ruleDocumentTypeRepository;
            _emailService = emailService;
            _policyService = policyService;
            _productService = productService;
            _productOptionRuleService = productOptionRuleService;
            _smsService = smsService;
            _brokerageService = brokerageService;
            _configurationService = configurationService;
            _productOptionService = productOptionService;
            _workPoolService = workPoolService;
            _injuryRepository = injuryRepository;
            _personEventStpExitReasonRepository = personEventStpExitReasonRepository;
            _stpExitReasonRepository = stpExitReasonRepository;
            _physicalDamageRepository = physicalDamageRepository;
            _iCD10CodeService = iCD10CodeService;
            _suspiciousTransactionModelService = suspiciousTransactionModelService;
            _noteService = noteService;
            _slaService = slaService;
            _poolWorkFlowService = poolWorkFlowService;
            _medicalFormService = medicalFormService;
            _claimCommunicationService = claimCommunicationService;
            _serializer = serializer;
            _wizardService = wizardService;
            _claimRequirementService = claimRequirementService;
            _claimAdditionalRequiredDocumentRepository = claimAdditionalRequiredDocumentRepository;
            _claimEstimateRepository = claimEstimateRepository;
            _commonSystemNoteService = commonSystemNoteService;
        }

        #region Public Methods
        public async Task<int> AddEvent(Contracts.Entities.Event eventEntity)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            using (var scope = _dbContextScopeFactory.Create())
            {
                eventEntity.AdviseMethod = AdviseMethodEnum.Email;
                if (eventEntity.EventType == EventTypeEnum.Accident || eventEntity.EventType == EventTypeEnum.Disease)
                {
                    eventEntity.PersonEvents = null;
                }
                var entity = Mapper.Map<claim_Event>(eventEntity);

                _eventRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.EventId;
            }
        }

        public async Task<int> AddPersonEvent(PersonEvent personEvent)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var isClaimAssessor = RmaIdentity.IsUserAuthorised(Permissions.IndividualAssessorpool, false);
                if (isClaimAssessor)
                {
                    personEvent.AssignedToUserId = RmaIdentity.UserId;
                    personEvent.AssignedDate = DateTime.Now.ToSaDateTime();
                    var capturedUserId = personEvent.CapturedByUserId;
                    var userResult = await _workPoolService.IsUserInWorkPool(capturedUserId, WorkPoolEnum.IndividualAssessorpool);
                    if (userResult)
                    {
                        personEvent.AssignedToUserId = capturedUserId;
                    }
                }
                personEvent.DateCaptured = DateTime.Now.ToSaDateTime();
                var entity = Mapper.Map<claim_PersonEvent>(personEvent);
                if (personEvent.PersonEventId == 0)
                    entity.PersonEventId = Convert.ToInt32(personEvent.PersonEventReferenceNumber);
                _personEventRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.PersonEventId;
            }
        }

        public async Task<int> AddPersonEventDeathDetail(PersonEventDeathDetail personEventDeathDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            using (var scope = this._dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEventDeathDetail>(personEventDeathDetail);
                this._personEventDeathDetailRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.PersonEventId;
            }
        }

        public async Task<int> AddPersonEventAccidentDetail(PersonEventAccidentDetail personEventAccidentDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEventAccidentDetail>(personEventAccidentDetail);
                _personEventAccidentDetailRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.PersonEventId;
            }
        }

        public async Task<int> AddPersonEventDiseaseDetail(PersonEventDiseaseDetail personEventDiseaseDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEventDiseaseDetail>(personEventDiseaseDetail);
                _personEventDiseaseDetailRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.PersonEventId;
            }
        }

        public async Task<int> AddPersonEventNoiseDetail(PersonEventNoiseDetail personEventNoiseDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEventNoiseDetail>(personEventNoiseDetail);
                _personEventNoiseDetailRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.PersonEventId;
            }
        }

        public async Task<int> AddInsuredLifeDetail(RolePlayer rolePlayer, int parentRolePlayerId, int relation)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInsuredLife);

            var rolePlayerTypes = GetRolePlayerTypeEnums();
            //var item = new RolePlayerTypeEnum();
            var item = (RolePlayerTypeEnum)rolePlayerTypes.Where(x => x.Key == relation).FirstOrDefault().DisplayAttributeValue().FirstOrDefault();
            return await _rolePlayerService.SaveRolePlayer(rolePlayer, parentRolePlayerId, item);
        }

        public async Task<string> SendEmailCommunication(Contracts.Entities.Event eventEntity)
        {

            //This whole method needs to be refactored
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = eventEntity?.PersonEvents[0];
                var claimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                var insuredLifeId = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                var policies = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);
                var continuationPolicies = policies.Where(p => p.PolicyInsuredLives.Any(t => t.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf && t.RolePlayerId == personEvent.InsuredLifeId));




                //If policies are not found, means we doing stillborn or just added new member to claimant policies
                if (policies == null)
                {
                    policies = await _policyService.GetPoliciesByRolePlayer(personEvent.ClaimantId);
                }


                //Send email if InsuredLife is Main Member
                if (continuationPolicies != null)
                {


                    foreach (var contPolicy in continuationPolicies)

                    {

                        var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicy(contPolicy.PolicyId);
                        var coveredwithMain = (await _rolePlayerPolicyService.GetRolePlayerRelations(personEvent.InsuredLifeId, contPolicy.PolicyId));
                        var policyInsuredLife = contPolicy.PolicyInsuredLives.Where(pil => pil.PolicyId == contPolicy.PolicyId);
                        var productOptionRule = (await _productOptionRuleService.GetProductOptionRules(contPolicy.ProductOptionId)).Where(pr => pr.RuleId == 9);
                        var productOptionGroup = (await _productOptionService.GetProductOptionCoverTypeByproductOptionId(contPolicy.ProductOptionId)).Where(po => po.CoverType == CoverTypeEnum.GroupVoluntary || po.CoverType == CoverTypeEnum.GroupCompulsory || po.CoverType == CoverTypeEnum.CorporateVoluntary || po.CoverType == CoverTypeEnum.CorporateCompulsory);

                        if (productOptionRule.Any() && productOptionGroup.Any())
                        {
                            foreach (var member in coveredwithMain)
                            {
                                foreach (var goldWageLife in policyInsuredLife.Where(pil => pil.RolePlayerId == member.FromRolePlayerId))
                                {
                                    goldWageLife.InsuredLifeStatus = InsuredLifeStatusEnum.PremiumWaived;
                                    await _policyService.UpdatePolicyInsuredLife(goldWageLife);
                                }
                            }
                        }
                        else
                        {


                            List<RolePlayerTypeEnum> rolePlayerTypeEnums = new List<RolePlayerTypeEnum>();
                            rolePlayerTypeEnums.Add(RolePlayerTypeEnum.Beneficiary);

                            var beneficiaries = coveredwithMain.Where(b => b.RolePlayerTypeId == (int)RolePlayerTypeEnum.Spouse || b.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child);

                            string beneficiaryName;
                            string beneficiaryLastName;
                            string beneficiaryEmail;
                            int beneficiaryAge;


                            if (beneficiaries != null)
                            {
                                List<DocumentTypeEnum> documentTypes = new List<DocumentTypeEnum>();
                                foreach (var beneficiary in beneficiaries)
                                {
                                    var beneficiaryDetails = await _rolePlayerService.GetRolePlayer(beneficiary.FromRolePlayerId);
                                    if (beneficiaryDetails.Person != null)
                                    {
                                        beneficiaryAge = beneficiaryDetails.Person.Age;
                                        beneficiaryName = beneficiaryDetails.Person.FirstName;
                                        beneficiaryLastName = beneficiaryDetails.Person.Surname;
                                        beneficiaryEmail = beneficiaryDetails.EmailAddress ?? String.Empty;

                                        var policyContDocumentDetails = new DocumentDetails()
                                        {
                                            PolicyNumber = contPolicy.PolicyNumber,
                                            PersonFirstName = insuredLifeId.Person.FirstName,
                                            PersonLastName = insuredLifeId.Person.Surname,
                                            BeneficiaryFirstName = beneficiaryName,
                                            BeneficiaryLastName = beneficiaryLastName
                                        };


                                        var continuationFormEmailTokens = new Dictionary<string, string>
                                        {
                                            ["{policyNumber}"] = contPolicy.PolicyNumber,
                                            ["{deceasedFirstName}"] = insuredLifeId.Person.FirstName,
                                            ["{deceasedLastName}"] = insuredLifeId.Person.Surname,
                                            ["{beneficiaryFirstName}"] = beneficiaryName,
                                            ["{beneficiaryLastName}"] = beneficiaryLastName,
                                            ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                                        };
                                        var emailTemplate = (await _emailTemplateService.GetEmailTemplate((int)EmailTemplate.ClaimPolicyContinuationEmaill)).Template;
                                        foreach (var token in continuationFormEmailTokens)
                                        {
                                            emailTemplate = emailTemplate.Replace($"{token.Key}", token.Value);
                                        }


                                        documentTypes.Add(DocumentTypeEnum.ContinuationForm);
                                        var mailAttachMent = await GetAttachments(documentTypes, policyContDocumentDetails);

                                        if (beneficiaryAge >= 18)
                                        {
                                            var email = new SendMailRequest()
                                            {
                                                Subject = "Policy Continuation for Policy - " + contPolicy.PolicyNumber,
                                                FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                                                Recipients = beneficiaryEmail,
                                                Body = emailTemplate,
                                                IsHtml = true,
                                                Attachments = mailAttachMent,
                                                ItemId = personEvent.PersonEventId,
                                                ItemType = "PersonEvent"
                                            };
                                            await _emailService.SendEmail(email);
                                        }
                                        documentTypes.Clear();
                                    }
                                }
                            }
                        }
                    }
                }



                //one policy holder can only have one funeral policy, the only thing that can be added is benefits and product options
                //Business will have to give feedback here
                var funeralPolicy = new Policy();
                var isIndividual = true;
                List<int> brokerageIds = new List<int>();
                foreach (var policy in policies)
                {
                    var product = await _productService.GetProduct(policy.ProductOption.ProductId);

                    if (product.ProductClassId == (int)ProductClassEnum.Assistance || product.ProductClassId == (int)ProductClassEnum.Life)
                    {
                        funeralPolicy = policy;
                    }
                    var roleplayer = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                    isIndividual = (roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person);
                    brokerageIds.Add(policy.BrokerageId);
                }
                //var funeralPolicy = policies.Where(x => x.ProductOption.Product.ProductClassId == (int)ProductClassEnum.Assistance || x.ProductOption.Product.ProductClassId == (int)ProductClassEnum.Life).FirstOrDefault();

                var documentManagementHeader = new DocumentManagementHeader
                {
                    ClaimUniqueReference = $"{personEvent.PersonEventId}",
                    PolicyNumber = funeralPolicy == null ? null : funeralPolicy.PolicyNumber,
                    Name = insuredLifeId.Person.FirstName,
                    Surname = insuredLifeId.Person.Surname,
                };

                var documentRule = await _documentRuleRepository.Where(s => s.DeathType == personEvent.PersonEventDeathDetail.DeathType && s.IsIndividual == isIndividual)
                                       .Select(n => new DocumentRule
                                       {
                                           Id = n.Id,
                                           DeathType = n.DeathType,
                                           EmailTemplateId = n.EmailTemplateId,
                                           DocumentSetId = (int)n.DocumentSet
                                       }).SingleAsync();

                var emailTokens = new Dictionary<string, string>
                {
                    ["{policyNumber}"] = documentManagementHeader.PolicyNumber,
                    ["{claimNumber}"] = documentManagementHeader.ClaimUniqueReference,
                    ["{deceasedFirstName}"] = documentManagementHeader.Name,
                    ["{deceasedLastName}"] = documentManagementHeader.Surname,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                };
                var documentDetails = new DocumentDetails();


                var addressDetails = claimant.RolePlayerAddresses.FirstOrDefault();
                documentDetails.PersonFirstName = claimant.Person.FirstName;
                documentDetails.PersonLastName = claimant.Person.Surname;
                documentDetails.PolicyNumber = personEvent.PersonEventReferenceNumber;
                if (addressDetails != null)
                {
                    documentDetails.Address1 = addressDetails.AddressLine1;
                    documentDetails.Address2 = addressDetails.AddressLine2;
                    documentDetails.Address3 = addressDetails.PostalCode;
                }

                var enumDocumentType = await _ruleDocumentTypeRepository.Where(a => a.DocumentRuleId == documentRule.Id).Select(b => b.DocumentType).ToListAsync();

                var attachments = await GetAttachments(enumDocumentType, documentDetails);

                var htmlBody = (await _emailTemplateService.GetEmailTemplate(documentRule.EmailTemplateId.Value)).Template;
                foreach (var token in emailTokens) htmlBody = htmlBody.Replace($"{token.Key}", token.Value);


                var claimantEmailRequest = new SendMailRequest
                {
                    Recipients = claimant.EmailAddress,
                    Body = htmlBody,
                    IsHtml = true,
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Subject = "New Claim Registered",
                    Attachments = attachments,
                    ItemId = personEvent.PersonEventId,
                    ItemType = "PersonEvent"
                };

                if (claimant.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email)
                    await _emailService.SendEmail(claimantEmailRequest);


                if (await _configurationService.IsFeatureFlagSettingEnabled("EmailAllClaimPolicyBrokers"))
                {
                    if (personEvent.SendBrokerEmail)
                    {
                        List<string> emails = new List<string>();
                        foreach (var brokerageId in brokerageIds.Where(b => b > 0).Distinct())
                        {
                            var brokerage = await _brokerageService.GetBrokerage(brokerageId);
                            emails.AddRange(brokerage.Contacts.Where(c => !string.IsNullOrEmpty(c.Email)).Select(c => c.Email).ToList());
                        }
                        if (emails.Count > 0)
                        {
                            var brokerageMailRequest = new SendMailRequest
                            {
                                Recipients = string.Join(";", emails.Select(e => e).Distinct()),
                                Body = htmlBody,
                                IsHtml = true,
                                FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                                Subject = "New Claim Registered",
                                Attachments = attachments,
                                ItemId = personEvent.PersonEventId,
                                ItemType = "PersonEvent"
                            };
                            await _emailService.SendEmail(brokerageMailRequest);
                        }
                    }
                }
                else
                {
                    var brokerage = new Brokerage();
                    if (funeralPolicy.BrokerageId > 0)
                    {
                        brokerage = await _brokerageService.GetBrokerage(funeralPolicy.BrokerageId);
                    }
                    if (brokerage.Contacts.Where(c => !string.IsNullOrEmpty(c.Email)) != null && personEvent.SendBrokerEmail)
                    {
                        var brokerageMailRequest = new SendMailRequest
                        {
                            Recipients = brokerage.Contacts[0].Email,
                            Body = htmlBody,
                            IsHtml = true,
                            FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                            Subject = "New Claim Registered",
                            Attachments = attachments,
                            ItemId = personEvent.PersonEventId,
                            ItemType = "PersonEvent"
                        };
                        await _emailService.SendEmail(brokerageMailRequest);
                    }
                }

                if (claimant.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS)
                {
                    var tokens = new Dictionary<string, string>();
                    tokens.Add("claimNumber", documentManagementHeader.ClaimUniqueReference);
                    var name = "Registration of claim";
                    var smsNumber = new List<string>();
                    smsNumber.Add(claimant.CellNumber);
                    var smsNotification = new TemplateSmsRequest()
                    {
                        Name = name,
                        Tokens = tokens,
                        SmsNumbers = smsNumber,
                        ItemId = Convert.ToInt32(documentManagementHeader.ClaimUniqueReference),
                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                        Department = RMADepartmentEnum.Claims
                    };
                    var sendSms = await _smsService.SendTemplateSms(smsNotification);
                }
                return "sent";
            }
        }
        public async Task<int> AddEventDetails(Contracts.Entities.Event eventEntity)
        {

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            eventEntity.EventReferenceNumber = await GenerateEventUniqueReferenceNumber();
            var personEvents = eventEntity.PersonEvents;
            foreach (var item in personEvents)
            {
                item.PersonEventReferenceNumber = await GeneratePersonEventReferenceNumber();
            }
            eventEntity.PersonEvents = null;
            var eventId = await AddEvent(eventEntity);
            //List<PersonEvent> personEvents = eventEntity.PersonEvents;
            foreach (var personEvent in personEvents)
            {
                PersonEventDeathDetail personEventDeathDetail = personEvent.PersonEventDeathDetail; personEvent.PersonEventDeathDetail = null;
                PersonEventAccidentDetail personEventAccidentDetail = personEvent.PersonEventAccidentDetail; personEvent.PersonEventAccidentDetail = null;
                PersonEventNoiseDetail personEventNoiseDetail = personEvent.PersonEventNoiseDetail; personEvent.PersonEventNoiseDetail = null;
                PersonEventDiseaseDetail personEventDiseaseDetail = personEvent.PersonEventDiseaseDetail; personEvent.PersonEventDiseaseDetail = null;
                personEvent.EventId = eventId;
                //personEvent.PersonEventReferenceNumber = await GeneratePersonEventUniqueReferenceNumber();
                var personEventId = await AddPersonEvent(personEvent);
                if (personEventDeathDetail != null)
                {
                    personEventDeathDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventDeathDetail(personEventDeathDetail);
                }
                if (personEventDiseaseDetail != null)
                {
                    personEventDiseaseDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventDiseaseDetail(personEventDiseaseDetail);
                }
                if (personEventAccidentDetail != null)
                {
                    personEventAccidentDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventAccidentDetail(personEventAccidentDetail);
                }
                if (personEventNoiseDetail != null)
                {
                    personEventNoiseDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventNoiseDetail(personEventNoiseDetail);
                }
            }
            return eventId;
        }

        public async Task<int> AddEventAndPersonEventDetails(Contracts.Entities.Event eventEntity, List<PersonEvent> personEvents)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);

            var eventId = await AddEvent(eventEntity);
            foreach (var personEvent in personEvents)
            {
                PersonEventDeathDetail personEventDeathDetail = personEvent.PersonEventDeathDetail; personEvent.PersonEventDeathDetail = null;
                PersonEventAccidentDetail personEventAccidentDetail = personEvent.PersonEventAccidentDetail; personEvent.PersonEventAccidentDetail = null;
                PersonEventNoiseDetail personEventNoiseDetail = personEvent.PersonEventNoiseDetail; personEvent.PersonEventNoiseDetail = null;
                PersonEventDiseaseDetail personEventDiseaseDetail = personEvent.PersonEventDiseaseDetail; personEvent.PersonEventDiseaseDetail = null;
                personEvent.EventId = eventId;
                if (personEvent.PersonEventId == 0)
                    personEvent.PersonEventReferenceNumber = await GeneratePersonEventReferenceNumber();
                var personEventId = await AddPersonEvent(personEvent);
                if (personEventDeathDetail != null)
                {
                    personEventDeathDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventDeathDetail(personEventDeathDetail);
                }
                if (personEventDiseaseDetail != null)
                {
                    personEventDiseaseDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventDiseaseDetail(personEventDiseaseDetail);
                }
                if (personEventAccidentDetail != null)
                {
                    personEventAccidentDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventAccidentDetail(personEventAccidentDetail);
                }
                if (personEventNoiseDetail != null)
                {
                    personEventNoiseDetail.PersonEventId = personEventId;
                    var id = await AddPersonEventNoiseDetail(personEventNoiseDetail);
                }
            }
            return eventId;
        }

        public async Task<string> GenerateEventUniqueReferenceNumber()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.EventId, "");
            }
        }

        public async Task<string> GeneratePersonEventUniqueReferenceNumber()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var referenceNumberPrefix = DateTimeHelper.SaNow.ToString("yy");
                var personEventUniqueReference = await _personEventRepository.OrderByDescending(x => x.PersonEventId)
                    .Select(c => c.PersonEventReferenceNumber)
                    .FirstOrDefaultAsync();

                if (string.IsNullOrEmpty(personEventUniqueReference)) return $"{referenceNumberPrefix}000001";

                var match = Regex.Match(personEventUniqueReference, @"[0-9]{8}");

                if (!match.Success) return $"{referenceNumberPrefix}000001";

                var personEventReferenceNumber = personEventUniqueReference.Substring(2);
                var referenceNumber = Convert.ToInt32(personEventReferenceNumber);
                if (referenceNumber == 999999) referenceNumber = 1;

                return $"{referenceNumberPrefix}{++referenceNumber:D6}";
            }
        }

        public async Task UpdateEvent(Contracts.Entities.Event _event)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_Event>(_event);

                _eventRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<Contracts.Entities.Event> GetEvent(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _eventRepository.FindByIdAsync(id);
                await _eventRepository.LoadAsync(result, c => c.PersonEvents);
                await _personEventRepository.LoadAsync(result.PersonEvents, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(result.PersonEvents, c => c.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(result.PersonEvents, c => c.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(result.PersonEvents, c => c.PhysicalDamages);
                await _personEventRepository.LoadAsync(result.PersonEvents, c => c.Claims);

                var mappedItems = Mapper.Map<Contracts.Entities.Event>(result);
                mappedItems.MemberSiteId = mappedItems.PersonEvents[0].CompanyRolePlayerId != null ? mappedItems.PersonEvents[0].CompanyRolePlayerId.Value : 0;

                foreach (var personEvent in mappedItems.PersonEvents)
                {
                    if (personEvent.InsuredLifeId != 0)
                    {
                        personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                        foreach (var physicalDamage in personEvent.PhysicalDamages)
                        {
                            var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                            physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                        }
                    }
                }
                return mappedItems;
            }
        }

        public async Task<PersonEventDeathDetail> GetPersonEventDeathDetailByPersonEventId(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var deathDetail = await _personEventDeathDetailRepository.Where(d => d.PersonEventId == id).FirstOrDefaultAsync();
                return Mapper.Map<Contracts.Entities.PersonEventDeathDetail>(deathDetail);
            }
        }

        public async Task<PersonEventDeathDetail> GetPersonEventDeathDetail(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _personEventDeathDetailRepository.FindByIdAsync(id);
                return Mapper.Map<Contracts.Entities.PersonEventDeathDetail>(result);
            }
        }

        public async Task<PersonEvent> GetPersonEventByInsuredLifeId(int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository
                    .SingleAsync(p => p.InsuredLifeId == insuredLifeId,
                        $"Could not find person event with insuredLifeId {insuredLifeId}");

                return Mapper.Map<PersonEvent>(personEvent);
            }
        }

        public async Task<PersonEvent> GetPersonEvent(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.SingleAsync(p => p.PersonEventId == personEventId, $"could not find person event with personeventid {personEventId}");

                await _personEventRepository.LoadAsync(personEvent, e => e.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(personEvent, e => e.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(personEvent, e => e.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(personEvent, e => e.Claims);
                await _personEventRepository.LoadAsync(personEvent, e => e.Earnings);
                await _personEventRepository.LoadAsync(personEvent, e => e.PersonEventStpExitReasons);
                await _personEventRepository.LoadAsync(personEvent, e => e.PhysicalDamages);

                if (personEvent?.PersonEventStpExitReasons?.Count > 0)
                {
                    await _personEventStpExitReasonRepository.LoadAsync(personEvent.PersonEventStpExitReasons, r => r.StpExitReason);
                }

                var mappedItem = Mapper.Map<PersonEvent>(personEvent);

                mappedItem.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                mappedItem.FirstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEventId);
                mappedItem.ProgressMedicalReportForms = await _medicalFormService.GetProgressMedicalReportByPersonEventId(personEventId);
                mappedItem.FinalMedicalReport = await _medicalFormService.GetFinalMedicalReportByPersonEventId(personEventId);

                if (mappedItem.PersonEmploymentId != null)
                {
                    var employmentAtEventDate = await _rolePlayerService.GetPersonEmploymentByPersonEmploymentId((int)mappedItem.PersonEmploymentId);
                    mappedItem.RolePlayer.Person.PersonEmployments = new List<PersonEmployment> { employmentAtEventDate };
                }

                foreach (var physicalDamage in mappedItem.PhysicalDamages)
                {
                    var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                    physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                }

                return mappedItem;
            }
        }

        public async Task<PersonEvent> GetPersonEventByPolicyId(int personEventId, int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            var rolePlayerList = new List<RolePlayer>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository
                    .SingleAsync(p => p.PersonEventId == personEventId,
                        $"could not find person event with person event id {personEventId}");
                await _personEventRepository.LoadAsync(personEvent, e => e.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(personEvent, e => e.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(personEvent, e => e.Claims);

                // Deceased 0
                var deceased = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);
                deceased.KeyRoleType = KeyRoleEnum.InsuredLife.DisplayAttributeValue();
                rolePlayerList.Add(deceased);

                // claimant 1
                var rolePlayerClaimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                rolePlayerClaimant.Claimant = new Claimant()
                {
                    RolePlayerId = rolePlayerClaimant.RolePlayerId,
                    FirstName = rolePlayerClaimant.Person.FirstName,
                    LastName = rolePlayerClaimant.Person.Surname,
                    IdNumber = rolePlayerClaimant.Person.IdNumber,
                    PassportNumber = rolePlayerClaimant.Person.PassportNumber,
                    ContactNumber = rolePlayerClaimant.CellNumber,
                    BeneficiaryTypeId = 41,
                    DateOfBirth = rolePlayerClaimant.Person.DateOfBirth
                };
                rolePlayerClaimant.KeyRoleType = KeyRoleEnum.Claimant.DisplayAttributeValue();
                rolePlayerList.Add(rolePlayerClaimant);

                // informant 2
                if (personEvent.ClaimantId > 0)
                {
                    var rolePlayerInformant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
                    rolePlayerInformant.Informant = new Informant()
                    {
                        RolePlayerId = rolePlayerInformant.RolePlayerId,
                        FirstName = rolePlayerInformant.Person.FirstName,
                        LastName = rolePlayerInformant.Person.Surname,
                        IdNumber = rolePlayerInformant.Person.IdNumber,
                        PassportNumber = rolePlayerInformant.Person.PassportNumber,
                        ContactNumber = rolePlayerInformant.CellNumber,
                        BeneficiaryTypeId = 41,
                        DateOfBirth = rolePlayerInformant.Person.DateOfBirth
                    };
                    rolePlayerInformant.KeyRoleType = KeyRoleEnum.Informant.DisplayAttributeValue();
                    rolePlayerList.Add(rolePlayerInformant);
                }
                else
                {
                    var rolePlayerInformant = CreateRolePlayer();
                    rolePlayerInformant.KeyRoleType = KeyRoleEnum.Informant.DisplayAttributeValue();
                    rolePlayerList.Add(rolePlayerInformant);
                }


                // medicalPractitioner 3
                if (personEvent.PersonEventDeathDetail.DoctorId > 0)
                {
                    var medical = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.PersonEventDeathDetail.DoctorId));
                    medical.KeyRoleType = KeyRoleEnum.MedicalServiceProvider.DisplayAttributeValue();
                    rolePlayerList.Add(medical);
                }
                else
                {
                    var medical = CreateRolePlayer();
                    medical.KeyRoleType = KeyRoleEnum.MedicalServiceProvider.DisplayAttributeValue();
                    rolePlayerList.Add(medical);
                }

                // forensicPathologist 4
                if (personEvent.PersonEventDeathDetail.ForensicPathologistId > 0)
                {
                    var forensic = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.PersonEventDeathDetail.ForensicPathologistId));
                    forensic.ForensicPathologist = new ForensicPathologist()
                    {
                        RegistrationNumber = forensic.HealthCareProvider.PracticeNumber
                    };
                    forensic.KeyRoleType = KeyRoleEnum.ForensicPathologist.DisplayAttributeValue();
                    rolePlayerList.Add(forensic);
                }
                else
                {
                    var forensic = CreateRolePlayer();
                    forensic.KeyRoleType = KeyRoleEnum.ForensicPathologist.DisplayAttributeValue();
                    forensic.ForensicPathologist.DateOfPostMortem = null;
                    rolePlayerList.Add(forensic);
                }

                // funeralParlor 5
                if (personEvent.PersonEventDeathDetail.FuneralParlorId > 0)
                {
                    var funeralParlor = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.PersonEventDeathDetail.FuneralParlorId));

                    if (funeralParlor.FuneralParlor != null)
                    {
                        funeralParlor.FuneralParlor.AddressLine1 = (funeralParlor.RolePlayerAddresses.FirstOrDefault())?.AddressLine1;
                        funeralParlor.FuneralParlor.AddressLine2 = (funeralParlor.RolePlayerAddresses.FirstOrDefault())?.AddressLine2;
                    }
                    else
                    {
                        funeralParlor = CreateRolePlayer();
                    }

                    funeralParlor.KeyRoleType = KeyRoleEnum.FuneralParlor.DisplayAttributeValue();
                    rolePlayerList.Add(funeralParlor);
                }
                else
                {
                    var funeralParlor = CreateRolePlayer();
                    funeralParlor.KeyRoleType = KeyRoleEnum.FuneralParlor.DisplayAttributeValue();
                    rolePlayerList.Add(funeralParlor);
                }

                // underTaker 6
                if (personEvent.PersonEventDeathDetail.UnderTakerId > 0)
                {
                    var rolePlayerUndertaker = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.PersonEventDeathDetail.UnderTakerId));
                    rolePlayerUndertaker.Undertaker = new Undertaker()
                    {
                        RolePlayerId = rolePlayerUndertaker.RolePlayerId,
                        FirstName = rolePlayerUndertaker.Person.FirstName,
                        LastName = rolePlayerUndertaker.Person.Surname,
                        IdNumber = rolePlayerUndertaker.Person.IdNumber,
                        PassportNumber = rolePlayerUndertaker.Person.PassportNumber,
                        ContactNumber = rolePlayerUndertaker.CellNumber,
                        DateOfBirth = rolePlayerUndertaker.Person.DateOfBirth,
                        RegistrationNumber = rolePlayerUndertaker.Undertaker?.RegistrationNumber,
                        DateOfBurial = rolePlayerUndertaker.Undertaker?.DateOfBurial,
                        PlaceOfBurial = rolePlayerUndertaker.Undertaker?.PlaceOfBurial

                    };
                    rolePlayerUndertaker.KeyRoleType = KeyRoleEnum.Undertaker.DisplayAttributeValue();
                    rolePlayerList.Add(rolePlayerUndertaker);
                }
                else
                {
                    var rolePlayerUndertaker = CreateRolePlayer();
                    rolePlayerUndertaker.KeyRoleType = KeyRoleEnum.Undertaker.DisplayAttributeValue();
                    rolePlayerList.Add(rolePlayerUndertaker);
                }


                // bodyCollector 7
                if (personEvent.PersonEventDeathDetail.BodyCollectorId > 0)
                {
                    var rolePlayerBodyCollector = await _rolePlayerService.GetRolePlayer(Convert.ToInt32(personEvent.PersonEventDeathDetail.BodyCollectorId));
                    rolePlayerBodyCollector.BodyCollector = new BodyCollector()
                    {
                        RolePlayerId = rolePlayerBodyCollector.RolePlayerId,
                        RegistrationNumber = rolePlayerBodyCollector.BodyCollector?.RegistrationNumber,
                        ContactNumber = rolePlayerBodyCollector.CellNumber,
                        IdNumber = rolePlayerBodyCollector.Person.IdNumber,
                        PassportNumber = rolePlayerBodyCollector.Person.PassportNumber,
                        CollectionOfBodyDate = rolePlayerBodyCollector.BodyCollector?.CollectionOfBodyDate,
                        DateOfBirth = rolePlayerBodyCollector.Person.DateOfBirth,
                        FirstName = rolePlayerBodyCollector.Person.FirstName,
                        LastName = rolePlayerBodyCollector.Person.Surname,
                    };
                    rolePlayerBodyCollector.KeyRoleType = KeyRoleEnum.BodyCollector.DisplayAttributeValue();
                    rolePlayerList.Add(rolePlayerBodyCollector);
                }
                else
                {
                    var rolePlayerBodyCollector = CreateRolePlayer();
                    rolePlayerBodyCollector.KeyRoleType = KeyRoleEnum.BodyCollector.DisplayAttributeValue();
                    rolePlayerList.Add(rolePlayerBodyCollector);
                }


                var personEventMapped = Mapper.Map<PersonEvent>(personEvent);
                personEventMapped.RolePlayers = rolePlayerList;
                return personEventMapped;
            }
        }

        public async Task<PagedRequestResult<Contracts.Entities.Event>> SearchEvents(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _eventRepository
                    .ProjectTo<Contracts.Entities.Event>()
                    .Where(evententity => string.IsNullOrEmpty(request.SearchCriteria) ||
                    evententity.EventReferenceNumber.Contains(request.SearchCriteria))
                    .ToListAsync();

                var events = await _eventRepository
                    .Where(evententity => string.IsNullOrEmpty(request.SearchCriteria) ||
                    evententity.EventReferenceNumber.Contains(request.SearchCriteria))
                    .ToPagedResult<claim_Event, Contracts.Entities.Event>(request);
                return events;
            }
        }

        public async Task<List<Contracts.Entities.Event>> GetEventList(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _eventRepository
                    .ProjectTo<Contracts.Entities.Event>()
                    .Where(evententity => string.IsNullOrEmpty(request.SearchCriteria) ||
                    evententity.EventReferenceNumber.Contains(request.SearchCriteria))
                    .ToListAsync();

                return result;
            }
        }

        public async Task<List<SearchResult>> SearchPoliciesWithoutClaim(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _eventRepository.SqlQueryAsync<SearchResult>(DatabaseConstants.ClaimSearchPoliciesStoredProcedure,
                new SqlParameter("FilterType", 1),
                new SqlParameter("Filter", request?.SearchCriteria),
                new SqlParameter("ShowActive", showActive));

                var propertyInfo = typeof(SearchResult).GetProperty(request.OrderBy.Substring(0, 1).ToUpper() + request.OrderBy.Substring(1));
                Func<SearchResult, object> keySelector = i => propertyInfo.GetValue(i, null);

                var result = request.IsAscending ? searchResult.OrderBy(keySelector) : searchResult.OrderByDescending(keySelector);

                return result.ToList();
            }
        }

        public async Task<int> SubmitRolePlayerForApproval(string reference, string stepData)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                SqlParameter[] parameters = {
                    new SqlParameter("Reference", reference),
                    new SqlParameter("User", RmaIdentity.Email),
                    new SqlParameter("StepData", stepData),
                    new SqlParameter("RowId", SqlDbType.Int, 50){Direction = ParameterDirection.Output}
                };

                await _eventRepository.ExecuteSqlCommandAsync(DatabaseConstants.CreateRolePlayerForApprovalStoredProcedure, parameters);
                var result = parameters[3].Value;

                return 1;
            }
        }

        public async Task<PagedRequestResult<RolePlayerSearchResult>> SearchInsuredLives(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInsuredLife);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", request?.SearchCriteria),
                    new SqlParameter("ShowActive", showActive),
                    new SqlParameter("PageIndex", request.Page),
                    new SqlParameter("PageSize", request.PageSize),
                    new SqlParameter("SortColumn", request.OrderBy),
                    new SqlParameter("SortOrder", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("RecordCount", SqlDbType.Int)
            };

                parameters[7].Direction = ParameterDirection.Output;

                var searchResult = await _eventRepository.SqlQueryAsync<RolePlayerSearchResult>(DatabaseConstants.ClaimSearchInsuredLivesStoredProcedure, parameters);
                var recordCount = (int)parameters[7].Value;

                return new PagedRequestResult<RolePlayerSearchResult>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<RolePlayerSearchResult>> SearchClaimantInsuredLives(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInsuredLife);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", request?.SearchCriteria),
                    new SqlParameter("ShowActive", showActive),
                    new SqlParameter("PageIndex", request.Page),
                    new SqlParameter("PageSize", request.PageSize),
                    new SqlParameter("SortColumn", request.OrderBy),
                    new SqlParameter("SortOrder", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("RecordCount", SqlDbType.Int)
                };

                parameters[7].Direction = ParameterDirection.Output;

                var searchResult = await _eventRepository.SqlQueryAsync<RolePlayerSearchResult>(DatabaseConstants.ClaimantInsuredLivesStoredProcedure, parameters);
                var recordCount = (int)parameters[7].Value;

                return new PagedRequestResult<RolePlayerSearchResult>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task UpdatePersonEventDeathDetail(PersonEventDeathDetail personEventDeathDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataItem = await _personEventDeathDetailRepository.Where(x => x.PersonEventId == personEventDeathDetail.PersonEventId).SingleAsync();
                dataItem.BodyCollectorId = personEventDeathDetail.BodyCollectorId;
                dataItem.Causeofdeath = personEventDeathDetail.CauseOfDeath;
                dataItem.DoctorId = personEventDeathDetail.DoctorId;
                dataItem.ForensicPathologistId = personEventDeathDetail.ForensicPathologistId;
                dataItem.UnderTakerId = personEventDeathDetail.UnderTakerId;
                dataItem.FuneralParlorId = personEventDeathDetail.FuneralParlorId;
                dataItem.HomeAffairsRegion = personEventDeathDetail.HomeAffairsRegion;
                dataItem.PlaceOfDeath = personEventDeathDetail.PlaceOfDeath;
                dataItem.DateOfPostMortem = personEventDeathDetail.DateOfPostmortem;
                dataItem.PostMortemNumber = personEventDeathDetail.PostMortemNumber;
                dataItem.BodyNumber = personEventDeathDetail.BodyNumber;
                dataItem.SapCaseNumber = personEventDeathDetail.SapCaseNumber;
                dataItem.DhaReferenceNo = personEventDeathDetail.DhaReferenceNo;
                dataItem.DeathCertificateNo = personEventDeathDetail.DeathCertificateNo;
                dataItem.InterviewWithFamilyMember = personEventDeathDetail.InterviewWithFamilyMember;
                dataItem.OpinionOfMedicalPractitioner = personEventDeathDetail.OpinionOfMedicalPractitioner;
                _personEventDeathDetailRepository.Update(dataItem);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task UpdatePersonEventDetails(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataItem = await _personEventRepository.Where(x => x.PersonEventId == personEvent.PersonEventId).SingleAsync();
                await _personEventRepository.LoadAsync(dataItem, c => c.Claims);

                dataItem.PersonEventStatus = personEvent.PersonEventStatus;
                dataItem.InformantId = personEvent.InformantId;
                dataItem.DateSubmitted = DateTime.Now;
                dataItem.SubmittedByUserId = RmaIdentity.UserId;
                dataItem.SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus;
                dataItem.IsStraightThroughProcess = personEvent.IsStraightThroughProcess;
                dataItem.IsFatal = personEvent.IsFatal;

                if (personEvent.Claims != null)
                {
                    foreach (var claim in personEvent.Claims)
                    {
                        var existingClaim = dataItem.Claims.FirstOrDefault(c => c.ClaimId == claim.ClaimId);
                        if (existingClaim != null)
                        {
                            existingClaim.ClaimLiabilityStatus = claim.ClaimLiabilityStatus;
                            existingClaim.PdVerified = claim.PdVerified;
                            existingClaim.DisabilityPercentage = claim.DisabilityPercentage;
                        }
                    }
                }

                _personEventRepository.Update(dataItem);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PersonEvent> GetDuplicatePersonEventCheckByInsuredLifeId(int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(p => p.InsuredLifeId == insuredLifeId);

                return Mapper.Map<PersonEvent>(personEvent);
            }
        }

        public async Task<List<Contracts.Entities.Event>> GetDuplicateEventsCheck(Contracts.Entities.Event eventBE)
        {
            Contract.Requires(eventBE != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // check all events on that day
                var startDate = eventBE.EventDate.Date; //  00:00:00 of that day
                var endDate = startDate.AddDays(1).AddTicks(-1);  // 23:59:59.999 of that day;

                var claimEvents = await _eventRepository.Where(e => e.EventType == eventBE.EventType
                                            && e.LocationCategory == eventBE.LocationCategory
                                            && e.MemberSiteId == eventBE.MemberSiteId
                                            && e.EventDate >= startDate
                                            && e.EventDate <= endDate
                                            && !e.IsDeleted)
                                        .ToListAsync();

                return Mapper.Map<List<Contracts.Entities.Event>>(claimEvents);
            }
        }

        public async Task<bool> StillBornCheck(int claimantId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.Where(p => p.ClaimantId == claimantId && p.PersonEventDeathDetail.DeathType == DeathTypeEnum.Stillborn).ToListAsync();
                await _personEventRepository.LoadAsync(personEvent, c => c.PersonEventDeathDetail);
                return personEvent.Count() <= 2 ? true : false;
            }
        }

        public async Task<int> StillBornDuplicateCheck(Person person)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventId = 0;
                var roleplayerdetails = await _rolePlayerService.StillBornDuplicateCheck(person);
                if (roleplayerdetails != null)
                {
                    personEventId = await _personEventRepository.Where(b => b.InsuredLifeId == roleplayerdetails.RolePlayerId).Select(a => a.PersonEventId).FirstOrDefaultAsync();
                }
                return personEventId;
            }
        }

        public async Task<List<Contracts.Entities.PersonEvent>> GetAllPersonEvents()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _personEventRepository
                     .Where(a => a.PersonEventStatus != PersonEventStatusEnum.Cancelled)
                     .ToListAsync();
                await _personEventRepository.LoadAsync(result, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(result, c => c.PersonEventDiseaseDetail);

                return Mapper.Map<List<PersonEvent>>(result);
            }
        }

        public async Task SendFollowUpsForInternalNotifications()
        {
            var personEvents = await GetPersonEventsForFollowUps();

            foreach (var personEvent in personEvents)
            {
                try
                {
                    var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                    var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);

                    if (employee != null)
                    {
                        var requiredCategoryDocuments = new List<string>();

                        #region handle person event requirements
                        var personEventRequirements = await _claimRequirementService.GetPersonEventRequirements(personEvent.PersonEventId);

                        foreach (var requirementCategory in personEventRequirements)
                        {
                            if ((bool)requirementCategory?.IsMinimumRequirement && requirementCategory.DateClosed == null)
                            {
                                requiredCategoryDocuments.Add(requirementCategory.ClaimRequirementCategory.Name);
                            }
                        }
                        #endregion

                        if (requiredCategoryDocuments.Count != 0)
                        {
                            var dayCount = DayCount(personEvent.CreatedDate, DateTimeHelper.SaNow);
                            var noteText = string.Empty;
                            var templateType = TemplateTypeEnum.FirstDocumentsFollowUp;

                            bool shouldSendCommunication = false;
                            bool shouldSendSection40Workflow = false;

                            switch (dayCount)
                            {
                                case 7:
                                    noteText = "First Follow up notification for required documents";
                                    templateType = TemplateTypeEnum.FirstDocumentsFollowUp;
                                    shouldSendCommunication = true;
                                    break;
                                case 14:
                                    noteText = "Second Follow up notification for required documents";
                                    templateType = TemplateTypeEnum.SecondDocumentsFollowUp;
                                    shouldSendCommunication = true;
                                    break;
                                case 21:
                                    noteText = "Third Follow up notification for required documents";
                                    templateType = TemplateTypeEnum.ThirdFinalDocumentsFollowUp;
                                    shouldSendCommunication = true;
                                    break;
                                case 28:
                                    noteText = "Section 40 workflow sent to CAD";
                                    shouldSendSection40Workflow = true;
                                    break;
                                case 30:
                                    noteText = "Requirements still outstanding, the claim is now closed due to non-compliant/section 40";
                                    templateType = TemplateTypeEnum.ClosingLetterFollowUp;
                                    shouldSendCommunication = true;
                                    break;
                                default:
                                    return; // No action needed for other day counts
                            }

                            var hasNoteBeenAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, noteText);

                            if (shouldSendCommunication)
                            {
                                #region send follow up communication
                                await _claimCommunicationService.SendFollowUpCommunication(
                                                                personEvent,
                                                                company,
                                                                employee,
                                                                requiredCategoryDocuments,
                                                                templateType,
                                                                hasNoteBeenAdded,
                                                                dayCount,
                                                                noteText);
                                #endregion

                                #region handle update claim status
                                if (dayCount == 30)
                                {
                                    personEvent.PersonEventStatus = PersonEventStatusEnum.Closed;
                                    foreach (var claim in personEvent.Claims)
                                    {
                                        claim.ClaimStatus = ClaimStatusEnum.Closed;
                                        claim.ClaimStatusChangeDate = DateTime.Now;
                                        claim.IsClosed = true;
                                        claim.ClaimClosedReasonId = (int)ClaimClosedReasonEnum.ClosedOutstandingStandardRequirementDocuments;
                                    }
                                    await UpdatePersonEvent(personEvent);
                                }
                                #endregion
                            }
                            else if (shouldSendSection40Workflow)
                            {
                                #region send section 40 workflow
                                await _claimRequirementService.StartSection40Workflow(personEvent);
                                #endregion
                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    e.LogException($"Error when sending follow ups for Person Event: {personEvent.PersonEventId}");
                }
            }
        }

        public async Task<List<ClaimAdditionalRequiredDocument>> GetClaimAdditionalRequiredDocument(int personeventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var requiredDocument = await _claimAdditionalRequiredDocumentRepository.Where(doc => doc.PersoneventId == personeventId && !doc.IsUploaded).ToListAsync();
                return Mapper.Map<List<ClaimAdditionalRequiredDocument>>(requiredDocument);
            }
        }

        public async Task<List<Contracts.Entities.PersonEvent>> GetPersonEventsForFollowUps()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventList = new List<Contracts.Entities.PersonEvent>();
                try
                {
                    var followUpIntervals = new List<int> { 7, 14, 21, 28, 30 };
                    var result = await _personEventRepository
                         .Where(a => a.PersonEventStatus != PersonEventStatusEnum.Cancelled
                          && a.InsuredLifeId > 0
                          && a.CompCarePersonEventId == null 
                          && followUpIntervals.Contains((int)System.Data.Entity.DbFunctions.DiffDays(a.CreatedDate, DateTimeHelper.SaNow)))
                         .ToListAsync();

                    await _personEventRepository.LoadAsync(result, c => c.PersonEventAccidentDetail);
                    await _personEventRepository.LoadAsync(result, c => c.PersonEventDiseaseDetail);
                    await _personEventRepository.LoadAsync(result, c => c.Claims);
                    await _personEventRepository.LoadAsync(result, e => e.ClaimBucketClass);

                    var personEvents = result.Where(x => x.ClaimBucketClass.Name != "Notification Only").ToList();
                    personEventList = Mapper.Map<List<PersonEvent>>(personEvents);

                    foreach (var item in personEventList)
                    {
                        item.RolePlayer = await _rolePlayerService.GetRolePlayer(item.InsuredLifeId);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when getting person events for sending follow ups - Error Message {ex.Message}");
                }
                return personEventList;
            }
        }

        public async Task<List<Contracts.Entities.PersonEvent>> GetCompCarePersonEventsForFollowUps()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var followUpIntervals = new List<int> { 7, 14, 21, 30 };
                var result = await _personEventRepository
                     .Where(a => a.PersonEventStatus != PersonEventStatusEnum.Cancelled
                     && a.CompCarePersonEventId != null
                     && followUpIntervals.Contains((int)System.Data.Entity.DbFunctions.DiffDays(a.CreatedDate, DateTimeHelper.SaNow)))
                     .ToListAsync();

                await _personEventRepository.LoadAsync(result, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(result, c => c.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(result, c => c.Claims);
                await _personEventRepository.LoadAsync(result, e => e.ClaimBucketClass);

                var personEvents = result
                        .Where(x => x.ClaimBucketClass.Name != "Notification Only")
                        .ToList();

                return Mapper.Map<List<PersonEvent>>(personEvents);
            }
        }

        public async Task<DeathTypeEnum> GetPersonEventDeathType(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _personEventDeathDetailRepository
                    .Where(a => a.PersonEventId == personEventId).Select(b => b.DeathType)
                    .FirstOrDefaultAsync();
                return result;
            }
        }

        public async Task<List<Contracts.Entities.PersonEvent>> GetPersonEventsByInsuredLife(int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _personEventRepository
                    .Where(a => a.InsuredLifeId == insuredLifeId && a.PersonEventStatus != PersonEventStatusEnum.PendingInvestigations
                    || a.InsuredLifeId == insuredLifeId && a.PersonEventStatus != PersonEventStatusEnum.Closed)
                    .ToListAsync();
                await _personEventRepository.LoadAsync(results, p => p.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(results, p => p.Claims);

                return Mapper.Map<List<PersonEvent>>(results);
            }
        }

        public async Task<Contracts.Entities.PersonEvent> GetPersonEventByInsuredLife(int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _personEventRepository.OrderByDescending(x => x.PersonEventId)
                    .Where(a => a.InsuredLifeId == insuredLifeId && a.PersonEventStatus != PersonEventStatusEnum.PendingInvestigations
                    || a.InsuredLifeId == insuredLifeId && a.PersonEventStatus != PersonEventStatusEnum.Closed)
                    .FirstOrDefaultAsync();

                if (results == null)
                {
                    return null;
                }

                await _personEventRepository.LoadAsync(results, p => p.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(results, p => p.Claims);

                return Mapper.Map<PersonEvent>(results);

            }
        }

        public async Task<List<PersonEvent>> GetPersonEventsByPersonEventReferenceNumber(string personEventReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _personEventRepository
                    .Where(a => a.PersonEventReferenceNumber.Contains(personEventReferenceNumber))
                    .ToListAsync();

                return Mapper.Map<List<PersonEvent>>(results);
            }
        }

        public async Task<PagedRequestResult<PersonEventSearch>> GetCoidPersonEvents(PersonEventSearchParams request)
        {
            if (request?.CurrentQuery!="")
            {
                request.Filter = true;
            }
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.PageIndex),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.Direction),
                    new SqlParameter("SearchCreatia", request.CurrentQuery == null ? string.Empty : request.CurrentQuery),
                    new SqlParameter("StartDate", request.StartDate),
                    new SqlParameter("EndDate", request.EndDate),
                    new SqlParameter("IsStp", request.IsStp),
                    new SqlParameter("Stm", request.Stm),
                    new SqlParameter("claimStatus", request.ClaimStatus),
                    new SqlParameter("liabilityStatus", request.LiabilityStatus),
                    new SqlParameter("rolePlayerId", request.RolePlayerId),
                    new SqlParameter("ViewAll", request.ViewAll),
                    new SqlParameter("Filter", request.Filter),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[14].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<PersonEventSearch>(DatabaseConstants.PersonEventSearchStoredProcedure, parameters);
                var recordCount = (int)parameters[14].Value;

                return new PagedRequestResult<PersonEventSearch>()
                {
                    Page = request.PageIndex,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<string> GeneratePersonEventReferenceNumber()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventReference =
                    await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PersonEventId, "");
                return personEventReference;
            }
        }

        public async Task<int> SendDocumentRejectionEmail(RejectDocument rejectDocument)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await GetPersonEvent(rejectDocument.PersonEventId);
                var result = 0;
                if (personEvent.CompanyRolePlayerId != null)
                {
                    var memberDetails = await _rolePlayerService.GetRolePlayer((int)personEvent.CompanyRolePlayerId);

                    var rejectionTokens = new Dictionary<string, string>();

                    if (personEvent?.Claims.Count > 0)
                    {
                        rejectionTokens["[PEVNUM]"] = personEvent.Claims[0].ClaimReferenceNumber;
                    }

                    if (memberDetails.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email)
                    {
                        var emailTemplate = (await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.ClaimDocumentRejection, rejectionTokens)).Content;
                        foreach (var token in rejectionTokens)
                        {
                            emailTemplate = emailTemplate.Replace($"{token.Key}", token.Value);
                        }

                        if (rejectDocument.PersonEventId > 0)
                        {
                            var email = new SendMailRequest()
                            {
                                Subject = "Rejection of Document - " + rejectDocument.PersonEventId,
                                FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                                Recipients = memberDetails.RolePlayerContacts[0].EmailAddress,
                                Body = emailTemplate,
                                IsHtml = true,
                                ItemId = rejectDocument.PersonEventId,
                                ItemType = "PersonEvent"
                            };
                            result = await _emailService.SendEmail(email);
                        }
                    }
                    else
                    {
                        var smsRejectionTokens = new Dictionary<string, string>();

                        if (personEvent?.Claims.Count > 0)
                        {
                            smsRejectionTokens["PEVNUM"] = personEvent.Claims[0].ClaimReferenceNumber;
                        }

                        var smsNotification = new TemplateSmsRequest()
                        {
                            Tokens = smsRejectionTokens,
                            SmsNumbers = new List<string> { memberDetails.CellNumber },
                            ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                            ItemId = rejectDocument.PersonEventId,
                            TemplateId = (int)TemplateTypeEnum.ClaimDocumentRejection,
                            Department = RMADepartmentEnum.Claims
                        };
                        result = await _smsService.SendTemplateSms(smsNotification);
                    }
                }
                return result;
            }
        }

        public async Task<bool> CheckIsPersonEvent(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _personEventRepository.AnyAsync(p => p.PersonEventId == personEventId);
            }
        }

        public async Task<Contracts.Entities.Event> GetPersonEventDetails(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventDetails = await _personEventRepository.FirstOrDefaultAsync(pe => pe.PersonEventId == personEventId);

                if (personEventDetails == null) { return null; }

                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventNoiseDetail);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PhysicalDamages);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.Event);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventQuestionnaire);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.Claims);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventStpExitReasons);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.Earnings);
                await _personEventRepository.LoadAsync(personEventDetails, c => c.PersonEventClaimRequirements);

                if (personEventDetails?.PersonEventStpExitReasons?.Count > 0)
                {
                    await _personEventStpExitReasonRepository.LoadAsync(personEventDetails.PersonEventStpExitReasons, r => r.StpExitReason);
                }

                var mappedEvent = Mapper.Map<Contracts.Entities.Event>(personEventDetails.Event);
                mappedEvent.MemberSiteId = mappedEvent.PersonEvents[0].CompanyRolePlayerId.Value;
                foreach (var personEvent in mappedEvent.PersonEvents)
                {
                    personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                    foreach (var physicalDamage in personEvent.PhysicalDamages)
                    {
                        var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                        physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                    }
                }
                return mappedEvent;
            }
        }

        public async Task<Person> GetPersonDetailsByPersonEventId(int personEventId)
        {
            if (personEventId < 0)
            {
                return null;
            }
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventDetails = await _personEventRepository.Where(pe => pe.PersonEventId == personEventId).FirstOrDefaultAsync();
                if (personEventDetails != null)
                {
                    var rolePlayer = await _rolePlayerService.GetPerson(personEventDetails.InsuredLifeId);
                    if (rolePlayer != null)
                    {
                        return rolePlayer.Person;
                    }
                }

                return null;
            }
        }

        public async Task<Contracts.Entities.Event> GetEventDetails(int eventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var eventDetails = await _eventRepository.FirstOrDefaultAsync(e => e.EventId == eventId);
                await _eventRepository.LoadAsync(eventDetails, c => c.PersonEvents);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PersonEventNoiseDetail);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PhysicalDamages);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.PersonEventQuestionnaire);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.Claims);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.ClaimBucketClass);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.Earnings);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, e => e.PersonEventStpExitReasons);

                foreach (var personEventDetails in eventDetails.PersonEvents)
                {
                    if (personEventDetails?.PersonEventStpExitReasons?.Count > 0)
                    {
                        await _personEventStpExitReasonRepository.LoadAsync(personEventDetails.PersonEventStpExitReasons, r => r.StpExitReason);
                    }
                }

                var mappedEvent = Mapper.Map<Contracts.Entities.Event>(eventDetails);
                if (mappedEvent.PersonEvents.Count > 0 && mappedEvent.PersonEvents[0].CompanyRolePlayerId != null)
                {
                    mappedEvent.MemberSiteId = mappedEvent.PersonEvents[0].CompanyRolePlayerId.Value;
                }

                foreach (var personEvent in mappedEvent.PersonEvents)
                {
                    personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                    foreach (var physicalDamage in personEvent.PhysicalDamages)
                    {
                        var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                        physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                    }
                }
                return mappedEvent;
            }
        }

        public async Task<Contracts.Entities.Event> GetEventDetailsForReceiptLetters(int eventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var eventDetails = await _eventRepository.FirstOrDefaultAsync(e => e.EventId == eventId);
                await _eventRepository.LoadAsync(eventDetails, c => c.PersonEvents);
                await _personEventRepository.LoadAsync(eventDetails.PersonEvents, c => c.Claims);

                var mappedEvent = Mapper.Map<Contracts.Entities.Event>(eventDetails);
                if (mappedEvent.PersonEvents.Count > 0 && mappedEvent.PersonEvents[0].CompanyRolePlayerId != null)
                {
                    mappedEvent.MemberSiteId = mappedEvent.PersonEvents[0].CompanyRolePlayerId.Value;
                    mappedEvent.PersonEvents[0].RolePlayer = await _rolePlayerService.GetRolePlayer((int)mappedEvent.MemberSiteId);
                }

                return mappedEvent;
            }
        }

        public async Task<int> CreateEventDetails(Contracts.Entities.Event eventEntity)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(AddEventPermission);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_Event>(eventEntity);
                _eventRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.EventId;
            }
        }

        public async Task<PagedRequestResult<CadPool>> GetNonStpCoidPersonEvents(PagedRequest request)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                        new SqlParameter("PageNumber", request.Page),
                        new SqlParameter("RowsOfPage", request.PageSize),
                        new SqlParameter("SortingCol", request.OrderBy),
                        new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                        new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                        new SqlParameter("RecordCount", SqlDbType.Int),
                    };

                parameters[5].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<CadPool>(DatabaseConstants.NonStpPersonEvents, parameters);
                var recordCount = (int)parameters[5].Value;

                return new PagedRequestResult<CadPool>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult.OrderByDescending(a => a.IsTopEmployer == true).ToList()
                };
            }
        }

        public async Task<PagedRequestResult<EventSearch>> EventSearch(EventSearchParams request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.PageIndex),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.Direction),
                    new SqlParameter("SearchCreatia", request.CurrentQuery == null ? string.Empty : request.CurrentQuery),
                    new SqlParameter("StartDate", request.StartDate),
                    new SqlParameter("EndDate", request.EndDate),
                    new SqlParameter("EventType", request.EventType),
                    new SqlParameter("ViewAll", request.ViewAll),
                    new SqlParameter("Filter", request.Filter),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                    };

                parameters[10].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<EventSearch>(DatabaseConstants.EventSearchStoredProcedure, parameters);
                var recordCount = (int)parameters[10].Value;

                return new PagedRequestResult<EventSearch>()
                {
                    Page = request.PageIndex,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<int> CreatePersonEventDetails(Contracts.Entities.PersonEvent eventEntity)
        {
            try
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                    RmaIdentity.DemandPermission(AddEventPermission);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = Mapper.Map<claim_PersonEvent>(eventEntity);
                    _personEventRepository.Create(entity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                    return entity.PersonEventId;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        public async Task<VopdDash> GetVopdOverview(VopdOverview filter)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("startDate", filter?.StartDate),
                    new SqlParameter("endDate", filter.EndDate),
                    new SqlParameter("notificationType", filter.EventTypeId),
                    new SqlParameter("claimType", filter.ClaimTypeId),
                    new SqlParameter("insuranceType", filter.InsuranceTypeId),
                    new SqlParameter("benefitDue", filter.PersonEventBucketClassId),
                    new SqlParameter("filter", filter.Filter),
                };

                var vopdOverview = await _eventRepository.SqlQueryAsync<VopdOverview>(
               DatabaseConstants.GetVopdOverview, parameters);
                var VopdDash = new VopdDash();
                if (vopdOverview.Count() > 0)
                {
                    VopdDash.VopdOverviews = vopdOverview;
                }
                return VopdDash;
            }
        }

        public async Task<StmDash> GetStmOverview(StmDashboardFields filter)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("startDate", filter.StartDate),
                    new SqlParameter("endDate", filter.EndDate),
                    new SqlParameter("notificationType", filter.EventTypeId),
                    new SqlParameter("claimType", filter.ClaimTypeId),
                    new SqlParameter("insuranceType", filter.InsuranceTypeId),
                    new SqlParameter("benefitDue", filter.PersonEventBucketClassId),
                    new SqlParameter("filter", filter.Filter),
                };

                var stmOverview = await _eventRepository.SqlQueryAsync<StmOverview>(
                    DatabaseConstants.GetStmOverview, parameters);

                return new StmDash()
                {
                    StmOverviews = stmOverview,
                    SuspiciousCount = stmOverview.Count(c => c.SuspiciousTransactionStatusId == (int)SuspiciousTransactionStatusEnum.Suspicious),
                    NotSuspiciousCount = stmOverview.Count(c => c.SuspiciousTransactionStatusId == (int)SuspiciousTransactionStatusEnum.NotSuspicious)
                };
            }
        }

        public async Task<List<Contracts.Entities.Event>> GetEventByEventReferenceNumber(string eventReferenceNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (var scope = _dbContextScopeFactory.Create())
            {
                return await _eventRepository
                    .ProjectTo<Contracts.Entities.Event>()
                    .Where(evententity => evententity.EventReferenceNumber.Contains(eventReferenceNumber))
                    .ToListAsync();
            }
        }

        public async Task<StpDash> GetExitReasonClaimOverview(ExitReasonDashboardFields filter)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewClaim);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("startDate", filter?.StartDate),
                    new SqlParameter("endDate", filter.EndDate),
                    new SqlParameter("benefitDue", filter.PersonEventBucketClassId),
                    new SqlParameter("filter", filter.Filter),
                };

                var stpOverview = await _eventRepository.SqlQueryAsync<ExitReasonOverview>(
                    DatabaseConstants.GetExitReasonClaimOverview, parameters);

                return new StpDash()
                {
                    StpOverview = stpOverview,
                };
            }
        }

        public async Task<PagedRequestResult<PersonEventSearch>> GetExitReasonPersonEvents(ExitReasonSearchParams request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.PageIndex),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.Direction),
                    new SqlParameter("SearchCreatia", request.CurrentQuery == null ? string.Empty : request.CurrentQuery),
                    new SqlParameter("ExitReasonId", request.ExitReasonId),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[6].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<PersonEventSearch>(DatabaseConstants.ExitReasonSearch, parameters);
                var recordCount = (int)parameters[6].Value;

                return new PagedRequestResult<PersonEventSearch>()
                {
                    Page = request.PageIndex,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<bool> CheckIfPersonEventAlreadyExists(int compCarePersonEventId, int employeeId, int companyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(a => a.CompCarePersonEventId == compCarePersonEventId
                                                                                        && a.InsuredLifeId == employeeId
                                                                                        && a.CompanyRolePlayerId == companyId);
                return personEvent != null;
            }
        }

        public async Task<PagedRequestResult<CadPool>> GetCmcPoolData(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[5].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<CadPool>(DatabaseConstants.CmcPoolData, parameters);
                var recordCount = (int)parameters[5].Value;

                return new PagedRequestResult<CadPool>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult.OrderByDescending(a => a.IsTopEmployer == true).ToList()
                };
            }
        }

        public async Task<PagedRequestResult<CadPool>> GetInvestigationPoolData(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("RecordCount", SqlDbType.Int)
                };

                parameters[5].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<CadPool>(DatabaseConstants.InvestigationPoolData, parameters);
                var recordCount = (int)parameters[5]?.Value;

                return new PagedRequestResult<CadPool>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult.OrderByDescending(a => a.IsTopEmployer == true).ToList()
                };
            }
        }

        public async Task<PagedRequestResult<CadPool>> GetAssesorPoolData(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[5].Direction = ParameterDirection.Output;
                var searchResult = await _eventRepository.SqlQueryAsync<CadPool>(DatabaseConstants.AssesorPoolData, parameters);
                var recordCount = (int)parameters[5].Value;

                return new PagedRequestResult<CadPool>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult.OrderByDescending(a => a.IsTopEmployer == true).ToList()
                };
            }
        }

        public async Task<List<PersonEventExitReason>> GetExitReasonsByEventNumber(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from personEventStpExitReaon in _personEventStpExitReasonRepository
                              join stpExitReason in _stpExitReasonRepository on personEventStpExitReaon.StpExitReasonId equals stpExitReason.StpExitReasonId
                              where personEventStpExitReaon.PersonEventId == personEventId
                              select new PersonEventExitReason
                              {
                                  ClaimStpExitReasonId = personEventStpExitReaon.ClaimStpExitReasonId,
                                  Description = stpExitReason.Description,
                                  ExitReasonName = stpExitReason.Name,
                                  PersonEventId = personEventStpExitReaon.PersonEventId,
                                  StpExitReasonId = personEventStpExitReaon.StpExitReasonId,
                                  CreatedDate = personEventStpExitReaon.CreatedDate
                              }).ToListAsync();
            }
        }

        public async Task<PagedRequestResult<PersonEvent>> GetPagedPersonEvents(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var eventId = Convert.ToInt32(request?.SearchCriteria);

                var personEventDetails = await _personEventRepository.Where(pe => pe.EventId == eventId).ToPagedResult(request);

                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PhysicalDamages);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.Event);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.Claims);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.Earnings);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.ClaimEstimates);

                var mappedEvent = Mapper.Map<Contracts.Entities.Event>(personEventDetails.Data[0].Event);

                foreach (var personEvent in mappedEvent.PersonEvents)
                {
                    personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                    personEvent.FirstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEvent.PersonEventId);
                    personEvent.ProgressMedicalReportForms = await _medicalFormService.GetProgressMedicalReportByPersonEventId(personEvent.PersonEventId);
                    personEvent.FinalMedicalReport = await _medicalFormService.GetFinalMedicalReportByPersonEventId(personEvent.PersonEventId);

                    if (personEvent.PersonEmploymentId != null)
                    {
                        var employmentAtEventDate = await _rolePlayerService.GetPersonEmploymentByPersonEmploymentId((int)personEvent.PersonEmploymentId);
                        personEvent.RolePlayer.Person.PersonEmployments = new List<PersonEmployment> { employmentAtEventDate };
                    }

                    foreach (var physicalDamage in personEvent.PhysicalDamages)
                    {
                        var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                        physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                    }
                }

                return new PagedRequestResult<PersonEvent>()
                {
                    Page = request.Page,
                    PageCount = request.PageSize,
                    RowCount = personEventDetails.RowCount,
                    PageSize = request.PageSize,
                    Data = mappedEvent.PersonEvents
                };
            }
        }

        public async Task<PagedRequestResult<PersonEvent>> GetPagedPersonEventsByPersonEventId(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventId = Convert.ToInt32(request?.SearchCriteria);

                var personEventDetails = await _personEventRepository.Where(pe => pe.PersonEventId == personEventId)
                                            .ToPagedResult(request);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PhysicalDamages);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PersonEventQuestionnaire);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.Event);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.Claims);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PersonEventDeathDetail);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.Earnings);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.PersonEventClaimRequirements);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.ClaimDisabilityPensions);
                await _personEventRepository.LoadAsync(personEventDetails.Data, c => c.ClaimEstimates);

                var mappedEvent = Mapper.Map<Contracts.Entities.Event>(personEventDetails.Data[0].Event);

                foreach (var personEvent in mappedEvent.PersonEvents)
                {
                    personEvent.RolePlayer = await _rolePlayerService.GetRolePlayer(personEvent.InsuredLifeId);

                    if (personEvent.PersonEmploymentId != null)
                    {
                        var employmentAtEventDate = await _rolePlayerService.GetPersonEmploymentByPersonEmploymentId((int)personEvent.PersonEmploymentId);
                        personEvent.RolePlayer.Person.PersonEmployments = new List<PersonEmployment> { employmentAtEventDate };
                    }

                    personEvent.FirstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEventId);
                    personEvent.ProgressMedicalReportForms = await _medicalFormService.GetProgressMedicalReportByPersonEventId(personEventId);
                    personEvent.FinalMedicalReport = await _medicalFormService.GetFinalMedicalReportByPersonEventId(personEventId);

                    foreach (var physicalDamage in personEvent.PhysicalDamages)
                    {
                        var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                        physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                    }
                }

                return new PagedRequestResult<PersonEvent>()
                {
                    Page = request.Page,
                    PageCount = request.PageSize,
                    RowCount = personEventDetails.RowCount,
                    PageSize = request.PageSize,
                    Data = mappedEvent.PersonEvents
                };
            }
        }

        public async Task<PersonEvent> GetPersonEventInjuryDetails(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(pe => pe.PersonEventId == personEventId);
                await _personEventRepository.LoadAsync(personEvent, c => c.Event);
                await _personEventRepository.LoadAsync(personEvent, c => c.PhysicalDamages);
                await _personEventRepository.LoadAsync(personEvent, c => c.PersonEventDiseaseDetail);
                await _personEventRepository.LoadAsync(personEvent, c => c.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(personEvent, c => c.PersonEventDeathDetail);

                var mappedEvent = Mapper.Map<PersonEvent>(personEvent);
                mappedEvent.RolePlayer = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                foreach (var physicalDamage in mappedEvent.PhysicalDamages)
                {
                    var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                    physicalDamage.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));
                }
                return mappedEvent;
            }
        }

        public async Task<PhysicalDamage> GetPhysicalDamage(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var physicalDamage = await _physicalDamageRepository.FirstOrDefaultAsync(pe => pe.PersonEventId == personEventId);

                var mappedEvent = Mapper.Map<PhysicalDamage>(physicalDamage);

                var injuries = await _injuryRepository.Where(i => i.PhysicalDamageId == physicalDamage.PhysicalDamageId).ToListAsync();
                mappedEvent.Injuries.AddRange(Mapper.Map<List<Injury>>(injuries));

                return mappedEvent;
            }
        }

        public async Task<List<RolePlayerAddress>> GetPersonEventAddress(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(pe => pe.PersonEventId == personEventId);
                var rolePlayerAddress = (await _rolePlayerService.GetCompany(personEvent.InsuredLifeId)).RolePlayerAddresses;

                return Mapper.Map<List<RolePlayerAddress>>(rolePlayerAddress);
            }
        }

        public async Task<Contracts.Entities.Event> GetPersonEventEarningsDetails(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from eventDetail in _eventRepository
                                    join personEvent in _personEventRepository on eventDetail.EventId equals personEvent.EventId
                                    join deathDetail in _personEventDiseaseDetailRepository on personEvent.PersonEventId equals deathDetail.PersonEventId
                                    where personEvent.PersonEventId == personEventId
                                    select new Contracts.Entities.Event
                                    {
                                        EventId = eventDetail.EventId,
                                        EventDate = eventDetail.EventDate,
                                        AdviseMethod = eventDetail.AdviseMethod,
                                        EventStatus = eventDetail.EventStatus,
                                        EventType = eventDetail.EventType,
                                        LocationCategory = eventDetail.LocationCategory,
                                        PersonEvents = new List<PersonEvent>
                                 {
                                     new PersonEvent
                                     {
                                         PersonEventId = personEvent.PersonEventId,
                                         PersonEventStatus = personEvent.PersonEventStatus,
                                         SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus,
                                         ClaimType = personEvent.ClaimType,
                                         PersonEventDiseaseDetail = new PersonEventDiseaseDetail
                                         {
                                             DateDiagnosis = deathDetail.DateDiagnosis
                                         }
                                     }
                                 }
                                    }).FirstOrDefaultAsync();


                return Mapper.Map<Contracts.Entities.Event>(result);
            }
        }

        public async Task UpdatePersonEvent(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            claim_PersonEvent originalEntity;
            List<claim_ClaimEstimate> claimEstimates;

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                originalEntity = await _personEventRepository.FirstOrDefaultAsync(s => s.PersonEventId == personEvent.PersonEventId);
                await _personEventRepository.LoadAsync(originalEntity, s => s.Claims);
                await _personEventRepository.LoadAsync(originalEntity, p => p.PersonEventDeathDetail);

                claimEstimates = await _claimEstimateRepository.Where(s => s.PersonEventId == personEvent.PersonEventId).ToListAsync();
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEvent>(personEvent);
                _personEventRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            if (originalEntity != null)
            {
                var stpStatusChanged = originalEntity.IsStraightThroughProcess != personEvent.IsStraightThroughProcess;

                if (stpStatusChanged && !personEvent.IsStraightThroughProcess)
                {
                    var workPool = personEvent.Claims?.Count > 0 ? WorkPoolEnum.ScaPool : WorkPoolEnum.CadPool;
                    var instructionText = workPool == WorkPoolEnum.ScaPool ? "Liability decision required" : "Acknowledgement Required";

                    #region handle workpool routing
                    var poolWorkFlow = new PoolWorkFlow()
                    {
                        PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent,
                        ItemId = personEvent.PersonEventId,
                        AssignedByUserId = RmaIdentity.UserId,
                        AssignedToUserId = null,
                        WorkPool = workPool,
                        EffectiveFrom = DateTimeHelper.SaNow,
                        EffectiveTo = null,
                        Instruction = $"{instructionText}: STP exited"
                    };

                    await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
                    #endregion

                    #region handle workpool sla(s)
                    //Start Stp exited SLA
                    var slaItemType = workPool == WorkPoolEnum.ScaPool
                        ? (personEvent.Claims?[0].UnderwriterId == Convert.ToInt32(UnderwriterEnum.RMAMutualAssurance)
                            ? SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID
                            : SLAItemTypeEnum.WorkPoolLiabilityDecisionNonCOID)
                        : SLAItemTypeEnum.CadPool;
                    
                    var slaStatusChangeAuditStpChanged = new SlaStatusChangeAudit
                    {
                        SLAItemType = slaItemType,
                        ItemId = personEvent.PersonEventId,
                        EffectiveFrom = DateTimeHelper.SaNow,
                        EffictiveTo = null,
                        Status = personEvent.PersonEventStatus.ToString(),
                        Reason = "STP exited and status changed"
                    };

                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditStpChanged); 
                    #endregion
                }

                var liabilityStatusChanged = false;
                var claimStatusChanged = false;

                if (personEvent.Claims?.Count > 0)
                {
                    var originalLiabilityStatus = originalEntity.Claims?.First()?.ClaimLiabilityStatus;
                    var targetLiabilityStatus = personEvent.Claims[0].ClaimLiabilityStatus;

                    var originalPDVerificationStatus = Convert.ToBoolean(originalEntity.Claims?.First()?.PdVerified);
                    var targetPDVerificationStatus = personEvent.Claims[0].PdVerified;

                    var targetFinalisedPd = personEvent.Claims[0].DisabilityPercentage;

                    var originalClaimStatus = originalEntity.Claims?.First()?.ClaimStatus;
                    var targetClaimStatus = personEvent.Claims[0].ClaimStatus;

                    liabilityStatusChanged = targetLiabilityStatus != originalLiabilityStatus;
                    claimStatusChanged = targetClaimStatus != originalClaimStatus;

                    if (liabilityStatusChanged)
                    {
                        if (targetLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability || targetLiabilityStatus == ClaimLiabilityStatusEnum.Accepted || targetLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted)
                        {
                            if (personEvent.Earnings?.Count > 0 && !personEvent.Earnings.Any(s => !s.IsEstimated) && !personEvent.IsStraightThroughProcess && (bool)!personEvent.IsFatal)
                            {
                                await CreateCaptureEarningsWizard(personEvent);
                            }

                            await _claimCommunicationService.SendClaimNotification(personEvent, TemplateTypeEnum.LiabilityAcceptanceNotification);
                        }
                        else if (targetLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityNotAccepted || targetLiabilityStatus == ClaimLiabilityStatusEnum.Repudiated)
                        {
                            // Stop Liability SLA
                            var slaStatusChangeAuditLiability = new SlaStatusChangeAudit
                            {
                                SLAItemType = SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID,
                                ItemId = personEvent.PersonEventId,
                                EffectiveFrom = DateTimeHelper.SaNow,
                                EffictiveTo = DateTimeHelper.SaNow,
                                Reason = "Liability decision completed",
                                Status = "Liability Status: " + targetLiabilityStatus.ToString()
                            };

                            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditLiability);
                        }

                        if (originalLiabilityStatus == ClaimLiabilityStatusEnum.Pending && (targetLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability || targetLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted))
                        {
                            // Stop Liability SLA
                            var slaStatusChangeAuditLiability = new SlaStatusChangeAudit
                            {
                                SLAItemType = SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID,
                                ItemId = personEvent.PersonEventId,
                                EffectiveFrom = DateTimeHelper.SaNow,
                                EffictiveTo = DateTimeHelper.SaNow,
                                Reason = "Liability decision completed",
                                Status = "Liability Status: " + targetLiabilityStatus.ToString()
                            };

                            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditLiability);

                            // Start Estimate Validation SLA
                            var slaStatusChangeAuditEstimate = new SlaStatusChangeAudit
                            {
                                SLAItemType = SLAItemTypeEnum.WorkPoolEstimateVerification,
                                ItemId = personEvent.PersonEventId,
                                EffectiveFrom = DateTimeHelper.SaNow,
                                EffictiveTo = null,
                                Reason = "Awaiting PD% verification",
                                Status = "Liability Status: " + targetLiabilityStatus.ToString()
                            };

                            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditEstimate);
                        }
                    }

                    if (!originalPDVerificationStatus && targetPDVerificationStatus)
                    {
                        // Stop Estimate Validation SLA
                        var slaStatusChangeAuditEstimate = new SlaStatusChangeAudit
                        {
                            SLAItemType = SLAItemTypeEnum.WorkPoolEstimateVerification,
                            ItemId = personEvent.PersonEventId,
                            EffectiveFrom = DateTimeHelper.SaNow,
                            EffictiveTo = DateTimeHelper.SaNow,
                            Reason = "PD% verified",
                            Status = "Estimated PD% Status: PD% Verified"
                        };

                        await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditEstimate);

                        var estimatedPdPercentage = claimEstimates?.FirstOrDefault(s => s.EstimatePd > 0)?.EstimatePd;

                        if (estimatedPdPercentage != null)
                        {
                            // start zero / non-zero SLA
                            var slaItemType = estimatedPdPercentage > 0 ? SLAItemTypeEnum.WorkPoolNonZeroPD : SLAItemTypeEnum.WorkPoolZeroPD;
                            var reason = estimatedPdPercentage > 0 ? $"Verified PD% was greater then zero: ({estimatedPdPercentage}%)" : "Verified PD% was zero: (0%)";

                            var slaStatusChangeAuditCaSca = new SlaStatusChangeAudit
                            {
                                SLAItemType = slaItemType,
                                ItemId = personEvent.PersonEventId,
                                EffectiveFrom = DateTimeHelper.SaNow,
                                EffictiveTo = null,
                                Reason = reason,
                                Status = "Estimated PD% Status: PD% Verified"
                            };

                            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditCaSca);
                        }

                    }

                    if (claimStatusChanged)
                    {
                        if (targetClaimStatus == ClaimStatusEnum.Closed)
                        {
                            var request = new PoolWorkFlowRequest
                            {
                                ItemId = personEvent.PersonEventId,
                                ItemType = PoolWorkFlowItemTypeEnum.PersonEvent
                            };

                            var poolWorkFlow = await _poolWorkFlowService.GetPoolWorkFlowByTypeAndId(request);
                            if (poolWorkFlow != null)
                            {
                                poolWorkFlow.EffectiveTo = DateTimeHelper.SaNow;
                                await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
                            }

                            if (targetPDVerificationStatus)
                            {
                                var estimatedPdPercentage = claimEstimates?.FirstOrDefault(s => s.EstimatePd > 0)?.EstimatePd;

                                if (estimatedPdPercentage != null)
                                {
                                    // stop zero / non-zero SLA
                                    var slaItemType = estimatedPdPercentage > 0 ? SLAItemTypeEnum.WorkPoolNonZeroPD : SLAItemTypeEnum.WorkPoolZeroPD;

                                    var slaStatusChangeAuditCaSca = new SlaStatusChangeAudit
                                    {
                                        SLAItemType = slaItemType,
                                        ItemId = personEvent.PersonEventId,
                                        EffectiveFrom = DateTimeHelper.SaNow,
                                        EffictiveTo = DateTimeHelper.SaNow,
                                        Reason = "Claim was closed",
                                        Status = "Claim Status: " + targetClaimStatus.ToString()
                                    };

                                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAuditCaSca);

                                    if (estimatedPdPercentage == 0)
                                    {
                                        await _claimCommunicationService.SendClaimNotification(personEvent, TemplateTypeEnum.NilPDLetter);
                                    }
                                }
                            }
                        }
                    }
                }

                if (originalEntity.PersonEventDeathDetail == null && personEvent.PersonEventDeathDetail != null)
                {
                    await CreateDisabiltyToFatalDeathCaptured(personEvent);
                }
            }
        }

        public async Task<PagedRequestResult<ClaimPool>> GetClaimWorkPool(PagedRequest request, string assignedToUserId, int userLoggedIn, int workpoolId, bool isUserBox)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("AssignedToUserId", assignedToUserId),
                    new SqlParameter("UserLoggedIn", userLoggedIn),
                    new SqlParameter("WorkpoolId", workpoolId),
                    new SqlParameter("IsUserBox", isUserBox),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[9].Direction = ParameterDirection.Output;

                var searchResult = await _eventRepository.SqlQueryAsync<ClaimPool>(DatabaseConstants.GetPool, parameters);

                int recordCount = int.TryParse(parameters[9]?.Value?.ToString(), out int result) ? result : 0;

                return new PagedRequestResult<ClaimPool>()
                {
                    Page = request.Page,
                    PageCount = (searchResult?.Count) ?? 0,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<ClaimInvoicePayment>> GetPagedClaimInvoices(PagedRequest request, int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", request.Page),
                    new SqlParameter("RowsOfPage", request.PageSize),
                    new SqlParameter("SortingCol", request.OrderBy),
                    new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", request.SearchCriteria == null ? string.Empty : request.SearchCriteria),
                    new SqlParameter("PersonEventId", personEventId),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[6].Direction = ParameterDirection.Output;

                var searchResult = await _eventRepository.SqlQueryAsync<ClaimInvoicePayment>(DatabaseConstants.GetPagedClaimInvoices, parameters);
                var recordCount = (int)parameters[6].Value;

                return new PagedRequestResult<ClaimInvoicePayment>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PagedRequestResult<RolePlayerSearchResult>> GetPagedMemberInsuredLives(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInsuredLife);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("Filter", request?.SearchCriteria),
                    new SqlParameter("ShowActive", showActive),
                    new SqlParameter("PageIndex", request.Page),
                    new SqlParameter("PageSize", request.PageSize),
                    new SqlParameter("SortColumn", request.OrderBy),
                    new SqlParameter("SortOrder", request.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("RecordCount", SqlDbType.Int)
                };

                parameters[6].Direction = ParameterDirection.Output;

                var searchResult = await _eventRepository.SqlQueryAsync<RolePlayerSearchResult>(DatabaseConstants.ClaimMemberInsuredLivesStoredProcedure, parameters);
                var recordCount = (int)parameters[6].Value;

                return new PagedRequestResult<RolePlayerSearchResult>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<PersonEvent> GetPersonEventByClaimant(int claimantId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _personEventRepository.OrderByDescending(x => x.PersonEventId)
                    .Where(a => a.ClaimantId == claimantId && a.PersonEventStatus != PersonEventStatusEnum.PendingInvestigations
                    || a.ClaimantId == claimantId && a.PersonEventStatus != PersonEventStatusEnum.Closed)
                    .FirstOrDefaultAsync();

                if (results == null)
                {
                    return null;
                }

                await _personEventRepository.LoadAsync(results, p => p.PersonEventAccidentDetail);
                await _personEventRepository.LoadAsync(results, p => p.Claims);

                return Mapper.Map<PersonEvent>(results);

            }
        }

        public async Task<PersonEvent> GetPersonEventWithNoReferenceData(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.SingleAsync(p => p.PersonEventId == personEventId, $"could not find person event with personeventid {personEventId}");

                return Mapper.Map<PersonEvent>(personEvent);
            }
        }

        public async Task<bool> CreateDisabiltyToFatalDeathCaptured(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            var roleplayer = await _rolePlayerService.GetRolePlayer(personEvent.RolePlayer.RolePlayerId);
            roleplayer.Person.DateOfDeath = personEvent.PersonEventDeathDetail.DeathDate.ToSaDateTime();
            roleplayer.Person.IsAlive = false;
            await _rolePlayerService.UpdateRolePlayer(roleplayer);

            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "disability-to-fatal",
                Data = _serializer.Serialize(personEvent)
            };
            await _wizardService.StartWizard(startWizardRequest);
            return await Task.FromResult(true);
        }
        #endregion

        #region Private Methods

        private int DayCount(DateTime createDate, DateTime todaysDate)
        {
            return (todaysDate.Date - createDate.Date).Days;
        }

        private Dictionary<int, string> GetRolePlayerTypeEnums()
        {
            var rolePlayerTypes = new Dictionary<int, string>();
            foreach (RolePlayerTypeEnum item in Enum.GetValues(typeof(RolePlayerTypeEnum)))
            {
                rolePlayerTypes.Add((int)item, item.DisplayAttributeValue());
            }

            return rolePlayerTypes;
        }

        private RolePlayer CreateRolePlayer()
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

        private async Task<MailAttachment[]> GetAttachments(List<DocumentTypeEnum> documentTypeId, DocumentDetails documentDetails)
        {
            var listOfDocument = new List<MailAttachment>();
            var counter = 0;
            foreach (var documentType in documentTypeId.ToList())
            {
                if (documentType == DocumentTypeEnum.ContinuationForm)
                {
                    var mailAttachment = await CreatePdfDocument(documentType, documentDetails);
                    listOfDocument.Add(mailAttachment);
                }
                else
                {
                    var attachment = await _documentTemplateService.GetDocumentTemplateByDocumentType(documentType);
                    if (attachment != null)
                    {
                        var mail = new MailAttachment()
                        {
                            AttachmentByteData = attachment.DocumentBinary != null ? attachment.DocumentBinary : await _documentGeneratorService.ConvertHtmlToPdf(attachment.DocumentHtml),
                            FileName = attachment.DocumentName,
                            FileType = attachment.DocumentMimeType
                        };
                        listOfDocument.Add(mail);
                    }
                }
            }

            var attachmentMailAttachments = new MailAttachment[listOfDocument.Count];
            foreach (var document in listOfDocument)
            {
                attachmentMailAttachments[counter] = document;
                counter++;
            }
            return attachmentMailAttachments;
        }

        private async Task<MailAttachment> CreatePdfDocument(DocumentTypeEnum documentType, DocumentDetails documentDetails)
        {
            var documentTemplate = await _documentTemplateService.GetDocumentTemplateByDocumentType(documentType);
            var documentsToken = new Dictionary<string, string>()
            {
                ["{policyNumber}"] = documentDetails.PolicyNumber,
                ["{deceasedFirstName}"] = documentDetails.PersonFirstName,
                ["{deceasedLastName}"] = documentDetails.PersonLastName,
                ["{beneficiaryFirstName}"] = documentDetails.BeneficiaryFirstName,
                ["{beneficiarLastName}"] = documentDetails.BeneficiaryLastName,
                ["{address1}"] = documentDetails.Address1,
                ["{address2}"] = documentDetails.Address1,
                ["{address3}"] = documentDetails.Address1,

            };

            foreach (var token in documentsToken)
            {
                documentTemplate.DocumentHtml = documentTemplate.DocumentHtml.Replace($"{token.Key}", token.Value);
            }

            var mailAttachment = new MailAttachment()
            {
                AttachmentByteData = await _documentGeneratorService.ConvertHtmlToPdf(documentTemplate.DocumentHtml),
                FileType = documentTemplate.DocumentMimeType,
                FileName = documentTemplate.DocumentName
            };
            return mailAttachment;
        }

        private DocumentSetEnum GetDocumentSetForDiseaseType(DiseaseTypeEnum diseaseType)
        {
            switch (diseaseType)
            {
                case DiseaseTypeEnum.NIHL:
                    return DocumentSetEnum.NIHL;
                case DiseaseTypeEnum.WorkRelatedUpperLimbDisorder:
                    return DocumentSetEnum.WRULDdocuments;
                case DiseaseTypeEnum.TuberculosisHealthWorkersOnly:
                case DiseaseTypeEnum.TuberculosisOfTheHeart:
                case DiseaseTypeEnum.TuberculousPleurisy:
                case DiseaseTypeEnum.PulmonaryTuberculosisPlusOAD:
                case DiseaseTypeEnum.PulmonaryTuberculosis:
                case DiseaseTypeEnum.PulmonaryTuberculosisPlusPneumoconiosis:
                case DiseaseTypeEnum.CardioPulmonaryTuberculosis:
                case DiseaseTypeEnum.PulmonaryTuberculosisPlusPneumoconiosisPlusOAD:
                    return DocumentSetEnum.TuberculosisDocuments;
                case DiseaseTypeEnum.PTSD:
                    return DocumentSetEnum.PtsdDocuments;
                case DiseaseTypeEnum.Malaria:
                    return DocumentSetEnum.MalariaDocuments;
                case DiseaseTypeEnum.Virus:
                    return DocumentSetEnum.CovidDocuments;
                case DiseaseTypeEnum.HeatExhaustionHeatStroke:
                    return DocumentSetEnum.HeatClaimsDocuments;
                case DiseaseTypeEnum.OccupationalAsthma:
                    return DocumentSetEnum.AsthmaDocuments;
                default:
                    return DocumentSetEnum.CommonPersonalDocuments;
            }
        }

        private async Task UpdateSLAForClaim(claim_Claim claim, WorkPoolEnum workPool)
        {
            var slaItemType = workPool == WorkPoolEnum.CadPool ? SLAItemTypeEnum.CadPool
                            : workPool == WorkPoolEnum.CmcPool ? SLAItemTypeEnum.CmcPool
                            : workPool == WorkPoolEnum.EarningsAssessorpool ? SLAItemTypeEnum.EarningsPool
                            : workPool == WorkPoolEnum.ScaPool ? SLAItemTypeEnum.ScaPool
                            : workPool == WorkPoolEnum.CcaPool ? SLAItemTypeEnum.CcaPool
                            : workPool == WorkPoolEnum.ClaimsAssessorPool ? SLAItemTypeEnum.CaPool : SLAItemTypeEnum.Claim;


            var slaStatusChangeAudit = new SlaStatusChangeAudit
            {
                SLAItemType = slaItemType,
                ItemId = claim.ClaimId,
                Status = claim.ClaimStatus.ToString(),
                EffectiveFrom = DateTimeHelper.SaNow,
                Reason = "claim was created"
            };

            DateTime? effectiveTo = null;
            switch (slaItemType)
            {
                case SLAItemTypeEnum.Claim:
                    if (claim.ClaimStatus == ClaimStatusEnum.ClaimClosed || claim.ClaimStatus == ClaimStatusEnum.Closed)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }
                    break;
                case SLAItemTypeEnum.CadPool:
                    if (claim.ClaimStatus == ClaimStatusEnum.ManuallyAcknowledged || claim.ClaimStatus == ClaimStatusEnum.AutoAcknowledged)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }
                    break;
                case SLAItemTypeEnum.ScaPool:
                    break;
                case SLAItemTypeEnum.CcaPool:
                    break;
                case SLAItemTypeEnum.CmcPool:
                    break;
                case SLAItemTypeEnum.CaPool:
                    break;
                case SLAItemTypeEnum.CcaTeamLeadPool:
                    break;
                case SLAItemTypeEnum.EarningsPool:
                    break;
                case SLAItemTypeEnum.PaymentPool:
                    break;

                case SLAItemTypeEnum.ClaimsAssessorPool:
                    break;
                default:
                    effectiveTo = DateTimeHelper.SaNow;
                    break;
            }

            slaStatusChangeAudit.EffictiveTo = effectiveTo;
            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
        }

        private async Task CreatePoolWorkFlow(PersonEvent personEvent, WorkPoolEnum workPool)
        {
            var poolWorkFlow = new PoolWorkFlow()
            {
                ItemId = personEvent.PersonEventId,
                PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent,
                WorkPool = workPool,
                AssignedByUserId = RmaIdentity.UserId,
                AssignedToUserId = null,
                EffectiveFrom = DateTimeHelper.SaNow,
                EffectiveTo = null,
            };

            // await UpdateSLAForClaim(personEvent, workPool);
            await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
        }

        private async Task CreateCaptureEarningsWizard(PersonEvent personEvent)
        {
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = personEvent.PersonEventId,
                Type = "capture-earnings",
                Data = _serializer.Serialize(personEvent)
            };

            await _wizardService.StartWizard(startWizardRequest);
        }

        private List<string> GenerateColumns()
        {
            List<string> columns = new List<string>();
            columns.Add("claimNumber");
            columns.Add("age");
            columns.Add("isMVAClaim");
            columns.Add("isHighCostInjury");
            columns.Add("dayReportingLag");
            columns.Add("assaultFlag");
            columns.Add("incurredMedicalValue");
            columns.Add("drgCode");
            columns.Add("incurredDaysValue");
            columns.Add("frequency");
            columns.Add("subClass");
            columns.Add("injurySeverity");
            columns.Add("pdPercentage");
            columns.Add("eventDescription");
            columns.Add("product");
            columns.Add("claimType");
            columns.Add("industryName");
            columns.Add("gender");

            return columns;
        }

        private async Task<PersonEvent> SubmitTransactionForSTPValidation(PersonEvent personEvent)
        {
            var eventDetails = await GetEventDetails(personEvent.EventId);
            if (personEvent.PhysicalDamages.Count != 0)
            {
                var icd10DiagnosticGroup = await _iCD10CodeService.GetICD10DiagnosticGroup(personEvent.PhysicalDamages[0].Icd10DiagnosticGroupId);
                var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);
                var request = new SuspiciousTransactionRequest.RootSuspiciousTransactionRequest
                {
                    Inputs = new SuspiciousTransactionRequest.Inputs()
                };
                request.Inputs.input1 = new SuspiciousTransactionRequest.Input1
                {
                    ColumnNames = new List<string>()
                };
                request.Inputs.input1.ColumnNames = GenerateColumns();

                List<string> values = new List<string>();
                values.Add(eventDetails.PersonEvents[0].Claims[0].ClaimReferenceNumber);
                values.Add(personEvent.RolePlayer.Person.Age.ToString());
                values.Add(Convert.ToString(personEvent.PersonEventAccidentDetail?.IsRoadAccident == true ? 1 : 0));
                values.Add(Convert.ToString(personEvent.PhysicalDamages[0].Injuries[0].InjurySeverityType == InjurySeverityTypeEnum.Severe ? 1 : 0));
                values.Add((DateTime.Now.Date - eventDetails.EventDate.Date).Days.ToString());
                values.Add(Convert.ToString(personEvent.IsAssault ? 1 : 0));
                values.Add(Convert.ToString(0));
                values.Add(icd10DiagnosticGroup.Code);
                values.Add(Convert.ToString(0));
                values.Add(Convert.ToString(1));
                values.Add(eventDetails.LocationCategory.Value.DisplayAttributeValue());
                values.Add(personEvent.PhysicalDamages[0].Injuries[0].InjurySeverityType.DisplayAttributeValue());
                values.Add(Convert.ToString(0));
                values.Add(eventDetails.EventType.DisplayAttributeValue());
                values.Add("COID Policy");
                values.Add(personEvent.ClaimType.DisplayAttributeValue());
                values.Add(company.Company.IndustryClass.DisplayAttributeValue());
                values.Add(personEvent.RolePlayer.Person.Gender.DisplayAttributeValue());
                request.Inputs.input1.Values = new List<List<string>>();
                request.Inputs.input1.Values.Add(values);
                var suspiciousTransactionResult = await _suspiciousTransactionModelService.SendSTMRequest(request, personEvent);
                if (suspiciousTransactionResult?.Results?.output1?.value?.Values?.Count > 0)
                {
                    var predictedValue = int.Parse(suspiciousTransactionResult.Results?.output1?.value?.Values[0][1]);
                    if (predictedValue == 1)
                    {
                        personEvent.SuspiciousTransactionStatus = SuspiciousTransactionStatusEnum.Suspicious;
                        personEvent.IsStraightThroughProcess = false;
                        personEvent.PersonEventStpExitReasons.Add(new PersonEventStpExitReason
                        {
                            PersonEventId = personEvent.PersonEventId,
                            StpExitReasonId = (int)STPExitReasonEnum.CheckSTM,
                            CreatedBy = RmaIdentity.Username,
                            ModifiedBy = RmaIdentity.Username
                        });

                    }
                    else if (predictedValue == 0)
                    {
                        personEvent.SuspiciousTransactionStatus = SuspiciousTransactionStatusEnum.NotSuspicious;
                    }
                }
            }
            var isSTPReasonId = await ValidateIsStraigthThroughProcessing(personEvent, eventDetails.EventDate);
            if (isSTPReasonId == -1 && personEvent.PersonEventDeathDetail == null)
            {
                personEvent.IsStraightThroughProcess = true;
                personEvent.PersonEventStpExitReasons.Add(new PersonEventStpExitReason
                {
                    PersonEventId = personEvent.PersonEventId,
                    StpExitReasonId = (int)STPExitReasonEnum.Unknown,
                    CreatedBy = RmaIdentity.Username,
                    ModifiedBy = RmaIdentity.Username
                });
            }
            else if (isSTPReasonId != -1 || personEvent.PersonEventDeathDetail != null)
            {
                personEvent.IsStraightThroughProcess = false;
                if (isSTPReasonId != -1)
                {
                    personEvent.PersonEventStpExitReasons.Add(new PersonEventStpExitReason
                    {
                        PersonEventId = personEvent.PersonEventId,
                        StpExitReasonId = isSTPReasonId,
                        CreatedBy = RmaIdentity.Username,
                        ModifiedBy = RmaIdentity.Username
                    });
                }
            }
            await AddNotes(personEvent, "Claim injury details edited and resubmitted for STP validations");

            return personEvent;
        }

        private async Task<int> ValidateIsStraigthThroughProcessing(PersonEvent personEvent, DateTime eventDate)
        {
            Contract.Requires(personEvent != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PolicyOwner", personEvent.CompanyRolePlayerId),
                    new SqlParameter("InsuranceType", personEvent.InsuranceTypeId),
                    new SqlParameter("ClaimType", personEvent.ClaimType),
                    new SqlParameter("BenefitId", personEvent.PersonEventBucketClassId),
                    new SqlParameter("ReportDate", eventDate),
                };

                var isSTP = await _personEventRepository.SqlQueryAsync<int>(DatabaseConstants.ValidateIsStraigthThroughProcess, parameters);
                return isSTP[0];

            }
        }

        private async Task<int> AddNotes(PersonEvent personEvent, string message)
        {
            Contract.Requires(personEvent != null);

            return await _noteService.AddNote(new Note
            {
                ItemId = personEvent.PersonEventId,
                ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                Text = message,
            });
        }

        #endregion
    }
};
