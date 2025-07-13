using AutoMapper;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.STP;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

using INoteService = RMA.Service.ClaimCare.Contracts.Interfaces.Claim.INoteService;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimCommunicationFacade : RemotingStatelessService, IClaimCommunicationService
    {
        private readonly ISendEmailService _sendEmailService;
        private readonly ISendSmsService _sendSmsService;
        private readonly IConfigurationService _configurationService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly IEventService _eventService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<claim_DocumentRule> _documentRuleRepository;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly INoteService _noteService;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IEmailService _emailService;
        private readonly IRepository<claim_PersonEventStpExitReason> _personEventStpExitReasons;
        private readonly IAuditWriter _claimAuditWriter;
        private readonly IAuditLogV1Service _auditLogService;
        private readonly IWizardService _wizardService;
        private readonly IDocumentTemplateService _documentTemplateService;
        private readonly IRepository<claim_ClaimAdditionalRequiredDocument> _claimAdditionalRequiredDocumentRepository;
        private readonly IRepository<claim_RuleDocumentType> _ruleDocumentTypeRepository;

        private readonly ISerializerService _serializer;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IClaimRequirementService _claimRequirementService;
        private readonly ICommonSystemNoteService _commonSystemNoteService;

        private string _fromAddress;
        private string _reportserverUrl;
        private string _parameters;
        private bool allowExternalSending;
        private WebHeaderCollection _headerCollection;
        private bool isAuditClaimsProcessedEnabled = false;
        private bool _isSendCommunicationByServiceBusEnabled = false;
        private string _environment;
        private string stpSendTopic;
        private string stpSendConnectionString;
        private string _additionalDocsRequested;


        public ClaimCommunicationFacade(StatelessServiceContext context
            , ISendEmailService sendEmailService
            , ISendSmsService sendSmsService
            , IConfigurationService configurationService
            , IDbContextScopeFactory dbContextScopeFactory
            , IEventService eventService
            , IRolePlayerService rolePlayerService
            , IRepository<claim_DocumentRule> documentRuleRepository
            , IRepository<claim_Claim> claimRepository
            , IDocumentIndexService documentIndexService
            , INoteService noteService
            , IAuditWriter claimAuditWriter
            , IAuditLogV1Service auditLogService
            , IEmailTemplateService emailTemplateService
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_RuleDocumentType> ruleDocumentTypeRepository
            , IRepository<claim_PersonEventStpExitReason> personEventStpExitReasons
            , IEmailService emailService
            , ISerializerService serializer
            , IWizardService wizardService
            , IServiceBusMessage serviceBusMessage
            , IDocumentTemplateService documentTemplateService
            , IClaimRequirementService claimRequirementService
            , ICommonSystemNoteService commonSystemNoteService
            , IRepository<claim_ClaimAdditionalRequiredDocument> claimAdditionalRequiredDocumentRepository) :
            base(context)
        {
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _sendSmsService = sendSmsService;
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailTemplateService = emailTemplateService;
            _eventService = eventService;
            _rolePlayerService = rolePlayerService;
            _documentRuleRepository = documentRuleRepository;
            _documentIndexService = documentIndexService;
            _noteService = noteService;
            _claimRepository = claimRepository;
            _personEventRepository = personEventRepository;
            _ruleDocumentTypeRepository = ruleDocumentTypeRepository;
            _emailService = emailService;
            _personEventStpExitReasons = personEventStpExitReasons;
            _claimAuditWriter = claimAuditWriter;
            _auditLogService = auditLogService;
            _serializer = serializer;
            _serviceBusMessage = serviceBusMessage;
            _wizardService = wizardService;
            _documentTemplateService = documentTemplateService;
            _claimAdditionalRequiredDocumentRepository = claimAdditionalRequiredDocumentRepository;
            _claimRequirementService = claimRequirementService;
            _commonSystemNoteService = commonSystemNoteService;
            Task.Run(() => this.SetupClaimCommunicationVariables()).Wait();
        }

        #region CommonMethods
        private async Task SetupClaimCommunicationVariables()
        {
            _fromAddress = await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportserverUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClaimCare";
            allowExternalSending = (await _configurationService.GetModuleSetting(SystemSettings.AllowExternalCommunication)).ToBoolean(true);
            isAuditClaimsProcessedEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsAuditClaimsProcessedEnabled");
            isAuditClaimsProcessedEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsAuditClaimsProcessedEnabled");
            _isSendCommunicationByServiceBusEnabled = await _configurationService.IsFeatureFlagSettingEnabled(DatabaseConstants.SendCommunicationByServiceBusEnabled);
            _environment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
            stpSendTopic = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendTopic);
            stpSendConnectionString = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendConnectionString);
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

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task<int> AddNoteForFollowUp(PersonEvent personEvent, string message)
        {
            Contract.Requires(personEvent != null);

            return await _commonSystemNoteService.CreateCommonSystemNote(new CommonSystemNote
            {
                ItemId = personEvent.PersonEventId,
                NoteCategory = NoteCategoryEnum.PersonEvent,
                NoteItemType = NoteItemTypeEnum.PersonEvent,
                NoteModules = new List<CommonSystemNoteModule>() { new CommonSystemNoteModule() { ModuleType = ModuleTypeEnum.ClaimCare } },
                NoteType = NoteTypeEnum.SystemAdded,
                Text = message,
                IsActive = true
            });
        }

        private async Task<ClaimEmail> GenerateDocumentDetails(PersonEvent personEvent, RolePlayer company, RolePlayer employee, List<string> documentTypes, TemplateTypeEnum templateType)
        {
            var eventDetails = await _eventService.GetEvent(personEvent.EventId);
            StringBuilder documentList = new StringBuilder();
            foreach (var documentType in documentTypes)
            {
                documentList.Append($@"<li /><p style =""margin-bottom: 0in""><font color = ""#000000"" >{documentType}</font ></p>");
            }
            var email = string.Empty;
            var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails(company.RolePlayerId);
            var contactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
            email = personEvent.CompCarePersonEventId != null ? employee.EmailAddress : contactInformation?.EmailAddress;
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = email,
                PersonEventId = personEvent.PersonEventId,
                TemplateType = templateType,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{company.DisplayName}",
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{EmployeeName}"] = $"{employee.DisplayName}",
                    ["{DateOfAccident}"] = eventDetails?.EventDate.ToString("dd MMM yyyy"),
                    ["{PersonEventNumber}"] = personEvent.Claims != null ? personEvent.Claims.OrderByDescending(a => a.ClaimId).FirstOrDefault()?.ClaimReferenceNumber : personEvent.PersonEventId.ToString(),
                    ["{CompanyNumber}"] = company.Company?.ReferenceNumber,
                    ["{Title}"] = employee.Person.Title.DisplayAttributeValue(),
                    ["{Surname}"] = employee.Person.Surname,
                    ["{documentList}"] = documentList.ToString(),
                }
            };

            if (templateType == TemplateTypeEnum.SecondDocumentsFollowUp || templateType == TemplateTypeEnum.ThirdFinalDocumentsFollowUp)
            {
                claimEmail.Tokens.Add("{ClaimDate}", personEvent.CreatedDate.ToSaDateTime().ToString("dd MMM yyyy"));
                if (templateType == TemplateTypeEnum.SecondDocumentsFollowUp)
                {
                    claimEmail.Tokens.Add("{firstFollowUpDate}", DateTimeHelper.SaNow.AddDays(-7).ToString("dd MMM yyyy"));
                }
                if (templateType == TemplateTypeEnum.ThirdFinalDocumentsFollowUp)
                {
                    claimEmail.Tokens.Add("{firstFollowUpDate}", DateTimeHelper.SaNow.AddDays(-14).ToString("dd MMM yyyy"));

                    claimEmail.Tokens.Add("{secondFollowUpDate}", DateTimeHelper.SaNow.AddDays(-7).ToString("dd MMM yyyy"));
                }
            }
            return claimEmail;
        }

        private async Task<ClaimEmail> GenerateCompCareDocumentDetails(PersonEvent personEvent, RolePlayer company, RolePlayer employee, List<ScanCare.Contracts.Entities.Document> documentTypes, TemplateTypeEnum templateType)
        {
            var eventDetails = await _eventService.GetEvent(personEvent.EventId);
            StringBuilder documentList = new StringBuilder();
            foreach (var documentType in documentTypes)
            {
                documentList.Append($@"<li /><p style =""margin-bottom: 0in""><font color = ""#000000"" >{documentType.DocumentTypeName}</font ></p>");
            }

            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = company.EmailAddress,
                PersonEventId = personEvent.PersonEventId,
                TemplateType = templateType,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{company.DisplayName}",
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{EmployeeName}"] = $"{employee.DisplayName}",
                    ["{DateOfAccident}"] = eventDetails?.EventDate.ToString("dd MMM yyyy"),
                    ["{PersonEventNumber}"] = personEvent.Claims != null ? personEvent.Claims.OrderByDescending(a => a.ClaimId).FirstOrDefault()?.ClaimReferenceNumber : personEvent.PersonEventId.ToString(),
                    ["{CompanyNumber}"] = company.Company?.ReferenceNumber,
                    ["{Title}"] = employee.Person.Title.DisplayAttributeValue(),
                    ["{Surname}"] = employee.Person.Surname,
                    ["{documentList}"] = documentList.ToString(),
                }
            };

            if (templateType == TemplateTypeEnum.SecondDocumentsFollowUp || templateType == TemplateTypeEnum.ThirdFinalDocumentsFollowUp)
            {
                claimEmail.Tokens.Add("{ClaimDate}", personEvent.CreatedDate.ToSaDateTime().ToString("dd MMM yyyy"));
                if (templateType == TemplateTypeEnum.SecondDocumentsFollowUp)
                {
                    claimEmail.Tokens.Add("{firstFollowUpDate}", DateTimeHelper.SaNow.AddDays(-7).ToString("dd MMM yyyy"));
                }
                if (templateType == TemplateTypeEnum.ThirdFinalDocumentsFollowUp)
                {
                    claimEmail.Tokens.Add("{firstFollowUpDate}", DateTimeHelper.SaNow.AddDays(-14).ToString("dd MMM yyyy"));

                    claimEmail.Tokens.Add("{secondFollowUpDate}", DateTimeHelper.SaNow.AddDays(-7).ToString("dd MMM yyyy"));
                }
            }
            return claimEmail;
        }

        private async Task<bool> CheckIfCompCareClaimIsStillSTP(int CompCarePersonEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                new SqlParameter("CompCarePersonEventId", CompCarePersonEventId),
                };
                var isSTP = await _claimRepository.SqlQueryAsync<bool>(DatabaseConstants.CheckIfCompCareClaimIsStillSTP, parameters);
                return isSTP.FirstOrDefault();
            }
        }

        private int DayCount(DateTime createDate, DateTime todaysDate)
        {
            return (todaysDate.Date - createDate.Date).Days;
        }

        private string GetDocumentNames(List<ScanCare.Contracts.Entities.Document> documentsNotReceieved)
        {
            var documentNames = new List<string>();
            if (documentsNotReceieved != null)
            {
                foreach (var item in documentsNotReceieved)
                {
                    var name = item.DocumentTypeName ?? item.DocumentDescription;
                    if (!documentNames.Contains(name))
                    {
                        documentNames.Add(name);
                    }
                }
            }
            if (documentNames?.Any() == true)
            {
                return string.Join(",", new List<string>(documentNames).ToArray());
            }
            else
            {
                return "";
            }
        }

        private async Task<string> GetCompCareRequiredDocuments(PersonEvent personEvent)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var documentNames = "";
                    var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                    var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);
                    if (employee != null)
                    {
                        SqlParameter[] parameters = {
                                    new SqlParameter("CompcareClaimNumber", personEvent.CompCarePevRefNumber),
                                    new SqlParameter("IdNumber", employee.Person.IdNumber)

                                };
                        var documentsNotReceieved = await _claimRepository.SqlQueryAsync<ScanCare.Contracts.Entities.Document>(DatabaseConstants.GetCompCareDocumentsNotUploaded, parameters);
                        if (documentsNotReceieved.Count > 0)
                        {
                            documentNames = GetDocumentNames(documentsNotReceieved);
                        }
                    }
                    return documentNames;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error on when CompCare required documents: {ex.Message}");
                return "";
            }

        }

        private async Task<string> GetOutstandingRequirements(int personEventId)
        {
            var personEventClaimRequirements = await _claimRequirementService.GetPersonEventRequirements(personEventId);

            if (personEventClaimRequirements?.Count > 0)
            {
                var outstandingRequirementsBuilder = new StringBuilder();

                foreach (var personEventClaimRequirement in personEventClaimRequirements)
                {
                    if (personEventClaimRequirement.DateClosed == null)
                    {
                        if (outstandingRequirementsBuilder.Length > 0)
                        {
                            outstandingRequirementsBuilder.Append(',');
                        }
                        outstandingRequirementsBuilder.Append(personEventClaimRequirement.Instruction);
                    }
                }

                return outstandingRequirementsBuilder.ToString();
            }

            return string.Empty;
        }

        public async Task UpdateClaimStatus(PersonEvent personEvent)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var claims = await _claimRepository.Where(x => x.PersonEventId == personEvent.PersonEventId).ToListAsync();
                foreach (var claim in claims)
                {
                    var result = Mapper.Map<claim_Claim>(claim);
                    result.ClaimStatus = ClaimStatusEnum.Closed;
                    result.ClaimLiabilityStatus = ClaimLiabilityStatusEnum.OutstandingRequirements;
                    result.ClaimStatusChangeDate = DateTimeHelper.SaNow;
                    result.IsClosed = true;
                    _claimRepository.Update(result);
                    AddAuditEntry(claim, false, null);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
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

        public async Task<ClaimEmail> GenerateClaimClosingLetter(AutoAjudicateClaim autoAjudicateClaim, TemplateTypeEnum templateType)
        {
            var claimEmail = new ClaimEmail();
            try
            {
                claimEmail.ClaimId = 0;
                claimEmail.EmailAddress = autoAjudicateClaim.EmployeeEmailAddress;
                claimEmail.PersonEventId = autoAjudicateClaim.PersonEventId;
                claimEmail.TemplateType = templateType;
                claimEmail.Tokens = new Dictionary<string, string>
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
                    ["{Surname}"] = autoAjudicateClaim.EmployeeSurname
                };

                return await Task.FromResult(claimEmail);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error on generate claim closing letter: {ex.Message}");
                return claimEmail;
            }
        }

        #endregion

        #region AccidentNotificationReceipt

        public async Task<int> SendAccidentClaimEmailAndSMS(PersonEvent personEvent, ClaimEmail claimEmail, ClaimSMS claimSMS, bool isNotificationOnly)
        {
            Contract.Requires(claimEmail != null);
            if (_isSendCommunicationByServiceBusEnabled)
            {
                await PublishCommunicationNotification(new ClaimCommunicationMessage()
                {
                    ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationReceipt,
                    ClaimEmployerEmail = claimEmail,
                    EmployeeClaimSMS = claimSMS,
                    IsNotificationOnly = isNotificationOnly,
                    PersonEvent = personEvent
                });
                return 1;
            }

            return 0;
        }

        private async Task<int> SendNotificationReceiptAccidentClaimEmail(ClaimEmail claimEmail, bool isNotificationOnly, PersonEvent personEvent)
        {
            Contract.Requires(claimEmail != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                var isDuplicateCheckEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsDuplicateCheckEnabled");
                bool emailSent;
                if (isDuplicateCheckEnabled)
                {
                    emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), $"{personEvent.PersonEventReferenceNumber} - Notification of Receipt", claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                    if (emailSent) return await Task.FromResult(0);
                }


                if (isAuditClaimsProcessedEnabled)
                {
                    await AddTracingNotes(claimEmail.PersonEventId, $"Email not sent - SendAccidentClaimEmail - {System.Environment.MachineName}", ItemTypeEnum.PersonEvent);
                }
                string requiredDocuments = "";
                if (string.IsNullOrEmpty(personEvent.CompCarePevRefNumber))
                {
                    // requiredDocuments = await GetRequiredDocuments(claimEmail.PersonEventId);
                    requiredDocuments = await GetOutstandingRequirements(claimEmail.PersonEventId);
                }
                else
                {
                    requiredDocuments = await GetCompCareRequiredDocuments(personEvent);
                }
                _parameters = $"&personEventId={claimEmail.PersonEventId}&requiredDocuments={requiredDocuments}&rs:Command=ClearSession";

                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };
                var emailBody = await _configurationService.GetModuleSetting(SystemSettings.DocumentsFollowUpBody);

                byte[] notificationReceiptLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/NotificationReceiptLetter{_parameters}&rs:Format=PDF"), _headerCollection);

                var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = notificationReceiptLetter, FileName = "Notification of Receipt.pdf", FileType = "application/pdf"}
                };

                if (isNotificationOnly || string.IsNullOrEmpty(requiredDocuments))
                {
                    claimEmail.TemplateType = TemplateTypeEnum.NotificationofReceipt;
                }
                else if (!isNotificationOnly && !string.IsNullOrEmpty(requiredDocuments))
                {
                    byte[] requestForInformation = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RequestForInformation{_parameters}&rs:Format=PDF"), _headerCollection);
                    if (requestForInformation != null)
                    {
                        attachments.Add(new MailAttachment { AttachmentByteData = requestForInformation, FileName = "Request for Information.pdf", FileType = "application/pdf" });
                    }
                    claimEmail.TemplateType = TemplateTypeEnum.AcknowledgmentforFurtherInformation;
                }

                var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);

                return await _sendEmailService.SendEmail(new SendMailRequest
                {

                    ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                    ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims,
                    BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                    FromAddress = _fromAddress,
                    Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                    RecipientsCC = null,
                    Subject = $"{personEvent.PersonEventReferenceNumber} - Notification of Receipt",
                    Body = template.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });

            }

        }

        private async Task<int> SendNotificationTTDRejectEmail(ClaimCommunicationMessage claimCommunicationMessage, string subject, string fileName)
        {
            ClaimEmail claimEmail = claimCommunicationMessage.ClaimEmployerEmail;
            Contract.Requires(claimEmail != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                var emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), $"{claimEmail.PersonEventId} - {subject}", claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                if (emailSent) return await Task.FromResult(0);

                if (isAuditClaimsProcessedEnabled)
                {
                    await AddTracingNotes(claimEmail.PersonEventId, $"Email sending - {subject} - {System.Environment.MachineName}", ItemTypeEnum.PersonEvent);
                }

             
                _parameters = $"&personEventId={claimEmail.PersonEventId}&ClaimInvoiceId={claimCommunicationMessage.PersonEvent.ClaimInvoiceId}&rs:Command=ClearSession";
                var environment = await _configurationService.GetModuleSetting("Environment");
                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };

                byte[] notificationReceiptLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{fileName}{_parameters}&rs:Format=PDF"), _headerCollection);

                var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = notificationReceiptLetter, FileName =  fileName + ".pdf", FileType = "application/pdf"}
                };

                var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);
                return await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                    ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims,
                    BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                    FromAddress = _fromAddress,
                    Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                    RecipientsCC = null,
                    Subject = $"{claimEmail.PersonEventId} - {subject}",
                    Body = template.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }

        }

        private async Task SendTTDRejectFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    {
                        var result = await SendNotificationTTDRejectEmail(claimCommunicationMessage, SystemSettings.TTDRejectSubject, SystemSettings.TTDRejectFileName);
                    }
                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    {
                        var result = await SendNotificationAcknowledgementSMS(claimCommunicationMessage.EmployeeClaimSMS, claimCommunicationMessage.Employee.DisplayName, claimCommunicationMessage.ClaimNumber);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on send TTD reject letter: {ex.Message}");
                }
            }
        }

        private async Task SendLiabilityAcceptanceFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    {
                        var result = await SendCommunicationEmail(claimCommunicationMessage.ClaimEmployerEmail, SystemSettings.LiabiltyAcceptanceSubject, SystemSettings.LiabilityAcceptanceFileName);
                    }
                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                    {
                        var result = await SendCommunicationEmail(claimCommunicationMessage.EmployeeClaimEmail, SystemSettings.LiabiltyAcceptanceSubject, SystemSettings.LiabilityAcceptanceFileName);
                    }
                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    {
                        var result = await SendNotificationAcknowledgementSMS(claimCommunicationMessage.EmployeeClaimSMS, claimCommunicationMessage.Employee.DisplayName, claimCommunicationMessage.ClaimNumber);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on send liability acceptance: {ex.Message}");
                }
            }
        }

        private async Task SendClaimRecaptureEarningsFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var result = await SendCommunicationEmail(claimCommunicationMessage.ClaimEmployerEmail, SystemSettings.ClaimRecaptureSubject, SystemSettings.ClaimRecaptureEarningsFileName);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on sending claim recpature earnings: {ex.Message}");
                }
            }
        }

        private async Task SendClaimCloseNotificationFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var result = await SendCommunicationEmail(claimCommunicationMessage.ClaimEmployerEmail, SystemSettings.ClaimClosedSubject, SystemSettings.ClaimClosedFileName);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on sending claim closed: {ex.Message}");
                }
            }
        }

        private async Task SendPDPaidCloseLetterFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var result = await SendCommunicationEmail(claimCommunicationMessage.ClaimEmployerEmail, SystemSettings.PdPaidCloseLetterSubject, SystemSettings.PdPaidCloseLetterFileName);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on sending PD Paid Close Letter: {ex.Message}");
                }
            }
        }

        private async Task SendPDApprovedLetterFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var result = await SendCommunicationEmail(claimCommunicationMessage.ClaimEmployerEmail, SystemSettings.PdApprovedSubject, SystemSettings.PdApprovedFileName);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on sending PD Approved Letter: {ex.Message}");
                }
            }
        }

        private async Task SendNILPdLetterFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                try
                {
                    var result = await SendCommunicationEmail(claimCommunicationMessage.ClaimEmployerEmail, SystemSettings.ClaimClosedNilPDSubject, SystemSettings.ClaimClosedNilPDFileName);
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on sending PD NIL Letter: {ex.Message}");
                }
            }
        }

        private async Task<int> SendCommunicationEmail(ClaimEmail claimEmail, string subject, string fileName)
        {
            Contract.Requires(claimEmail != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                var emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), $"{claimEmail.PersonEventId} - {subject}", claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                if (emailSent) return await Task.FromResult(0);

                if (isAuditClaimsProcessedEnabled)
                {
                    await AddTracingNotes(claimEmail.PersonEventId, $"Email sending - {subject} - {System.Environment.MachineName}", ItemTypeEnum.PersonEvent);
                }

                var requiredDocuments = string.Empty;
                _parameters = $"&personEventId={claimEmail.PersonEventId}&rs:Command=ClearSession";
                var environment = await _configurationService.GetModuleSetting("Environment");
                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };

                byte[] notificationReceiptLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{fileName}{_parameters}&rs:Format=PDF"), _headerCollection);

                var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = notificationReceiptLetter, FileName =  fileName + ".pdf", FileType = "application/pdf"}
                };

                var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);
                return await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                    ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims,
                    BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                    FromAddress = _fromAddress,
                    Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                    RecipientsCC = null,
                    Subject = $"{claimEmail.PersonEventId} - {subject}",
                    Body = template.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
        }

        public async Task<int> SendNotificationReceiptAccidentClaimSMS(ClaimSMS claimSMS)
        {
            Contract.Requires(claimSMS != null);
            var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.AccidentAcknowledgeSMS));

            foreach (var token in claimSMS.Tokens)
            {
                smsMessage = smsMessage.Replace("{0}", token.Value);
            }
            var IsSmsSent = await _sendSmsService.SmsAlreadySent(claimSMS.PersonEventId, nameof(PersonEvent), smsMessage, claimSMS.MobileNumber);
            if (IsSmsSent)
                return await Task.FromResult(0);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimAccidentReporting,
                SmsNumbers = new List<string> { claimSMS.MobileNumber },
                Message = smsMessage,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = claimSMS.PersonEventId != 0 ? claimSMS.PersonEventId : claimSMS.ClaimId,
                ItemType = claimSMS.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };
            return await _sendSmsService.SendSmsMessage(smsRequest);
        }

        private async Task SendNotificationReceiptFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                try
                {
                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    {
                        await SendNotificationReceiptAccidentClaimEmail(claimCommunicationMessage.ClaimEmployerEmail, claimCommunicationMessage.IsNotificationOnly, claimCommunicationMessage.PersonEvent);
                    }
                    if (claimCommunicationMessage.ClaimEmployerSMS != null)
                    {
                        await SendNotificationReceiptAccidentClaimSMS(claimCommunicationMessage.ClaimEmployerSMS);
                    }

                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                    {
                        await SendNotificationReceiptAccidentClaimEmail(claimCommunicationMessage.EmployeeClaimEmail, claimCommunicationMessage.IsNotificationOnly, claimCommunicationMessage.PersonEvent);
                    }
                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    {
                        await SendNotificationReceiptAccidentClaimSMS(claimCommunicationMessage.EmployeeClaimSMS);
                    }

                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on send notification acknowledgement: {ex.Message}");
                }
            }
        }
        #endregion

        #region DiseaseNotificationReceipt
        public async Task<int> SendDiseaseClaimEmail(ClaimEmail claimEmail)
        {
            Contract.Requires(claimEmail != null);

            var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);
            var allowExternalSending = (await _configurationService.GetModuleSetting(SystemSettings.AllowExternalCommunication)).ToBoolean(true);
            var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);

            return await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                FromAddress = _fromAddress,
                Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                RecipientsCC = null,
                Subject = claimEmail.TemplateType == TemplateTypeEnum.DiseaseAcknowledged ? $"{claimEmail.PersonEventId} - Disease Acknowledged" : $"{claimEmail.PersonEventId} - Disease Not Acknowledged",
                Body = template.Content,
                IsHtml = true,
                Attachments = null
            });
        }

        public async Task<int> SendDiseaseClaimSMS(ClaimSMS claimSMS)
        {
            Contract.Requires(claimSMS != null);

            var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.DiseaseAcknowledgeSMS));
            foreach (var token in claimSMS.Tokens)
            {
                smsMessage = smsMessage.Replace("{0}", token.Value);
            }
            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimDiseaseNotification,
                SmsNumbers = new List<string> { claimSMS.MobileNumber },
                Message = smsMessage,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = claimSMS.PersonEventId != 0 ? claimSMS.PersonEventId : claimSMS.ClaimId,
                ItemType = claimSMS.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };

            return await _sendSmsService.SendSmsMessage(smsRequest);
        }
        #endregion

        #region DocumentsFollowUp
        public async Task SendDocumentsFollowUpSMS(PersonEvent personEvent, RolePlayer employee, int daysCount)
        {
            Contract.Requires(personEvent != null);
            Contract.Requires(employee != null);
            if (_isSendCommunicationByServiceBusEnabled)
            {

                await PublishCommunicationNotification(new ClaimCommunicationMessage()
                {
                    ClaimCommunicationType = ClaimCommunicationTypeEnum.DocumentsFollowUp,
                    Employee = employee,
                    PersonEvent = personEvent,
                    DayCount = daysCount
                });
                return;
            }
        }

        private async Task SendDocumentsFollowUpSMSQueue(PersonEvent personEvent, RolePlayer employee, int daysCount, ClaimSMS claimSMS)
        {
            Contract.Requires(personEvent != null);
            Contract.Requires(employee != null);
            var requirementsOutstandingSMS = (await _configurationService.GetModuleSetting(SystemSettings.RequirementsOutstandingSMS));
            requirementsOutstandingSMS = requirementsOutstandingSMS.Replace("{0}", employee.DisplayName);
            var followUpSMS = (await _configurationService.GetModuleSetting(SystemSettings.FollowUpSMS));
            followUpSMS = followUpSMS.Replace("{0}", employee.DisplayName);

            switch (daysCount)
            {
                case 7:
                    followUpSMS = "First follow up, " + followUpSMS;
                    break;
                case 14:
                    followUpSMS = "Second follow up, " + followUpSMS;
                    break;
                case 21:
                    followUpSMS = "Third follow up, " + followUpSMS;
                    break;
                case 28:
                    followUpSMS = "Notification, " + followUpSMS;
                    break;
            }

            var messageToSend = daysCount == 30 ? requirementsOutstandingSMS : followUpSMS;

            var isSmsSent = await _sendSmsService.SmsAlreadySent(personEvent.PersonEventId, nameof(PersonEvent), messageToSend, claimSMS.MobileNumber);

            if (isSmsSent) return;

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimDocumentsFollowUp,
                SmsNumbers = new List<string> { claimSMS.MobileNumber },
                Message = messageToSend,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = personEvent.PersonEventId,
                ItemType = personEvent.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);

        }

        private async Task SendCompCareDocumentsFollowUpSMSQueue(PersonEvent personEvent, RolePlayer employee, int daysCount)
        {
            Contract.Requires(personEvent != null);
            Contract.Requires(employee != null);
            var requirementsOutstandingSMS = (await _configurationService.GetModuleSetting(SystemSettings.RequirementsOutstandingSMS));
            requirementsOutstandingSMS = requirementsOutstandingSMS.Replace("{0}", employee.DisplayName);
            var followUpSMS = (await _configurationService.GetModuleSetting(SystemSettings.FollowUpSMS));
            followUpSMS = followUpSMS.Replace("{0}", employee.DisplayName);

            switch (daysCount)
            {
                case 7:
                    followUpSMS = "First follow up, " + followUpSMS;
                    break;
                case 14:
                    followUpSMS = "Second follow up, " + followUpSMS;
                    break;
                case 21:
                    followUpSMS = "Third follow up, " + followUpSMS;
                    break;
                case 28:
                    followUpSMS = "Notification, " + followUpSMS;
                    break;
            }

            var messageToSend = daysCount == 30 ? requirementsOutstandingSMS : followUpSMS;

            var isSmsSent = await _sendSmsService.SmsAlreadySent(personEvent.PersonEventId, nameof(PersonEvent), messageToSend, employee.CellNumber);

            if (isSmsSent) return;

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimDocumentsFollowUp,
                SmsNumbers = new List<string> { employee.CellNumber },
                Message = messageToSend,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = personEvent.PersonEventId,
                ItemType = personEvent.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);

        }

        public async Task SendDocumentsFollowUpEmail(ClaimEmail claimEmail, int daysCount, string requiredDocuments, PersonEvent personEvent)
        {
            Contract.Requires(claimEmail != null);

            if (_isSendCommunicationByServiceBusEnabled)
            {

                await PublishCommunicationNotification(new ClaimCommunicationMessage()
                {
                    ClaimCommunicationType = ClaimCommunicationTypeEnum.DocumentsFollowUp,
                    ClaimEmployerEmail = claimEmail,
                    RequiredDocuments = requiredDocuments,
                    DayCount = daysCount,
                    PersonEvent = personEvent
                });
                return;
            }
            await SendDocumentsFollowUpEmailQueue(claimEmail, daysCount, requiredDocuments);

        }

        public async Task SendCompCareDocumentsFollowUpEmailAndSMS(ClaimEmail claimEmail, string requiredDocuments, PersonEvent personEvent, RolePlayer employee, int daysCount)
        {
            Contract.Requires(personEvent != null);
            Contract.Requires(employee != null);
            if (_isSendCommunicationByServiceBusEnabled)
            {

                await PublishCommunicationNotification(new ClaimCommunicationMessage()
                {
                    ClaimCommunicationType = ClaimCommunicationTypeEnum.DocumentsFollowUp,
                    Employee = employee,
                    PersonEvent = personEvent,
                    DayCount = daysCount,
                    ClaimEmployerEmail = claimEmail,
                    RequiredDocuments = requiredDocuments,
                });
                return;
            }
            // await SendDocumentsFollowUpSMSQueue(personEvent, employee, daysCount);
        }

        private async Task SendDocumentsFollowUpEmailQueue(ClaimEmail claimEmail, int daysCount, string requiredDocuments, bool isAdditionaDocumentRequest = false)
        {
            Contract.Requires(claimEmail != null);

            _parameters = $"&personEventId={claimEmail.PersonEventId}&requiredDocuments={requiredDocuments}&rs:Command=ClearSession";
            var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };
            var reportUrl = string.Empty;
            var messageSubject = string.Empty;
            var fileName = string.Empty;

            switch (daysCount)
            {
                case 7:
                    reportUrl = "FirstDocumentsFollowUp";
                    fileName = "FirstDocumentsFollowUp";
                    messageSubject = "First Documents Follow Up";
                    claimEmail.TemplateType = TemplateTypeEnum.FirstDocumentsFollowUp;
                    break;
                case 14:
                    reportUrl = "SecondDocumentsFollowUp";
                    fileName = "SecondDocumentsFollowUp";
                    messageSubject = "Second Documents Follow Up";
                    claimEmail.TemplateType = TemplateTypeEnum.SecondDocumentsFollowUp;

                    break;
                case 21:
                    reportUrl = "ThirdDocumentsFollowUp";
                    fileName = isAdditionaDocumentRequest ? "Request for additional information" : "ThirdDocumentsFollowUp";
                    messageSubject = isAdditionaDocumentRequest ? "Request for additional information" : "Third Documents Follow Up";
                    claimEmail.TemplateType = TemplateTypeEnum.ThirdFinalDocumentsFollowUp;

                    break;
                case 30:
                    reportUrl = "ClosingOnFollowUp";
                    fileName = "ClosingOnFollowUp";
                    messageSubject = "Claim Close: Section 40";
                    claimEmail.TemplateType = TemplateTypeEnum.ClosingLetterFollowUp;

                    break;
            }
            var isDuplicateCheckEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsDuplicateCheckEnabled");
            bool emailSent;
            if (isDuplicateCheckEnabled)
            {
                emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), claimEmail.PersonEventId.ToString() + " - " + messageSubject, claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                if (emailSent) return;
            }
            var reportUrl_ = $"{_reportserverUrl}/{reportUrl}{_parameters}";

            byte[] followUpLetter = await GetUriDocumentByteData(new Uri($"{reportUrl_}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = followUpLetter, FileName = $"{fileName}.pdf", FileType = "application/pdf"},
            };

            var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimDocumentsFollowUp,
                FromAddress = _fromAddress,
                Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                RecipientsCC = null,
                Subject = claimEmail.PersonEventId.ToString() + " - " + messageSubject,
                Body = template.Content,
                IsHtml = true,
                Attachments = attachments.ToArray()
            }); ;


        }

        public async Task SendFollowUpsForDocumentsRequired()
        {
            try
            {
                //We will create separate scheduler for internal claims created in modernization -20230303
                //await SendFollowUpsForInternalNotifications(); We will create separate scheduler for internal claims created in modernization
                await SendFollowUpsForCompCareNotifications();
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when processing documents followups: {ex.Message}");
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

        public async Task SendFollowUpsForCompCareNotifications()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEvents = await _eventService.GetCompCarePersonEventsForFollowUps();
                foreach (var personEvent in personEvents)
                {
                    try
                    {
                        var isSTP = await CheckIfCompCareClaimIsStillSTP((int)personEvent.CompCarePersonEventId);
                        if (isSTP)
                        {
                            var documentsNotReceieved = new List<ScanCare.Contracts.Entities.Document>();
                            var key = new Dictionary<string, string>
                            {
                                { "PersonEvent", personEvent.PersonEventId.ToString() }
                            };
                            if (personEvent.InsuredLifeId > 0)
                            {
                                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                                var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);
                                if (employee != null)
                                {
                                    SqlParameter[] parameters = {
                                    new SqlParameter("CompcareClaimNumber", personEvent.CompCarePevRefNumber),
                                    new SqlParameter("IdNumber", employee.Person.IdNumber)

                                };
                                    documentsNotReceieved = await _claimRepository.SqlQueryAsync<ScanCare.Contracts.Entities.Document>(DatabaseConstants.GetCompCareDocumentsNotUploaded, parameters);

                                    var daycount = DayCount(personEvent.CreatedDate, DateTimeHelper.SaNow);
                                    if (documentsNotReceieved.Count != 0)
                                    {
                                        string note = string.Empty;
                                        bool noteAdded = false;
                                        switch (daycount)
                                        {
                                            case 7:
                                                note = "First Follow up notification for required documents";
                                                noteAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, note);
                                                await SendCompCareFollowUpCommunication(personEvent, company, employee, documentsNotReceieved, TemplateTypeEnum.FirstDocumentsFollowUp, noteAdded, daycount, note);
                                                break;
                                            case 14:
                                                note = "Second Follow up notification for required documents";
                                                noteAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, note);
                                                await SendCompCareFollowUpCommunication(personEvent, company, employee, documentsNotReceieved, TemplateTypeEnum.SecondDocumentsFollowUp, noteAdded, daycount, note);
                                                break;
                                            case 21:
                                                note = "Third Follow up notification for required documents";
                                                noteAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, note);
                                                await SendCompCareFollowUpCommunication(personEvent, company, employee, documentsNotReceieved, TemplateTypeEnum.ThirdFinalDocumentsFollowUp, noteAdded, daycount, note);
                                                break;
                                            case 30:
                                                note = "Requirements still outstanding, the claim is now closed due to non-compliant/section 40";
                                                noteAdded = await _commonSystemNoteService.CheckIfCommonNoteHasBeenAdded(personEvent.PersonEventId, note);
                                                await SendCompCareFollowUpCommunication(personEvent, company, employee, documentsNotReceieved, TemplateTypeEnum.ClosingLetterFollowUp, noteAdded, daycount, note);
                                                break;
                                        }
                                    }
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
        }

        public async Task SendFollowUpCommunication(PersonEvent personEvent, RolePlayer company, RolePlayer employee, List<string> requiredDocumentsList, TemplateTypeEnum templateType, bool noteAdded, int dayCount, string note)
        {
            Contract.Requires(personEvent != null);

            if (!noteAdded)
            {
                var claimCommunicationMessage = await GetContactDetailsForEmployeeAndEmployer(personEvent.PersonEventId, ClaimCommunicationTypeEnum.DocumentsFollowUp);
                var requiredDocuments = string.Join(",", new List<string>(requiredDocumentsList).ToArray());
                var claimEmail = await GenerateDocumentDetails(personEvent, company, employee, requiredDocumentsList, templateType);

                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                {
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.ClaimEmployerEmail.TemplateType = claimEmail.TemplateType;
                }

                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                {
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.EmployeeClaimEmail.TemplateType = claimEmail.TemplateType;
                }

                claimCommunicationMessage.PersonEvent = personEvent;
                claimCommunicationMessage.DayCount = dayCount;
                claimCommunicationMessage.RequiredDocuments = requiredDocuments;
                claimCommunicationMessage.Employee = employee;

                _ = Task.Run(() => PublishCommunicationNotification(claimCommunicationMessage));

                await AddNoteForFollowUp(personEvent, note);
            }
        }

        private async Task SendCompCareFollowUpCommunication(PersonEvent personEvent, RolePlayer company, RolePlayer employee, List<ScanCare.Contracts.Entities.Document> documentsNotReceieved, TemplateTypeEnum templateType, bool noteAdded, int dayCount, string note)
        {
            if (!noteAdded)
            {
                var isCompCareFollowUpMessagesEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsCompCareFollowUpMessagesEnabled");
                var requiredDocuments = GetDocumentNames(documentsNotReceieved);
                var claimEmail = await GenerateCompCareDocumentDetails(personEvent, company, employee, documentsNotReceieved, templateType);
                if (isAuditClaimsProcessedEnabled)
                {
                    await AddTracingNotes(claimEmail.PersonEventId, $"Follow up communication for {dayCount} - SendCompCareFollowUpCommunication - {System.Environment.MachineName}", ItemTypeEnum.PersonEvent);
                }

                var followUpSMS = (await _configurationService.GetModuleSetting(dayCount == 30 ? SystemSettings.RequirementsOutstandingSMS : SystemSettings.FollowUpSMS));
                followUpSMS = followUpSMS.Replace("{0}", employee.DisplayName);
                await SendCompCareDocumentsFollowUpEmailAndSMS(claimEmail, requiredDocuments, personEvent, employee, dayCount);
                if (dayCount == 30)
                {
                    await UpdateClaimStatus(personEvent);
                }

                await AddNoteForFollowUp(personEvent, note);
                if (isCompCareFollowUpMessagesEnabled)
                {
                    await SendIntegrationMessageToCompCare(personEvent, dayCount, note, employee);
                }
            }
        }

        private async Task SendIntegrationMessageToCompCare(PersonEvent personEvent, int dayCount, string note, RolePlayer employee)
        {
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    if (personEvent.CompCarePersonEventId != 0 && !string.IsNullOrWhiteSpace(personEvent.CompCareIntegrationMessageId))
                    {
                        var stpIntegrationBody = new STPIntegrationBody()
                        {
                            PersonEventId = personEvent.CompCarePersonEventId.Value,
                            IDVOPDValidated = employee.Person.IsVopdVerified,
                            ReSubmitVOPD = false,
                            STPExitReasonId = dayCount,
                            STPExitReason = note,
                            SuspiciousTransactionStatusID = personEvent.SuspiciousTransactionStatus == SuspiciousTransactionStatusEnum.NotSuspicious ? 2 : 1
                        };
                        var messageBody = _serializer.Serialize(stpIntegrationBody);

                        var messageType = new MessageType
                        {
                            MessageBody = messageBody,
                            From = ClaimConstants.MessageFrom,
                            To = ClaimConstants.MessageTo,
                            MessageTaskType = ClaimConstants.MessageTaskType003,
                            Environment = _environment,
                            CorrelationID = personEvent.CompCareIntegrationMessageId,
                            EnqueuedTime = DateTime.UtcNow,
                        };

                        var messageProperties = new Dictionary<string, string>
                        {
                            ["MessageTo"] = messageType.To,
                            ["MessageFrom"] = messageType.From,
                            ["Environment"] = messageType.Environment,
                            ["MessageTaskType"] = messageType.MessageTaskType,
                        };
                        if (!await _serviceBusMessage.CheckIfMessageHasBeenSentByMesageBody(personEvent.CompCarePersonEventId.Value, messageType.To, messageType.From, messageType.CorrelationID, messageType.MessageBody))
                        {
                            var producer = new ServiceBusTopicProducer<MessageType>(stpSendTopic, stpSendConnectionString);
                            await producer.PublishMessageAsync(messageType, null, messageProperties);
                            await _serviceBusMessage.AddServiceBusMessage(messageType);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error sending message to CompCare - Error Message {ex.Message}");
            }

        }

        #endregion

        #region NotificationClosedComms
        public async Task<int> SendClosingLetterForNotificationsOnly(ClaimEmail claimEmail)
        {
            try
            {
                Contract.Requires(claimEmail != null);
                var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);
                var isDuplicateCheckEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsDuplicateCheckEnabled");
                bool emailSent;
                if (isDuplicateCheckEnabled)
                {
                    emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), $"{claimEmail.PersonEventId} - Claim Closed", claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                    if (emailSent) return await Task.FromResult(0);
                }

                _parameters = $"&personEventId={claimEmail.PersonEventId}&rs:Command=ClearSession";

                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };

                byte[] claimClosedLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/ClaimClosedLetter{_parameters}&rs:Format=PDF"), _headerCollection);

                var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = claimClosedLetter, FileName = "Claim Closed Letter.pdf", FileType = "application/pdf"}
                };

                return await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                    ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims,
                    BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                    FromAddress = _fromAddress,
                    Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                    RecipientsCC = null,
                    Subject = $"{claimEmail.PersonEventId} - Claim Closed",
                    Body = template.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
            catch (Exception ex)
            {
                ex.LogException($"Error on send closing letter for notification only: {ex.Message}");
                return 0;
            }
        }

        private async Task<int> SendNotificationClosedSMS(ClaimSMS claimSMS, string contactName)
        {
            Contract.Requires(claimSMS != null);

            var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.NotificationClosedSMS));
            smsMessage = smsMessage.Replace("{0}", contactName);
            var isSmsSent = await _sendSmsService.SmsAlreadySent(claimSMS.PersonEventId, nameof(PersonEvent), smsMessage, claimSMS.MobileNumber);

            if (isSmsSent) await Task.FromResult(0);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimAccidentReporting,
                SmsNumbers = new List<string> { claimSMS.MobileNumber },
                Message = smsMessage,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = claimSMS.PersonEventId != 0 ? claimSMS.PersonEventId : claimSMS.ClaimId,
                ItemType = claimSMS.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };

            return await _sendSmsService.SendSmsMessage(smsRequest);
        }

        public async Task SendNotificationClosedCommunication(ClaimEmail claimEmail, ClaimSMS claimSMS, RolePlayer employee, RolePlayerContact employerContact, PersonEvent personEvent)
        {
            Contract.Requires(claimEmail != null);
            if (_isSendCommunicationByServiceBusEnabled)
            {
                await PublishCommunicationNotification(new ClaimCommunicationMessage()
                {
                    ClaimCommunicationType = ClaimCommunicationTypeEnum.NotificationClosed,
                    ClaimEmployerEmail = claimEmail,
                    EmployeeClaimSMS = claimSMS,
                    Employee = employee,
                    EmployerContact = employerContact,
                    PersonEvent = personEvent
                });
                return;
            }

            await SendClaimClosedCommunication(claimEmail, claimSMS, employee, employerContact);
        }

        private async Task SendClaimClosedCommunication(ClaimEmail claimEmail, ClaimSMS claimSMS, RolePlayer employee, RolePlayerContact employerContact)
        {
            Contract.Requires(claimEmail != null);
            try
            {
                if (employee != null)
                {
                    if (employee.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email)
                    {
                        await SendClosingLetterForNotificationsOnly(claimEmail);
                    }
                    else if (employee.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS)
                    {
                        await SendNotificationClosedSMS(claimSMS, employee.DisplayName);
                    }
                }
                if (employerContact != null)
                {
                    claimEmail.EmailAddress = employerContact.EmailAddress;
                    await SendClosingLetterForNotificationsOnly(claimEmail);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error on send notification closed commununication: {ex.Message}");
            }

        }
        #endregion

        #region ClaimAcknowledgement
        public async Task<int> SendAcknowledgementLetter(ClaimEmail claimEmail)
        {
            Contract.Requires(claimEmail != null);
            var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
            var isDuplicateCheckEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsDuplicateCheckEnabled");
            bool emailSent;
            if (isDuplicateCheckEnabled)
            {
                emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), $"{claimEmail.PersonEventId} - Acknowledgement Letter", claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                if (emailSent) return await Task.FromResult(0);
            }

            var requiredDocuments = string.Empty;
            _parameters = $"&personEventId={claimEmail.PersonEventId}&requiredDocuments={requiredDocuments}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };
            var emailBody = await _configurationService.GetModuleSetting(SystemSettings.AcknowledgementBody);

            byte[] acknowledgementLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/AcknowledgementLetter{_parameters}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = acknowledgementLetter, FileName = "Acknowledgement Letter.pdf", FileType = "application/pdf"},
            };

            claimEmail.TemplateType = TemplateTypeEnum.AcknowledgmentofClaim;

            var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);

            return await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimAccidentReporting,
                FromAddress = _fromAddress,
                Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                RecipientsCC = null,
                Subject = $"{claimEmail.PersonEventId} - Acknowledgement Letter",
                Body = template.Content,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        private async Task<int> SendNotificationAcknowledgementSMS(ClaimSMS claimSMS, string contactName, string claimNumber)
        {
            Contract.Requires(claimSMS != null);

            var keyFirstMedicalReport = new Dictionary<string, string>
            {
                { "FirstMedicalReportId", claimSMS.PersonEventId.ToString() }
            };

            var medicalReports = await _documentIndexService.GetAllDocumentsNotRecieved(DocumentSetEnum.ClaimMedicalDocuments, keyFirstMedicalReport);

            var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.NotificationAcknowledgement));

            if (claimSMS.TemplateType == TemplateTypeEnum.LiabilityAcceptanceNotification)
            {
                smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.LiabilityAcceptanceMessage));
            }
            else if (claimSMS.TemplateType == TemplateTypeEnum.TTDRejected)
            {
                smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.TTDRejected));
            }
            else if (medicalReports != null)
            {
                smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.ClaimAcknowledgedSMS));

            }

            smsMessage = smsMessage.Replace("{0}", contactName);
            smsMessage = smsMessage.Replace("{1}", claimNumber);
            var IsSmsSent = await _sendSmsService.SmsAlreadySent(claimSMS.PersonEventId, nameof(PersonEvent), smsMessage, claimSMS.MobileNumber);

            if (IsSmsSent)
                return await Task.FromResult(0);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimAccidentReporting,
                SmsNumbers = new List<string> { claimSMS.MobileNumber },
                Message = smsMessage,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = claimSMS.PersonEventId != 0 ? claimSMS.PersonEventId : claimSMS.ClaimId,
                ItemType = claimSMS.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };

            return await _sendSmsService.SendSmsMessage(smsRequest);
        }

        public async Task SendNotification(ClaimEmail claimEmail, ClaimSMS claimSMS, RolePlayer employee, string claimNumber, RolePlayerContact employerContact, ClaimCommunicationTypeEnum claimCommunicationTypeEnum)
        {
            Contract.Requires(claimEmail != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (_isSendCommunicationByServiceBusEnabled)
                {
                    var personEvent = new PersonEvent();
                    if (claimEmail != null && claimEmail.PersonEventId != 0)
                    {
                        var personEventEntity = await _personEventRepository.FindByIdAsync(claimEmail.PersonEventId);
                        personEvent = Mapper.Map<PersonEvent>(personEventEntity);

                        if (personEvent == null && claimSMS != null)
                        {
                            var personEventEntitySMS = await _personEventRepository.FindByIdAsync(claimSMS.PersonEventId);
                            personEvent = Mapper.Map<PersonEvent>(personEventEntitySMS);
                        }
                    }

                    await PublishCommunicationNotification(new ClaimCommunicationMessage()
                    {
                        ClaimCommunicationType = claimCommunicationTypeEnum,
                        ClaimEmployerEmail = claimEmail,
                        EmployeeClaimSMS = claimSMS,
                        Employee = employee,
                        ClaimNumber = claimNumber,
                        EmployerContact = employerContact,
                        PersonEvent = personEvent
                    });
                }
                return;
            }
        }

        #endregion

        private async Task SendNotificationAcknowledgementFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                try
                {
                    var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                    {
                        await SendAcknowledgementLetter(claimCommunicationMessage.EmployeeClaimEmail);
                    }
                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    {
                        await SendNotificationAcknowledgementSMS(claimCommunicationMessage.EmployeeClaimSMS, claimCommunicationMessage.Employee.DisplayName, claimCommunicationMessage.ClaimNumber);
                    }


                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    {
                        await SendAcknowledgementLetter(claimCommunicationMessage.ClaimEmployerEmail);
                    }
                    if (claimCommunicationMessage.ClaimEmployerSMS != null)
                    {
                        await SendNotificationAcknowledgementSMS(claimCommunicationMessage.ClaimEmployerSMS, claimCommunicationMessage.Employee.DisplayName, claimCommunicationMessage.ClaimNumber);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on send notification acknowledgement: {ex.Message}");
                }
            }
        }

        private async Task SendNotificationClosedFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                try
                {
                    if (claimCommunicationMessage.EmployeeClaimEmail != null)
                    {
                        await SendClosingLetterForNotificationsOnly(claimCommunicationMessage.EmployeeClaimEmail);
                    }
                    if (claimCommunicationMessage.EmployeeClaimSMS != null)
                    {
                        await SendNotificationClosedSMS(claimCommunicationMessage.EmployeeClaimSMS, claimCommunicationMessage.Employee.DisplayName);
                    }
                    if (claimCommunicationMessage.ClaimEmployerEmail != null)
                    {
                        await SendClosingLetterForNotificationsOnly(claimCommunicationMessage.ClaimEmployerEmail);
                    }
                    if (claimCommunicationMessage.ClaimEmployerSMS != null)
                    {
                        await SendNotificationClosedSMS(claimCommunicationMessage.ClaimEmployerSMS, claimCommunicationMessage.Employee.DisplayName);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error (MessageId : {claimCommunicationMessage.MessageId}) on send notification closed commununication: {ex.Message}");
                }
            }
        }

        private async Task DocumentsFollowUpFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                try
                {
                    if (claimCommunicationMessage.ClaimEmployerEmail != null && !string.IsNullOrEmpty(claimCommunicationMessage.RequiredDocuments))
                    {
                        await SendDocumentsFollowUpEmailQueue(claimCommunicationMessage.ClaimEmployerEmail, claimCommunicationMessage.DayCount, claimCommunicationMessage.RequiredDocuments);
                    }

                    if (claimCommunicationMessage.ClaimEmployerSMS != null && claimCommunicationMessage.PersonEvent != null && claimCommunicationMessage.Employee != null)
                    {
                        await SendDocumentsFollowUpSMSQueue(claimCommunicationMessage.PersonEvent, claimCommunicationMessage.Employee, claimCommunicationMessage.DayCount, claimCommunicationMessage.ClaimEmployerSMS);
                    }

                    if (claimCommunicationMessage.EmployeeClaimEmail != null && !string.IsNullOrEmpty(claimCommunicationMessage.RequiredDocuments))
                    {
                        await SendDocumentsFollowUpEmailQueue(claimCommunicationMessage.EmployeeClaimEmail, claimCommunicationMessage.DayCount, claimCommunicationMessage.RequiredDocuments);
                    }

                    if (claimCommunicationMessage.EmployeeClaimSMS != null && claimCommunicationMessage.PersonEvent != null && claimCommunicationMessage.Employee != null)
                    {
                        await SendDocumentsFollowUpSMSQueue(claimCommunicationMessage.PersonEvent, claimCommunicationMessage.Employee, claimCommunicationMessage.DayCount, claimCommunicationMessage.EmployeeClaimSMS);
                    }

                    if (!string.IsNullOrEmpty(claimCommunicationMessage.PersonEvent.CompCarePevRefNumber))
                    {
                        await SendCompCareDocumentsFollowUpSMSQueue(claimCommunicationMessage.PersonEvent, claimCommunicationMessage.Employee, claimCommunicationMessage.DayCount);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on send notification acknowledgement: {ex.Message}");
                }
            }
        }

        private async Task RequestAdditionalDocumentsFromServiceBusQueue(ClaimCommunicationMessage claimCommunicationMessage)
        {
            Contract.Requires(claimCommunicationMessage != null);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                try
                {
                    if (claimCommunicationMessage.ClaimEmployerEmail != null && !string.IsNullOrEmpty(claimCommunicationMessage.RequiredDocuments))
                    {
                        await SendAdditionalDocumentsRequestEmailQueue(claimCommunicationMessage.ClaimEmployerEmail, claimCommunicationMessage.RequiredDocuments);
                    }

                    if (claimCommunicationMessage.EmployeeClaimEmail != null && !string.IsNullOrEmpty(claimCommunicationMessage.RequiredDocuments))
                    {
                        await SendAdditionalDocumentsRequestEmailQueue(claimCommunicationMessage.EmployeeClaimEmail, claimCommunicationMessage.RequiredDocuments);
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error on request additional documents: {ex.Message}");
                }
            }
        }

        private async Task SendAdditionalDocumentsRequestEmailQueue(ClaimEmail claimEmail, string requiredDocuments)
        {
            Contract.Requires(claimEmail != null);

            _parameters = $"&personEventId={claimEmail.PersonEventId}&requiredDocuments={requiredDocuments}&rs:Command=ClearSession";
            var internalEmailAddresses = await _configurationService.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            var reportUrl = "ThirdDocumentsFollowUp";
            var fileName = "Request for additional information";
            var messageSubject = "Request for additional information";
            claimEmail.TemplateType = TemplateTypeEnum.ThirdFinalDocumentsFollowUp;

            var isDuplicateCheckEnabled = await _configurationService.IsFeatureFlagSettingEnabled("IsDuplicateCheckEnabled");
            bool emailSent;
            if (isDuplicateCheckEnabled)
            {
                emailSent = await _emailService.CheckEmailAlreadySent(nameof(PersonEvent), claimEmail.PersonEventId.ToString() + " - " + messageSubject, claimEmail.PersonEventId, new List<string> { allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses }, DateTimeHelper.SaNow);

                if (emailSent) return;
            }
            var reportUrl_ = $"{_reportserverUrl}/{reportUrl}{_parameters}";

            byte[] followUpLetter = await GetUriDocumentByteData(new Uri($"{reportUrl_}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = followUpLetter, FileName = $"{fileName}.pdf", FileType = "application/pdf"},
            };

            var template = await _emailTemplateService.GenerateTemplateContent(claimEmail.TemplateType, claimEmail.Tokens);

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = claimEmail.PersonEventId != 0 ? claimEmail.PersonEventId : claimEmail.ClaimId,
                ItemType = claimEmail.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimActionNotification,
                FromAddress = _fromAddress,
                Recipients = allowExternalSending ? claimEmail.EmailAddress : internalEmailAddresses,
                RecipientsCC = null,
                Subject = claimEmail.PersonEventId.ToString() + " - " + messageSubject,
                Body = template.Content,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }


        public async Task PublishCommunicationNotification(ClaimCommunicationMessage claimCommunicationMessage)
        {
            if (claimCommunicationMessage == null) {  return; }

            claimCommunicationMessage.PersonEvent.RolePlayers = null;
            claimCommunicationMessage.PersonEvent.RolePlayer = null;
            var messageUniqueId = GenerateUniqueMessageId(claimCommunicationMessage);
            var isMessageBeenSent = await _serviceBusMessage.CheckIfMessageTypeHasBeenSentByMessageUniqueId(messageUniqueId);

            if (isMessageBeenSent) { return; }

            var messageBody = _serializer.Serialize(claimCommunicationMessage);
            var messageType = new MessageType
            {
                MessageId = Guid.NewGuid().ToString(),
                MessageBody = messageBody,
                From = ClaimConstants.MessageFrom,
                To = ClaimConstants.MessageTo,
                MessageTaskType = ClaimConstants.MessageTaskType000,
                Environment = _environment,
                EnqueuedTime = DateTime.Now,
                MessageUniqueId = messageUniqueId,
            };

            var producer = new ServiceBusQueueProducer<ClaimCommunicationMessage, ClaimCommunicationListener>(ClaimCommunicationListener.QueueName);
            
            await producer.PublishMessageAsync(claimCommunicationMessage);

            await _serviceBusMessage.AddServiceBusMessage(messageType);
        }

        private string GenerateUniqueMessageId(ClaimCommunicationMessage message)
        {
            Contract.Requires(message != null);
            string messageUniqueId = "";
            switch (message.ClaimCommunicationType)
            {
                case ClaimCommunicationTypeEnum.NotificationAcknowledgement:
                    messageUniqueId = $"NTF-ACK-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.NotificationClosed:
                    messageUniqueId = $"NTF-CLOSED-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.NotificationReceipt:
                    messageUniqueId = $"NTF-RECEIPT-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.DocumentsFollowUp:
                    messageUniqueId = $"DOC-FOLLOW-{message.DayCount}-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.LiabilityAcceptanceNotification:
                    messageUniqueId = $"LBY-ACCEPTED-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.PdPaidCloseLetter:
                    messageUniqueId = $"PD-PAID-CLOSE-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.CloseClaimNotification:
                    messageUniqueId = $"CLAIM-CLOSED-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.TTDRejected:
                    messageUniqueId = $"TTD-REJECTED-{message.PersonEvent.ClaimInvoiceId}";
                    break;
                case ClaimCommunicationTypeEnum.RequestAdditionDocuments:
                    messageUniqueId = $"REQ-DOCUMENT-{message.PersonEvent.PersonEventId}";
                    break;
                case ClaimCommunicationTypeEnum.PdApprovedLetter:
                    messageUniqueId = $"PD-APPROVED-{message.PersonEvent.ClaimInvoiceId}";
                    break;
                case ClaimCommunicationTypeEnum.NILPdLetter:
                    messageUniqueId = $"ZERO-PD-CLOSED-{message.PersonEvent.PersonEventId}";
                    break;
                default:
                    break;
            }

            return messageUniqueId;

        }

        public async Task ProccessCommunicationNotification(ClaimCommunicationMessage message)
        {
            Contract.Requires(message != null);

            switch (message.ClaimCommunicationType)
            {
                case ClaimCommunicationTypeEnum.NotificationAcknowledgement:
                    await SendNotificationAcknowledgementFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.NotificationClosed:
                    await SendNotificationClosedFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.NotificationReceipt:
                    await SendNotificationReceiptFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.DocumentsFollowUp:
                    await DocumentsFollowUpFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.LiabilityAcceptanceNotification:
                    await SendLiabilityAcceptanceFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.PdPaidCloseLetter:
                    await SendPDPaidCloseLetterFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.CloseClaimNotification:
                    await SendClaimCloseNotificationFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.RecaptureEarnings:
                    await SendClaimRecaptureEarningsFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.TTDRejected:
                    await SendTTDRejectFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.RequestAdditionDocuments:
                    await RequestAdditionalDocumentsFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.PdApprovedLetter:
                    await SendPDApprovedLetterFromServiceBusQueue(message);
                    break;
                case ClaimCommunicationTypeEnum.NILPdLetter:
                    await SendNILPdLetterFromServiceBusQueue(message);
                    break;
                default:
                    break;
            }
        }

        public async Task SendAdditionalDocumentRequestSms(AdditionalDocumentRequest additionalDocumentRequest)
        {
            Contract.Requires(additionalDocumentRequest != null);
            foreach (var rolePlayerContact in additionalDocumentRequest.RolePlayerContacts)
            {
                if (rolePlayerContact.CommunicationType == CommunicationTypeEnum.SMS)
                {
                    var smsTemplate = (await _configurationService.GetModuleSetting(SystemSettings.AdditionalDocumentRequest));
                    smsTemplate = smsTemplate.Replace("{0}", rolePlayerContact.Firstname + " " + rolePlayerContact.Surname);

                    var smsRequest = new SendSmsRequest()
                    {
                        Department = RMADepartmentEnum.Claims,
                        BusinessArea = BusinessAreaEnum.ClaimDocumentsFollowUp,
                        SmsNumbers = new List<string>() { rolePlayerContact.ContactNumber },
                        Message = smsTemplate,
                        WhenToSend = DateTimeHelper.SaNow,
                        ItemId = additionalDocumentRequest.PersonEventId,
                        ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
                    };
                    await _sendSmsService.SendSmsMessage(smsRequest);
                }
            }
        }
        public async Task<int> SendDeletedClaimEmail(int personEventId)
        {
            int sendEmail = 0;
            Contract.Requires(personEventId > 0);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId);
                var claims = await _claimRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId);
                var claimCommunicationMessage = new ClaimCommunicationMessage();
                var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);

                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var companyRolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.ClaimantId);
                var companyContactInformation = companyRolePlayerContacts.Count > 0 ? companyRolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                if (companyContactInformation == null)
                {
                    companyContactInformation = companyRolePlayerContacts.Count > 0 ? companyRolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                }

                var template = await _documentTemplateService.GetDocumentTemplateByDocumentType(DocumentTypeEnum.DeleteClaimLetter);
                if (template == null)
                {
                    return -1;
                }
                var documentTemplate = template.DocumentHtml;
                var eventDetails = await _eventService.GetEvent(personEvent.EventId);

                var documentTokens = new Dictionary<string, string>
                {
                    ["{CurrentDate}"] = DateTime.Now.ToString("dd MMM yyyy"),
                    ["{EmployeeName}"] = employee.DisplayName,
                    ["{DateOfAccident}"] = eventDetails?.EventDate.ToString("dd MMM yyyy"),
                    ["{ClaimNo}"] = claims.ClaimReferenceNumber,
                    ["{ICD10Code}"] = "N/A"
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "Claim Deleted Letter",
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = companyContactInformation.EmailAddress,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null,
                    ItemId = personEventId,
                    ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue()
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }
            return sendEmail;
        }

        public Task<string> GetSelectedRequiredDocuments(List<ClaimAdditionalRequiredDocument> additionalDocs)
        {
            var documentNames = additionalDocs.Select(doc => doc.DocumentName);
            _additionalDocsRequested = string.Join(",", documentNames);
            return Task.FromResult(_additionalDocsRequested);
        }

        public async Task<int> SendAdditionalDocumentRequestEmail(AdditionalDocumentRequest additionalDocumentRequest, PersonEvent personEvent)
        {
            int sendEmail = 0;
            Contract.Requires(additionalDocumentRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var contacts = additionalDocumentRequest.RolePlayerContacts.Count > 0 ? additionalDocumentRequest.RolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                var recipients = string.Empty;
                foreach (var rolePlayerContact in additionalDocumentRequest.RolePlayerContacts)
                {
                    if (rolePlayerContact.CommunicationType == CommunicationTypeEnum.Email)
                    {
                        recipients += rolePlayerContact.EmailAddress + ";";
                    }
                }

                if (!string.IsNullOrEmpty(recipients))
                {
                    var claimEmail = new ClaimEmail()
                    {
                        ClaimId = 0,
                        EmailAddress = recipients,
                        PersonEventId = additionalDocumentRequest.PersonEventId,
                        TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                        Tokens = new Dictionary<string, string>
                        {
                            ["{EmployeeName}"] = personEvent?.RolePlayer.DisplayName,
                        }
                    };

                    await SendAdditionalDocumentsEmail(claimEmail, _additionalDocsRequested, personEvent);
                }
            }
            return sendEmail;
        }

        public async Task SendAdditionalDocumentsEmail(ClaimEmail claimEmail, string requiredDocuments, PersonEvent personEvent)
        {
            Contract.Requires(claimEmail != null);

            await PublishCommunicationNotification(new ClaimCommunicationMessage()
            {
                ClaimCommunicationType = ClaimCommunicationTypeEnum.RequestAdditionDocuments,
                ClaimEmployerEmail = claimEmail,
                RequiredDocuments = requiredDocuments,
                PersonEvent = personEvent
            });

        }

        public async Task<int> SendNotificationSMS(ClaimSMS claimSMS, string message)
        {
            Contract.Requires(claimSMS != null);

            var isSmsSent = await _sendSmsService.SmsAlreadySent(claimSMS.PersonEventId, nameof(PersonEvent), message, claimSMS.MobileNumber);
            if (isSmsSent) await Task.FromResult(0);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Claims,
                BusinessArea = BusinessAreaEnum.ClaimAccidentReporting,
                SmsNumbers = new List<string> { claimSMS.MobileNumber },
                Message = message,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = claimSMS.PersonEventId != 0 ? claimSMS.PersonEventId : claimSMS.ClaimId,
                ItemType = claimSMS.PersonEventId != 0 ? ItemTypeEnum.PersonEvent.DisplayAttributeValue() : ItemTypeEnum.Claim.DisplayAttributeValue()
            };

            return await _sendSmsService.SendSmsMessage(smsRequest);
        }

        public async Task<ClaimCommunicationMessage> SetupContactDetailsForEmployeeAndEmployer(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId);
                var claims = await _claimRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId);
                var claimCommunicationMessage = new ClaimCommunicationMessage();
                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);

                var companyRolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.ClaimantId);
                var companyContactInformation = companyRolePlayerContacts.Count > 0 ? companyRolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                if (companyContactInformation == null)
                {
                    companyContactInformation = companyRolePlayerContacts.Count > 0 ? companyRolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                }

                var employeeRolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.InsuredLifeId);
                var employeeContactInformation = companyRolePlayerContacts.Count > 0 ? employeeRolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                if (employeeContactInformation == null)
                {
                    employeeContactInformation = employeeRolePlayerContacts.Count > 0 ? employeeRolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                }

                claimCommunicationMessage.EmployerContact = companyContactInformation;
                claimCommunicationMessage.EmployeeContact = employeeContactInformation;

                if (personEvent.CompCarePersonEventId != null)
                {
                    var claimEmail = new ClaimEmail()
                    {
                        ClaimId = 0,
                        EmailAddress = company.EmailAddress,
                        PersonEventId = personEvent.PersonEventId,
                        TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                    };
                    claimCommunicationMessage.ClaimEmployerEmail = claimEmail;
                    var claimSms = new ClaimSMS()
                    {
                        ClaimId = 0,
                        MobileNumber = employee.CellNumber,
                        PersonEventId = personEvent.PersonEventId,
                        TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                        Tokens = new Dictionary<string, string>
                        {
                            ["[personEventNumber]"] = claims.ClaimReferenceNumber
                        }
                    };
                    claimCommunicationMessage.EmployeeClaimSMS = claimSms;
                }
                else
                {
                    if (companyContactInformation != null)
                    {
                        if (companyContactInformation.CommunicationType == CommunicationTypeEnum.Email)
                        {
                            var claimEmail = new ClaimEmail()
                            {
                                ClaimId = 0,
                                EmailAddress = companyContactInformation.EmailAddress,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["{EmployeeName}"] = companyContactInformation.Firstname + " " + companyContactInformation.Surname,
                                }
                            };
                            claimCommunicationMessage.ClaimEmployerEmail = claimEmail;
                        }
                        if (companyContactInformation.CommunicationType == CommunicationTypeEnum.SMS)
                        {
                            var claimSms = new ClaimSMS()
                            {
                                ClaimId = 0,
                                MobileNumber = companyContactInformation.ContactNumber,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["[personEventNumber]"] = claims.ClaimReferenceNumber
                                }
                            };
                            claimCommunicationMessage.ClaimEmployerSMS = claimSms;
                        }
                    }
                    if (employeeContactInformation != null)
                    {
                        if (employeeContactInformation.CommunicationType == CommunicationTypeEnum.Email)
                        {
                            var claimEmail = new ClaimEmail()
                            {
                                ClaimId = 0,
                                EmailAddress = employeeContactInformation.EmailAddress,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["{EmployeeName}"] = employeeContactInformation.Firstname + " " + employeeContactInformation.Surname,
                                }
                            };
                            claimCommunicationMessage.EmployeeClaimEmail = claimEmail;
                        }
                        if (employeeContactInformation.CommunicationType == CommunicationTypeEnum.SMS)
                        {
                            var claimSms = new ClaimSMS()
                            {
                                ClaimId = 0,
                                MobileNumber = employeeContactInformation.ContactNumber,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["[personEventNumber]"] = claims.ClaimReferenceNumber
                                }
                            };
                            claimCommunicationMessage.EmployeeClaimSMS = claimSms;
                        }
                    }
                }

                return claimCommunicationMessage;
            }
        }

        public async Task<ClaimCommunicationMessage> GetContactDetailsForEmployeeAndEmployer(int personEventId, ClaimCommunicationTypeEnum claimCommunicationTypeEnum)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId);
                var claims = await _claimRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId);
                var claimCommunicationMessage = new ClaimCommunicationMessage();
                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var company = await _rolePlayerService.GetCompany(personEvent.ClaimantId);
                claimCommunicationMessage.ClaimCommunicationType = claimCommunicationTypeEnum;
                var companyRolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.ClaimantId);
                var companyContactInformation = companyRolePlayerContacts.Count > 0 ? companyRolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                if (companyContactInformation == null)
                {
                    companyContactInformation = companyRolePlayerContacts.Count > 0 ? companyRolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                }

                var employeeRolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.InsuredLifeId);
                var employeeContactInformation = companyRolePlayerContacts.Count > 0 ? employeeRolePlayerContacts.Where(r => r.RolePlayerContactInformations.Any(b => b.ContactInformationType == ContactInformationTypeEnum.Claims)).FirstOrDefault() : null;
                if (employeeContactInformation == null)
                {
                    employeeContactInformation = employeeRolePlayerContacts.Count > 0 ? employeeRolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;
                }

                claimCommunicationMessage.EmployerContact = companyContactInformation;
                claimCommunicationMessage.EmployeeContact = employeeContactInformation;

                if (personEvent.CompCarePersonEventId != null)
                {
                    var claimEmail = new ClaimEmail()
                    {
                        ClaimId = 0,
                        EmailAddress = company.EmailAddress,
                        PersonEventId = personEvent.PersonEventId,
                        TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                    };
                    claimCommunicationMessage.ClaimEmployerEmail = claimEmail;
                    var claimSms = new ClaimSMS()
                    {
                        ClaimId = 0,
                        MobileNumber = employee.CellNumber,
                        PersonEventId = personEvent.PersonEventId,
                        TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                        Tokens = new Dictionary<string, string>
                        {
                            ["[personEventNumber]"] = personEvent.PersonEventReferenceNumber
                        }
                    };
                    claimCommunicationMessage.EmployeeClaimSMS = claimSms;
                }
                else
                {
                    if (companyContactInformation != null)
                    {
                        if (companyContactInformation.CommunicationType == CommunicationTypeEnum.Email)
                        {
                            var claimEmail = new ClaimEmail()
                            {
                                ClaimId = 0,
                                EmailAddress = companyContactInformation.EmailAddress,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["{EmployeeName}"] = companyContactInformation.Firstname + " " + companyContactInformation.Surname,
                                }
                            };
                            claimCommunicationMessage.ClaimEmployerEmail = claimEmail;
                        }
                        if (companyContactInformation.CommunicationType == CommunicationTypeEnum.SMS)
                        {
                            var claimSms = new ClaimSMS()
                            {
                                ClaimId = 0,
                                MobileNumber = companyContactInformation.ContactNumber,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["[personEventNumber]"] = personEvent.PersonEventReferenceNumber
                                }
                            };
                            claimCommunicationMessage.ClaimEmployerSMS = claimSms;
                        }
                    }
                    if (employeeContactInformation != null)
                    {
                        if (employeeContactInformation.CommunicationType == CommunicationTypeEnum.Email)
                        {
                            var claimEmail = new ClaimEmail()
                            {
                                ClaimId = 0,
                                EmailAddress = employeeContactInformation.EmailAddress,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["{EmployeeName}"] = employeeContactInformation.Firstname + " " + employeeContactInformation.Surname,
                                }
                            };
                            claimCommunicationMessage.EmployeeClaimEmail = claimEmail;
                        }
                        if (employeeContactInformation.CommunicationType == CommunicationTypeEnum.SMS)
                        {
                            var claimSms = new ClaimSMS()
                            {
                                ClaimId = 0,
                                MobileNumber = employeeContactInformation.ContactNumber,
                                PersonEventId = personEvent.PersonEventId,
                                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                                Tokens = new Dictionary<string, string>
                                {
                                    ["[personEventNumber]"] = personEvent.PersonEventReferenceNumber
                                }
                            };
                            claimCommunicationMessage.EmployeeClaimSMS = claimSms;
                        }
                    }
                }

                return claimCommunicationMessage;
            }
        }

        public async Task<string> SendCommunication(PersonEvent personEvent, Policy policy, Brokerage brokerage)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var isIndividual = true;
                var brokerageIds = new List<int>();

                var insuredLifeId = await _rolePlayerService.GetRolePlayer((int)personEvent?.InsuredLifeId);
                var claimant = await _rolePlayerService.GetRolePlayer(personEvent.ClaimantId);

                var roleplayer = await _rolePlayerService.GetRolePlayer((int)policy?.PolicyOwnerId);
                isIndividual = (roleplayer.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person);
                brokerageIds.Add(policy.BrokerageId);

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
                    ["{policyNumber}"] = policy == null ? null : policy.PolicyNumber,
                    ["{claimNumber}"] = $"{personEvent.PersonEventId}",
                    ["{deceasedFirstName}"] = insuredLifeId.Person.FirstName,
                    ["{deceasedLastName}"] = insuredLifeId.Person.Surname,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy")
                };

                var documentDetails = new DocumentDetails
                {
                    PersonFirstName = claimant.Person.FirstName,
                    PersonLastName = claimant.Person.Surname,
                    PolicyNumber = personEvent.PersonEventReferenceNumber
                };
                var addressDetails = claimant.RolePlayerAddresses.FirstOrDefault();
                if (addressDetails != null)
                {
                    documentDetails.Address1 = addressDetails.AddressLine1;
                    documentDetails.Address2 = addressDetails.AddressLine2;
                    documentDetails.Address3 = addressDetails.PostalCode;
                }
                var enumDocumentType = await _ruleDocumentTypeRepository
                    .Where(a => a.DocumentRuleId == documentRule.Id)
                    .Select(b => b.DocumentType)
                    .ToListAsync();

                var htmlBody = (await _emailTemplateService.GetEmailTemplate((int)documentRule?.EmailTemplateId.Value)).Template;
                foreach (var token in emailTokens)
                {
                    htmlBody = htmlBody.Replace($"{token.Key}", token.Value);
                }
                var attachments = await GetAttachments(enumDocumentType, documentDetails);

                if (await _configurationService.IsFeatureFlagSettingEnabled("EmailAllClaimPolicyBrokers"))
                {
                    if (personEvent.SendBrokerEmail)
                    {
                        await SendEmail(null, htmlBody, attachments, personEvent.PersonEventId, brokerage);
                    }
                }

                if (claimant.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.Email)
                {
                    if (!string.IsNullOrEmpty(claimant.EmailAddress))
                    {
                        await SendEmail(claimant.EmailAddress, htmlBody, attachments, personEvent.PersonEventId, brokerage);
                    }
                }
                else if (claimant.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS)
                {
                    if (!string.IsNullOrEmpty(claimant.CellNumber))
                    {
                        _ = await SendSms($"{personEvent.PersonEventId}", claimant.CellNumber);
                    }
                }
                else
                {
                    if (brokerage?.Contacts.Where(c => !string.IsNullOrEmpty(c.Email)) != null && personEvent.SendBrokerEmail)
                    {
                        if (!string.IsNullOrEmpty(brokerage.Contacts[0].Email))
                        {
                            await SendEmail(brokerage.Contacts[0].Email, htmlBody, attachments, personEvent.PersonEventId, brokerage);
                        }
                    }
                }
            }
            return "sent";
        }
        private async Task SendEmail(string recipient, string htmlBody, MailAttachment[] attachments, int personEventId, Brokerage brokerage)
        {
            var emails = new List<string>();
            emails.AddRange(brokerage?.Contacts.Where(c => !string.IsNullOrEmpty(c.Email)).Select(c => c.Email).ToList());

            var brokerageMailRequest = new SendMailRequest
            {
                Recipients = !string.IsNullOrEmpty(recipient) ? recipient : string.Join(";", emails.Select(e => e).Distinct()),
                Body = htmlBody,
                IsHtml = true,
                FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                Subject = "New Claim Registered",
                Attachments = attachments,
                ItemId = personEventId,
                ItemType = "PersonEvent"
            };
            await _sendEmailService.SendEmail(brokerageMailRequest);
        }
        private async Task<int> SendSms(string claimUniqueReference, string cellNumber)
        {
            var tokens = new Dictionary<string, string>() { { "claimNumber", claimUniqueReference } };
            var smsNumbers = new List<string>() { cellNumber };
            var smsNotification = new TemplateSmsRequest()
            {
                Name = "Registration of claim",
                Tokens = tokens,
                SmsNumbers = smsNumbers,
                ItemId = Convert.ToInt32(claimUniqueReference),
                ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Claims
            };

            return await _sendSmsService.SendTemplateSms(smsNotification);
        }
        private async Task<MailAttachment[]> GetAttachments(List<DocumentTypeEnum> documentTypeId, DocumentDetails documentDetails)
        {
            var listOfDocument = new List<MailAttachment>();
            var counter = 0;
            foreach (var documentType in documentTypeId.ToList())
            {
                var attachment = await _documentTemplateService.GetDocumentTemplateByDocumentType(documentType);
                if (attachment != null && attachment.DocumentBinary != null)
                {
                    var mail = new MailAttachment()
                    {
                        AttachmentByteData = attachment.DocumentBinary,
                        FileName = attachment.DocumentName,
                        FileType = attachment.DocumentMimeType
                    };
                    listOfDocument.Add(mail);
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

        public async Task<bool> SendClaimNotification(PersonEvent personEvent, TemplateTypeEnum templateTypeEnum)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var templateType = TemplateTypeEnum.LiabilityAcceptanceNotification;
                var claimCommunicationType = ClaimCommunicationTypeEnum.LiabilityAcceptanceNotification;

                if (templateTypeEnum == TemplateTypeEnum.LiabilityAcceptanceNotification)
                {
                    templateType = TemplateTypeEnum.LiabilityAcceptanceNotification;
                    claimCommunicationType = ClaimCommunicationTypeEnum.LiabilityAcceptanceNotification;
                }
                else if (templateTypeEnum == TemplateTypeEnum.LiabilityNotAccepted)
                {
                    templateType = TemplateTypeEnum.LiabilityNotAccepted;
                }
                else if (templateTypeEnum == TemplateTypeEnum.AcknowledgmentofClaim)
                {
                    templateType = TemplateTypeEnum.AcknowledgmentofClaim;
                    claimCommunicationType = ClaimCommunicationTypeEnum.NotificationAcknowledgement;
                } else if (templateTypeEnum == TemplateTypeEnum.NilPDLetter)
                {
                    templateType= TemplateTypeEnum.NilPDLetter;
                    claimCommunicationType = ClaimCommunicationTypeEnum.NILPdLetter;
                }

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEvent.PersonEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimToAcknowledge, parameters);
                var employee = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);
                var employeeContact = await _rolePlayerService.GetRolePlayerContactDetails(personEvent.InsuredLifeId);
                var employeeContactInformation = employeeContact.Count > 0 ? employeeContact.Where(r => r.CommunicationType == CommunicationTypeEnum.SMS).FirstOrDefault() : null;
                ClaimSMS claimSMS = new ClaimSMS();

                if (employeeContactInformation != null)
                {
                    claimSMS = await GenerateSMS(personEvent, employeeContactInformation.ContactNumber, templateType);
                }
                else
                {
                    claimSMS = await GenerateSMS(personEvent, null, templateType);
                }
                var rolePlayerContacts = await _rolePlayerService.GetRolePlayerContactDetails((int)personEvent.CompanyRolePlayerId);
                var rolePlayerContactInformation = rolePlayerContacts.Count > 0 ? rolePlayerContacts.Where(r => r.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).FirstOrDefault() : null;

                var claimCommunicationMessage = await GetContactDetailsForEmployeeAndEmployer(personEvent.PersonEventId, claimCommunicationType);
                var claimEmail = await GenerateNotification(claimDetails[0], templateType);
                if (rolePlayerContactInformation != null)
                {
                    claimEmail.EmailAddress = rolePlayerContactInformation.EmailAddress;
                }

                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.PersonEvent = personEvent;

                var claims = await _claimRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEvent.PersonEventId);
                if (claims != null)
                {
                    claimCommunicationMessage.ClaimNumber = claims.ClaimReferenceNumber;
                }
                else
                {
                    claimCommunicationMessage.ClaimNumber = string.IsNullOrEmpty(personEvent.CompCarePevRefNumber)
                                ? personEvent.PersonEventReferenceNumber
                                : null;
                }

                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                {
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.ClaimEmployerEmail.TemplateType = templateType;
                }
                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                {
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.EmployeeClaimEmail.TemplateType = templateType;
                }
                if (claimCommunicationMessage.ClaimEmployerSMS != null)
                {
                    claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = templateType;
                }

                if (claimCommunicationMessage.EmployeeClaimSMS != null)
                {
                    claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.EmployeeClaimSMS.TemplateType = templateType;
                }

                claimCommunicationMessage.ClaimCommunicationType = claimCommunicationType;
                await PublishCommunicationNotification(claimCommunicationMessage);

                return true;
            }
        }

        private Task<ClaimEmail> GenerateNotification(AutoAjudicateClaim notificationDetails, TemplateTypeEnum templateTypeEnum)
        {
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = notificationDetails.EmployeeEmailAddress,
                PersonEventId = notificationDetails.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{notificationDetails.CompanyName}",
                    ["{Address}"] = notificationDetails.CompanyAddressLine1,
                    ["{City/Town}"] = notificationDetails.CompanyCity,
                    ["{PostalCode}"] = notificationDetails.CompanyPostalCode,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{ClaimNumber}"] = notificationDetails.CompCarePEVRefNumber ?? notificationDetails.ClaimReferenceNumber,
                    ["{EmployeeName}"] = $"{notificationDetails.EmployeeFirstName} {notificationDetails.EmployeeSurname}",
                    ["{CompanyNumber}"] = notificationDetails.CompanyReferenceNumber,
                    ["{IndustryNumber}"] = notificationDetails.CompanyReferenceNumber,
                    ["{DateOfAccident}"] = notificationDetails.EventDate.ToString("dd MMM yyyy"),

                    ["{Title}"] = notificationDetails.Title.DisplayAttributeValue(),
                    ["{Surname}"] = notificationDetails.EmployeeSurname,
                }
            };

            return Task.FromResult<ClaimEmail>(claimEmail);
        }

        private Task<ClaimSMS> GenerateSMS(PersonEvent personEvent, string cellNumber, TemplateTypeEnum templateTypeEnum)
        {
            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = personEvent.PersonEventId,
                TemplateType = templateTypeEnum,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = personEvent.CompCarePevRefNumber ?? (personEvent.Claims?.Count > 0 ? personEvent.Claims[0].ClaimReferenceNumber : personEvent.PersonEventReferenceNumber),
                }
            };
            return Task.FromResult<ClaimSMS>(claimSMS);
        }

        public async Task SendMMIExpiryEmail(string hcpEmailAddress, string fromEmailAddress, int personEventId, string employeeName, string hcpName, DateTime incidentDate, DateTime lastReportDate, string companyNumber, string claimNumber)
        {
            try
            {
                var template = await _documentTemplateService.GetDocumentTemplateByDocumentType(DocumentTypeEnum.MMIExpiryEmailTemplate);
                var documentTemplate = template.DocumentHtml;
                var documentTokens = new Dictionary<string, string>
                {
                    ["{employeeName}"] = employeeName,
                    ["{dateOfIncident}"] = incidentDate.ToString("dd MMM yyyy"),
                    ["{claimNumber}"] = claimNumber,
                    ["{companyNumber}"] = companyNumber,
                    ["{hcpName}"] = hcpName,
                    ["{lastReportDate}"] = lastReportDate.ToString("dd MMM yyyy"),
                    ["{letterDate}"] = DateTime.Now.ToString("dd MMM yyyy")
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var emailRequest = new SendMailRequest
                {
                    Subject = "Oustanding final medical report",
                    FromAddress = fromEmailAddress,
                    Recipients = hcpEmailAddress,
                    Body = documentTemplate,
                    IsHtml = true,
                    ItemId = personEventId,
                    ItemType = "PersonEvent"
                };
                await _sendEmailService.SendEmail(emailRequest);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Sending Outstanding Medical Report Notification {ex.Message}");
            }
        }

        public async Task SendAdhocClaimRequirementCommunicationEmail(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest)
        {
            Contract.Requires(adhocClaimRequirementCommunicationRequest != null);

            try
            {
                var tokens = new Dictionary<string, string>
                {
                    ["{DisplayName}"] = adhocClaimRequirementCommunicationRequest.DisplayName,
                    ["{Requirements}"] = adhocClaimRequirementCommunicationRequest.RequirementsHtml
                };

                var template = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.AdhocRequirementsCommunication, tokens);

                var recipients = string.Empty;

                foreach (var rolePlayerContact in adhocClaimRequirementCommunicationRequest.RolePlayerContacts)
                {
                    if (!string.IsNullOrEmpty(rolePlayerContact.EmailAddress))
                    {
                        recipients += $"{rolePlayerContact.EmailAddress};";
                    }
                }

                if (!string.IsNullOrEmpty(recipients))
                {
                    var emailRequest = new SendMailRequest
                    {
                        Subject = adhocClaimRequirementCommunicationRequest.Subject,
                        FromAddress = "noreply@randmutual.co.za",
                        Recipients = recipients,
                        Body = template.Content,
                        IsHtml = true,
                        ItemId = adhocClaimRequirementCommunicationRequest.PersonEventId,
                        ItemType = "PersonEvent"
                    };

                    await _sendEmailService.SendEmail(emailRequest);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Email Error: SendAdhocClaimRequirementCommunicationEmail: {ex.Message}");
            }
        }

        public async Task SendAdhocClaimRequirementCommunicationSms(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest)
        {
            Contract.Requires(adhocClaimRequirementCommunicationRequest != null);

            try
            {
                var message = $"{adhocClaimRequirementCommunicationRequest.Subject}: Dear {adhocClaimRequirementCommunicationRequest.DisplayName}, The following items are required before we can finalise your claim. {adhocClaimRequirementCommunicationRequest.RequirementsCsv}, Should you require more information please contact us on 0860 102 532, Regards RMA Claims Team";

                var recipients = new List<string>();

                foreach (var rolePlayerContact in adhocClaimRequirementCommunicationRequest.RolePlayerContacts)
                {
                    if (!string.IsNullOrEmpty(rolePlayerContact.ContactNumber))
                    {
                        recipients.Add(rolePlayerContact.ContactNumber);
                    }
                }

                var sendSmsRequest = new SendSmsRequest()
                {
                    Message = message,
                    SmsNumbers = recipients,
                    ItemId = adhocClaimRequirementCommunicationRequest.PersonEventId,
                    ItemType = ItemTypeEnum.PersonEvent.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Claims
                };

                await _sendSmsService.SendSmsMessage(sendSmsRequest);
            }
            catch (Exception ex)
            {
                ex.LogException($"Email Error: SendAdhocClaimRequirementCommunicationEmail: {ex.Message}");
            }
        }
    }
}

