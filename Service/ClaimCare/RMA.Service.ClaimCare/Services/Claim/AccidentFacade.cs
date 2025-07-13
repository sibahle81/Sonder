using AutoMapper;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Constants;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Entities.Digi;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.Integrations.Contracts.Entities.STP;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

using DocumentSetEnum = RMA.Service.Admin.MasterDataManager.Contracts.Enums.DocumentSetEnum;
using INoteService = RMA.Service.ClaimCare.Contracts.Interfaces.Claim.INoteService;
using MedicalIcd10Code = RMA.Service.MediCare.Contracts.Entities.Medical.ICD10Code;
using SuspiciousTransactionRequest = RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionRequest;
// ensure enum changes go through
namespace RMA.Service.ClaimCare.Services.Claim
{
    public class AccidentFacade : RemotingStatelessService, IAccidentService
    {
        private const string SuspiciousTransactionModel = "SuspiciousTransactionModel";
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";
        private const string IsVopdQuickTransactEnabled = "IsVopdQuickTransactEnabled";
        private bool isAuditClaimsProcessedEnabled;
        private bool isValidateCompCareMedicalReport;
        private bool instantAdjudicateSTP;
        private string stpSendTopic;
        private string stpSendConnectionString;
        private const string FatalDrg = "DRG00";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_Event> _eventRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_PatersonGrading> _claimPatersonGradings;
        private readonly IRepository<claim_ClaimBucketClass> _claimBucketClassRepository;
        private readonly IRepository<claim_HearingAssessment> _claimHearingAssessmentRepository;
        private readonly IRepository<claim_NihlLookup> _claimNihlLookupRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyService _policyService;
        private readonly IIndustryService _industryService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IEventService _eventService;
        private readonly IMedicalEstimatesService _medicalEstimatesService;
        private readonly IMedicalFormService _medicalFormService;
        private readonly IDigiService _digiService;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly IRepository<claim_MedicalReportFormWizardDetail> _medicalReportFormWizardDetails;
        private readonly IRepository<claim_PersonEventStpExitReason> _personEventStpExitReasons;
        private readonly MediCare.Contracts.Interfaces.Medical.IICD10CodeService _iCD10CodeService;
        private readonly ISuspiciousTransactionModelService _suspiciousTransactionModelService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly INoteService _noteService;
        private readonly IAuditLogV1Service _auditLogService;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IClaimService _claimService;
        private readonly IPoolWorkFlowService _poolWorkFlowService;
        private readonly IUserService _userService;
        private readonly IUserReminderService _userReminderService;
        private readonly IRepository<common_UserReminder> _userReminderRepository;
        private readonly IClaimInvoiceService _claimInvoiceService;
        private readonly ISLAService _slaService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;


        public AccidentFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Claim> claimRepository
            , IRepository<claim_PatersonGrading> claimPatersonGradings
            , IRepository<claim_ClaimBucketClass> claimBucketClassRepository
            , IRepository<claim_HearingAssessment> claimHearingAssessmentRepository
            , IRepository<claim_NihlLookup> claimNihlLookupRepository
            , IConfigurationService configurationService
            , IPolicyService policyService
            , IRepository<claim_PersonEvent> personEventRepository
            , IIndustryService industryService
            , IRolePlayerService rolePlayerService
            , IClaimCommunicationService claimCommunicationService
            , IRepository<claim_Event> eventRepository
            , IDocumentIndexService documentIndexService
            , IEventService eventService
            , IMedicalEstimatesService medicalEstimatesService
            , IMedicalFormService medicalFormService
            , IDigiService digiService
            , ISerializerService serializer
            , IWizardService wizardService
            , IDocumentGeneratorService documentGeneratorService
            , INoteService noteService
            , IAuditLogV1Service auditLogService
            , IRepository<claim_MedicalReportFormWizardDetail> medicalReportFormWizardDetails
            , IRepository<claim_PersonEventStpExitReason> personEventStpExitReasons
            , MediCare.Contracts.Interfaces.Medical.IICD10CodeService iCD10CodeService
            , ISuspiciousTransactionModelService suspiciousTransactionModelService
            , IServiceBusMessage serviceBusMessage
            , IClaimService claimService
            , IPoolWorkFlowService poolWorkFlowService
            , IUserService userService
            , IUserReminderService userReminderService
            , IRepository<common_UserReminder> userReminderRepository
            , IClaimInvoiceService claimInvoiceService
            , ICommonSystemNoteService commonSystemNoteService
            , ISLAService slaService) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimRepository = claimRepository;
            _claimBucketClassRepository = claimBucketClassRepository;
            _claimHearingAssessmentRepository = claimHearingAssessmentRepository;
            _claimNihlLookupRepository = claimNihlLookupRepository;
            _claimPatersonGradings = claimPatersonGradings;
            _configurationService = configurationService;
            _policyService = policyService;
            _personEventRepository = personEventRepository;
            _industryService = industryService;
            _rolePlayerService = rolePlayerService;
            _eventRepository = eventRepository;
            _documentIndexService = documentIndexService;
            _claimCommunicationService = claimCommunicationService;
            _documentIndexService = documentIndexService;
            _eventService = eventService;
            _medicalEstimatesService = medicalEstimatesService;
            _medicalFormService = medicalFormService;
            _digiService = digiService;
            _serializer = serializer;
            _wizardService = wizardService;
            _medicalReportFormWizardDetails = medicalReportFormWizardDetails;
            _personEventStpExitReasons = personEventStpExitReasons;
            _iCD10CodeService = iCD10CodeService;
            _suspiciousTransactionModelService = suspiciousTransactionModelService;
            _documentGeneratorService = documentGeneratorService;
            _noteService = noteService;
            _auditLogService = auditLogService;
            _serviceBusMessage = serviceBusMessage;
            _claimService = claimService;
            _poolWorkFlowService = poolWorkFlowService;
            _userService = userService;
            _userReminderService = userReminderService;
            _userReminderRepository = userReminderRepository;
            _claimInvoiceService = claimInvoiceService;
            _slaService = slaService;
            _commonSystemNoteService = commonSystemNoteService;
            Task.Run(() => this.SetupStpIntegrationVariables()).Wait();
        }

        private async Task SetupStpIntegrationVariables()
        {
            stpSendTopic = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendTopic);
            stpSendConnectionString = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendConnectionString);
            isAuditClaimsProcessedEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsAuditClaimsProcessedEnabled");
            isValidateCompCareMedicalReport = await _configurationService.IsFeatureFlagSettingEnabled("ValidateCompCareMedicalReport");
            instantAdjudicateSTP = await _configurationService.IsFeatureFlagSettingEnabled("InstantAdjudicateSTP");
        }

        public async Task<Contracts.Entities.Claim> GetAccidentClaim(int claimId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);
                return Mapper.Map<Contracts.Entities.Claim>(entity);
            }
        }

        public async Task<List<PatersonGrading>> GetPatersonGradingsBySkill(bool isSkilled)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _claimPatersonGradings.Where(pg => pg.IsSkilled == isSkilled).ToListAsync();
                return Mapper.Map<List<PatersonGrading>>(entities);
            }
        }

        public async Task<List<ClaimBucketClass>> GetClaimBucketClasses()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _claimBucketClassRepository.ToListAsync();
                return Mapper.Map<List<ClaimBucketClass>>(entities);
            }
        }

        public async Task<ClaimBucketClass> GetClaimBucketClassById(int bucketClassId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bucketClass = await _claimBucketClassRepository.FirstOrDefaultAsync(x => x.ClaimBucketClassId == bucketClassId);
                return Mapper.Map<ClaimBucketClass>(bucketClass);
            }
        }

        public async Task<int> ValidateIsStraigthThroughProcessing(PersonEvent personEvent, DateTime eventDate)
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

                var isSTP = await _claimRepository.SqlQueryAsync<int>(DatabaseConstants.ValidateIsStraigthThroughProcess, parameters);
                return isSTP[0];

            }
        }

        public async Task ResubmitVopdRequests()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var vopdRequests = await _rolePlayerService.GetUnprocessedVopdRequest();
                if (vopdRequests != null)
                {
                    foreach (var vopdRequest in vopdRequests)
                    {
                        try
                        {
                            DateTime currentTime = DateTime.Now;
                            TimeSpan timeDifference = currentTime - vopdRequest.SubmittedDate.Value;
                            if (timeDifference.TotalHours <= 24)
                            {
                                var rolePlayer = await _rolePlayerService.GetPerson(vopdRequest.RolePlayerId);
                                if (rolePlayer != null)
                                {
                                    await _rolePlayerService.ResubmitRolePlayerVopdRequest(rolePlayer.Person);
                                    if (await _configurationService.IsFeatureFlagSettingEnabled(IsVopdQuickTransactEnabled))
                                    {
                                        await _claimService.ProcessVOPDReponse(vopdRequest.RolePlayerId);
                                    }
                                }
                            }
                            else
                            {
                                var personEvents = await _personEventRepository.Where(x => x.InsuredLifeId == vopdRequest.RolePlayerId).ToListAsync();
                                if (personEvents != null)
                                {
                                    foreach (var personEvent in personEvents)
                                    {
                                        var _personEvent = Mapper.Map<PersonEvent>(personEvent);
                                        await SendToCADWorkPoolForVOPD(_personEvent);
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException($"Error when resubmiting VOPD Request for: {vopdRequest.RolePlayerId} - Error Message {ex.Message}");
                        }
                    }
                }

            }
        }

        private async Task<int> AddTracingNotes(int claimId, string message, ItemTypeEnum itemTypeEnum)
        {
            Contract.Requires(claimId > 0);

            return await _noteService.AddNote(new Note
            {
                ItemId = claimId,
                ItemType = itemTypeEnum.DisplayAttributeValue(),
                Text = message,
                Reason = "Tracing"
            });
        }

        public async Task ScheduledAutoAdjudicateSTP()
        {
            var autoAdjudicateClaims = await GetPendingAcknowledgementClaims(false);

            foreach (var claim in autoAdjudicateClaims)
            {
                if (!claim.DocumentsBeenUploaded)
                {
                    continue;
                }
                // Run in the background, because will time out when called from the scheduler
                _ = Task.Run(() => ProcessAutoAcknowledgeSTPClaim(claim));
            }
        }

        private async Task ProcessAutoAcknowledgeSTPClaim(AutoAjudicateClaim autoAjudicateClaim)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var existingClaims = await _claimRepository.Where(c => c.PersonEventId == autoAjudicateClaim.PersonEventId).ToListAsync();
                    if (!existingClaims.Any())
                    {
                        var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(autoAjudicateClaim.ClaimantId);
                        policies.RemoveAll(p => p.ProductCategoryType != ProductCategoryTypeEnum.Coid);

                        if (autoAjudicateClaim.IdType == IdTypeEnum.PassportDocument || (autoAjudicateClaim.IdType == IdTypeEnum.SAIDDocument && autoAjudicateClaim.IsVopdVerified))
                        {
                            await _claimService.AcknowledgeClaims(policies, autoAjudicateClaim.PersonEventId, true);
                        }
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(autoAjudicateClaim.CompCarePEVRefNumber))
                        {
                            var isValidateCompCareMedicalReport = await _configurationService.IsFeatureFlagSettingEnabled("ValidateCompCareMedicalReport");
                            var personEvent = await _eventService.GetPersonEvent(autoAjudicateClaim.PersonEventId);
                            var claim = await _claimRepository.FirstOrDefaultAsync(c => c.ClaimId == autoAjudicateClaim.ClaimId && (c.ClaimStatus == ClaimStatusEnum.PendingRequirements
                                                                                        || c.ClaimStatus == ClaimStatusEnum.PendingAcknowledgement || c.ClaimStatus == ClaimStatusEnum.Reopened
                                                                                        || c.ClaimStatus == ClaimStatusEnum.Submitted || c.ClaimStatus == ClaimStatusEnum.New));
                            if (claim == null) return;

                            string claimNumber = autoAjudicateClaim.ClaimReferenceNumber;
                            if (claim.ClaimReferenceNumber.Contains("???") || claim.ClaimReferenceNumber.Contains("PEV"))
                            {
                                var newClaimNumber = claim.ClaimReferenceNumber.Remove(claim.ClaimReferenceNumber.Length - 3);
                                claimNumber = $"{newClaimNumber}{autoAjudicateClaim.ProductCode}";
                                autoAjudicateClaim.ClaimReferenceNumber = claimNumber;
                            }

                            autoAjudicateClaim.DocumentsBeenUploaded = await CheckIfCompcareDocumentsUploaded(autoAjudicateClaim.CompCarePEVRefNumber, autoAjudicateClaim.EmployeeIdNumber);
                            if (isValidateCompCareMedicalReport && autoAjudicateClaim.DocumentsBeenUploaded)
                            {
                                var validMedicalReport = await CheckCompCareMedicalReportEstimates(autoAjudicateClaim.PersonEventId);
                                if (!validMedicalReport)
                                {
                                    return;
                                }
                            }

                            if (autoAjudicateClaim.IsVopdVerified && autoAjudicateClaim.DocumentsBeenUploaded && autoAjudicateClaim.IdType == IdTypeEnum.SAIDDocument)
                            {
                                await UpdateAdjudicatedClaimStatus(autoAjudicateClaim.PersonEventId, ClaimStatusEnum.AutoAcknowledged, ClaimLiabilityStatusEnum.Accepted, claimNumber);

                            }
                            else if (autoAjudicateClaim.DocumentsBeenUploaded && autoAjudicateClaim.IdType != IdTypeEnum.SAIDDocument)
                            {
                                await UpdateAdjudicatedClaimStatus(autoAjudicateClaim.PersonEventId, ClaimStatusEnum.AutoAcknowledged, ClaimLiabilityStatusEnum.Accepted, claimNumber);

                            }

                            _ = Task.Run(() => _claimCommunicationService.SendClaimNotification(personEvent, TemplateTypeEnum.AcknowledgmentofClaim));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when processing auto acknowledge stp claim: {autoAjudicateClaim.PersonEventId} - Error Message {ex.Message}");
            }
        }

        public async Task InstantAdjudicateSTP(PersonEvent personEvent, DateTime eventDate)
        {
            Contract.Requires(personEvent != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var claim = personEvent.Claims[0];
                    if (isAuditClaimsProcessedEnabled)
                    {
                        await AddTracingNotes(claim.ClaimId, "Claim queued for adjudication", ItemTypeEnum.Claim);
                    }

                    if (claim.ClaimStatus == ClaimStatusEnum.PendingRequirements
                       || claim.ClaimStatus == ClaimStatusEnum.PendingAcknowledgement || claim.ClaimStatus == ClaimStatusEnum.Reopened)
                    {
                        string claimNumber = claim.ClaimReferenceNumber;
                        if (claim.ClaimReferenceNumber.Contains("???"))
                        {
                            var newClaimNumber = claim.ClaimReferenceNumber.Remove(claim.ClaimReferenceNumber.Length - 3);
                            claimNumber = $"{newClaimNumber}" + "EMP";
                            claim.ClaimReferenceNumber = claimNumber;
                        }

                        var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);
                        var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                        var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId);
                        var contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                        if (contactInformation == null)
                        {
                            contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                        }

                        var claimSMS = await GenerateInstantAcknowledgementSMS(personEvent, employee.CellNumber);
                        var claimEmail = await GenerateInstantAcknowledgementLetter(personEvent, employee, company, eventDate);

                        var identity = employee.Person.IdNumber ?? employee.Person.PassportNumber;
                        var documentsBeenUploaded = personEvent.CompCarePevRefNumber != null ? await CheckIfCompcareDocumentsUploaded(personEvent.CompCarePevRefNumber, identity) : false;
                        if (!string.IsNullOrWhiteSpace(personEvent.CompCarePevRefNumber) && isValidateCompCareMedicalReport && documentsBeenUploaded)
                        {
                            var validMedicalReport = await CheckCompCareMedicalReportEstimates(claim.PersonEventId);
                        }

                        if ((employee.Person.IsVopdVerified && documentsBeenUploaded && employee.Person.IdType == IdTypeEnum.SAIDDocument)
                            || (documentsBeenUploaded && employee.Person.IdType != IdTypeEnum.SAIDDocument))
                        {
                            await UpdateAdjudicatedClaimStatus(personEvent.PersonEventId, ClaimStatusEnum.AutoAcknowledged, ClaimLiabilityStatusEnum.Accepted, claimNumber);
                            //_ = Task.Run(() => _claimCommunicationService.SendNotificationAcknowledgement(claimEmail, claimSMS, employee, claimNumber, contactInformation));
                            if (isAuditClaimsProcessedEnabled)
                            {
                                await AddTracingNotes(claim.ClaimId, "Claim is auto-acknowledged", ItemTypeEnum.Claim);
                            }

                        }
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when geting claims for Adjudication process - Error Message {ex.Message}");
                }
            }
        }

        public async Task UpdateAdjudicatedClaimStatus(int personEventId, ClaimStatusEnum claimStatusEnum, ClaimLiabilityStatusEnum claimLiabilityStatusEnum, string claimNumber)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claims = await _claimRepository.Where(x => x.PersonEventId == personEventId).ToListAsync();
                if (claims.Count > 0)
                {
                    var text = $"Claim status updated from {claims[0].ClaimStatus.DisplayAttributeValue()} to {claimStatusEnum.DisplayAttributeValue()} " +
                                $"and Liability status updated from {claims[0].ClaimLiabilityStatus.DisplayAttributeValue()} to {claimLiabilityStatusEnum.DisplayAttributeValue()}";

                    await CreateSystemAddedCommonNotes(personEventId, text);

                    foreach (var claim in claims)
                    {
                        var result = Mapper.Map<claim_Claim>(claim);
                        result.ClaimReferenceNumber = claimNumber;
                        result.ClaimStatus = claimStatusEnum;
                        result.ClaimLiabilityStatus = claimLiabilityStatusEnum;
                        result.ClaimStatusChangeDate = DateTime.Now;
                        _claimRepository.Update(result);
                        AddAuditEntry(claim, false, null);
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task<ClaimSMS> GenerateAcknowledgementSMS(AutoAjudicateClaim autoAjudicateClaim, string cellNumber)
        {
            var documentsNotReceieved = new List<ScanCare.Contracts.Entities.Document>();
            var keyFirstMedicalReport = new Dictionary<string, string>
            {
                { "FirstMedicalReportId", autoAjudicateClaim.PersonEventId.ToString() }
            };
            var medicalReports = await _documentIndexService.GetAllDocumentsNotRecieved(DocumentSetEnum.ClaimMedicalDocuments, keyFirstMedicalReport);
            if (medicalReports != null)
            {
                var firstMedicalReport = medicalReports.Where(report => report.DocTypeId == (int)DocumentTypeEnum.FirstMedicalReport).ToList();
                documentsNotReceieved.AddRange(firstMedicalReport);
            }

            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = documentsNotReceieved.Count != 0 ? TemplateTypeEnum.AccidentNotAcknowledged : TemplateTypeEnum.AccidentNotAcknowledgedDocumentExist,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                }
            };
            return claimSMS;
        }

        private Task<ClaimSMS> GenerateInstantAcknowledgementSMS(PersonEvent personEvent, string cellNumber)
        {
            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = personEvent.PersonEventId,
                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = personEvent.CompCarePevRefNumber ?? personEvent.Claims[0].ClaimReferenceNumber,
                }
            };
            return Task.FromResult<ClaimSMS>(claimSMS);
        }

        private Task<ClaimEmail> GenerateAcknowledgementLetter(AutoAjudicateClaim autoAjudicateClaim)
        {
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = autoAjudicateClaim.EmployeeEmailAddress,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = TemplateTypeEnum.STPClaimClosingLetter,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{autoAjudicateClaim.CompanyName}",
                    ["{Address}"] = autoAjudicateClaim.CompanyAddressLine1,
                    ["{City/Town}"] = autoAjudicateClaim.CompanyCity,
                    ["{PostalCode}"] = autoAjudicateClaim.CompanyPostalCode,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{ClaimNumber}"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                    ["{EmployeeName}"] = $"{autoAjudicateClaim.EmployeeFirstName} {autoAjudicateClaim.EmployeeSurname}",
                    ["{CompanyNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{IndustryNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{DateOfAccident}"] = autoAjudicateClaim.EventDate.ToString("dd MMM yyyy"),

                    ["{Title}"] = autoAjudicateClaim.Title.DisplayAttributeValue(),
                    ["{Surname}"] = autoAjudicateClaim.EmployeeSurname,
                }
            };

            return Task.FromResult<ClaimEmail>(claimEmail);
        }

        private Task<ClaimEmail> GenerateInstantAcknowledgementLetter(PersonEvent personEvent, RolePlayer employee, RolePlayer company, DateTime eventDate)
        {
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = employee.EmailAddress,
                PersonEventId = personEvent.PersonEventId,
                TemplateType = TemplateTypeEnum.STPClaimClosingLetter,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{company.Company.CompanyName}",
                    ["{Address}"] = company.RolePlayerAddresses.Count > 0 ? company.RolePlayerAddresses[0].AddressLine1 : null,
                    ["{City/Town}"] = company.RolePlayerAddresses.Count > 0 ? company.RolePlayerAddresses[0].City : null,
                    ["{PostalCode}"] = company.RolePlayerAddresses.Count > 0 ? company.RolePlayerAddresses[0].PostalCode : null,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{ClaimNumber}"] = personEvent.CompCarePevRefNumber ?? personEvent.Claims[0].ClaimReferenceNumber,
                    ["{EmployeeName}"] = $"{employee.Person.FirstName} {employee.Person.Surname}",
                    ["{CompanyNumber}"] = company.Company.ReferenceNumber,
                    ["{IndustryNumber}"] = company.Company.ReferenceNumber,
                    ["{DateOfAccident}"] = eventDate.ToString("dd MMM yyyy"),
                    ["{Title}"] = employee.Person.Title.DisplayAttributeValue(),
                    ["{Surname}"] = employee.Person.Surname,
                }
            };

            return Task.FromResult<ClaimEmail>(claimEmail);
        }

        public async Task<string> GenerateClaimNumber(PersonEvent personEvent, DateTime eventDate, int count, string eventNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimNumber = string.Empty;
                var rolePlayer = await _rolePlayerService.GetCompany(personEvent.ClaimantId);

                var year = (eventDate.Year % 100).ToString().PadLeft(2, '0');

                claimNumber = $"X/{eventNumber}/{count}/{rolePlayer.FinPayee.FinPayeNumber}/{year}/PEV";
                return claimNumber;
            }
        }

        public async Task<List<PersonEvent>> GetNotificationPersonEvents()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _personEventRepository
                     .Where(a => a.PersonEventStatus != PersonEventStatusEnum.Cancelled && a.IsStraightThroughProcess)
                     .ToListAsync();
                await _personEventRepository.LoadAsync(result, e => e.ClaimBucketClass);
                await _personEventRepository.LoadAsync(result, e => e.Claims);
                var personEvents = result.Where(x => x.ClaimBucketClass.IsStraightThroughProcessBenefit == true && x.ClaimBucketClass.Name == "Notification Only" && x.Claims.Count > 0).ToList();
                return Mapper.Map<List<PersonEvent>>(personEvents);
            }
        }

        private async Task<List<AutoAjudicateClaim>> GetPendingAcknowledgementClaims(bool isNotificationOnly)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = { new SqlParameter("isNotificationOnly", isNotificationOnly) };

                return await _eventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimsPendingAcknowledgement, parameters);
            }
        }

        private async Task<List<AutoAjudicateClaim>> GetClaimsPendingFinalization(bool isNotificationOnly)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = { new SqlParameter("isNotificationOnly", isNotificationOnly) };

                return await _eventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimsPendingFinalization, parameters);
            }
        }

        private async Task<List<AutoAjudicateClaim>> GetSection40CompCareClaimToReOpen()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _eventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetSection40ClaimToReOpen);
            }
        }

        private async Task<List<AutoAjudicateClaim>> GetClaimsToAutoAcknowledgeByEventType(EventTypeEnum eventType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = { new SqlParameter("EventTypeId", (int)eventType) };

                return await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimsToAutoAcknowledgeByEventType, parameters);
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
                return Mapper.Map<Contracts.Entities.Event>(result);
            }
        }

        public async Task GenerateClaimsForPersonEvents(int eventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var incident = await GetEvent(eventId);
                var count = 0;
                foreach (var personEvent in incident.PersonEvents)
                {
                    count++;
                    var claimNumber = "";

                    var hasClaim = await _claimRepository.AnyAsync(c => c.PersonEventId == personEvent.PersonEventId);
                    if (hasClaim) continue;

                    claimNumber = await GenerateClaimNumber(personEvent, incident.EventDate, count, incident.EventReferenceNumber);

                    var keys = new Dictionary<string, string>
                    {
                        { "ClaimId", personEvent.PersonEventId.ToString() }
                    };

                    bool documentsAccepted;

                    var rolePlayer = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);

                    documentsAccepted = await _documentIndexService.HaveAllDocumentsBeenAccepted(DocumentSetEnum.CommonPersonalDocuments, keys);

                    
                    ClaimStatusEnum claimStatus = documentsAccepted ? ClaimStatusEnum.PendingAcknowledgement : ClaimStatusEnum.PendingRequirements;


                    var claim = new claim_Claim
                    {
                        PersonEventId = personEvent.PersonEventId,
                        ClaimReferenceNumber = claimNumber,
                        ClaimStatus = claimStatus,
                        ClaimLiabilityStatus = documentsAccepted ? ClaimLiabilityStatusEnum.Pending : ClaimLiabilityStatusEnum.OutstandingRequirements,
                        ClaimStatusChangeDate = DateTime.Now,
                        IsCancelled = false,
                        IsClosed = false,
                        IsRuleOverridden = false,
                        DisabilityPercentage = 0.0000M,
                        IsDeleted = false,
                    };

                    _claimRepository.Create(claim);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task AdjudicateNotificationClaims()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    var autoAdjudicateClaimNotifications = await GetPendingAcknowledgementClaims(true);
                    if (autoAdjudicateClaimNotifications.Count > 0)
                    {
                        foreach (var autoAdjudicateClaimNotification in autoAdjudicateClaimNotifications)
                        {
                            try
                            {
                                if (isAuditClaimsProcessedEnabled)
                                {
                                    //await AddTracingNotes(autoAdjudicateClaimNotification.ClaimId, "Notification-only claim queued for auto-acknowledgement", ItemTypeEnum.Claim);
                                }
                                if ((autoAdjudicateClaimNotification.IdType == IdTypeEnum.SAIDDocument && autoAdjudicateClaimNotification.IsVopdVerified) || autoAdjudicateClaimNotification.IdType == IdTypeEnum.PassportDocument)
                                {
                                    string claimNumber = autoAdjudicateClaimNotification.ClaimReferenceNumber;
                                    if (claimNumber.Contains("???") || claimNumber.Contains("PEV"))
                                    {
                                        var newClaimNumber = claimNumber.Remove(claimNumber.Length - 3);
                                        claimNumber = $"{newClaimNumber}{autoAdjudicateClaimNotification.ProductCode}";
                                        await UpdateClaimStatus(autoAdjudicateClaimNotification, claimNumber);
                                    }
                                    var dataItem = await _personEventRepository.Where(x => x.PersonEventId == autoAdjudicateClaimNotification.PersonEventId).SingleAsync();
                                    var employee = await _rolePlayerService.GetPerson(dataItem.InsuredLifeId);
                                    var personEvent = Mapper.Map<PersonEvent>(dataItem);
                                    var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)dataItem.CompanyRolePlayerId);
                                    var contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                                    if (contactInformation == null)
                                    {
                                        contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                                    }

                                    var claimEmail = await GenerateAcknowledgementLetter(autoAdjudicateClaimNotification);
                                    var claimSMS = await GenerateAcknowledgementSMS(autoAdjudicateClaimNotification, employee.CellNumber);
                                    var claim = await _claimRepository.FirstOrDefaultAsync(x => x.PersonEventId == autoAdjudicateClaimNotification.PersonEventId);
                                    var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(autoAdjudicateClaimNotification.PersonEventId, ClaimCommunicationTypeEnum.NotificationAcknowledgement);

                                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                                    {
                                        claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                                    }
                                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                                    {
                                        claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                                    }

                                    if (claimCommunicationMessage.ClaimEmployerSMS != null)
                                    {
                                        claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                                    }
                                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                                    {
                                        claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                                    }

                                    claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationAcknowledgement;
                                    claimCommunicationMessage.Employee = employee;
                                    claimCommunicationMessage.ClaimNumber = claimNumber;
                                    claimCommunicationMessage.PersonEvent = personEvent;

                                    if (claim?.ClaimStatus == ClaimStatusEnum.AutoAcknowledged && claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityNotAccepted)
                                    {
                                        await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);
                                    }
                                }
                            }
                            catch (Exception e)
                            {
                                e.LogException($"Error when auto adjudicating PersonEvent: {autoAdjudicateClaimNotification.PersonEventId}");
                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    e.LogException($"Error when getting notification only claims for auto adjudication");
                }
            }
        }

        public async Task UpdateClaimStatus(AutoAjudicateClaim autoAjudicateClaim, string claimNumber)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claims = await _claimRepository.Where(x => x.PersonEventId == autoAjudicateClaim.PersonEventId).ToListAsync();
                foreach (var claim in claims)
                {
                    if (claim.ClaimStatus.DisplayAttributeValue() != ClaimStatusEnum.AutoAcknowledged.DisplayAttributeValue()
                        && claim.ClaimLiabilityStatus.DisplayAttributeValue() != ClaimLiabilityStatusEnum.LiabilityNotAccepted.DisplayAttributeValue())
                    {
                        var text = $"Claim status updated from {claim.ClaimStatus.DisplayAttributeValue()} to {ClaimStatusEnum.AutoAcknowledged.DisplayAttributeValue()} " +
                                    $"and liability Status updated from {claim.ClaimLiabilityStatus.DisplayAttributeValue()} to {ClaimLiabilityStatusEnum.LiabilityNotAccepted.DisplayAttributeValue()}";

                        await CreateSystemAddedCommonNotes(claim.PersonEventId, text);
                    }

                    var result = Mapper.Map<claim_Claim>(claim);
                    result.PolicyId = autoAjudicateClaim.PolicyId;
                    result.ClaimReferenceNumber = claimNumber;
                    result.ClaimStatus = ClaimStatusEnum.AutoAcknowledged;
                    result.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.LiabilityNotAccepted;
                    result.ClaimStatusChangeDate = DateTime.Now;
                    result.ClaimClosedReason = ClaimClosedReasonEnum.STPAutoClosed;
                    result.IsCancelled = false;
                    result.IsClosed = true;
                    _claimRepository.Update(result);
                    AddAuditEntry(claim, false, null);
                    var ttdResult = _claimInvoiceService.RejectTTDLiabilityDecisionNotMade(result.ClaimId, result.ClaimStatus, result.ClaimLiabilityStatus);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<FirstMedicalReportForm> SetMedicalReportFields(PersonEvent personEvent)
        {
            if (personEvent == null || personEvent.FirstMedicalReport.MedicalReportForm == null) return new FirstMedicalReportForm();

            var eventDetails = await _eventService.GetPersonEventDetails(personEvent.PersonEventId);

            personEvent.FirstMedicalReport.MedicalReportForm.CreatedDate = DateTimeHelper.SaNow;
            personEvent.FirstMedicalReport.MedicalReportForm.CreatedBy = RmaIdentity.Email;
            personEvent.FirstMedicalReport.MedicalReportForm.ModifiedDate = DateTimeHelper.SaNow;
            personEvent.FirstMedicalReport.MedicalReportForm.ServiceBusMessageType = string.Empty;
            personEvent.FirstMedicalReport.MedicalReportForm.SourceSystemRoutingId = AppNames.DigiCare;
            personEvent.FirstMedicalReport.MedicalReportForm.SourceSystemReference = Guid.NewGuid().ToString();
            personEvent.FirstMedicalReport.MedicalReportForm.ReportTypeId = (int)MedicalFormReportTypeEnum.FirstAccidentMedicalReport;

            personEvent.FirstMedicalReport.MedicalReportForm.UnfitStartDate = personEvent.FirstMedicalReport.MedicalReportForm.UnfitStartDate?.ToSaDateTime();
            personEvent.FirstMedicalReport.MedicalReportForm.UnfitEndDate = personEvent.FirstMedicalReport.MedicalReportForm.UnfitEndDate?.ToSaDateTime();

            personEvent.FirstMedicalReport.MedicalReportForm.EventCategoryId = (int)EventTypeEnum.Accident;
            personEvent.FirstMedicalReport.MedicalReportForm.PersonEventId = personEvent.PersonEventId;
            personEvent.FirstMedicalReport.MedicalReportForm.ClaimReferenceNumber = eventDetails.PersonEvents[0].PersonEventReferenceNumber;
            personEvent.FirstMedicalReport.MedicalReportForm.EventDate = eventDetails.EventDate.ToSaDateTime();
            personEvent.FirstMedicalReport.MedicalReportForm.DateOfBirth = eventDetails.PersonEvents[0].RolePlayer.Person.DateOfBirth;
            personEvent.FirstMedicalReport.MedicalReportForm.Name = eventDetails.PersonEvents[0].RolePlayer.Person.FirstName;
            personEvent.FirstMedicalReport.MedicalReportForm.Surname = eventDetails.PersonEvents[0].RolePlayer.Person.Surname;
            personEvent.FirstMedicalReport.MedicalReportForm.Gender = eventDetails.PersonEvents[0].RolePlayer.Person.Gender.DisplayAttributeValue();

            var companyDetails = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);
            personEvent.FirstMedicalReport.MedicalReportForm.EmployerName = companyDetails.DisplayName;

            if (companyDetails.FinPayee != null)
            {
                var result = await _industryService.GetIndustry(companyDetails.FinPayee.IndustryId);
                switch (result.IndustryClass)
                {
                    case IndustryClassEnum.Metals:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MetalsClass;
                        break;
                    case IndustryClassEnum.Mining:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MiningClass;
                        break;
                    case IndustryClassEnum.Other:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.OtherClass;
                        break;
                    case IndustryClassEnum.Individual:
                    case IndustryClassEnum.Group:
                    case IndustryClassEnum.Senna:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.IndividualGroupSennaClass;
                        break;
                }
            }

            return personEvent.FirstMedicalReport;
        }

        public async Task AutoCloseStpClaims()
        {
            if (!await _configurationService.IsFeatureFlagSettingEnabled(ClaimConstants.DisableCOIDClaimCare))
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var personEvents = await _personEventRepository
                            .Where(p => p.IsStraightThroughProcess
                            && p.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious
                            && p.PersonEventStatus == PersonEventStatusEnum.AutoAcknowledged
                            && !p.IsDeleted)
                            .OrderBy(p => p.CreatedDate)
                            .Take(5)
                            .ToListAsync();

                    foreach (var personEvent in personEvents)
                    {
                        var claims = await _claimRepository
                            .Where(c => c.PersonEventId == personEvent.PersonEventId)
                            .ToListAsync();

                        personEvent.PersonEventStatus = PersonEventStatusEnum.Closed;
                        personEvent.ModifiedDate = DateTime.Now;
                        _personEventRepository.Update(personEvent);

                        await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"PEV Notification ({personEvent.PersonEventReferenceNumber}) is auto closed");

                        foreach (var claim in claims)
                        {
                            if (claim.ClaimStatus == ClaimStatusEnum.AutoAcknowledged
                                && (claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.Accepted
                                || claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityNotAccepted))
                            {
                                claim.ClaimStatus = ClaimStatusEnum.Closed;
                                claim.ClaimStatusChangeDate = DateTime.Now;
                                claim.ClaimClosedReason = ClaimClosedReasonEnum.STPAutoClosed;
                                claim.IsClosed = true;
                            }
                            _claimRepository.Update(claim);
                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            else
            {
                await AutoCloseStpIntegrationClaims();
            }
        }

        public async Task AutoCloseStpIntegrationClaims()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                    var isSendToSTPIntegration = await _configurationService.IsFeatureFlagSettingEnabled(ClaimConstants.SendToSTPIntegration);
                    var recordsToProcess = await _configurationService.GetModuleSetting(SystemSettings.AcknowledgementRecords);
                    var autoAdjudicateClaims = await GetClaimsPendingFinalization(false);   //Minor injury
                    var notificationPersonEvents = await GetClaimsPendingFinalization(true);    //Notification only
                    if (autoAdjudicateClaims.Count > 0)
                    {
                        var autodjudicateClaimsList = autoAdjudicateClaims.Take(Convert.ToInt32(recordsToProcess)).ToList();
                        foreach (var autoAdjudicateClaim in autodjudicateClaimsList)
                        {
                            try
                            {
                                var personEvent = await _eventService.GetPersonEvent(autoAdjudicateClaim.PersonEventId);
                                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId);
                                var contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                                if (contactInformation == null)
                                {
                                    contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                                }
                                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == autoAdjudicateClaim.PersonEventId);
                                if (claim == null) continue;
                                if (claim.ClaimStatus == ClaimStatusEnum.AutoAcknowledged && claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.Accepted)
                                {
                                    var text = $"Claim status updated from {ClaimStatusEnum.AutoAcknowledged.DisplayAttributeValue()} to {ClaimStatusEnum.Finalized.DisplayAttributeValue()}";
                                    await CreateSystemAddedCommonNotes(autoAdjudicateClaim.PersonEventId, text);

                                    var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(autoAdjudicateClaim.PersonEventId, ClaimCommunicationTypeEnum.NotificationClosed);
                                    claim.ClaimStatus = ClaimStatusEnum.Finalized;
                                    autoAdjudicateClaim.CompCarePEVRefNumber = personEvent.CompCarePevRefNumber;
                                    autoAdjudicateClaim.ClaimReferenceNumber = claim.ClaimReferenceNumber;
                                    var claimEmail = await _claimCommunicationService.GenerateClaimClosingLetter(autoAdjudicateClaim, TemplateTypeEnum.STPClaimClosingLetter);
                                    var claimSMS = new ClaimSMS();
                                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                                    {
                                        claimSMS = await GenerateAcknowledgementSMS(autoAdjudicateClaim, !String.IsNullOrEmpty(employee.CellNumber) ? employee.CellNumber : claimCommunicationMessage.EmployeeClaimSMS.MobileNumber);
                                    }

                                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                                    {
                                        claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                                        claimCommunicationMessage.ClaimEmployerEmail.TemplateType = TemplateTypeEnum.STPClaimClosingLetter;
                                    }
                                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                                    {
                                        claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                                        claimCommunicationMessage.ClaimEmployerEmail.TemplateType = TemplateTypeEnum.STPClaimClosingLetter;
                                    }

                                    if (claimCommunicationMessage.ClaimEmployerSMS != null && claimSMS != null)
                                    {
                                        claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                                    }
                                    if (claimCommunicationMessage.EmployeeClaimSMS != null && claimSMS != null)
                                    {
                                        claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                                    }
                                    AddAuditEntry(claim, false, null);

                                    claimCommunicationMessage.Employee = employee;
                                    claimCommunicationMessage.ClaimNumber = autoAdjudicateClaim.ClaimReferenceNumber;
                                    claimCommunicationMessage.PersonEvent = personEvent;

                                    if (isSendToSTPIntegration)
                                    {
                                        if (personEvent.CompCarePersonEventId != 0 && !string.IsNullOrWhiteSpace(personEvent.CompCareIntegrationMessageId))
                                        {
                                            var stpIntegrationBody = new STPIntegrationBody()
                                            {
                                                PersonEventId = personEvent.CompCarePersonEventId.Value,
                                                IDVOPDValidated = true,
                                                ReSubmitVOPD = false,
                                                STPExitReasonId = 0,
                                                STPExitReason = string.Empty,
                                                SuspiciousTransactionStatusID = personEvent.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                                            };
                                            var messageBody = _serializer.Serialize(stpIntegrationBody);

                                            var messageType = new MessageType
                                            {
                                                MessageBody = messageBody,
                                                From = ClaimConstants.MessageFrom,
                                                To = ClaimConstants.MessageTo,
                                                MessageTaskType = ClaimConstants.MessageTaskType006,
                                                Environment = enviroment,
                                                CorrelationID = personEvent.CompCareIntegrationMessageId,
                                                EnqueuedTime = DateTime.Now,
                                            };

                                            await SendIntegrationMessageToCompCare(messageType, personEvent.CompCarePersonEventId.Value);
                                        }
                                    }
                                    await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);
                                }
                                _claimRepository.Update(claim);
                            }
                            catch (Exception ex)
                            {
                                ex.LogException($"Error when Auto close Person Event: {autoAdjudicateClaim.PersonEventId} - Error Message {ex.Message}");
                            }
                        }
                    }
                    if (notificationPersonEvents.Count > 0)
                    {
                        var notificationPersonEventList = notificationPersonEvents.Take(Convert.ToInt32(recordsToProcess)).ToList();
                        foreach (var notificationPersonEvent in notificationPersonEventList)
                        {
                            try
                            {
                                var personEvent = await _eventService.GetPersonEvent(notificationPersonEvent.PersonEventId);
                                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(notificationPersonEvent.PersonEventId, ClaimCommunicationTypeEnum.NotificationClosed);
                                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == notificationPersonEvent.PersonEventId);
                                if (claim == null) continue;
                                if (claim.ClaimStatus == ClaimStatusEnum.AutoAcknowledged && claim.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityNotAccepted)
                                {
                                    var text = $"Claim status updated from {claim.ClaimStatus.DisplayAttributeValue()} to {ClaimStatusEnum.ClaimClosed.DisplayAttributeValue()}";
                                    await CreateSystemAddedCommonNotes(claim.PersonEventId, text);

                                    claim.ClaimStatus = ClaimStatusEnum.ClaimClosed;
                                    notificationPersonEvent.CompCarePEVRefNumber = personEvent.CompCarePevRefNumber;
                                    notificationPersonEvent.ClaimReferenceNumber = claim.ClaimReferenceNumber;
                                    var claimEmail = await _claimCommunicationService.GenerateClaimClosingLetter(notificationPersonEvent, TemplateTypeEnum.ClaimClosingLetter);
                                    var claimSMS = new ClaimSMS();
                                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                                    {
                                        claimSMS = await GenerateAcknowledgementSMS(notificationPersonEvent, !String.IsNullOrEmpty(employee.CellNumber) ? employee.CellNumber : claimCommunicationMessage.EmployeeClaimSMS.MobileNumber);
                                    }
                                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                                    {
                                        claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                                        claimCommunicationMessage.ClaimEmployerEmail.TemplateType = TemplateTypeEnum.ClaimClosingLetter;
                                    }
                                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                                    {
                                        claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                                        claimCommunicationMessage.ClaimEmployerEmail.TemplateType = TemplateTypeEnum.ClaimClosingLetter;
                                    }

                                    if (claimCommunicationMessage.ClaimEmployerSMS != null && claimSMS != null)
                                    {
                                        claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                                    }
                                    if (claimCommunicationMessage.EmployeeClaimSMS != null && claimSMS != null)
                                    {
                                        claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                                    }

                                    claimCommunicationMessage.Employee = employee;
                                    claimCommunicationMessage.ClaimNumber = notificationPersonEvent.ClaimReferenceNumber;
                                    claimCommunicationMessage.PersonEvent = personEvent;
                                    await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);
                                    AddAuditEntry(claim, false, null);

                                    if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimConstants.SendToSTPIntegration))
                                    {
                                        if (personEvent.CompCarePersonEventId != 0 && !string.IsNullOrWhiteSpace(personEvent.CompCareIntegrationMessageId))
                                        {
                                            var stpIntegrationBody = new STPIntegrationBody()
                                            {
                                                PersonEventId = personEvent.CompCarePersonEventId.Value,
                                                IDVOPDValidated = true,
                                                ReSubmitVOPD = false,
                                                STPExitReasonId = 0,
                                                STPExitReason = string.Empty,
                                                SuspiciousTransactionStatusID = personEvent.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                                            };
                                            var messageBody = _serializer.Serialize(stpIntegrationBody);

                                            var messageType = new MessageType
                                            {
                                                MessageBody = messageBody,
                                                From = ClaimConstants.MessageFrom,
                                                To = ClaimConstants.MessageTo,
                                                MessageTaskType = ClaimConstants.MessageTaskType006,
                                                Environment = enviroment,
                                                CorrelationID = personEvent.CompCareIntegrationMessageId,
                                                EnqueuedTime = DateTime.Now,
                                            };
                                            _ = Task.Run(() => SendIntegrationMessageToCompCare(messageType, personEvent.CompCarePersonEventId.Value));
                                        }
                                    }
                                }
                                _claimRepository.Update(claim);
                            }
                            catch (Exception ex)
                            {
                                ex.LogException($"Error when Auto close notification only Person Event: {notificationPersonEvent.PersonEventId} - Error Message {ex.Message}");
                            }


                        }
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when getting notifications to Auto close - Error Message {ex.Message}");
                }
            }
        }

        private string DecodeDocumentType(DocumentTypeEnum documentType)
        {
            var description = typeof(DocumentTypeEnum).GetField(documentType.ToString());
            var attributes = (DisplayAttribute)Attribute.GetCustomAttribute(description, typeof(DisplayAttribute));

            return attributes.Name.ToString();
        }

        public async Task AutoAcceptDocuments(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);
            List<ScanCare.Contracts.Entities.Document> documents = new List<ScanCare.Contracts.Entities.Document>();
            var claimId = personEvent.Claims.FirstOrDefault(a => a.UnderwriterId == (int)UnderwriterEnum.RMAMutualAssurance)?.ClaimId;
            var firstMedicalReportForm = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEvent.PersonEventId);

            var medicalDocuments = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.ClaimMedicalDocuments, new Dictionary<string, string> { { "FirstMedicalReportId", personEvent.PersonEventId.ToString() } });
            var personalDocuments = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.CommonPersonalDocuments, new Dictionary<string, string> { { "PersonalClaimId", personEvent.PersonEventId.ToString() } });
            if (personalDocuments != null)
                documents.AddRange(personalDocuments);
            if (medicalDocuments != null)
                documents.AddRange(medicalDocuments);
            if (documents.Count > 0)
            {
                foreach (var document in documents)
                {
                    if (document.Id != 0)
                    {

                        if (document.DocumentTypeName != DecodeDocumentType(DocumentTypeEnum.FirstMedicalReport) && document.DocumentTypeName != DecodeDocumentType(DocumentTypeEnum.FinalMedicalReport))
                        {
                            document.DocumentStatus = DocumentStatusEnum.Received;
                            await _documentIndexService.UpdateDocument(document);
                        }
                        if (personEvent.IsStraightThroughProcess && (document.DocumentTypeName == DecodeDocumentType(DocumentTypeEnum.FirstMedicalReport) || document.DocumentTypeName == DecodeDocumentType(DocumentTypeEnum.PassportDocument)))
                        {
                            document.DocumentStatus = DocumentStatusEnum.Accepted;
                            await _documentIndexService.UpdateDocument(document);
                        }

                    }
                }
            }
        }

        public async Task UpdateAccidentClaimStatus(Contracts.Entities.Claim claim)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _claimRepository.FirstOrDefaultAsync(x => x.ClaimId == claim.ClaimId);

                result.ClaimStatus = ClaimStatusEnum.New;
                result.ClaimStatusChangeDate = DateTime.Now;
                _claimRepository.Update(result);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<ProgressMedicalReportForm> SetProgressMedicalReportFields(ProgressMedicalReportForm progressMedicalReportForm)
        {
            var eventDetails = await _eventService.GetPersonEventDetails(progressMedicalReportForm.MedicalReportForm.PersonEventId);

            progressMedicalReportForm.MedicalReportForm.CreatedDate = DateTimeHelper.SaNow;
            progressMedicalReportForm.MedicalReportForm.CreatedBy = RmaIdentity.Email;
            progressMedicalReportForm.MedicalReportForm.ModifiedDate = DateTimeHelper.SaNow;
            progressMedicalReportForm.MedicalReportForm.ServiceBusMessageType = string.Empty;
            progressMedicalReportForm.MedicalReportForm.SourceSystemRoutingId = AppNames.DigiCare;
            progressMedicalReportForm.MedicalReportForm.SourceSystemReference = Guid.NewGuid().ToString();
            progressMedicalReportForm.MedicalReportForm.ReportTypeId = (int)MedicalFormReportTypeEnum.ProgressAccidentMedicalReport;

            progressMedicalReportForm.MedicalReportForm.UnfitStartDate = progressMedicalReportForm.MedicalReportForm.UnfitStartDate?.ToSaDateTime();
            progressMedicalReportForm.MedicalReportForm.UnfitEndDate = progressMedicalReportForm.MedicalReportForm.UnfitEndDate?.ToSaDateTime();

            progressMedicalReportForm.MedicalReportForm.EventCategoryId = (int)EventTypeEnum.Accident;
            progressMedicalReportForm.MedicalReportForm.PersonEventId = eventDetails.PersonEvents[0].PersonEventId;
            progressMedicalReportForm.MedicalReportForm.ClaimReferenceNumber = eventDetails.PersonEvents != null &&
                                                                               eventDetails.PersonEvents.Count > 0 &&
                                                                               eventDetails.PersonEvents[0].Claims != null &&
                                                                               eventDetails.PersonEvents[0].Claims.Count > 0
                                                                                   ? eventDetails.PersonEvents[0].Claims[0].ClaimReferenceNumber
                                                                                   : string.Empty;

            progressMedicalReportForm.MedicalReportForm.EventDate = eventDetails.EventDate.ToSaDateTime();
            progressMedicalReportForm.MedicalReportForm.DateOfBirth = eventDetails.PersonEvents[0].RolePlayer.Person.DateOfBirth;
            progressMedicalReportForm.MedicalReportForm.Name = eventDetails.PersonEvents[0].RolePlayer.Person.FirstName;
            progressMedicalReportForm.MedicalReportForm.Surname = eventDetails.PersonEvents[0].RolePlayer.Person.Surname;
            progressMedicalReportForm.MedicalReportForm.Gender = eventDetails.PersonEvents[0].RolePlayer.Person.Gender.DisplayAttributeValue();

            var companyDetails = await _rolePlayerService.GetRolePlayer(eventDetails.PersonEvents[0].ClaimantId);
            progressMedicalReportForm.MedicalReportForm.EmployerName = companyDetails.DisplayName;

            if (companyDetails.FinPayee != null)
            {
                var result = await _industryService.GetIndustry(companyDetails.FinPayee.IndustryId);
                switch (result.IndustryClass)
                {
                    case IndustryClassEnum.Metals:
                        progressMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MetalsClass;
                        break;
                    case IndustryClassEnum.Mining:
                        progressMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MiningClass;
                        break;
                    case IndustryClassEnum.Other:
                        progressMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.OtherClass;
                        break;
                    case IndustryClassEnum.Individual:
                    case IndustryClassEnum.Group:
                    case IndustryClassEnum.Senna:
                        progressMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.IndividualGroupSennaClass;
                        break;
                }
            }

            return progressMedicalReportForm;
        }

        public async Task<FinalMedicalReportForm> SetFinalMedicalReportFields(FinalMedicalReportForm finalMedicalReportForm)
        {
            var eventDetails = await _eventService.GetPersonEventDetails(finalMedicalReportForm.MedicalReportForm.PersonEventId);

            finalMedicalReportForm.MedicalReportForm.CreatedDate = DateTimeHelper.SaNow;
            finalMedicalReportForm.MedicalReportForm.CreatedBy = RmaIdentity.Email;
            finalMedicalReportForm.MedicalReportForm.ModifiedDate = DateTimeHelper.SaNow;
            finalMedicalReportForm.MedicalReportForm.ServiceBusMessageType = string.Empty;
            finalMedicalReportForm.MedicalReportForm.SourceSystemRoutingId = AppNames.DigiCare;
            finalMedicalReportForm.MedicalReportForm.SourceSystemReference = Guid.NewGuid().ToString();
            finalMedicalReportForm.MedicalReportForm.ReportTypeId = (int)MedicalFormReportTypeEnum.FinalAccidentMedicalReport;

            finalMedicalReportForm.MedicalReportForm.UnfitStartDate = finalMedicalReportForm.MedicalReportForm.UnfitStartDate?.ToSaDateTime();
            finalMedicalReportForm.MedicalReportForm.UnfitEndDate = finalMedicalReportForm.MedicalReportForm.UnfitEndDate?.ToSaDateTime();

            finalMedicalReportForm.MedicalReportForm.EventCategoryId = (int)EventTypeEnum.Accident;
            finalMedicalReportForm.MedicalReportForm.PersonEventId = eventDetails.PersonEvents[0].PersonEventId;
            finalMedicalReportForm.MedicalReportForm.ClaimReferenceNumber = eventDetails.PersonEvents != null &&
                                                                               eventDetails.PersonEvents.Count > 0 &&
                                                                               eventDetails.PersonEvents[0].Claims != null &&
                                                                               eventDetails.PersonEvents[0].Claims.Count > 0
                                                                                   ? eventDetails.PersonEvents[0].Claims[0].ClaimReferenceNumber
                                                                                   : string.Empty;
            finalMedicalReportForm.MedicalReportForm.EventDate = eventDetails.EventDate.ToSaDateTime();
            finalMedicalReportForm.MedicalReportForm.DateOfBirth = eventDetails.PersonEvents[0].RolePlayer.Person.DateOfBirth;
            finalMedicalReportForm.MedicalReportForm.Name = eventDetails.PersonEvents[0].RolePlayer.Person.FirstName;
            finalMedicalReportForm.MedicalReportForm.Surname = eventDetails.PersonEvents[0].RolePlayer.Person.Surname;
            finalMedicalReportForm.MedicalReportForm.Gender = eventDetails.PersonEvents[0].RolePlayer.Person.Gender.DisplayAttributeValue();
            finalMedicalReportForm.MedicalReportForm.DocumentStatusId = finalMedicalReportForm.MedicalReportForm.DocumentStatusId;

            var companyDetails = await _rolePlayerService.GetRolePlayer(eventDetails.PersonEvents[0].ClaimantId);
            finalMedicalReportForm.MedicalReportForm.EmployerName = companyDetails.DisplayName;

            if (companyDetails.FinPayee != null)
            {
                var result = await _industryService.GetIndustry(companyDetails.FinPayee.IndustryId);
                switch (result.IndustryClass)
                {
                    case IndustryClassEnum.Metals:
                        finalMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MetalsClass;
                        break;
                    case IndustryClassEnum.Mining:
                        finalMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MiningClass;
                        break;
                    case IndustryClassEnum.Other:
                        finalMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.OtherClass;
                        break;
                    case IndustryClassEnum.Individual:
                    case IndustryClassEnum.Group:
                    case IndustryClassEnum.Senna:
                        finalMedicalReportForm.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.IndividualGroupSennaClass;
                        break;
                }
            }

            return finalMedicalReportForm;
        }

        public async Task<FirstMedicalReportForm> ValidateFirstMedicalReportSTP(FirstMedicalReportForm firstMedicalReportForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (firstMedicalReportForm != null)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(firstMedicalReportForm.MedicalReportForm.PersonEventId);
                    var personEvent = eventDetails.PersonEvents[0];
                    var checkEstimateAmountValidation = await CheckEstimateAmount(eventDetails.EventType, firstMedicalReportForm.MedicalReportForm, eventDetails);
                    var medicalReportExist = await _medicalFormService.CheckDuplicateMedicalReportForm(firstMedicalReportForm.MedicalReportForm);
                    personEvent.FirstMedicalReport = firstMedicalReportForm;

                    if (firstMedicalReportForm.FirstMedicalReportFormId != 0)
                    {
                        await _medicalFormService.UpdateFirstMedicalReportForm(firstMedicalReportForm);
                        if (!checkEstimateAmountValidation.isValid && !checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            await UpdateClaimStatusAndRouteToPoolWorkFlow(personEvent);

                            await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                            {
                                PersonEventId = personEvent.PersonEventId,
                                StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                                CreatedBy = RmaIdentity.Username,
                                ModifiedBy = RmaIdentity.Username,
                                CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                            });
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                        }
                    }
                    else
                    {
                        var workItem = await CreateWorkItem(MedicalFormReportTypeEnum.FirstAccidentMedicalReport, personEvent.PersonEventId, personEvent.IsStraightThroughProcess, checkEstimateAmountValidation.isValid);
                        var workItemId = await _digiService.AddWorkItem(workItem);
                        firstMedicalReportForm.MedicalReportForm.WorkItemId = (int)workItemId;
                        firstMedicalReportForm = await SetMedicalReportFields(personEvent);
                        firstMedicalReportForm = await _medicalFormService.AddFirstMedicalReportForm(firstMedicalReportForm);
                        await AutoAcceptDocuments(personEvent);

                        if ((checkEstimateAmountValidation.isValid && personEvent.IsStraightThroughProcess)
                            || (checkEstimateAmountValidation.isValid && personEvent.Claims[0].ClaimStatus == ClaimStatusEnum.Closed && personEvent.Claims[0].ClaimLiabilityStatus == ClaimLiabilityStatusEnum.OutstandingRequirements))
                        {
                            await AutoAcceptDocuments(personEvent);
                        }
                        else
                        {
                            await UpdateClaimStatusAndRouteToPoolWorkFlow(personEvent);
                        }
                    }
                    return firstMedicalReportForm;
                }
                else
                {
                    return null;
                }

            }
        }

        public async Task<ProgressMedicalReportForm> ValidateProgressMedicalReportSTP(ProgressMedicalReportForm progressMedicalReportForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (progressMedicalReportForm != null)
                {

                    var eventDetails = await _eventService.GetPersonEventDetails(progressMedicalReportForm.MedicalReportForm.PersonEventId);
                    var personEvent = eventDetails.PersonEvents[0];
                    var checkEstimateAmountValidation = await CheckEstimateAmount(eventDetails.EventType, progressMedicalReportForm.MedicalReportForm, eventDetails);

                    if (progressMedicalReportForm.ProgressMedicalReportFormId != 0)
                    {
                        await _medicalFormService.UpdateProgressMedicalReportForm(progressMedicalReportForm);
                        if (!checkEstimateAmountValidation.isValid)
                        {
                            await UpdateClaimStatusAndRouteToPoolWorkFlow(personEvent);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                        }
                        return progressMedicalReportForm;
                    }
                    else
                    {
                        var workItem = await CreateWorkItem(MedicalFormReportTypeEnum.ProgressAccidentMedicalReport, personEvent.PersonEventId, personEvent.IsStraightThroughProcess, checkEstimateAmountValidation.isValid);
                        var workItemId = await _digiService.AddWorkItem(workItem);
                        progressMedicalReportForm.MedicalReportForm.WorkItemId = (int)workItemId;

                        if ((personEvent.IsStraightThroughProcess)
                            || (checkEstimateAmountValidation.isValid && personEvent.Claims[0].ClaimStatus == ClaimStatusEnum.Closed && personEvent.Claims[0].ClaimLiabilityStatus == ClaimLiabilityStatusEnum.OutstandingRequirements))
                        {
                            progressMedicalReportForm.MedicalReportForm.DocumentStatusId = DocumentStatusEnum.Accepted;
                            await AutoAcceptDocuments(personEvent);
                        }
                        else
                        {
                            await UpdateClaimStatusAndRouteToPoolWorkFlow(personEvent);

                            await AutoAcceptDocuments(personEvent);
                            var stpExitReason = 0;
                            var firstMedicalReport = await _medicalFormService.GetFirstMedicalReportAccidentByPersonEventId(personEvent.PersonEventId);

                            if (firstMedicalReport.Count > 0)
                            {
                                stpExitReason = firstMedicalReport[0].MedicalReportForm.Icd10Codes != progressMedicalReportForm.MedicalReportForm.Icd10Codes
                                    ? (int)STPExitReasonEnum.ICD10Modified
                                    : (int)STPExitReasonEnum.MedicalReport;
                            }

                            await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                            {
                                PersonEventId = personEvent.PersonEventId,
                                StpExitReasonId = stpExitReason,
                                CreatedBy = RmaIdentity.Username,
                                ModifiedBy = RmaIdentity.Username,
                                CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                            });


                        }
                        progressMedicalReportForm = await SetProgressMedicalReportFields(progressMedicalReportForm);
                        progressMedicalReportForm = await _medicalFormService.AddProgressMedicalReportForm(progressMedicalReportForm);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }

                    string oldKeyValue = RmaIdentity.UserId.ToString() + "_" + personEvent.PersonEventId.ToString();
                    string newKeyValue = personEvent.PersonEventId.ToString() + "_" + progressMedicalReportForm.ProgressMedicalReportFormId.ToString();
                    await _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.ClaimManager, "ProgressMedicalReportId", oldKeyValue, "ProgressMedicalReportId", newKeyValue);

                    return progressMedicalReportForm;
                }
                else
                {
                    return null;
                }
            }
        }

        public async Task<FinalMedicalReportForm> ValidateFinalMedicalReportSTP(FinalMedicalReportForm finalMedicalReportForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (finalMedicalReportForm != null)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(finalMedicalReportForm.MedicalReportForm.PersonEventId);
                    var personEvent = eventDetails.PersonEvents[0];

                    // Update the Person Event Stabilization-Date with the latest from the Final Medical Report.
                    if (finalMedicalReportForm.DateStabilised != null)
                    {
                        // Fetch the single record to avoid referential integrity issues.
                        var recordToUpdate = await _personEventRepository.FindByIdAsync(finalMedicalReportForm.MedicalReportForm.PersonEventId);
                        recordToUpdate.DateOfStabilisation = finalMedicalReportForm.DateStabilised.Value.AddDays(1);
                        _personEventRepository.Update(recordToUpdate);
                    }

                    var checkEstimateAmountValidation = await CheckEstimateAmount(eventDetails.EventType, finalMedicalReportForm.MedicalReportForm, eventDetails);

                    if (finalMedicalReportForm.FinalMedicalReportFormId != 0)
                    {
                        var icd10Codes = JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(finalMedicalReportForm.MedicalReportForm.Icd10CodesJson);

                        if (checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            personEvent.IsStraightThroughProcess = false;
                        }

                        await ProcessMedicalReportICD10Codes(eventDetails, personEvent, icd10Codes, finalMedicalReportForm.MedicalReportForm.ReportDate);
                        await _medicalFormService.UpdateFinalMedicalReportForm(finalMedicalReportForm);
                        await CreateDisabiltyToFatalWorkflow(personEvent, JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(finalMedicalReportForm.MedicalReportForm.Icd10CodesJson));

                        if (!checkEstimateAmountValidation.isValid)
                        {
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                        }
                        return finalMedicalReportForm;
                    }
                    else
                    {
                        var workItem = await CreateWorkItem(MedicalFormReportTypeEnum.FinalAccidentMedicalReport, personEvent.PersonEventId, personEvent.IsStraightThroughProcess, checkEstimateAmountValidation.isValid);
                        var workItemId = await _digiService.AddWorkItem(workItem);
                        finalMedicalReportForm.MedicalReportForm.WorkItemId = (int)workItemId;

                        finalMedicalReportForm = await SetFinalMedicalReportFields(finalMedicalReportForm);

                        if (personEvent.IsStraightThroughProcess ||
                            (checkEstimateAmountValidation.isValid &&
                             personEvent.Claims != null &&
                             personEvent.Claims.Count > 0 &&
                             personEvent.Claims[0].ClaimStatus == ClaimStatusEnum.Closed &&
                             personEvent.Claims[0].ClaimLiabilityStatus == ClaimLiabilityStatusEnum.OutstandingRequirements))
                        {
                            finalMedicalReportForm.MedicalReportForm.DocumentStatusId = DocumentStatusEnum.Accepted;
                            await AutoAcceptDocuments(personEvent);
                        }
                        else
                        {
                            var stpExitReason = 0;
                            var firstMedicalReport = await _medicalFormService.GetFirstMedicalReportAccidentByPersonEventId(personEvent.PersonEventId);

                            if (firstMedicalReport.Count > 0)
                            {
                                stpExitReason = firstMedicalReport[0].MedicalReportForm.Icd10Codes != finalMedicalReportForm.MedicalReportForm.Icd10Codes
                                    ? (int)STPExitReasonEnum.ICD10Modified
                                    : (int)STPExitReasonEnum.MedicalReport;
                            }

                            await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                            {
                                PersonEventId = personEvent.PersonEventId,
                                StpExitReasonId = stpExitReason,
                                CreatedBy = RmaIdentity.Username,
                                ModifiedBy = RmaIdentity.Username,
                                CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                            });
                        }

                        finalMedicalReportForm = await _medicalFormService.AddFinalMedicalReportForm(finalMedicalReportForm);
                        var icd10Codes = JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(finalMedicalReportForm.MedicalReportForm.Icd10CodesJson);

                        if (checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            personEvent.IsStraightThroughProcess = false;
                        }

                        await ProcessMedicalReportICD10Codes(eventDetails, personEvent, icd10Codes, finalMedicalReportForm.MedicalReportForm.ReportDate);
                        await CreateDisabiltyToFatalWorkflow(personEvent, JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(finalMedicalReportForm.MedicalReportForm.Icd10CodesJson));
                    }
                    return finalMedicalReportForm;
                }
                else
                {
                    return null;
                }
            }
        }

        private async Task SendToCADWorkPoolForVOPD(PersonEvent personEvent)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                personEvent.IsStraightThroughProcess = false;
                await _eventService.UpdatePersonEventDetails(personEvent);
                var message = "VOPD Results not back in 24hours";
                var noteAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, message);
                if (!noteAdded)
                {
                    await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                    {
                        ItemId = personEvent.PersonEventId,
                        NoteCategory = NoteCategoryEnum.PersonEvent,
                        NoteItemType = NoteItemTypeEnum.PersonEvent,
                        NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                        NoteType = NoteTypeEnum.VOPD,
                        Text = message,
                        IsActive = true

                    });
                }
            }
        }

        private async Task<WorkItem> CreateWorkItem(MedicalFormReportTypeEnum medicalFormReportType, int personEventId, bool isSTP, bool isValid)
        {
            var workItem = new WorkItem();
            var workItemTypes = await _digiService.GetWorkItemTypes();
            var date = DateTime.Now.ToString("MM/dd/yyyy");
            switch (medicalFormReportType)
            {
                case MedicalFormReportTypeEnum.FirstAccidentMedicalReport:
                    workItem.WorkItemType = workItemTypes.FirstOrDefault(a => a.WorkItemTypeName.Contains("First Medical Report (Accident)"));
                    workItem.WorkItemName = $"{workItem.WorkItemType.WorkItemTypeDescription} {date} - {personEventId}";
                    break;
                case MedicalFormReportTypeEnum.ProgressAccidentMedicalReport:
                    workItem.WorkItemType = workItemTypes.FirstOrDefault(a => a.WorkItemTypeName.Contains("Progress Medical Report (Accident)"));
                    workItem.WorkItemName = $"{workItem.WorkItemType.WorkItemTypeDescription} {date} - {personEventId}";
                    break;
                case MedicalFormReportTypeEnum.FinalAccidentMedicalReport:
                    workItem.WorkItemType = workItemTypes.FirstOrDefault(a => a.WorkItemTypeName.Contains("Final Medical Report (Accident)"));
                    workItem.WorkItemName = $"{workItem.WorkItemType.WorkItemTypeDescription} {date} - {personEventId}";
                    break;
                default:
                    return workItem;
            }
            workItem.TenantId = RmaIdentity.TenantId;
            workItem.WorkItemState = isSTP && isValid ? DigiCare.Contracts.Enum.WorkItemStateEnum.Complete : DigiCare.Contracts.Enum.WorkItemStateEnum.InProgress;
            return workItem;
        }

        private async Task<CheckEstimateAmountValidation> CheckEstimateAmount(EventTypeEnum eventType, MedicalReportForm medicalReportForm, Contracts.Entities.Event eventDetails)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter
                {
                    EventType = eventType,
                    Icd10Codes = medicalReportForm.Icd10Codes,
                    ReportDate = medicalReportForm.ReportDate
                });

                var icd10CodesList = JsonConvert.DeserializeObject<List<ICD10CodesJSON>>(medicalReportForm.Icd10CodesJson);
                ICD10CodesJSON icd10Codes = new ICD10CodesJSON();
                if (icd10CodesList != null)
                {
                    icd10Codes = icd10CodesList[0];
                }

                var checkEstimateAmountValidation = new CheckEstimateAmountValidation();
                var personEventId = eventDetails.PersonEvents[0].PersonEventId;
                var isValid = false;

                if (estimates.Count > 0)
                {
                    var medicalEstimateAmounts = new List<decimal>();
                    var pdEstimateAmounts = new List<decimal>();
                    var medicalReportValue = (int)STPExitReasonEnum.MedicalReport;
                    var medicalReportExitReason = await _personEventStpExitReasons.FirstOrDefaultAsync(p => p.PersonEventId == personEventId && p.StpExitReasonId == medicalReportValue);

                    switch (icd10Codes != null ? icd10Codes.Severity : eventDetails.PersonEvents[0].PhysicalDamages[0].Injuries[0].InjurySeverityType)
                    {
                        case InjurySeverityTypeEnum.Mild:
                            medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMinimumCost).Select(a => a.MedicalMinimumCost).ToList();
                            pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMinimum).Select(a => a.PDExtentMinimum).ToList();

                            if ((medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] != ClaimConstants.STPPdEstimateAmount) && medicalReportExitReason == null)
                            {
                                await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                                {
                                    PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                    StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                                    CreatedBy = RmaIdentity.Username,
                                    ModifiedBy = RmaIdentity.Username,
                                    CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                    MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                    SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                                });
                                checkEstimateAmountValidation.isMedicalReportCreated = true;

                                await scope.SaveChangesAsync().ConfigureAwait(false);
                            }
                            else
                            {
                                isValid = true;
                            }
                            break;

                        case InjurySeverityTypeEnum.Moderate:
                            medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalAverageCost).Select(a => a.MedicalAverageCost).ToList();
                            pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentAverage).Select(a => a.PDExtentAverage).ToList();

                            if (medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] != ClaimConstants.STPPdEstimateAmount)
                            {
                                await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                                {
                                    PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                    StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                                    CreatedBy = RmaIdentity.Username,
                                    ModifiedBy = RmaIdentity.Username,
                                    CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                    MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                    SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                                });
                                checkEstimateAmountValidation.isMedicalReportCreated = true;

                                await scope.SaveChangesAsync().ConfigureAwait(false);
                            }
                            else
                            {
                                isValid = true;
                            }
                            break;

                        case InjurySeverityTypeEnum.Severe:
                            medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).ToList();
                            pdEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).ToList();

                            if (medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] > ClaimConstants.STPPdEstimateAmount)
                            {
                                await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                                {
                                    PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                    StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                                    CreatedBy = RmaIdentity.Username,
                                    ModifiedBy = RmaIdentity.Username,
                                    CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                    MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                    SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                                });
                                checkEstimateAmountValidation.isMedicalReportCreated = true;

                                await scope.SaveChangesAsync().ConfigureAwait(false);
                            }
                            else
                            {
                                isValid = true;
                            }
                            break;
                    }

                    checkEstimateAmountValidation.isValid = isValid;
                    return checkEstimateAmountValidation;
                }
                else
                {
                    await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                    {
                        PersonEventId = personEventId,
                        StpExitReasonId = (int)STPExitReasonEnum.NoEstimates,
                        CreatedBy = RmaIdentity.Username,
                        ModifiedBy = RmaIdentity.Username,
                        CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                        MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                        SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                    });
                    checkEstimateAmountValidation.isValid = isValid;

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return checkEstimateAmountValidation;
                }
            }
        }

        public async Task<FirstMedicalReportForm> ValidateFirstMedicalReport(FirstMedicalReportForm firstMedicalReportForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (firstMedicalReportForm != null)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(firstMedicalReportForm.MedicalReportForm.PersonEventId);

                    var personEvent = eventDetails.PersonEvents[0];

                    var checkEstimateAmountValidation = await CheckEstimateAmount(eventDetails.EventType, firstMedicalReportForm.MedicalReportForm, eventDetails);

                    if (firstMedicalReportForm.FirstMedicalReportFormId != 0)
                    {
                        var icd10Codes = JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(firstMedicalReportForm.MedicalReportForm.Icd10CodesJson);

                        if (checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            personEvent.IsStraightThroughProcess = false;
                        }

                        await ProcessMedicalReportICD10Codes(eventDetails, personEvent, icd10Codes, firstMedicalReportForm.MedicalReportForm.ReportDate);
                        await _medicalFormService.UpdateFirstMedicalReportForm(firstMedicalReportForm);
                        await CreateDisabiltyToFatalWorkflow(personEvent, JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(firstMedicalReportForm.MedicalReportForm.Icd10CodesJson));
                    }
                    else
                    {
                        var existingFirstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEvent.PersonEventId);

                        var workItem = await CreateWorkItem(MedicalFormReportTypeEnum.FirstAccidentMedicalReport, personEvent.PersonEventId, personEvent.IsStraightThroughProcess, checkEstimateAmountValidation.isValid);
                        var workItemId = await _digiService.AddWorkItem(workItem);
                        firstMedicalReportForm.MedicalReportForm.WorkItemId = (int)workItemId;
                        personEvent.FirstMedicalReport = new FirstMedicalReportForm();
                        personEvent.FirstMedicalReport = firstMedicalReportForm;

                        if (personEvent.FirstMedicalReport.MedicalReportForm.TenantId == 0)
                            personEvent.FirstMedicalReport.MedicalReportForm.TenantId = RmaIdentity.TenantId;

                        if (checkEstimateAmountValidation.isValid && personEvent.IsStraightThroughProcess)
                        {
                            firstMedicalReportForm.MedicalReportForm.DocumentStatusId = DocumentStatusEnum.Accepted;

                            if (personEvent.PersonEventStatus == PersonEventStatusEnum.PendingRequirements)
                            {
                                var minimumRequirements = personEvent.PersonEventClaimRequirements
                                            .Where(rc => rc?.IsMinimumRequirement == true)
                                            .ToList();

                                int totalMinimumRequirements = minimumRequirements.Count;
                                var closedMinimumRequirements = minimumRequirements.Count(rc => rc.DateClosed != null);

                                if (closedMinimumRequirements >= totalMinimumRequirements)
                                {
                                    personEvent.PersonEventStatus = PersonEventStatusEnum.PendingAcknowledgement;
                                    await _eventService.UpdatePersonEvent(personEvent);
                                }
                            }
                        }

                        var reportTypeId = firstMedicalReportForm.MedicalReportForm.ReportTypeId;
                        firstMedicalReportForm = await SetMedicalReportFields(personEvent);

                        if (reportTypeId == (int)MedicalFormReportTypeEnum.SickNoteMedicalReport)
                        {
                            firstMedicalReportForm.MedicalReportForm.ReportTypeId = reportTypeId;
                        }

                        if (firstMedicalReportForm.MedicalReportFormId != 0)
                        {
                            if (checkEstimateAmountValidation.isValid && personEvent.IsStraightThroughProcess)
                            {
                                firstMedicalReportForm.MedicalReportForm.DocumentStatusId = DocumentStatusEnum.Accepted;
                            }
                            else
                            {
                                await UpdateClaimStatusAndRouteToPoolWorkFlow(personEvent);

                                if (!checkEstimateAmountValidation.isValid && !checkEstimateAmountValidation.isMedicalReportCreated)
                                {
                                    await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                                    {
                                        PersonEventId = personEvent.PersonEventId,
                                        StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                                        CreatedBy = RmaIdentity.Username,
                                        ModifiedBy = RmaIdentity.Username,
                                        CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                        MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                        SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                                    });

                                    personEvent.IsStraightThroughProcess = false;
                                    await _eventService.UpdatePersonEvent(personEvent);
                                }

                                await scope.SaveChangesAsync().ConfigureAwait(false);
                            }
                        }

                        firstMedicalReportForm = await _medicalFormService.AddFirstMedicalReportForm(firstMedicalReportForm);
                        var icd10Codes = JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(firstMedicalReportForm.MedicalReportForm.Icd10CodesJson);

                        if (checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            personEvent.IsStraightThroughProcess = false;
                        }

                        await ProcessMedicalReportICD10Codes(eventDetails, personEvent, icd10Codes, firstMedicalReportForm.MedicalReportForm.ReportDate);
                        await CreateDisabiltyToFatalWorkflow(personEvent, JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(firstMedicalReportForm.MedicalReportForm.Icd10CodesJson));
                        
                        if (existingFirstMedicalReport == null)
                        {
                            var slaStatusChangeAudit = new SlaStatusChangeAudit
                            {
                                SLAItemType = SLAItemTypeEnum.WorkPoolAcknowledgement,
                                ItemId = personEvent.PersonEventId,
                                EffectiveFrom = DateTimeHelper.SaNow,
                                EffictiveTo = null,
                                Reason = "First medical report was uploaded",
                                Status = personEvent.PersonEventStatus.ToString()
                            };

                            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                        }
                    }
                }
                return firstMedicalReportForm;
            }
        }

        public async Task<ProgressMedicalReportForm> ValidateProgressMedicalReport(ProgressMedicalReportForm progressMedicalReportForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (progressMedicalReportForm != null)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(progressMedicalReportForm.MedicalReportForm.PersonEventId);
                    var personEvent = eventDetails.PersonEvents[0];

                    var checkEstimateAmountValidation = await CheckEstimateAmount(eventDetails.EventType, progressMedicalReportForm.MedicalReportForm, eventDetails);

                    if (progressMedicalReportForm.ProgressMedicalReportFormId != 0)
                    {
                        var icd10Codes = JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(progressMedicalReportForm.MedicalReportForm.Icd10CodesJson);

                        if (checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            personEvent.IsStraightThroughProcess = false;
                        }

                        await ProcessMedicalReportICD10Codes(eventDetails, personEvent, icd10Codes, progressMedicalReportForm.MedicalReportForm.ReportDate);
                        await _medicalFormService.UpdateProgressMedicalReportForm(progressMedicalReportForm);
                        await CreateDisabiltyToFatalWorkflow(personEvent, JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(progressMedicalReportForm.MedicalReportForm.Icd10CodesJson));
                    }
                    else
                    {
                        var workItem = await CreateWorkItem(MedicalFormReportTypeEnum.ProgressAccidentMedicalReport, personEvent.PersonEventId, personEvent.IsStraightThroughProcess, checkEstimateAmountValidation.isValid);
                        var workItemId = await _digiService.AddWorkItem(workItem);
                        progressMedicalReportForm.MedicalReportForm.WorkItemId = (int)workItemId;

                        personEvent.ProgressMedicalReportForms = new List<ProgressMedicalReportForm>() { progressMedicalReportForm };

                        if (personEvent.ProgressMedicalReportForms[0].MedicalReportForm.TenantId == 0)
                            personEvent.ProgressMedicalReportForms[0].MedicalReportForm.TenantId = RmaIdentity.TenantId;

                        if (personEvent.IsStraightThroughProcess && checkEstimateAmountValidation.isValid)
                        {
                            progressMedicalReportForm.MedicalReportForm.DocumentStatusId = DocumentStatusEnum.Accepted;

                            await AutoAcceptDocuments(personEvent);
                        }

                        progressMedicalReportForm = await SetProgressMedicalReportFields(progressMedicalReportForm);

                        if (progressMedicalReportForm.MedicalReportFormId != 0)
                        {
                            if (checkEstimateAmountValidation.isValid && personEvent.IsStraightThroughProcess)
                            {
                                progressMedicalReportForm.MedicalReportForm.DocumentStatusId = DocumentStatusEnum.Accepted;
                            }
                            else
                            {
                                personEvent.IsStraightThroughProcess = false;

                                if (!checkEstimateAmountValidation.isValid && !checkEstimateAmountValidation.isMedicalReportCreated)
                                {
                                    await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                                    {
                                        PersonEventId = personEvent.PersonEventId,
                                        StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                                        CreatedBy = RmaIdentity.Username,
                                        ModifiedBy = RmaIdentity.Username,
                                        CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                                        MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                                        SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                                    });

                                    personEvent.IsStraightThroughProcess = false;
                                    await _eventService.UpdatePersonEvent(personEvent);
                                }

                                await scope.SaveChangesAsync().ConfigureAwait(false);
                            }
                        }

                        progressMedicalReportForm = await _medicalFormService.AddProgressMedicalReportForm(progressMedicalReportForm);
                        var icd10Codes = JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(progressMedicalReportForm.MedicalReportForm.Icd10CodesJson);

                        if (checkEstimateAmountValidation.isMedicalReportCreated)
                        {
                            personEvent.IsStraightThroughProcess = false;
                        }

                        await ProcessMedicalReportICD10Codes(eventDetails, personEvent, icd10Codes, progressMedicalReportForm.MedicalReportForm.ReportDate);
                        await CreateDisabiltyToFatalWorkflow(personEvent, JsonConvert.DeserializeObject<List<MedicalIcd10Code>>(progressMedicalReportForm.MedicalReportForm.Icd10CodesJson));
                    }
                }
                return progressMedicalReportForm;
            }
        }

        private async Task ProcessMedicalReportICD10Codes(Contracts.Entities.Event _event, PersonEvent personEvent, List<MedicalIcd10Code> icd10Codes, DateTime reportDate)
        {
            if (icd10Codes?.Count > 0)
            {
                var existingIcd10Codelist = personEvent.PhysicalDamages[0].Injuries;

                var existingInjuryIcd0CodeIds = existingIcd10Codelist.Select(s => s.Icd10CodeId).ToList();
                icd10Codes.RemoveAll(s => existingInjuryIcd0CodeIds.Contains(s.Icd10CodeId));

                foreach (var icd10Code in icd10Codes)
                {
                    var defaultEstimateBasis = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter { EventType = _event.EventType, Icd10Codes = icd10Code.Icd10Code, ReportDate = reportDate });
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

                var hasTopRankedInjuryChanged = personEvent.PhysicalDamages[0].Injuries[0].InjuryId <= 0;

                for (int i = 0; i < personEvent.PhysicalDamages[0].Injuries.Count; i++)
                {
                    if (!personEvent.PhysicalDamages[0].Injuries[i].IsDeleted)
                    {
                        personEvent.PhysicalDamages[0].Injuries[i].InjuryRank = i + 1;
                    }
                }

                await _eventService.UpdatePersonEvent(personEvent);

                if (hasTopRankedInjuryChanged)
                {
                    var shouldStartWizard = personEvent.Claims?.Any(s => s.ClaimStatus != ClaimStatusEnum.Closed && s.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability
                    || s.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.MedicalLiability
                    || s.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityAccepted
                    || s.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted
                    || s.ClaimLiabilityStatus == ClaimLiabilityStatusEnum.Accepted) ?? false;

                    if (shouldStartWizard)
                    {
                        var startWizardRequest = new StartWizardRequest
                        {
                            LinkedItemId = personEvent.PersonEventId,
                            Type = "review-injury-icd10-codes",
                            Data = _serializer.Serialize(personEvent)
                        };
                        await _wizardService.StartWizard(startWizardRequest);
                    }
                }
            }
        }

        public async Task<List<ProgressMedicalReportForm>> GetProgressMedicalReportForms(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _medicalFormService.GetProgressMedicalReportByPersonEventId(personEventId);
            }
        }

        public async Task<List<FinalMedicalReportForm>> GetFinalMedicalReportForms(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _medicalFormService.GetFinalMedicalReportAccidentByPersonEventId(personEventId);
            }
        }

        public async Task<List<FirstMedicalReportForm>> GetFirstMedicalReportForms(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var firstMedicalReportForms = new List<FirstMedicalReportForm>();
                var medicalReportFormWizardDetails = await _medicalReportFormWizardDetails.Where(m => m.PersonEventId == personEventId && m.MedicalFormReportType == MedicalFormReportTypeEnum.FirstAccidentMedicalReport).ToListAsync();
                if (medicalReportFormWizardDetails.Count != 0)
                {
                    foreach (var medicalReportFormWizardDetail in medicalReportFormWizardDetails)
                    {
                        if (medicalReportFormWizardDetail.WizardId != null && medicalReportFormWizardDetail.MedicalReportFormId == null)
                        {
                            var wizard = await _wizardService.GetWizard(medicalReportFormWizardDetail.WizardId.Value);
                            var stepData = _serializer.Deserialize<ArrayList>(wizard.Data);
                            var firstMedicalReportForm = _serializer.Deserialize<FirstMedicalReportForm>(stepData[0].ToString());
                            firstMedicalReportForms.Add(firstMedicalReportForm);
                        }
                        else if (medicalReportFormWizardDetail.MedicalReportFormId != null)
                        {
                            var firstMedicalReportForm = await _medicalFormService.GetFirstMedicalReportForm(medicalReportFormWizardDetail.MedicalReportFormId.Value);
                            firstMedicalReportForms.Add(firstMedicalReportForm);
                        }
                    }
                    return firstMedicalReportForms;
                }
                else
                {
                    return firstMedicalReportForms;
                }

            }
        }

        public async Task<FirstMedicalReportForm> GetFirstMedicalReportForm(int personEventId)
        {
            return await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEventId);
        }

        public async Task<FinalMedicalReportForm> GetFinalMedicalReportForm(int personEventId)
        {
            return await _medicalFormService.GetFinalMedicalReportByPersonEventId(personEventId);
        }

        public async Task UpdateMedicalReportFormWizardDetail(MedicalReportFormWizardDetail medicalReportFormWizardDetail)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _medicalReportFormWizardDetails.FirstOrDefaultAsync(m => m.PersonEventId == medicalReportFormWizardDetail.PersonEventId && m.WizardId == medicalReportFormWizardDetail.WizardId);

                entity.MedicalReportFormId = medicalReportFormWizardDetail.MedicalReportFormId.Value;
                _medicalReportFormWizardDetails.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

            }
        }

        public async Task<bool> RemoveFirstMedicalReportForm(int firstMedicalReportFormId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _medicalFormService.DeleteFirstMedicalReportForm(firstMedicalReportFormId);
                return true;
            }
        }

        public async Task<bool> RemoveProgressMedicalReportForm(int progressMedicalReportFormId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _medicalFormService.DeleteProgressMedicalReportForm(progressMedicalReportFormId);
            }
            return true;
        }

        public async Task<bool> RemoveFinalMedicalReportForm(int finalMedicalReportFormId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _medicalFormService.DeleteFinalMedicalReportForm(finalMedicalReportFormId);
                return true;
            }

        }

        public async Task<bool> UpdateFirstMedicalReportForm(FirstMedicalReportForm firstMedicalReport)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _medicalFormService.UpdateFirstMedicalReportForm(firstMedicalReport);
                if (firstMedicalReport?.MedicalReportForm.DocumentStatusId == DocumentStatusEnum.Accepted)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(firstMedicalReport.MedicalReportForm.PersonEventId);
                    var personEvent = eventDetails.PersonEvents[0];
                }
                return true;

            }
        }

        public async Task<bool> UpdateProgressMedicalReportForm(ProgressMedicalReportForm progressMedicalReport)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _medicalFormService.UpdateProgressMedicalReportForm(progressMedicalReport);
                return true;
            }

        }

        public async Task<bool> UpdateFinalMedicalReportForm(FinalMedicalReportForm finalMedicalReport)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _medicalFormService.UpdateFinalMedicalReportForm(finalMedicalReport);
                if (finalMedicalReport.MedicalReportForm.DocumentStatusId == DocumentStatusEnum.Accepted)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(finalMedicalReport.MedicalReportForm.PersonEventId);
                    var personEvent = eventDetails.PersonEvents[0];
                }
                return true;
            }

        }

        public async Task RemoveMedicalReportForm(MedicalReportFormWizardDetail medicalReportFormWizardDetail)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _medicalReportFormWizardDetails.FirstOrDefaultAsync(m => m.PersonEventId == medicalReportFormWizardDetail.PersonEventId && m.MedicalReportFormId == medicalReportFormWizardDetail.MedicalReportFormId && m.MedicalFormReportType == medicalReportFormWizardDetail.MedicalFormReportType);
                switch (medicalReportFormWizardDetail?.MedicalFormReportType)
                {
                    case MedicalFormReportTypeEnum.FirstAccidentMedicalReport:
                        var firstMedicalReportForm = await _medicalFormService.GetFirstMedicalReportForm(medicalReportFormWizardDetail.MedicalReportFormId.Value);
                        await _medicalFormService.DeleteFirstMedicalReportForm(firstMedicalReportForm.FirstMedicalReportFormId);
                        break;
                    case MedicalFormReportTypeEnum.ProgressAccidentMedicalReport:
                        var progressMedicalReportForm = await _medicalFormService.GetProgressMedicalReportForm(medicalReportFormWizardDetail.MedicalReportFormId.Value);
                        await _medicalFormService.DeleteProgressMedicalReportForm(progressMedicalReportForm.ProgressMedicalReportFormId);
                        break;
                    case MedicalFormReportTypeEnum.FinalAccidentMedicalReport:
                        var finalMedicalReportForm = await _medicalFormService.GetFinalMedicalReportForm(medicalReportFormWizardDetail.MedicalReportFormId.Value);
                        await _medicalFormService.DeleteFinalMedicalReportForm(finalMedicalReportForm.FinalMedicalReportFormId);
                        break;
                }
                _medicalReportFormWizardDetails.Delete(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task RemoveMedicalReportFormByDocumentId(int personEventId, int documentId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _medicalReportFormWizardDetails.FirstOrDefaultAsync(m => m.PersonEventId == personEventId && m.DocumentId == documentId);
                var firstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEventId);
                if (firstMedicalReport.FirstMedicalReportFormId > 0)
                {
                    await _medicalFormService.DeleteFirstMedicalReportForm(personEventId);
                }
                _medicalReportFormWizardDetails.Delete(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> GetMedicalFormDocumentId(int personEventId, int workItemId, MedicalFormReportTypeEnum medicalFormReportType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _medicalReportFormWizardDetails.FirstOrDefaultAsync(m => m.PersonEventId == personEventId && m.WorkItemId == workItemId && m.MedicalFormReportType == medicalFormReportType);
                return result.DocumentId.HasValue ? result.DocumentId.Value : 0;
            }
        }

        private async Task AddPersonEventSTPExitReason(PersonEventStpExitReason personEventStpExitReason)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                  var stpExitReasonEntity = new claim_PersonEventStpExitReason
                  {
                      PersonEventId = personEventStpExitReason.PersonEventId,
                      StpExitReasonId = personEventStpExitReason.StpExitReasonId,
                      CreatedBy = RmaIdentity.Email,
                      CreatedDate = DateTime.Now,
                      ModifiedBy = RmaIdentity.Email,
                      ModifiedDate = DateTime.Now
                  };
                  _personEventStpExitReasons.Create(stpExitReasonEntity);
                 await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
            }

            var originalClaimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventStpExitReason.PersonEventId);
            if (originalClaimEntity != null && personEventStpExitReason.StpExitReasonId == (int)STPExitReasonEnum.MedicalReport)
            {
                await NotifyDefaultRoleOfMedicalReport(personEventStpExitReason.PersonEventId, "Cca Pool");
            }

            #region handle send integration to CompCare
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimConstants.SendToSTPIntegration))
            {
                if (personEventStpExitReason.CompCarePersonEventId > 0 && !string.IsNullOrWhiteSpace(personEventStpExitReason.MessageId))
                {
                    var stpExitReason = (STPExitReasonEnum)personEventStpExitReason.StpExitReasonId;
                    var stpIntegrationBody = new STPIntegrationBody()
                    {
                        PersonEventId = personEventStpExitReason.CompCarePersonEventId,
                        IDVOPDValidated = true,
                        ReSubmitVOPD = false,
                        STPExitReasonId = personEventStpExitReason.StpExitReasonId,
                        STPExitReason = stpExitReason.DisplayAttributeValue(),
                        SuspiciousTransactionStatusID = personEventStpExitReason.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                    };
                    var messageBody = _serializer.Serialize(stpIntegrationBody);

                    var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                    var messageType = new MessageType
                    {
                        MessageBody = messageBody,
                        From = ClaimConstants.MessageFrom,
                        To = ClaimConstants.MessageTo,
                        MessageTaskType = ClaimConstants.MessageTaskType005,
                        Environment = enviroment,
                        CorrelationID = personEventStpExitReason.MessageId,
                        EnqueuedTime = DateTime.UtcNow,
                    };

                    await SendIntegrationMessageToCompCare(messageType, personEventStpExitReason.CompCarePersonEventId);
                }
            } 
            #endregion
        }

        private async Task NotifyDefaultRoleOfMedicalReport(int personEventId, string permissionName)
        {
            var personEvent = await _eventService.GetPersonEvent(personEventId);

            if (personEvent != null)
            {
                var userReminders = new List<UserReminder>();
                var recipients = await _userService.SearchUsersByPermission(permissionName);

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    foreach (var recipient in recipients)
                    {
                        var results = _userReminderRepository.Any(a => a.AssignedToUserId == recipient.Id && !a.IsDeleted && a.ItemId == personEventId);
                        if (!results)
                        {
                            var userReminder = new UserReminder
                            {
                                AssignedToUserId = recipient.Id,
                                UserReminderType = UserReminderTypeEnum.SystemNotification,
                                UserReminderItemType = UserReminderItemTypeEnum.Claim,
                                Text = $"ICD10 code mismatch on the medical report for this PEV reference: {personEvent.PersonEventReferenceNumber}",
                                AlertDateTime = DateTimeHelper.SaNow,
                                CreatedBy = RmaIdentity.DisplayName,
                                ItemId = personEvent.PersonEventId,
                                LinkUrl = "/claimcare/claim-manager/holistic-claim-view/" + personEvent.EventId + "/" + personEvent.PersonEventId
                            };

                            userReminders.Add(userReminder);
                        }
                    }
                }
                _ = Task.Run(() => _userReminderService.CreateUserReminders(userReminders));
            }
        }

        public async Task SendAckwonledgementNotifications()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var events = await _eventRepository.SqlQueryAsync<Contracts.Entities.Event>(DatabaseConstants.GetEventsWithNoNotificationSentStoredProcedure);

                    foreach (var evt in events)
                    {
                        try
                        {
                            var eventDetails = await _eventService.GetEventDetailsForReceiptLetters(evt.EventId);
                            if (isAuditClaimsProcessedEnabled)
                            {
                                await AddTracingNotes(eventDetails.EventId, $"Event queued for receipet letters - SendAckwonledgementNotifications  - {System.Environment.MachineName}", ItemTypeEnum.Event);
                            }

                            for (int i = 0; i < eventDetails.PersonEvents.Count; i++)
                            {
                                if (eventDetails.PersonEvents[i].CompCarePersonEventId == null)
                                {
                                    await SendNotificationReceiptToCompanyContactAndEmployee(eventDetails.PersonEvents[i]);
                                }
                                else
                                {
                                    await SendCompCareNotificationReceived(eventDetails.PersonEvents[i]);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.LogException($"Error when sending communication to Person Events: {string.Join(",", evt.PersonEvents.Select(a => a.PersonEventId))} - Error Message {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error When Getting Notifications - Error Message {ex.Message}");
            }
        }

        private async Task SendNotificationReceiptToCompanyContactAndEmployee(PersonEvent personEvent)
        {
            var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(personEvent.PersonEventId, ClaimCommunicationTypeEnum.NotificationReceipt);
            claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationReceipt;
            var claimBucketClass = await GetClaimBucketClassById(personEvent.PersonEventBucketClassId);
            claimCommunicationMessage.IsNotificationOnly = claimBucketClass?.Name == "Notification Only";

            claimCommunicationMessage.PersonEvent = personEvent;
            await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);
        }

        private async Task SendCompCareNotificationReceived(PersonEvent personEvent)
        {
            try
            {
                var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);
                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var claimBucketClass = await GetClaimBucketClassById(personEvent.PersonEventBucketClassId);
                var isNotificationOnly = claimBucketClass?.Name == "Notification Only";
                var claimEmail = new ClaimEmail()
                {
                    ClaimId = 0,
                    EmailAddress = company.EmailAddress,
                    PersonEventId = personEvent.PersonEventId,
                    TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                    Tokens = new Dictionary<string, string>
                    {
                        ["{EmployeeName}"] = employee.DisplayName,
                    }
                };

                var claimSms = new ClaimSMS()
                {
                    ClaimId = 0,
                    MobileNumber = employee.CellNumber,
                    PersonEventId = personEvent.PersonEventId,
                    TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                    Tokens = new Dictionary<string, string>
                    {
                        ["[personEventNumber]"] = (personEvent.Claims.Count > 0 && personEvent.CompCarePersonEventId == null) ? personEvent.Claims[0].ClaimReferenceNumber : personEvent.CompCarePevRefNumber,
                    }
                };
                await _claimCommunicationService.SendAccidentClaimEmailAndSMS(personEvent, claimEmail, claimSms, isNotificationOnly);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when sending compcare notification received: {personEvent.PersonEventId} - Error Message {ex.Message}");
            }
        }

        public async Task<PersonEvent> SetNotificationOnlyOrSTP(Contracts.Entities.Event _event, PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);
            Contract.Requires(_event != null);

            var claimNotificationOnly = await _configurationService.GetModuleSetting(SystemSettings.ClaimNotificationOnly);

            var isPassportMinimumRequirement = personEvent.RolePlayer.Person.IdType == IdTypeEnum.PassportDocument;
            var isMinimumRequirementDateClosed = false;

            if (isPassportMinimumRequirement)
            {
                #region handle person event claim requirements
                foreach (var requirementCategory in personEvent.PersonEventClaimRequirements)
                {
                    if (requirementCategory?.IsMinimumRequirement == true
                        && requirementCategory.DateClosed != null
                        && requirementCategory.ClaimRequirementCategory?.DocumentType == DocumentTypeEnum.PassportDocument)
                    {
                        isMinimumRequirementDateClosed = true;
                        break;
                    }
                } 
                #endregion
            }

            var isSuspiciousTransactionEnabled = await _configurationService.IsFeatureFlagSettingEnabled(SuspiciousTransactionModel);
            var isClaimNotificationOnly = personEvent.PersonEventBucketClassId == Convert.ToInt32(claimNotificationOnly);

            if (isClaimNotificationOnly)
            {
                // notification is a potential STP (Pending Acknowledgement), awaiting validation
                personEvent.PersonEventStatus = personEvent.IsStraightThroughProcess 
                                                    ? PersonEventStatusEnum.PendingAcknowledgement 
                                                    : PersonEventStatusEnum.Submitted;
            }
            else
            {
                if (personEvent.FirstMedicalReport != null)
                {
                    await VerifyIfMedicalReportIsSTP(personEvent, (int)_event.WizardId);
                }

                if (personEvent.IsStraightThroughProcess)
                {
                    personEvent.PersonEventStatus = (isPassportMinimumRequirement && isMinimumRequirementDateClosed)
                                                    || personEvent.FirstMedicalReport == null
                                                    ? PersonEventStatusEnum.PendingRequirements
                                                    : PersonEventStatusEnum.PendingAcknowledgement;
                }
            }

            if (isSuspiciousTransactionEnabled)
            {
                await SubmitTransactionForSTM(personEvent, _event, personEvent.PersonEventReferenceNumber);
            }

            return personEvent;
        }

        public async Task UpdatePersonEventEmployment(PersonEvent personEvent)
        {
            if (personEvent.RolePlayer.Person.PersonEmployments.Count > 0)
            {
                if (personEvent.RolePlayer.Person.PersonEmployments[0].PersonEmpoymentId != 0)
                {
                    personEvent.PersonEmploymentId = await _rolePlayerService.EditPersonEmployment(personEvent.RolePlayer.Person.PersonEmployments[0]);
                }
                else
                {
                    personEvent.PersonEmploymentId = await _rolePlayerService.CreatePersonEmployment(personEvent.RolePlayer.Person.PersonEmployments[0]);
                }
            }
        }

        public async Task UpdateExistingEvent(Contracts.Entities.Event _event, PersonEvent personEvent)
        {
            using (_dbContextScopeFactory.Create())
            {
                if (_event != null)
                {
                    if (_event.EventId > 0)
                    {
                        var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);
                        //var personEventStpExitReasons = await _personEventStpExitReasons.FirstOrDefaultAsync(p => p.PersonEventId == personEvent.PersonEventId);

                        //if (personEventStpExitReasons != null)
                        //{
                        //    if (claimEntity.ClaimLiabilityStatus.Equals(ClaimLiabilityStatusEnum.Pending) && personEventStpExitReasons.StpExitReasonId > 0)
                        //    {
                        //        await _noteService.AddNote(new Note
                        //        {
                        //            ItemId = personEvent.PersonEventId,
                        //            ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                        //            Text = "Disease changed to Fatal",
                        //            Reason = "Disease changed to Fatal"
                        //        });
                        //        await SendToCADWorkPool(personEvent);
                        //    }
                        //}


                        await _eventService.UpdateEvent(_event);
                        // await _eventService.UpdatePersonEvent(personEvent);
                    }
                }
            }
        }

        public async Task AddEmployeesToAccidentNotification(Wizard wizard)
        {
            var stepData = _serializer.Deserialize<ArrayList>(wizard?.Data);
            var eventDetails = _serializer.Deserialize<Contracts.Entities.Event>(stepData[0].ToString());
            var personEvents = eventDetails.PersonEvents;
            var count = 0;
            var existingEmployees = 0;
            foreach (var personEvent in eventDetails.PersonEvents)
            {
                if (personEvent.Claims.Count > 0)
                {
                    existingEmployees++;
                    continue;
                }

                personEvent.EventId = eventDetails.EventId;

                if (personEvent.PersonEventDeathDetail == null || personEvent.PersonEventDeathDetail.DeathTypeId == 0)
                {
                    personEvent.PersonEventDeathDetail = null;
                }

                personEvent.PersonEventDiseaseDetail = null;
                personEvent.PersonEventNoiseDetail = null;

                if (personEvent.RolePlayer.RolePlayerId != 0)
                {
                    if (personEvent.RolePlayer.RolePlayerAddresses != null && personEvent.RolePlayer.RolePlayerAddresses.Count > 0)
                    {
                        foreach (var rolePlayerAddress in personEvent.RolePlayer.RolePlayerAddresses)
                        {
                            rolePlayerAddress.RolePlayerId = personEvent.RolePlayer.RolePlayerId;
                        }
                    }
                    await _rolePlayerService.EditRolePlayer(personEvent.RolePlayer);

                    if (personEvent.RolePlayer.Person.PersonEmployments.Count > 0)
                    {
                        if (personEvent.RolePlayer.Person.PersonEmployments[0].PersonEmpoymentId != 0)
                        {
                            personEvent.PersonEmploymentId = await _rolePlayerService.EditPersonEmployment(personEvent.RolePlayer.Person.PersonEmployments[0]);
                        }
                        else
                        {
                            personEvent.PersonEmploymentId = await _rolePlayerService.CreatePersonEmployment(personEvent.RolePlayer.Person.PersonEmployments[0]);
                        }
                    }
                }
                else
                {
                    personEvent.RolePlayer.ClientType = ClientTypeEnum.Individual;
                    personEvent.InsuredLifeId = await _rolePlayerService.CreateRolePlayer(personEvent.RolePlayer);
                    var personEmploymentDetails = await _rolePlayerService.GetPersonEmployment(personEvent.InsuredLifeId, personEvent.CompanyRolePlayerId.Value);
                    personEvent.PersonEmploymentId = personEmploymentDetails.PersonEmpoymentId;
                }

                if (personEvent.InsuredLifeId > 0 && personEvent.RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
                {
                    personEvent.RolePlayer.Person.RolePlayerId = personEvent.InsuredLifeId;
                    await _rolePlayerService.RolePlayerVopdMultipleRequest(personEvent.RolePlayer.Person);
                }

                count++;
                var total = count + existingEmployees;

                var claimNumber = await GenerateClaimNumber(personEvent, eventDetails.EventDate, total, eventDetails.EventReferenceNumber);

                ClaimStatusEnum claimStatus;

                var isSTPReasonId = await ValidateIsStraigthThroughProcessing(personEvent, eventDetails.EventDate);
                if (isSTPReasonId == -1)
                {
                    personEvent.IsStraightThroughProcess = true;
                }
                else
                {
                    personEvent.IsStraightThroughProcess = false;
                    personEvent.PersonEventStpExitReasons.Add(new PersonEventStpExitReason
                    {
                        PersonEventId = personEvent.PersonEventId,
                        StpExitReasonId = isSTPReasonId,
                        CreatedBy = RmaIdentity.Username,
                        ModifiedBy = RmaIdentity.Username
                    });
                }

                var claimNotificationOnly = await _configurationService.GetModuleSetting(SystemSettings.ClaimNotificationOnly);
                if (personEvent.PersonEventBucketClassId == Convert.ToInt32(claimNotificationOnly))
                {
                    if (await _configurationService.IsFeatureFlagSettingEnabled(SuspiciousTransactionModel))
                    {
                        await SubmitTransactionForSTM(personEvent, eventDetails, claimNumber);
                    }
                    claimStatus = ClaimStatusEnum.PendingAcknowledgement;
                }
                else
                {
                    if (personEvent.IsStraightThroughProcess)
                    {
                        if (personEvent.FirstMedicalReport != null)
                        {
                            await VerifyIfMedicalReportIsSTP(personEvent, Convert.ToInt32(eventDetails.WizardId));
                        }
                        if (await _configurationService.IsFeatureFlagSettingEnabled(SuspiciousTransactionModel))
                        {
                            await SubmitTransactionForSTM(personEvent, eventDetails, claimNumber);
                        }

                        claimStatus = (ClaimStatusEnum)personEvent.Claims?.FirstOrDefault(a => a.UnderwriterId == 1).ClaimStatus;
                    }
                    else
                    {
                        claimStatus = ClaimStatusEnum.Submitted;
                    }
                }

                var claim = new Contracts.Entities.Claim
                {
                    PersonEventId = personEvent.PersonEventId,
                    ClaimReferenceNumber = claimNumber,
                    ClaimStatus = claimStatus,
                    ClaimLiabilityStatusId = (int)personEvent.Claims?.FirstOrDefault(a => a.UnderwriterId == 1).ClaimLiabilityStatus,
                    ClaimStatusChangeDate = DateTime.Now,
                    IsCancelled = false,
                    IsClosed = false,
                    IsRuleOverridden = false,
                    DisabilityPercentage = 0.0000M,
                    IsDeleted = false,

                };
                personEvent.Claims.Add(claim);

                await _eventService.CreatePersonEventDetails(personEvent);
                var eventUpdate = await _eventService.GetEvent(eventDetails.EventId);
                eventUpdate.NumberOfInjuredEmployees = total;

                await _eventService.UpdateEvent(eventUpdate);
            }

            var memberName = await _rolePlayerService.GetDisplayName((int)eventDetails.MemberSiteId);

            var comment = "PEV Number: " + personEvents[0].PersonEventId + ": Accident notification for member " + memberName;
            var request = new RejectWizardRequest()
            {
                WizardId = wizard.Id,
                Comment = comment,
                RejectedBy = wizard.CreatedBy
            };

        }

        private async Task SubmitTransactionForSTM(PersonEvent personEvent, Contracts.Entities.Event eventDetails, string claimNumber)
        {
            try
            {
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
                    values.Add(claimNumber);
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

                            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimConstants.SendToSTPIntegration))
                            {
                                if (personEvent.CompCarePersonEventId != 0 && !string.IsNullOrWhiteSpace(personEvent.CompCareIntegrationMessageId))
                                {
                                    var stpExitReason = STPExitReasonEnum.CheckSTM;
                                    var stpIntegrationBody = new STPIntegrationBody()
                                    {
                                        PersonEventId = personEvent.CompCarePersonEventId.Value,
                                        IDVOPDValidated = true,
                                        ReSubmitVOPD = false,
                                        STPExitReasonId = (int)stpExitReason,
                                        STPExitReason = stpExitReason.DisplayAttributeValue(),
                                        SuspiciousTransactionStatusID = 1
                                    };
                                    var messageBody = _serializer.Serialize(stpIntegrationBody);

                                    var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                                    var messageType = new MessageType
                                    {
                                        MessageBody = messageBody,
                                        From = ClaimConstants.MessageFrom,
                                        To = ClaimConstants.MessageTo,
                                        MessageTaskType = ClaimConstants.MessageTaskType002,
                                        Environment = enviroment,
                                        CorrelationID = personEvent.CompCareIntegrationMessageId,
                                        EnqueuedTime = DateTime.UtcNow,
                                    };

                                    await SendIntegrationMessageToCompCare(messageType, personEvent.CompCarePersonEventId.Value);
                                }
                            }
                        }
                        else if (predictedValue == 0)
                        {
                            personEvent.SuspiciousTransactionStatus = SuspiciousTransactionStatusEnum.NotSuspicious;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when submiting STM Request for: {personEvent.PersonEventId} - Error Message {ex.Message}");
            }
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

        private async Task<PersonEvent> VerifyIfMedicalReportIsSTP(PersonEvent personEvent, int wizardId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter { EventType = EventTypeEnum.Accident, Icd10Codes = personEvent.FirstMedicalReport.MedicalReportForm.Icd10Codes, ReportDate = personEvent.FirstMedicalReport.MedicalReportForm.ReportDate });

                if (estimates.Count > 0)
                {
                    var ICD10CodeJson = _serializer.Deserialize<ArrayList>(personEvent.FirstMedicalReport.MedicalReportForm.Icd10CodesJson);
                    var ICD10CodeString = ICD10CodeJson[0].ToString();
                    var ICD10CodeDetails = _serializer.Deserialize<ICD10CodeJsonObject>(ICD10CodeString);

                    var medicalEstimateAmounts = new List<decimal>();
                    var pdEstimateAmounts = new List<decimal>();

                    switch (ICD10CodeDetails.Severity)
                    {
                        case (int)InjurySeverityTypeEnum.Severe:
                            medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).ToList();
                            pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMaximum).Select(a => a.PDExtentMaximum).ToList();

                            break;
                        case (int)InjurySeverityTypeEnum.Moderate:
                            medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalAverageCost).Select(a => a.MedicalAverageCost).ToList();
                            pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentAverage).Select(a => a.PDExtentAverage).ToList();

                            break;
                        default:
                            medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMinimumCost).Select(a => a.MedicalMinimumCost).ToList();
                            pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMinimum).Select(a => a.PDExtentMinimum).ToList();

                            break;
                    }


                    if (medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] != ClaimConstants.STPPdEstimateAmount)
                    {
                        personEvent.IsStraightThroughProcess = false;

                        personEvent.PersonEventStpExitReasons = personEvent.PersonEventStpExitReasons == null ? new List<PersonEventStpExitReason>() : personEvent.PersonEventStpExitReasons;
                        personEvent.PersonEventStpExitReasons.Add(new PersonEventStpExitReason
                        {
                            PersonEventId = personEvent.PersonEventId,
                            StpExitReasonId = (int)STPExitReasonEnum.MedicalReport,
                            CreatedBy = RmaIdentity.Username,
                            ModifiedBy = RmaIdentity.Username
                        });

                        foreach (var personEventSTPExitReasons in personEvent.PersonEventStpExitReasons)
                        {
                            await AddPersonEventSTPExitReason(personEventSTPExitReasons);
                        }
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                    else
                    {
                        if (personEvent.FirstMedicalReport.MedicalReportForm.TenantId == 0)
                        {
                            personEvent.FirstMedicalReport.MedicalReportForm.TenantId = RmaIdentity.TenantId;
                        }
                        
                        var documents = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.ClaimMedicalDocuments, new Dictionary<string, string> { { "WizardDocumentId", wizardId.ToString() } });
                        foreach (var document in documents)
                        {
                            if (document.Id != 0)
                            {
                                document.DocumentStatus = DocumentStatusEnum.Accepted;
                                await _documentIndexService.UpdateDocument(document);
                            }
                        }
                    }
                }
                return personEvent;
            }
        }

        public async Task SetInformationForMedicalReportSubmission(PersonEvent personEvent)
        {
            if (personEvent.FirstMedicalReport.MedicalReportForm == null) return;

            personEvent.FirstMedicalReport.MedicalReportForm.CreatedDate = DateTimeHelper.SaNow;
            personEvent.FirstMedicalReport.MedicalReportForm.CreatedBy = RmaIdentity.Email;
            personEvent.FirstMedicalReport.MedicalReportForm.ModifiedDate = DateTimeHelper.SaNow;
            personEvent.FirstMedicalReport.MedicalReportForm.ServiceBusMessageType = string.Empty;
            var workItemId = await CreateWorkItem(personEvent);
            personEvent.FirstMedicalReport.MedicalReportForm.WorkItemId = Convert.ToInt32(workItemId);
            personEvent.FirstMedicalReport.MedicalReportForm.SourceSystemRoutingId = AppNames.DigiCare;
            personEvent.FirstMedicalReport.MedicalReportForm.SourceSystemReference = Guid.NewGuid().ToString();
            personEvent.FirstMedicalReport.MedicalReportForm.ReportTypeId = (int)MedicalFormReportTypeEnum.FirstAccidentMedicalReport;

            personEvent.FirstMedicalReport.MedicalReportForm.UnfitStartDate = personEvent.FirstMedicalReport.MedicalReportForm.UnfitStartDate?.ToSaDateTime();
            personEvent.FirstMedicalReport.MedicalReportForm.UnfitEndDate = personEvent.FirstMedicalReport.MedicalReportForm.UnfitEndDate?.ToSaDateTime();

            personEvent.FirstMedicalReport.MedicalReportForm.EventCategoryId = (int)EventTypeEnum.Accident;
            personEvent.FirstMedicalReport.MedicalReportForm.PersonEventId = personEvent.PersonEventId;
            personEvent.FirstMedicalReport.MedicalReportForm.ClaimReferenceNumber = personEvent.PersonEventId.ToString();
            personEvent.FirstMedicalReport.MedicalReportForm.EventDate = personEvent.DateCaptured;
            personEvent.FirstMedicalReport.MedicalReportForm.DateOfBirth = personEvent.RolePlayer.Person.DateOfBirth;
            personEvent.FirstMedicalReport.MedicalReportForm.Name = personEvent.RolePlayer.Person.FirstName;
            personEvent.FirstMedicalReport.MedicalReportForm.Surname = personEvent.RolePlayer.Person.Surname;
            personEvent.FirstMedicalReport.MedicalReportForm.Gender = personEvent.RolePlayer.Person.Gender.DisplayAttributeValue();

            var companyDetails = await _rolePlayerService.GetRolePlayer(personEvent.CompanyRolePlayerId.Value);
            personEvent.FirstMedicalReport.MedicalReportForm.EmployerName = companyDetails.DisplayName;

            if (companyDetails.FinPayee != null)
            {
                var result = await _industryService.GetIndustry(companyDetails.FinPayee.IndustryId);
                switch (result.IndustryClass)
                {
                    case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Metals:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MetalsClass;
                        break;
                    case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Mining:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.MiningClass;
                        break;
                    case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Other:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.OtherClass;
                        break;
                    case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Individual:
                    case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Group:
                    case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Senna:
                        personEvent.FirstMedicalReport.MedicalReportForm.IndustryNumber = Admin.MasterDataManager.Database.Constants.CommonConstants.IndividualGroupSennaClass;
                        break;
                }
            }

            return;
        }

        private async Task<float> CreateWorkItem(PersonEvent personEvent)
        {
            var workItemType = new WorkItemType()
            {
                WizardConfigurationId = 54,
                WorkItemTypeDescription = "First Medical Report (Accident)",
                WorkItemTypeId = 1,
                WorkItemTypeName = "First Medical Report (Accident)",
                TenantId = RmaIdentity.TenantId
            };
            var workItem = new WorkItem()
            {
                WorkItemName = $"STP First Medical Report for: {DateTime.Now.ToShortDateString()} - {personEvent.PersonEventId}",
                WorkItemType = workItemType,
                WorkItemState = (DigiCare.Contracts.Enum.WorkItemStateEnum)WorkItemStateEnum.Complete,
                TenantId = RmaIdentity.TenantId
            };

            return await _digiService.AddWorkItem(workItem);
        }

        public async Task ReopenClaim(PersonEvent personEvent)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (personEvent != null)
                {
                    var eventDetails = await _eventService.GetPersonEventDetails(personEvent.PersonEventId);
                    //var documentsUploaded = await _documentIndexService.HaveUploadedDocuments(personEvent.DocumentSetEnum.Value, new Dictionary<string, string> { { "PersonEvent", personEvent.PersonEventId.ToString() } });
                    if (true)
                    {
                        var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);
                        var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);
                        await _personEventRepository.LoadAsync(personEventEntity, e => e.PersonEventStpExitReasons);
                        await _personEventRepository.LoadAsync(personEventEntity, e => e.Event);
                        if ((DateTime.Now - personEventEntity.Event.EventDate).TotalDays <= 90)
                        {
                            var isSTPReasonId = await ValidateIsStraigthThroughProcessing(personEvent, personEventEntity.Event.EventDate);
                            if (isSTPReasonId == -1)
                            {
                                var firstMedicalReports = await GetFirstMedicalReportForms(personEvent.PersonEventId);

                                var medicalReports = new List<MedicalReportForm>();
                                medicalReports.AddRange(firstMedicalReports.Select(a => a.MedicalReportForm));
                                var isValid = false;
                                foreach (var medicalReport in medicalReports)
                                {
                                    var checkEstimateAmountValidation = await CheckEstimateAmount(EventTypeEnum.Accident, medicalReport, eventDetails);
                                    isValid = checkEstimateAmountValidation.isValid;
                                }

                                if (isValid)
                                {
                                    personEventEntity.IsStraightThroughProcess = true;
                                    claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                                    claimEntity.ClaimStatus = ClaimStatusEnum.Reopened;

                                    foreach (var personEventSTPExitReason in personEventEntity.PersonEventStpExitReasons)
                                    {
                                        personEventSTPExitReason.IsDeleted = true;
                                        personEventSTPExitReason.ModifiedBy = RmaIdentity.Username;
                                        personEventSTPExitReason.ModifiedDate = DateTime.Now;
                                    }
                                }
                                else
                                {
                                    personEventEntity.IsStraightThroughProcess = false;
                                    claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                                    claimEntity.ClaimStatus = ClaimStatusEnum.Reopened;
                                }
                            }
                            else
                            {
                                personEventEntity.IsStraightThroughProcess = false;
                                claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                                claimEntity.ClaimStatus = ClaimStatusEnum.Reopened;
                                personEventEntity.PersonEventStpExitReasons.Add(new claim_PersonEventStpExitReason
                                {
                                    PersonEventId = personEvent.PersonEventId,
                                    StpExitReasonId = isSTPReasonId,
                                    CreatedBy = RmaIdentity.Username,
                                    ModifiedBy = RmaIdentity.Username
                                });
                            }
                        }
                        else
                        {
                            personEventEntity.IsStraightThroughProcess = false;
                            claimEntity.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                            claimEntity.ClaimStatus = ClaimStatusEnum.Reopened;
                        }
                        personEvent.ModifiedBy = RmaIdentity.Username;
                        personEvent.ModifiedDate = DateTime.Now;

                        _claimRepository.Update(claimEntity);
                        _personEventRepository.Update(personEventEntity);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }

                }
            }
        }

        public async Task RerunSTPIntegrationMessage(int serviceBusMessageId)
        {
            var message = await _serviceBusMessage.GetServiceBusMessagesById(serviceBusMessageId);
            if (message != null)
            {
                var isSuccess = await ProcessSTPIntegrationMessage(message.MessageBody, message.MessageId);
                if (isSuccess)
                {
                    message.MessageProcessingStatusText = $"Success {DateTimeHelper.SaNow.AddMinutes(-5)} - {DateTimeHelper.SaNow}";
                    await _serviceBusMessage.UpdateBusMessage(message);
                }
            }
        }

        public async Task ProcessCommsMessage(int serviceBusMessageId)
        {
            var message = await _serviceBusMessage.GetServiceBusMessagesById(serviceBusMessageId);
            if (message != null)
            {
                var messageContent = _serializer.Deserialize<ClaimCommunicationMessage>(message.MessageBody);
                await _claimCommunicationService.ProccessCommunicationNotification(messageContent);
            }
        }

        public async Task<bool> ProcessSTPIntegrationMessage(string message, string messageId)
        {
            Contract.Requires(message != null);

            try
            {
                if (message.Contains(AdviseMethodEnum.CapturedviatheCFilingSystem.DisplayAttributeValue()))
                {
                    string messageUpdated = message.Replace(AdviseMethodEnum.CapturedviatheCFilingSystem.DisplayAttributeValue(), Convert.ToString((int)AdviseMethodEnum.CapturedviatheCFilingSystem));
                    message = messageUpdated;
                }

                if (message.Contains(AdviseMethodEnum.EarlyNotificationofEvent.DisplayAttributeValue()))
                {
                    string messageUpdated = message.Replace(AdviseMethodEnum.EarlyNotificationofEvent.DisplayAttributeValue(), Convert.ToString((int)AdviseMethodEnum.EarlyNotificationofEvent));
                    message = messageUpdated;
                }

                if (message.Contains(ClaimConstants.CompCareOtherAdvisementMethod))
                {
                    string messageUpdated = message.Replace(ClaimConstants.CompCareOtherAdvisementMethod, Convert.ToString((int)AdviseMethodEnum.Other));
                    message = messageUpdated;
                }

                if (message.Contains(ClaimConstants.CompCareClaimantReportedtMethod))
                {
                    string messageUpdated = message.Replace(ClaimConstants.CompCareClaimantReportedtMethod, Convert.ToString((int)AdviseMethodEnum.ClaimantreportedPaper));
                    message = messageUpdated;
                }

                var eventDetails = _serializer.Deserialize<Contracts.Entities.Event>(message);
                var personEvents = eventDetails.PersonEvents;
                var compcareClaimNumber = eventDetails.EventReferenceNumber;
                eventDetails.EventStatus = EventStatusEnum.Notified;
                eventDetails.EventType = EventTypeEnum.Accident;
                eventDetails.EventReferenceNumber = await _eventService.GenerateEventUniqueReferenceNumber();
                if (eventDetails.DateAdvised == DateTime.MinValue)
                {
                    eventDetails.DateAdvised = eventDetails.EventDate;
                }
                var count = 0;
                var addEventDetails = true;
                var company = eventDetails.CompanyRolePlayer;
                if (company != null)
                {
                    if (eventDetails.CompanyRolePlayer.RolePlayerContacts != null && eventDetails.CompanyRolePlayer.RolePlayerContacts.Count > 0)
                    {
                        foreach (var roleplayerContact in eventDetails.CompanyRolePlayer.RolePlayerContacts)
                        {
                            if (roleplayerContact.Title == 0)
                            {
                                roleplayerContact.Title = TitleEnum.Mr;
                            }
                            roleplayerContact.CommunicationType = roleplayerContact.ContactNumber != null ? CommunicationTypeEnum.SMS : CommunicationTypeEnum.Email;
                            roleplayerContact.ContactDesignationType = ContactDesignationTypeEnum.PrimaryContact;

                            var rolePlayerContactInformations = new RolePlayerContactInformation
                            {
                                ContactInformationType = ContactInformationTypeEnum.Claims
                            };
                            roleplayerContact.RolePlayerContactInformations = new List<RolePlayerContactInformation>();
                            roleplayerContact.RolePlayerContactInformations.Add(rolePlayerContactInformations);

                        }
                    }

                    var companyDetails = await _rolePlayerService.GetCompanyByReferenceNumber(company.Company.ReferenceNumber);
                    if (companyDetails == null)
                    {
                        company.DisplayName = company.Company.Name;
                        var memberNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.AccountNumber, eventDetails.CompanyRolePlayer.DisplayName);

                        eventDetails.CompanyRolePlayer.FinPayee = new FinPayee
                        {
                            FinPayeNumber = memberNumber,
                            IndustryId = Convert.ToInt32(eventDetails.CompanyRolePlayer.Company.IndustryId)
                        };
                        eventDetails.CompanyRolePlayer.ClientType = ClientTypeEnum.Company;
                        eventDetails.CompanyRolePlayer.RolePlayerId = await _rolePlayerService.CreateRolePlayer(eventDetails.CompanyRolePlayer);
                        eventDetails.MemberSiteId = eventDetails.CompanyRolePlayer.RolePlayerId;
                    }
                    else
                    {
                        eventDetails.CompanyRolePlayer.ClientType = ClientTypeEnum.Company;
                        eventDetails.CompanyRolePlayer.RolePlayerId = companyDetails.RolePlayerId;
                        eventDetails.MemberSiteId = companyDetails.RolePlayerId;
                        var rolePlayer = await _rolePlayerService.GetRolePlayer(companyDetails.RolePlayerId);
                        if (rolePlayer.RolePlayerContacts != null && rolePlayer.RolePlayerContacts.Count > 0)
                        {
                            foreach (var rolePlayerContact in eventDetails.CompanyRolePlayer.RolePlayerContacts)
                            {
                                if (!rolePlayer.RolePlayerContacts.Contains(rolePlayerContact))
                                {
                                    rolePlayer.RolePlayerContacts.Add(rolePlayerContact);
                                }
                            }
                        }
                        else
                        {
                            if (rolePlayer.RolePlayerContacts == null)
                            {
                                rolePlayer.RolePlayerContacts = new List<RolePlayerContact>();
                                rolePlayer.RolePlayerContacts.AddRange(eventDetails.CompanyRolePlayer.RolePlayerContacts);
                            }
                            else
                            {
                                rolePlayer.RolePlayerContacts.AddRange(eventDetails.CompanyRolePlayer.RolePlayerContacts);
                            }
                        }
                        await _rolePlayerService.EditRolePlayer(rolePlayer);
                    }
                }

                for (int i = 0; i < eventDetails.PersonEvents.Count; i++)
                {
                    if (personEvents[i].PersonEventDeathDetail == null || personEvents[i].PersonEventDeathDetail.DeathTypeId == 0)
                    {
                        personEvents[i].PersonEventDeathDetail = null;
                    }

                    personEvents[i].PersonEventDiseaseDetail = null;
                    personEvents[i].PersonEventNoiseDetail = null;
                    personEvents[i].CompanyRolePlayerId = eventDetails.MemberSiteId;
                    personEvents[i].ClaimantId = (int)eventDetails.MemberSiteId;
                    personEvents[i].IsStraightThroughProcess = true;

                    personEvents[i].CompCarePersonEventId = personEvents[i].PersonEventId;
                    personEvents[i].CompCareIntegrationMessageId = messageId;
                    personEvents[i].CompCarePevRefNumber = compcareClaimNumber;

                    var personDetails = personEvents[i].RolePlayer;
                    var rolePlayerId = await _rolePlayerService.CheckIfRolePlayerExists(personDetails.Person.IdNumber);
                    if (rolePlayerId != 0)
                    {
                        personEvents[i].RolePlayer.ClientType = ClientTypeEnum.Individual;
                        personEvents[i].InsuredLifeId = rolePlayerId;
                        personEvents[i].RolePlayer = await _rolePlayerService.GetRolePlayer(rolePlayerId);
                        if (personEvents[i].RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
                        {
                            personEvents[i].RolePlayer.RolePlayerId = rolePlayerId;
                            personEvents[i].RolePlayer.Person.IsVopdVerified = false;
                            personEvents[i].RolePlayer.DisplayName = $"{personEvents[i].RolePlayer.Person.FirstName} {personEvents[i].RolePlayer.Person.Surname}";
                            personEvents[i].RolePlayer.PreferredCommunicationTypeId = personEvents[i].RolePlayer.CellNumber != null ? (int)CommunicationTypeEnum.SMS : (int)CommunicationTypeEnum.Email;
                            await _rolePlayerService.EditRolePlayer(personEvents[i].RolePlayer);
                        }

                        if (personEvents[i].RolePlayer.Person.IdType == IdTypeEnum.PassportDocument)
                        {
                            personEvents[i].RolePlayer.RolePlayerId = rolePlayerId;
                            personEvents[i].RolePlayer.DisplayName = $"{personEvents[i].RolePlayer.Person.FirstName} {personEvents[i].RolePlayer.Person.Surname}";
                            personEvents[i].RolePlayer.PreferredCommunicationTypeId = personEvents[i].RolePlayer.CellNumber != null ? (int)CommunicationTypeEnum.SMS : (int)CommunicationTypeEnum.Email;
                            await _rolePlayerService.EditRolePlayer(personEvents[i].RolePlayer);
                        }

                        if (personEvents[i].RolePlayer.Person.PersonEmployments.Count > 0)
                        {
                            var personEmploymentDetails = await _rolePlayerService.GetPersonEmployment(personEvents[i].InsuredLifeId, personEvents[i].CompanyRolePlayerId.Value);
                            if (personEmploymentDetails.PersonEmpoymentId != 0)
                            {
                                personEvents[i].PersonEmploymentId = personEmploymentDetails.PersonEmpoymentId;
                            }
                            else
                            {
                                foreach (var personEmployment in personEvents[i].RolePlayer.Person.PersonEmployments)
                                {
                                    personEmployment.EmployeeRolePlayerId = rolePlayerId;
                                    personEmployment.EmployerRolePlayerId = (int)eventDetails.MemberSiteId;
                                }

                                personEvents[i].PersonEmploymentId = await _rolePlayerService.CreatePersonEmployment(personEvents[i].RolePlayer.Person.PersonEmployments[0]);
                            }
                        }
                    }
                    else
                    {
                        personEvents[i].RolePlayer.ClientType = ClientTypeEnum.Individual;
                        personEvents[i].RolePlayer.PreferredCommunicationTypeId = personEvents[i].RolePlayer.CellNumber != null ? (int)CommunicationTypeEnum.SMS : (int)CommunicationTypeEnum.Email;
                        personEvents[i].RolePlayer.DisplayName = $"{personDetails.Person.FirstName} {personDetails.Person.Surname}";
                        foreach (var personEmployment in personEvents[i].RolePlayer.Person.PersonEmployments)
                        {
                            personEmployment.EmployerRolePlayerId = (int)eventDetails.MemberSiteId;
                        }
                        personEvents[i].InsuredLifeId = await _rolePlayerService.CreateRolePlayer(personEvents[i].RolePlayer);
                        var personEmploymentDetails = await _rolePlayerService.GetPersonEmployment(personEvents[i].InsuredLifeId, personEvents[i].CompanyRolePlayerId.Value);
                        personEvents[i].PersonEmploymentId = personEmploymentDetails.PersonEmpoymentId;

                        if (personEvents[i].InsuredLifeId > 0 && personEvents[i].RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
                        {
                            personEvents[i].RolePlayer.Person.RolePlayerId = personEvents[i].InsuredLifeId;
                            await _rolePlayerService.RolePlayerVopdMultipleRequest(personEvents[i].RolePlayer.Person);
                        }
                    }

                    if (await _eventService.CheckIfPersonEventAlreadyExists(personEvents[i].CompCarePersonEventId.Value, personEvents[i].InsuredLifeId, personEvents[i].CompanyRolePlayerId.Value))
                    {
                        addEventDetails = false;
                        continue;
                    }

                    count++;

                    var generatedPersonEventNumber = await _eventService.GeneratePersonEventReferenceNumber();
                    personEvents[i].PersonEventId = Convert.ToInt32(generatedPersonEventNumber);
                    personEvents[i].PersonEventReferenceNumber = generatedPersonEventNumber;


                    var claimNumber = await GenerateClaimNumber(personEvents[i], eventDetails.EventDate, count, eventDetails.EventReferenceNumber);

                    ClaimStatusEnum claimStatus;


                    if (personEvents[i]?.PhysicalDamages?.Count > 0)
                    {
                        foreach (var physicalDamage in personEvents[i].PhysicalDamages)
                        {
                            if (!string.IsNullOrWhiteSpace(physicalDamage.Icd10DiagnosticGroupCode))
                            {
                                physicalDamage.Icd10DiagnosticGroupId = await _iCD10CodeService.GetICD10DiagnosticGroupByCode(physicalDamage.Icd10DiagnosticGroupCode);
                                if (physicalDamage?.Injuries?.Count > 0)
                                {
                                    foreach (var injury in physicalDamage.Injuries)
                                    {
                                        if (injury.Icd10CodeId != ClaimConstants.UnknownICD10Code)
                                        {
                                            var icd10CodeId = await GetCorrectICD10CodeForIntegration((int)personEvents[i].CompCarePersonEventId, injury.Icd10CodeId);
                                            injury.Icd10CodeId = icd10CodeId;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    var documentsUploaded = await CheckIfCompcareDocumentsUploaded(compcareClaimNumber, personEvents[i].RolePlayer.Person.IdNumber);

                    var claimNotificationOnly = await _configurationService.GetModuleSetting(SystemSettings.ClaimNotificationOnly);
                    if (personEvents[i].PersonEventBucketClassId == Convert.ToInt32(claimNotificationOnly))
                    {
                        if (await _configurationService.IsFeatureFlagSettingEnabled(SuspiciousTransactionModel))
                        {
                            await SubmitTransactionForSTM(personEvents[i], eventDetails, claimNumber);
                        }
                        claimStatus = ClaimStatusEnum.PendingAcknowledgement;
                    }
                    else
                    {
                        if (personEvents[i].IsStraightThroughProcess)
                        {
                            if (personEvents[i].FirstMedicalReport != null)
                            {
                                personEvents[i] = await VerifyIfMedicalReportIsSTP(personEvents[i], (int)eventDetails.WizardId);
                            }
                            if (await _configurationService.IsFeatureFlagSettingEnabled(SuspiciousTransactionModel))
                            {
                                await SubmitTransactionForSTM(personEvents[i], eventDetails, claimNumber);
                            }
                            if (!documentsUploaded)
                            {
                                claimStatus = ClaimStatusEnum.PendingRequirements;
                            }
                            else
                            {
                                claimStatus = documentsUploaded && personEvents[i].IsStraightThroughProcess ? ClaimStatusEnum.PendingAcknowledgement : ClaimStatusEnum.PendingRequirements;
                            }


                        }
                        else
                        {
                            claimStatus = ClaimStatusEnum.Submitted;
                        }
                    }

                    var isSTPReasonId = await ValidateIsStraigthThroughProcessing(personEvents[i], eventDetails.EventDate);

                    if (isSTPReasonId == -1)
                    {
                        personEvents[i].IsStraightThroughProcess = true;
                    }
                    else if (isSTPReasonId != -1)
                    {
                        personEvents[i].IsStraightThroughProcess = false;
                        (personEvents[i].PersonEventStpExitReasons ?? (personEvents[i].PersonEventStpExitReasons = new List<PersonEventStpExitReason>())).Add(new PersonEventStpExitReason
                        {
                            PersonEventId = personEvents[i].PersonEventId,
                            StpExitReasonId = isSTPReasonId,
                            CreatedBy = RmaIdentity.BackendServiceName,
                            ModifiedBy = RmaIdentity.BackendServiceName
                        });

                        var stpIntegrationBody = new STPIntegrationBody()
                        {
                            PersonEventId = personEvents[i].CompCarePersonEventId.Value,
                            IDVOPDValidated = true,
                            ReSubmitVOPD = false,
                            STPExitReasonId = isSTPReasonId,
                            STPExitReason = ((STPExitReasonEnum)isSTPReasonId).ToString(),
                            SuspiciousTransactionStatusID = personEvents[i].SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                        };
                        var messageBody = _serializer.Serialize(stpIntegrationBody);
                        var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                        var messageType = new MessageType
                        {
                            MessageBody = messageBody,
                            From = ClaimConstants.MessageFrom,
                            To = ClaimConstants.MessageTo,
                            MessageTaskType = ClaimConstants.MessageTaskType002,
                            Environment = enviroment,
                            CorrelationID = personEvents[i].CompCareIntegrationMessageId,
                            EnqueuedTime = DateTime.UtcNow,
                        };
                        await SendIntegrationMessageToCompCare(messageType, personEvents[i].CompCarePersonEventId.Value);
                    }

                    var claim = await CreateClaimEntity(personEvents[i].PersonEventId, claimNumber, claimStatus, documentsUploaded);
                    personEvents[i].Claims = new List<Contracts.Entities.Claim>();
                    personEvents[i].Claims.Add(claim);
                }

                if (addEventDetails)
                {
                    var eventId = await _eventService.CreateEventDetails(eventDetails);
                    foreach (var personEvent in eventDetails.PersonEvents)
                    {
                        await ValidateFirstMedicalReport(personEvent.FirstMedicalReport);
                        if (await _configurationService.IsFeatureFlagSettingEnabled(IsVopdQuickTransactEnabled) && personEvent.RolePlayer.Person.IdType == IdTypeEnum.SAIDDocument)
                        {
                            await _claimService.ProcessVOPDReponse(personEvent.InsuredLifeId);
                        }

                        if (instantAdjudicateSTP)
                        {
                            var registeredEvent = await _eventService.GetEventDetails(eventId);
                            if (registeredEvent != null)
                            {
                                await InstantAdjudicateSTP(registeredEvent.PersonEvents[0], registeredEvent.EventDate);
                            }
                        }
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Creating a Person Event from CompCare: {messageId} - Error Message {ex.Message}");
                return false;
                throw;
            }
        }

        public async Task<Contracts.Entities.Claim> CreateClaimEntity(int personEventId, string claimNumber, ClaimStatusEnum claimStatus, bool documentsUploaded)
        {
            return new Contracts.Entities.Claim
            {
                PersonEventId = personEventId,
                ClaimReferenceNumber = claimNumber,
                ClaimStatus = claimStatus,
                ClaimLiabilityStatusId = documentsUploaded ? (int)ClaimLiabilityStatusEnum.Pending : (int)ClaimLiabilityStatusEnum.OutstandingRequirements,
                ClaimStatusChangeDate = DateTime.Now,
                IsCancelled = false,
                IsClosed = false,
                IsRuleOverridden = false,
                DisabilityPercentage = 0.0000M,
                IsDeleted = false,
            };
        }

        private async Task<bool> CheckIfCompcareDocumentsUploaded(string compCareClaimNumber, string idNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("CompcareClaimNumber", compCareClaimNumber),
                    new SqlParameter("IdNumber", idNumber)

                    };

                var documentsUploaded = await _eventRepository.SqlQueryAsync<int>(DatabaseConstants.CheckCompCareDocumentsUploaded, parameters);

                return documentsUploaded[0] == 1 ? true : false;
            }
        }

        private async Task<int> GetCorrectICD10CodeForIntegration(int CompcarePersonEventId, int Icd10CodeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                                            new SqlParameter("CompcarePersonEventId", CompcarePersonEventId),
                                            new SqlParameter("ICD10CodeId", Icd10CodeId),
                                            };

                var icd10Code = await _eventRepository.SqlQueryAsync<int>(DatabaseConstants.GetCorrectICD10CodeForIntegration, parameters);

                return icd10Code[0];
            }
        }

        public async Task<bool> CheckCompCareMedicalReportEstimates(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var eventDetails = await _eventService.GetPersonEventDetails(personEventId);
                var isValid = false;
                var personEventStpExitReasons = new List<PersonEventStpExitReason>();

                if (eventDetails != null)
                {
                    SqlParameter[] parameters = {
                    new SqlParameter("CompCarePersonEventId", eventDetails.PersonEvents[0].CompCarePersonEventId),
                    };

                    var compCareMedicalReportDetails = await _eventRepository.SqlQueryAsync<CompCareMedicalReportDetail>(DatabaseConstants.GetCompCareMedicalReports, parameters);
                    foreach (var compCareMedicalReportDetail in compCareMedicalReportDetails)
                    {
                        var estimates = await _medicalEstimatesService.GetICD10Estimates(new ICD10EstimateFilter
                        {
                            EventType = eventDetails.EventType,
                            Icd10Codes = compCareMedicalReportDetail.ICD10Codes,
                            ReportDate = compCareMedicalReportDetail.ReportDate
                        });
                        var mismatchExitReason = 0;
                        var drgIds = estimates.Select(a => a.ICD10DiagnosticGroupId).ToList();
                        if (!drgIds.Contains(compCareMedicalReportDetail.ICD10DiagnosticGroupId))
                        {
                            mismatchExitReason = (int)STPExitReasonEnum.MedicalReport;
                        }

                        if (estimates.Count > 0)
                        {
                            var medicalEstimateAmounts = new List<decimal>();
                            var pdEstimateAmounts = new List<decimal>();
                            switch (eventDetails.PersonEvents[0].PhysicalDamages[0].Injuries[0].InjurySeverityType)
                            {
                                case InjurySeverityTypeEnum.Mild:
                                    medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMinimumCost).Select(a => a.MedicalMinimumCost).ToList();
                                    pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMinimum).Select(a => a.PDExtentMinimum).ToList();
                                    if (medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] != ClaimConstants.STPPdEstimateAmount)
                                    {
                                        personEventStpExitReasons.Add(new PersonEventStpExitReason
                                        {
                                            PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                            StpExitReasonId = mismatchExitReason == 0 ? (int)STPExitReasonEnum.MedicalReport : mismatchExitReason,
                                            CreatedBy = RmaIdentity.Username,
                                            ModifiedBy = RmaIdentity.Username,
                                            CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                            MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                            SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                                        });
                                    }
                                    else
                                    {
                                        isValid = true;
                                    }
                                    break;

                                case InjurySeverityTypeEnum.Moderate:
                                    medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalAverageCost).Select(a => a.MedicalAverageCost).ToList();
                                    pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentAverage).Select(a => a.PDExtentAverage).ToList();
                                    if (medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] != ClaimConstants.STPPdEstimateAmount)
                                    {
                                        personEventStpExitReasons.Add(new PersonEventStpExitReason
                                        {
                                            PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                            StpExitReasonId = mismatchExitReason == 0 ? (int)STPExitReasonEnum.MedicalReport : mismatchExitReason,
                                            CreatedBy = RmaIdentity.Username,
                                            ModifiedBy = RmaIdentity.Username,
                                            CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                            MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                            SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                                        });
                                    }
                                    else
                                    {
                                        isValid = true;
                                    }
                                    break;

                                case InjurySeverityTypeEnum.Severe:
                                    medicalEstimateAmounts = estimates.OrderByDescending(b => b.MedicalMaximumCost).Select(a => a.MedicalMaximumCost).ToList();
                                    pdEstimateAmounts = estimates.OrderByDescending(b => b.PDExtentMaximum).Select(a => a.PDExtentMaximum).ToList();

                                    if (medicalEstimateAmounts[0] > ClaimConstants.STPMedicalMaxAmount || pdEstimateAmounts[0] > ClaimConstants.STPPdEstimateAmount)
                                    {
                                        personEventStpExitReasons.Add(new PersonEventStpExitReason
                                        {
                                            PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                            StpExitReasonId = mismatchExitReason == 0 ? (int)STPExitReasonEnum.MedicalReport : mismatchExitReason,
                                            CreatedBy = RmaIdentity.Username,
                                            ModifiedBy = RmaIdentity.Username,
                                            CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                            MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                            SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                                        });
                                    }
                                    else
                                    {
                                        isValid = true;
                                    }
                                    break;
                            }
                        }
                        else
                        {
                            personEventStpExitReasons.Add(new PersonEventStpExitReason
                            {
                                PersonEventId = eventDetails.PersonEvents[0].PersonEventId,
                                StpExitReasonId = (int)STPExitReasonEnum.NoEstimates,
                                CreatedBy = RmaIdentity.Username,
                                ModifiedBy = RmaIdentity.Username,
                                CompCarePersonEventId = eventDetails.PersonEvents[0].CompCarePersonEventId.HasValue ? eventDetails.PersonEvents[0].CompCarePersonEventId.Value : 0,
                                MessageId = eventDetails.PersonEvents[0].CompCareIntegrationMessageId != null ? eventDetails.PersonEvents[0].CompCareIntegrationMessageId : string.Empty,
                                SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus
                            });
                        }
                    }
                }

                if (!isValid && personEventStpExitReasons.Count > 0)
                {
                    foreach (var personEventSTPExitReasons in personEventStpExitReasons)
                    {
                        await AddPersonEventSTPExitReason(personEventSTPExitReasons);
                    }

                    var personEvent = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                    personEvent.IsStraightThroughProcess = false;
                    _personEventRepository.Update(personEvent);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                return isValid;
            }
        }

        public async Task<int> RemovePersonEventFromSTP(int personEventId, Note note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var originalEntity = await _personEventRepository.FirstOrDefaultAsync(p => p.PersonEventId == personEventId);
                await _personEventRepository.LoadAsync(originalEntity, s => s.Claims);

                var personEvent = Mapper.Map<PersonEvent>(originalEntity);
                await UpdateClaimStatusAndRouteToPoolWorkFlow(personEvent);

                await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                {
                    PersonEventId = personEvent.PersonEventId,
                    StpExitReasonId = (int)STPExitReasonEnum.TeamLead,
                    CreatedBy = RmaIdentity.Username,
                    ModifiedBy = RmaIdentity.Username,
                    CompCarePersonEventId = personEvent.CompCarePersonEventId.HasValue ? personEvent.CompCarePersonEventId.Value : 0,
                    MessageId = personEvent.CompCareIntegrationMessageId != null ? personEvent.CompCareIntegrationMessageId : string.Empty,
                    SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                });

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
                {
                    ItemId = personEvent.PersonEventId,
                    NoteCategory = NoteCategoryEnum.PersonEvent,
                    NoteItemType = NoteItemTypeEnum.PersonEvent,
                    NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                    NoteType = NoteTypeEnum.SystemAdded,
                    Text = note?.Text,
                    IsActive = true
                });
            }
        }

        private void AddAuditEntry(claim_Claim entity, bool isNewEntry, int? wizardId)
        {
            var newAudit = new AuditResult()
            {
                ItemId = entity.ClaimId,
                ItemType = "claim_Claim",
                Action = isNewEntry ? "Added" : "Modified",

                NewItem = JsonConvert.SerializeObject(entity),
                Date = DateTimeHelper.SaNow,
                Username = RmaIdentity.Username,
                CorrolationToken = RmaIdentity.TraceId,
                WizardId = wizardId
            };

            newAudit.OldItem = AddOldItem(entity);
            newAudit.NewItem = ParseClaim(newAudit.NewItem, entity);
            _auditLogService.AddAudit(newAudit).GetAwaiter().GetResult();
        }

        private string AddOldItem(claim_Claim claim)
        {
            using (_dbContextScopeFactory.Create())
            {
                var audits = _auditLogService.GetAuditLogs("claim_Claim", claim.ClaimId).GetAwaiter().GetResult();
                if (audits.Count == 0)
                {
                    return "{ }";
                }

                var audit = audits.OrderByDescending(a => a.Id).FirstOrDefault();
                return audit.NewItem;
            }
        }

        private string ParseClaim(string newItemString, claim_Claim newClaimEntity)
        {
            if (newItemString == null) return "{ }";
            var item = JObject.Parse(newItemString);

            return item.ToString(Formatting.None);
        }

        private async Task SendIntegrationMessageToCompCare(MessageType messageType, int compCarePersonEventId)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var messageProperties = new Dictionary<string, string>
                    {
                        ["MessageTo"] = messageType.To,
                        ["MessageFrom"] = messageType.From,
                        ["Environment"] = messageType.Environment,
                        ["MessageTaskType"] = messageType.MessageTaskType,
                    };
                    if (!await _serviceBusMessage.CheckIfMessageHasBeenSentByMesageBody(compCarePersonEventId, messageType.To, messageType.From, messageType.CorrelationID, messageType.MessageBody))
                    {
                        var producer = new ServiceBusTopicProducer<MessageType>(stpSendTopic, stpSendConnectionString);
                        await producer.PublishMessageAsync(messageType, null, messageProperties);
                        await _serviceBusMessage.AddServiceBusMessage(messageType);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error sending message to CompCare - Error Message {ex.Message}");
            }

        }

        public async Task ReSubmitSTMRequests()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var personEvents = await _personEventRepository.Where(a => a.ClaimType != null && (a.InsuranceTypeId.Value == (int)InsuranceTypeEnum.IOD) && (a.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.Suspicious)).OrderByDescending(x => x.PersonEventId).Take(10).ToListAsync();

                    foreach (var personEvent in personEvents)
                    {
                        try
                        {
                            var eventDetails = await _eventService.GetPersonEventDetails(personEvent.PersonEventId);
                            await SubmitTransactionForSTM(eventDetails.PersonEvents[0], eventDetails, eventDetails.PersonEvents[0].Claims[0].ClaimReferenceNumber);

                            var dataItem = await _personEventRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEvent.PersonEventId);
                            dataItem.SuspiciousTransactionStatus = eventDetails.PersonEvents[0].SuspiciousTransactionStatus;
                            dataItem.IsStraightThroughProcess = eventDetails.PersonEvents[0].IsStraightThroughProcess;
                            _personEventRepository.Update(dataItem);
                        }
                        catch (Exception ex)
                        {
                            ex.LogException($"Error When Resubmitting STM for Person Event: {personEvent.PersonEventId} - Error Message {ex.Message}");
                        }


                    }
                    await scope.SaveChangesAsync()
                           .ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error getting claims to Resubmit STM - Error Message {ex.Message}");
                }
            }

        }

        private int DayCount(DateTime createDate, DateTime todaysDate)
        {
            return (todaysDate.Date - createDate.Date).Days;
        }

        public async Task ReOpenSection40CompCareClaimsAndSQ()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var section40ClaimsToSendToSQ = await GetSection40CompCareClaimToReOpen();

                    if (section40ClaimsToSendToSQ.Count > 0)
                    {
                        foreach (var section40Claim in section40ClaimsToSendToSQ)
                        {
                            var personEvent = await _eventService.GetPersonEvent(section40Claim.PersonEventId);

                            var dayCount = DayCount(personEvent.CreatedDate, DateTimeHelper.SaNow);
                            var messages = new List<string>
                            {
                                "Claim status updated from Closed to Re-opened and liability status from Outstanding Requirements to Accepted"
                            };

                            if (dayCount <= 90)
                            {
                                messages.Add("Documents uploaded before 90 Days, claim is Re-opened");
                            }
                            else
                            {
                                personEvent.IsStraightThroughProcess = false;
                                messages.Add("Documents uploaded after 90 Days, claim moved to SQ");

                                #region handle section 40 stp exit reason
                                await AddPersonEventSTPExitReason(new PersonEventStpExitReason
                                {
                                    PersonEventId = personEvent.PersonEventId,
                                    StpExitReasonId = (int)STPExitReasonEnum.LiabilityStatus,
                                    CreatedBy = RmaIdentity.Username,
                                    ModifiedBy = RmaIdentity.Username,
                                    CompCarePersonEventId = personEvent.CompCarePersonEventId ?? 0,
                                    MessageId = personEvent.CompCareIntegrationMessageId ?? string.Empty,
                                    SuspiciousTransactionStatus = personEvent.SuspiciousTransactionStatus
                                }); 
                                #endregion
                            }

                            personEvent.PersonEventStatus = PersonEventStatusEnum.Open;
                            foreach (var claim in personEvent.Claims)
                            {
                                claim.ClaimStatus = ClaimStatusEnum.Open;
                                claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                                claim.ClaimStatusChangeDate = DateTime.Now;
                                claim.ClaimClosedReasonId = (int)ClaimClosedReasonEnum.Submitted;
                                claim.IsClosed = false;
                            }
                            await _eventService.UpdatePersonEvent(personEvent);

                            #region handle person event system notes
                            foreach (var message in messages)
                            {
                                if (!string.IsNullOrEmpty(message))
                                {
                                    await CreateSystemAddedCommonNotes(personEvent.PersonEventId, message);
                                }
                            } 
                            #endregion
                        }
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when getting claims for section 40 SQ - Error Message {ex.Message}");
                }
            }
        }

        public async Task AutoAcknowledgeAccidentClaim()
        {
            var accidentClaims = await GetClaimsToAutoAcknowledgeByEventType(EventTypeEnum.Accident);

            foreach (var claim in accidentClaims)
            {
                if (!claim.DocumentsBeenUploaded)
                {
                    continue;
                }
                // Run in the background, because will time out when called from the scheduler
                _ = Task.Run(() => ProcessAutoAcknowledgeSTPClaim(claim));
            }
        }

        private async Task CreatePoolWorkFlow(claim_Claim claim, WorkPoolEnum workPool)
        {
            var poolWorkFlow = new PoolWorkFlow()
            {
                ItemId = claim.ClaimId,
                WorkPool = workPool,
                AssignedByUserId = RmaIdentity.UserId,
                AssignedToUserId = null,
                EffectiveFrom = DateTimeHelper.SaNow,
                EffectiveTo = null,
                PoolWorkFlowItemType = PoolWorkFlowItemTypeEnum.Claim
            };

            await UpdateSLAForClaim(claim, workPool);
            await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
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

        public async Task<bool> CloseAccidentClaim(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claim = await _claimRepository.FirstOrDefaultAsync(c => c.PersonEventId == personEvent.PersonEventId);

                string textMessage = string.Empty;
                var templateType = TemplateTypeEnum.ClaimClosingLetter; // default
                var claimClosedSetting = SystemSettings.ClaimClosed;
                var communicationType = ClaimCommunicationTypeEnum.CloseClaimNotification;
                var shouldRejectLiability = false;

                switch (personEvent.ClaimAccidentCloseLetterTypeEnum)
                {
                    case ClaimAccidentCloseLetterTypeEnum.NillPdLetter:
                        textMessage = $"Claim close - Nill PD - PEV ({personEvent.PersonEventReferenceNumber})";
                        break;
                    case ClaimAccidentCloseLetterTypeEnum.PdPaid0To30Percent:
                        textMessage = $"Claim close - Pd paid 0 to 30% - PEV ({personEvent.PersonEventReferenceNumber})";
                        templateType = TemplateTypeEnum.PDPaid0To30Percent;
                        break;
                    case ClaimAccidentCloseLetterTypeEnum.PdPaidCloseLetter:
                        textMessage = $"Claim close - Pd paid close letter - PEV ({personEvent.PersonEventReferenceNumber})";
                        templateType = TemplateTypeEnum.PdPaidCloseLetter;
                        break;
                    case ClaimAccidentCloseLetterTypeEnum.LiabilityNotAccepted:
                        textMessage = $"Claim close - Liability not accepted - PEV ({personEvent.PersonEventReferenceNumber})";
                        templateType = TemplateTypeEnum.LiabilityNotAccepted;
                        shouldRejectLiability = true;
                        break;
                    case ClaimAccidentCloseLetterTypeEnum.InterimReason:
                        textMessage = $"Claim close - Interim reason - PEV ({personEvent.PersonEventReferenceNumber})";
                        templateType = TemplateTypeEnum.InterimReason;
                        break;
                    case ClaimAccidentCloseLetterTypeEnum.Repuadiate:
                        claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Repudiated;
                        textMessage = $"Claim close - reason repudiated - PEV ({personEvent.PersonEventReferenceNumber})";
                        shouldRejectLiability = true;
                        break;
                    default:
                        break; // Early break
                }

                if (shouldRejectLiability)
                {
                    await _claimInvoiceService.RejectTTDLiabilityDecisionNotMade(claim.ClaimId, claim.ClaimStatus, claim.ClaimLiabilityStatus);
                }

                if (personEvent.ClaimAccidentCloseLetterTypeEnum != ClaimAccidentCloseLetterTypeEnum.Repuadiate)
                {
                  _ = Task.Run(() => SendCommunication(personEvent, templateType, textMessage, communicationType, claimClosedSetting));
                }
                
                claim.ClaimStatus = ClaimStatusEnum.Closed;
                claim.ClaimStatusChangeDate = DateTime.Now;
                _claimRepository.Update(claim);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await CreateSystemAddedCommonNotes(personEvent.PersonEventId, $"PEV Notification ({personEvent.PersonEventReferenceNumber}) claim is manually closed");

                return true;
            }
        }

        public async Task<bool> SendZeroPercentClosureLetter(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                string textMessage = $"0% PD claim auto closure letter sent - PEV ({personEvent.PersonEventReferenceNumber})";
                await SendCommunication(personEvent, TemplateTypeEnum.NilPDLetter, textMessage, ClaimCommunicationTypeEnum.NILPdLetter, SystemSettings.ZeroPercentClosureMessage);

                return true;
            }
        }

        public async Task<bool> SendCommunication(PersonEvent personEvent, TemplateTypeEnum templateTypeEnum, string textMessage, ClaimCommunicationTypeEnum claimCommunicationTypeEnum, string smsKey)
        {
            Contract.Requires(personEvent != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimCommunicationMessage = new ClaimCommunicationMessage
                {
                    ClaimCommunicationType = claimCommunicationTypeEnum,
                    PersonEvent = personEvent
                };

                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEvent.PersonEventId);
                var claimReferenceNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = { new SqlParameter("PersonEventId", personEvent.PersonEventId) };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);

                var claimEmail = await GenerateEmailTemplateNotification(claimDetails[0], templateTypeEnum);

                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var employeeContact = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.InsuredLifeId);

                var employerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId);
                var employerContact = employerContacts.Count > 0
                                                    ? employerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() 
                                                    : null;
                var employeePrimaryContact = employeeContact.Count > 0
                                                    ? employeeContact.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() 
                                                    : null;

                if (employerContact != null)
                {
                    claimEmail.EmailAddress = employerContact.EmailAddress;
                }

                await CreateSystemAddedCommonNotes(personEvent.PersonEventId, textMessage);

                if (employeePrimaryContact != null)
                {
                    switch (employeePrimaryContact.CommunicationType)
                    {
                        case CommunicationTypeEnum.Email:
                            await _claimCommunicationService.SendNotification(
                                claimEmail,
                                null,
                                employee,
                                claimReferenceNumber,
                                null,
                                claimCommunicationTypeEnum);
                            break;

                        case CommunicationTypeEnum.SMS:
                            var claimSMS = await GenerateSMS(claimDetails[0], employeePrimaryContact.ContactNumber, templateTypeEnum);
                            var smsMessage = (await _configurationService.GetModuleSetting(smsKey)).Replace("{0}", claimEntity.ClaimReferenceNumber);
                            await _claimCommunicationService.SendNotificationSMS(claimSMS, smsMessage);
                            break;
                    }
                }
                else
                {
                    await _claimCommunicationService.SendNotification(
                         claimEmail,
                         null,
                         null,
                         claimReferenceNumber,
                         employeePrimaryContact,
                         claimCommunicationTypeEnum);
                }
                return true;
            }
        }

        private Task<ClaimEmail> GenerateEmailTemplateNotification(AutoAjudicateClaim autoAjudicateClaim, TemplateTypeEnum templateTypeEnum)
        {
            var tokens = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["{CompanyName}"] = autoAjudicateClaim.CompanyName,
                ["{Address}"] = autoAjudicateClaim.CompanyAddressLine1,
                ["{City/Town}"] = autoAjudicateClaim.CompanyCity,
                ["{PostalCode}"] = autoAjudicateClaim.CompanyPostalCode,
                ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                ["{ClaimNumber}"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                ["{EmployeeName}"] = $"{autoAjudicateClaim.EmployeeFirstName} {autoAjudicateClaim.EmployeeSurname}",
                ["{CompanyNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                ["{IndustryNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                ["{DateOfAccident}"] = autoAjudicateClaim.EventDate.ToString("dd MMM yyyy"),
                ["{Title}"] = autoAjudicateClaim.Title.DisplayAttributeValue(),
                ["{Surname}"] = autoAjudicateClaim.EmployeeSurname
            };

            var claimEmail = new ClaimEmail
            {
                ClaimId = 0,
                EmailAddress = autoAjudicateClaim.EmployeeEmailAddress,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = tokens
            };

            return Task.FromResult(claimEmail);
        }

        private Task<ClaimSMS> GenerateSMS(AutoAjudicateClaim autoAjudicateClaim, string cellNumber, TemplateTypeEnum templateTypeEnum)
        {
            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                }
            };
            return Task.FromResult<ClaimSMS>(claimSMS);
        }

        public async Task<bool> AddClaimHearingAssessment(ClaimHearingAssessment claimHearingAssessment)
        {

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_HearingAssessment>(claimHearingAssessment);

                var result = _claimHearingAssessmentRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }

        }

        public async Task<bool> UpdateClaimHearingAssessment(ClaimHearingAssessment claimHearingAssessment)
        {

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_HearingAssessment>(claimHearingAssessment);

                _claimHearingAssessmentRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<double> CalculateNihlPercentage(int frequency, float lossLeftEar, float lossRightEar)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                //Find out the worst and better hearing loss for Left and Right Ear
                int hlWorse = (int)(Math.Max(lossLeftEar, lossRightEar) / 5);
                int hlBetter = (int)(Math.Min(lossLeftEar, lossRightEar) / 5);

                var result = await _claimNihlLookupRepository.FirstOrDefaultAsync(c => c.Frequency == frequency
                                                        && c.HlWorse == hlWorse && c.HlBetter == hlBetter);
                return result == null ? 0.0 : (double)result.PercentageHl;
            }
        }

        private async Task UpdateClaimStatusAndRouteToPoolWorkFlow(PersonEvent personEvent)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                personEvent.IsStraightThroughProcess = false;
                personEvent.PersonEventStatus = personEvent.PersonEventStatus == PersonEventStatusEnum.Closed ? PersonEventStatusEnum.Open : personEvent.PersonEventStatus;
                
                if (personEvent.Claims?.Count > 0)
                {
                    foreach (var claim in personEvent.Claims)
                    {
                        claim.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
                        claim.ClaimStatus = ClaimStatusEnum.Open;
                        claim.ClaimStatusChangeDate = DateTime.Now;
                    }
                }

                await _eventService.UpdatePersonEvent(personEvent);

                await CreateSystemAddedCommonNotes(personEvent.PersonEventId, "PEV Notification has been opened and routed to wook pool");
            }
        }

        public async Task GenerateClaimsForPolicies(List<Policy> policies, int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEvent = await _eventService.GetPersonEvent(personEventId);

                var _event = await _eventService.GetEvent(personEvent.EventId);
                var count = 0;

                foreach (var policy in policies)
                {
                    var claims = await _claimRepository
                    .Where(p => p.PolicyId == policy.PolicyId)
                    .ToListAsync();

                    var claimEntity = claims.Find(c => c.PersonEventId == personEvent.PersonEventId);

                    count++;

                    if (claimEntity == null)
                    {
                        var claimNumberReference = await GenerateClaimNumber(personEvent, _event.EventDate, count, _event.EventReferenceNumber);
                        if (claimNumberReference.Contains("???") || claimNumberReference.Contains("PEV"))
                        {
                            var newClaimRefNumber = claimNumberReference.Remove(claimNumberReference.Length - 3);
                            claimNumberReference = $"{newClaimRefNumber}" + policy.ProductOption.Code;
                        }

                        claimEntity = new claim_Claim
                        {
                            PersonEventId = personEvent.PersonEventId,
                            ClaimReferenceNumber = claimNumberReference,
                            ClaimStatus = ClaimStatusEnum.ManuallyAcknowledged,
                            PolicyId = policy.PolicyId,
                            ClaimLiabilityStatus = ClaimLiabilityStatusEnum.Pending,
                            ClaimStatusChangeDate = DateTime.Now,
                            IsCancelled = false,
                            IsClosed = false,
                            IsRuleOverridden = false,
                            DisabilityPercentage = 0.0000M,
                            IsDeleted = false,
                            UnderwriterId = 1,
                            InvestigationRequired = (bool)personEvent.IsFatal ? true : false
                        };
                        _claimRepository.Create(claimEntity);
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<bool> UpdateFirstMedicalReportStatus(int personEventId, DocumentStatusEnum documentStatus)
        {
            List<ScanCare.Contracts.Entities.Document> documents = new List<ScanCare.Contracts.Entities.Document>();

            var medicalDocuments = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.ClaimMedicalDocuments, new Dictionary<string, string> { { "FirstMedicalReportId", personEventId.ToString() } });
            var personalDocuments = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.CommonPersonalDocuments, new Dictionary<string, string> { { "PersonalClaimId", personEventId.ToString() } });
            if (personalDocuments != null)
                documents.AddRange(personalDocuments);
            if (medicalDocuments != null)
                documents.AddRange(medicalDocuments);
            if (documents.Count > 0)
            {
                foreach (var document in documents)
                {
                    if (document.Id != 0 && document.DocumentTypeName == DecodeDocumentType(DocumentTypeEnum.FirstMedicalReport))
                    {
                        document.DocumentStatus = (DocumentStatusEnum?)documentStatus;
                        await _documentIndexService.UpdateDocument(document);
                    }
                }
                return true;
            }
            return false;
        }

        public async Task SaveFirstMedicalReport(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingFirstMedicalReport = await GetFirstMedicalReportForm(personEvent.PersonEventId);

                if (personEvent?.FirstMedicalReport != null)
                {
                    var firstMedicalReportForm = await SetMedicalReportFields(personEvent);
                    var firstMedicalReport = await _medicalFormService.AddFirstMedicalReportForm(firstMedicalReportForm);
                    await AddMedicalReportFormWizardDetail(new MedicalReportFormWizardDetail
                    {
                        WorkItemId = 0,
                        PersonEventId = personEvent.PersonEventId,
                        MedicalFormReportType = MedicalFormReportTypeEnum.FirstAccidentMedicalReport,
                        MedicalReportFormId = firstMedicalReport.MedicalReportForm.MedicalReportFormId,
                        DocumentId = firstMedicalReportForm.MedicalReportForm.DocumentId
                    });

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    if (existingFirstMedicalReport == null)
                    {
                        var slaStatusChangeAudit = new SlaStatusChangeAudit
                        {
                            SLAItemType = SLAItemTypeEnum.WorkPoolAcknowledgement,
                            ItemId = personEvent.PersonEventId,
                            EffectiveFrom = DateTimeHelper.SaNow,
                            EffictiveTo = null,
                            Reason = "First medical report was uploaded",
                            Status = "PEV Status: " + personEvent.PersonEventStatus.ToString()
                        };

                        await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                    }
                }
            }
        }

        private async Task AddMedicalReportFormWizardDetail(MedicalReportFormWizardDetail medicalReportFormWizardDetail)
        {
            var medicalReportFormWizardDetailEntity = new claim_MedicalReportFormWizardDetail
            {
                WorkItemId = medicalReportFormWizardDetail.WorkItemId,
                WizardId = medicalReportFormWizardDetail.WizardId != null ? medicalReportFormWizardDetail.WizardId : null,
                MedicalFormReportType = medicalReportFormWizardDetail.MedicalFormReportType != null ? medicalReportFormWizardDetail.MedicalFormReportType : null,
                MedicalReportFormId = medicalReportFormWizardDetail.MedicalReportFormId != null ? medicalReportFormWizardDetail.MedicalReportFormId : null,
                PersonEventId = medicalReportFormWizardDetail.PersonEventId,
                DocumentId = medicalReportFormWizardDetail.DocumentId != null ? medicalReportFormWizardDetail.DocumentId : null,
                CreatedBy = RmaIdentity.Email,
                CreatedDate = DateTime.Now,
                ModifiedBy = RmaIdentity.Email,
                ModifiedDate = DateTime.Now
            };
            _medicalReportFormWizardDetails.Create(medicalReportFormWizardDetailEntity);
        }

        private async Task<bool> CreateDisabiltyToFatalWorkflow(PersonEvent personEvent, List<MedicalIcd10Code> iCD10Codes)
        {
            var fatalDrgId = await _iCD10CodeService.GetICD10DiagnosticGroupByCode(FatalDrg);
            if (iCD10Codes.Count > 0)
            {
                if (iCD10Codes.Any(c => c.Icd10DiagnosticGroupId == fatalDrgId) &&
                    (personEvent.PersonEventStatus != PersonEventStatusEnum.New
                    && personEvent.PersonEventStatus != PersonEventStatusEnum.Submitted))
                {
                    var startWizardRequest = new StartWizardRequest
                    {
                        LinkedItemId = personEvent.PersonEventId,
                        Type = "disability-to-fatal",
                        Data = _serializer.Serialize(personEvent)
                    };

                    await _wizardService.StartWizard(startWizardRequest);
                    return true;
                }
            }
            return true;
        }

        public async Task<bool> CreateDisabiltyToFatalDeathCaptured(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            if (personEvent.PersonEventDeathDetail != null)
            {                
                if (personEvent.PersonEventDeathDetail.DeathType == 0)
                    personEvent.PersonEventDeathDetail.DeathType = DeathTypeEnum.Default;
                await _eventService.UpdatePersonEvent(personEvent);
            }        
            return await Task.FromResult(true);
        }

        public async Task<FirstMedicalReportForm> GetFirstMedicalReportFormByReportType(int personEventId, int reportTypeId)
        {
            return await _medicalFormService.GetFirstMedicalReportByPersonEventIdAndReportType(personEventId, reportTypeId);
        }
    }
}



