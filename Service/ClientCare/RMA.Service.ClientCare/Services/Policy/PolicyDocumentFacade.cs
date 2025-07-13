using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request;
using RMA.Service.ClientCare.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyDocumentFacade : RemotingStatelessService, IPolicyDocumentService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ISendEmailService _sendEmailService;
        private readonly ISendSmsService _sendSmsService;
        private readonly IRepository<policy_Policy> _policyRepository;

        private readonly WebHeaderCollection _headerCollection;
        private string _reportServerUrl;
        private string _reportEnviroment;

        private readonly string _reportCategoryUrl = "RMA.Reports.ClientCare.Policy/";
        private const string SystemGenerated = "System Generated";

        // Merged changes
        private readonly IRepository<policy_PolicyDocumentCommunicationMatrix> _policyDocumentCommunicationMatrixRepository;
        private readonly IPolicyService _policyService;
        private readonly IPremiumListingService _premiumListingService;
        private readonly IPolicyCommunicationService _communicationService;

        public PolicyDocumentFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            IDocumentIndexService documentIndexService,
            IDocumentGeneratorService documentGeneratorService,
            ISendEmailService sendEmailService,
            ISendSmsService sendSmsService,
            IRepository<policy_Policy> policyRepository,
            // Merged changes
            IRepository<policy_PolicyDocumentCommunicationMatrix> policyDocumentCommunicationMatrixRepository,
            IPolicyService policyService,
            IPremiumListingService premiumListingService,
            IPolicyCommunicationService communicationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _documentIndexService = documentIndexService;
            _sendEmailService = sendEmailService;
            _documentGeneratorService = documentGeneratorService;
            _sendSmsService = sendSmsService;
            _policyRepository = policyRepository;
            // Merged changes
            _policyDocumentCommunicationMatrixRepository = policyDocumentCommunicationMatrixRepository;
            _policyService = policyService;
            _premiumListingService = premiumListingService;
            _communicationService = communicationService;
        }

        private async Task GetReportSettings()
        {
            _reportServerUrl = await _configurationService.GetModuleSetting(SystemSettings.SsrsServer);
            _reportEnviroment = await _configurationService.GetModuleSetting(SystemSettings.SsrsEnvironment);
        }

        #region Policy document generation
        public async Task<bool> CreatePolicyWelcomePack(string policyNumber)
        {
            try
            {
                var count = 0;
                var templates = await GetPolicyTemplates(policyNumber);
                count += await GeneratePolicyDocument(templates.FirstOrDefault(s => s.SettingType == SettingTypeEnum.WelcomeLetter), false, SystemGenerated);
                count += await GeneratePolicyDocument(templates.FirstOrDefault(s => s.SettingType == SettingTypeEnum.PolicyScheduler), true, SystemGenerated);
                count += await GeneratePolicyDocument(templates.FirstOrDefault(s => s.SettingType == SettingTypeEnum.TermsAndConditions), false, SystemGenerated);
                return count == 3;
            }
            catch (Exception ex)
            {
                ex.LogException("Create Welcome Pack", policyNumber);
                throw;
            }
        }

        public async Task<int> RefreshPolicyDocument(string policyNumber, DocumentTypeEnum documentType, DocumentRefreshReasonEnum? documentRefreshReason)
        {
            try
            {
                var templates = await GetPolicyTemplates(policyNumber);
                var reason = (documentRefreshReason != null)
                    ? $"Document refreshed: {documentRefreshReason.DisplayAttributeValue()}"
                    : SystemGenerated;
                var encrypt = documentType == DocumentTypeEnum.PolicySchedule || documentType == DocumentTypeEnum.GroupPolicySchedule;
                var documentId = await GeneratePolicyDocument(templates.FirstOrDefault(s => s.DocumentType == documentType), encrypt, reason);
                return documentId;
            }
            catch (Exception ex)
            {
                ex.LogException($"Create {documentType.DisplayAttributeValue()}", policyNumber);
                throw;
            }
        }
        #endregion

        #region Policy communications
        public async Task SendPolicyWelcomePack(string policyNumber)
        {
            // Check that all of the documents exist and re-create them if they don't
            var documents = await GenerateMissingPolicyDocuments(policyNumber);
            // Get contact details
            var contacts = await GetPolicyDocumentContacts(policyNumber);
            // Send the welcome pack
            await SendPolicyDocuments(policyNumber, contacts, documents);
        }

        public async Task SendPolicyDocument(string policyNumber, DocumentTypeEnum documentType)
        {
            // Get the document templates and filter on the specified document type
            var templates = await GetPolicyTemplates(policyNumber);
            var template = templates.Find(s => s.DocumentType == documentType);
            if (template is null)
            {
                throw new Exception($"Could not find {documentType.DisplayAttributeValue()} template for policy {policyNumber}");
            }
            // Get the document & generate it if it doesn't exist
            var documents = new List<Document>();
            var document = await _documentIndexService.GetDocumentBinaryByKeyValueDocTypeId("CaseCode", policyNumber, documentType);
            if (document is null)
            {
                var documentId = await RefreshPolicyDocument(policyNumber, documentType, DocumentRefreshReasonEnum.MissingDocument);
                document = await _documentIndexService.GetDocumentBinary(documentId);
            }
            documents.Add(document);
            // Get contact details
            var contacts = await GetPolicyDocumentContacts(policyNumber);
            // Send the policy document
            await SendPolicyDocuments(policyNumber, contacts, documents);
        }
        #endregion

        #region Helper functions
        private async Task SendPolicyDocuments(string policyNumber, PolicyDocumentContacts contacts, List<Document> documents)
        {
            // Get the recipients
            var recipients = GetRecipients(contacts, out List<string> mobileNumber, out List<string> to, out List<string> cc, out List<string> bcc);
            if (recipients == 0)
            {
                throw new Exception($"No recipients have been specified for policy {policyNumber} document");
            }
            // Sent the policy communications
            if (mobileNumber?.Count > 0)
            {
                // Send an sms to the member
                await SendPolicySms(contacts, mobileNumber);
                // Send an email to the other specified recipients, e.g. the broker
                if (to.Count > 0)
                {
                    await SendPolicyEmail(contacts, documents, to, cc, bcc);
                }
            }
            else
            {
                await SendPolicyEmail(contacts, documents, to, cc, bcc);
            }
        }

        private int GetRecipients(PolicyDocumentContacts contacts, out List<string> mobileNumber, out List<string> to, out List<string> cc, out List<string> bcc)
        {

            // Assign default values
            mobileNumber = new List<string>();
            to = new List<string>();
            cc = new List<string>();
            bcc = new List<string>();

            // Send the documents to the relevant recipients
            if (contacts.OverrideCommunications)
            {
                // This only goes to the broker's override email, NO ONE ELSE!
                // These email addresses should be valid, because they cannot be 
                // updated in the front-end
                to = contacts.OverrideEmail.Split(';').ToList();
                return to.Count;
            }

            var count = 0;
            if (contacts.CommunicationType == CommunicationTypeEnum.SMS)
            {
                // Get the member's specified mobile number. Parse the value because
                // people add all sorts of data, e.g. 0760692714/0713071035
                var mobileNumbers = GetPhoneNumbers(contacts.MobileNumber);
                if (mobileNumbers.Count > 0)
                {
                    mobileNumber.AddRange(mobileNumbers);
                    count = mobileNumbers.Count;
                }
                else if (contacts.EmailAddress.IsValidEmail())
                {
                    to.Add(contacts.EmailAddress);
                }
            }
            else if (contacts.CommunicationType == CommunicationTypeEnum.Email)
            {
                to.AddRange(GetEmailList(contacts.EmailAddress));
            }

            // Get the contacts according to which ones must be sent
            var brokers = contacts.SendPolicyDocsToBroker ? GetEmailList(contacts.BrokerContacts) : new List<string>();
            var schemes = contacts.SendPolicyDocsToScheme ? GetEmailList(contacts.SchemeContacts) : new List<string>();
            var admin = contacts.SendPolicyDocsToAdmin ? GetEmailList(contacts.AdminContact) : new List<string>();

            // Broker details go into "to" if it has not already been specified
            if (to.Count == 0)
                to.AddRange(brokers);
            else
                cc.AddRange(brokers);

            // Scheme and Admin recipients always go in bcc
            bcc.AddRange(schemes);
            bcc.AddRange(admin);

            return count + to.Count + cc.Count + bcc.Count;
        }

        private List<string> GetEmailList(string contacts)
        {
            var list = new List<string>();
            if (!string.IsNullOrWhiteSpace(contacts))
            {
                var emails = contacts.Split(';');
                foreach (var email in emails)
                {
                    if (email.IsValidEmail())
                    {
                        list.Add(email);
                    }
                }
            }
            return list;
        }

        private async Task SendPolicyEmail(PolicyDocumentContacts contacts, List<Document> documents, List<string> to, List<string> cc, List<string> bcc)
        {
            // Get the email subject and content
            var templates = await GetPolicyMessageTemplates(contacts.PolicyNumber);
            var emailSubject = templates.Find(s => s.SettingType == SettingTypeEnum.WelcomeEmailSubject);
            var emailBody = templates.Find(s => s.SettingType == SettingTypeEnum.WelcomeEmail);
            // Set the email subject
            var subject = !string.IsNullOrWhiteSpace(emailSubject.CampaignTemplate)
                ? emailSubject.CampaignTemplate
                : emailSubject.SettingTemplate;
            // Add the required values to the email body
            var body = !string.IsNullOrWhiteSpace(emailBody.CampaignTemplate)
                ? emailBody.CampaignTemplate
                : emailBody.SettingTemplate;
            body = body.Replace("{0}", emailBody.MemberName);
            body = body.Replace("{1}", emailBody.PolicyNumber);
            // Build the attachment list
            var attachments = new List<MailAttachment>();
            foreach (var document in documents)
            {
                attachments.Add(
                    new MailAttachment
                    {
                        AttachmentByteData = Convert.FromBase64String(document.FileAsBase64),
                        FileName = document.FileName,
                        FileType = document.MimeType
                    }
                );
            }
            // Build the email request
            var request = new SendMailRequest
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.Unknown,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                ItemId = contacts.PolicyId,
                Subject = subject,
                Body = body,
                IsHtml = true,
                Recipients = string.Join(";", to),
                RecipientsCC = string.Join(";", cc),
                RecipientsBCC = string.Join(";", bcc),
                Attachments = attachments.ToArray()
            };
            // Send the email
            await _sendEmailService.SendEmail(request);
        }

        private async Task SendPolicySms(PolicyDocumentContacts contacts, List<string> recipients)
        {
            // Get the sms message templates
            // Get the email subject and content
            var templates = await GetPolicyMessageTemplates(contacts.PolicyNumber);
            var smsMessage = templates.Find(s => s.SettingType == SettingTypeEnum.WelcomeSms);
            // Get the sms message and replace values as required
            var message = !string.IsNullOrWhiteSpace(smsMessage.CampaignTemplate)
                ? smsMessage.CampaignTemplate
                : smsMessage.SettingTemplate;
            message = message.Replace("{0}", contacts.PolicyNumber);
            // Send the sms to all of the specified recipients
            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.Unknown,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                ItemId = contacts.PolicyId,
                SmsNumbers = recipients,
                Message = message,
                WhenToSend = DateTimeHelper.SaNow,
            };
            // Send the messages
            await _sendSmsService.SendSmsMessage(smsRequest);
        }

        private List<string> GetPhoneNumbers(string input)
        {
            var list = new List<string>();
            foreach (Match match in Regex.Matches(input, @"\d+"))
            {
                if (match.Value.IsValidPhone())
                {
                    list.Add(match.Value);
                }
            }
            return list;
        }

        private async Task<List<Document>> GenerateMissingPolicyDocuments(string policyNumber)
        {
            var list = new List<Document>();
            // Get the document types for the specified policy
            var templates = await GetPolicyTemplates(policyNumber);
            // Check that all of the documents exist
            foreach (var template in templates)
            {
                // Get the document from the document index service
                var policyDocument = await _documentIndexService.GetDocumentBinaryByKeyValueDocTypeId("CaseCode", policyNumber, template.DocumentType);
                // Create the document if it doesn't exist
                if (policyDocument is null)
                {
                    var documentId = await RefreshPolicyDocument(policyNumber, template.DocumentType, DocumentRefreshReasonEnum.MissingDocument);
                    policyDocument = await _documentIndexService.GetDocumentBinary(documentId);
                    list.Add(policyDocument);
                }
                else
                {
                    list.Add(policyDocument);
                }
            }
            return list;
        }

        private async Task<int> GeneratePolicyDocument(PolicyDocumentTemplate template, bool encrypt, string reason)
        {
            if (template is null) return 0;

            if (string.IsNullOrEmpty(_reportServerUrl) || string.IsNullOrEmpty(_reportEnviroment))
                await GetReportSettings();

            var parameters = $"&policyId={template.PolicyId}&rs:Command=ClearSession";
            var uri = await GetSsrsUri($"{template.SettingValue}{parameters}&rs:Format=PDF");
            var document = await GetUriDocumentByteData(uri, _headerCollection);
            if (document?.Length > 0)
            {
                if (encrypt)
                {
                    var encryptedDocument = await GetEncryptedFile(template.PolicyNumber, template.IdNumber, document);
                    document = encryptedDocument.encryptedDocumentBytes;
                }
                await SavePolicyDocument(GetFileName(template), reason, template, document);
                return 1;
            }
            else
            {
                throw new Exception($"Could not generate document {template.DocumentType.DisplayAttributeValue()} for policy {template.PolicyNumber}");
            }
        }

        private string GetFileName(PolicyDocumentTemplate template)
        {
            switch (template.DocumentType)
            {
                case DocumentTypeEnum.PolicySchedule:
                case DocumentTypeEnum.GroupPolicySchedule:
                    return $"PolicySchedule-{template.MemberName.ToUpper()}-{template.PolicyNumber}.pdf";
                case DocumentTypeEnum.WelcomeLetter:
                    return "WelcomeLetter.pdf";
                case DocumentTypeEnum.TermsConditions:
                    return "TermsAndConditions.pdf";
                default:
                    return "PolicyDocument.pdf";
            }
        }

        private async Task SavePolicyDocument(string fileName, string description, PolicyDocumentTemplate template, byte[] byteDate)
        {
            var keys = new Dictionary<string, string> { { "CaseCode", template.PolicyNumber } };
            var document = new Document
            {
                DocTypeId = (int)template.DocumentType,
                SystemName = "PolicyManager",
                FileName = fileName,
                Keys = keys,
                DocumentStatus = DocumentStatusEnum.Received,
                FileExtension = "application/pdf",
                DocumentSet = template.DocumentSet,
                FileAsBase64 = Convert.ToBase64String(byteDate),
                MimeType = MimeMapping.GetMimeMapping(fileName),
                DocumentDescription = description
            };
            await _documentIndexService.UploadDocument(document);
        }

        private async Task<FileEncryptResponse> GetEncryptedFile(string policyNumber, string password, byte[] content)
        {
            var request = new FileEncryptRequest { documentBytes = content };
            var response = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, request);
            return response;
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        private Task<Uri> GetSsrsUri(string reportUrl)
        {
            if (string.IsNullOrWhiteSpace(_reportServerUrl))
                throw new ArgumentNullException(nameof(_reportServerUrl), "Report server URL is null or empty.");

            if (string.IsNullOrWhiteSpace(_reportEnviroment))
                throw new ArgumentNullException(nameof(_reportEnviroment), "Report environment URL is null or empty.");

            Uri serverUri = new Uri(_reportServerUrl);
            Uri reportUri = new Uri($"{_reportEnviroment}{_reportCategoryUrl}{reportUrl}", UriKind.Relative);
            var uri = new Uri(serverUri, reportUri);
            return Task.FromResult(uri);
        }
        #endregion

        #region Stored procedures
        private async Task<List<PolicyMessageTemplate>> GetPolicyMessageTemplates(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _policyRepository.SqlQueryAsync<PolicyMessageTemplate>(
                    DatabaseConstants.GetPolicyMessageTemplates,
                    new SqlParameter { ParameterName = "@policyNumber", Value = policyNumber }
                );
                return templates;
            }
        }

        private async Task<PolicyDocumentContacts> GetPolicyDocumentContacts(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _policyRepository.SqlQueryAsync<PolicyDocumentContacts>(
                    DatabaseConstants.GetPolicyDocumentContacts,
                    new SqlParameter { ParameterName = "@policyNumber", Value = policyNumber }
                );
                return templates.FirstOrDefault();
            }
        }

        private async Task<List<PolicyDocumentTemplate>> GetPolicyTemplates(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _policyRepository.SqlQueryAsync<PolicyDocumentTemplate>(
                    DatabaseConstants.GetPolicyDocumentTemplates,
                    new SqlParameter { ParameterName = "@policyNumber", Value = policyNumber }
                );
                return templates;
            }
        }
        #endregion

        #region Merged changes
        public async Task<PolicyDocumentCommunicationMatrix> GetPolicyDocumentCommunicationMatrix(int? policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _policyDocumentCommunicationMatrixRepository.Where(s => s.PolicyId == policyId).FirstOrDefaultAsync();
                if (entity == null) { return null; }
                var result = _policyDocumentCommunicationMatrixRepository.FirstOrDefault(p => p.PolicyId == entity.PolicyId);
                return result != null ? Mapper.Map<PolicyDocumentCommunicationMatrix>(result) : null;

            }
        }

        public async Task<bool> SendPolicyDocuments(int policyId, string policyCommunicationType)
        {
            try
            {

                var policyModel = await _policyService.GetPolicy(policyId);

                if (policyModel != null)
                {
                    var request = new PolicyCommunicationRequest
                    {
                        RecipientType = ScheduleRecipientTypeEnum.PolicyMember.ToString(),
                        PolicyCommunicationType = policyCommunicationType,
                        PolicyId = policyId,
                        ParentPolicyId = policyModel.ParentPolicyId.Value,
                        PolicyNumber = policyModel.PolicyNumber
                    };


                    var policyDocumentCommunicationMatrix = await GetPolicyDocumentCommunicationMatrix(policyModel.ParentPolicyId);

                    if (policyDocumentCommunicationMatrix != null)
                    {
                        await HandlePolicyDocumentCommunication(policyDocumentCommunicationMatrix, request);
                    }

                    else
                    {
                        var member = await _premiumListingService.GetPolicyMemberDetails(request.PolicyNumber);

                        await SendDocumentsBasedOnPreference(
                    member,
                    request.PolicyCommunicationType,
                    () => _communicationService.SendIndividualPolicyMemberPolicyDocuments(
                        policyModel.PolicyId,
                        policyModel.PolicyNumber,
                        member.MemberName,
                        member.IdNumber,
                        member.EmailAddress,
                        false, true, true, true));
                    }

                }

            }
            catch (Exception ex)
            {
                ex.LogException($"{nameof(PolicyDocumentFacade)}:  Policy Communication exception. PolicyData ", policyId);

            }
            return true;
        }

        private async Task HandlePolicyDocumentCommunication(PolicyDocumentCommunicationMatrix matrix, PolicyCommunicationRequest request)
        {

            var policyModel = await _policyService.GetPolicy(request.PolicyId);
            var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
            var policyMembers = new List<PolicyMember> { policyMember };
            var parentPolicy = await _policyService.GetPolicy(matrix.PolicyId);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicy.PolicyNumber);

            if (matrix.SendPolicyDocsToBroker)
            {

                var brokerEmail = parentPolicy.Brokerage?.Contacts?.Where(c => !string.IsNullOrEmpty(c.Email)).Select(c => c.Email).Distinct().ToList();
                parentPolicyMember.EmailAddress = brokerEmail?.FirstOrDefault() ?? parentPolicyMember.EmailAddress;

                await SendDocumentsBasedOnPreference(
           parentPolicyMember,
           request.PolicyCommunicationType,
           () => _communicationService.SendGroupPolicySchedulesToBroker(
               policyModel.ParentPolicyId.Value,
               policyModel.PolicyNumber,
               policyModel.BrokerageName,
               policyMembers,
               policyModel.BrokerageName,
               parentPolicyMember.EmailAddress));
            }

            if (matrix.SendPolicyDocsToMember)
            {
                var member = await _premiumListingService.GetPolicyMemberDetails(request.PolicyNumber);

                await SendDocumentsBasedOnPreference(member, request.PolicyCommunicationType,
            () => _communicationService.SendIndividualPolicyMemberPolicyDocuments(
                policyModel.PolicyId,
                policyModel.PolicyNumber,
                member.MemberName,
                member.IdNumber,
                member.EmailAddress,
                false, true, true, true));
            }

            if (matrix.SendPolicyDocsToAdmin)
            {

                var adminEmail = parentPolicy.PolicyContacts?
              .Where(c => !string.IsNullOrEmpty(c.EmailAddress))
              .Select(c => c.EmailAddress)
              .Distinct()
              .FirstOrDefault();

                parentPolicyMember.EmailAddress = adminEmail ?? parentPolicyMember.EmailAddress;
                parentPolicyMember.CellPhoneNumber = adminEmail ?? parentPolicyMember.CellPhoneNumber;

                await SendDocumentsBasedOnPreference(
                    parentPolicyMember,
                    request.PolicyCommunicationType,
                    () => _communicationService.SendPolicyDocumentsByRole(
                        policyModel.ParentPolicyId.Value,
                        policyModel.PolicyNumber,
                        parentPolicyMember.MemberName,
                        policyMembers,
                        policyModel.BrokerageName,
                        parentPolicyMember.EmailAddress)
                );
            }

            if (matrix.SendPolicyDocsToScheme)
            {

                await SendDocumentsBasedOnPreference(
                    parentPolicyMember,
                    request.PolicyCommunicationType,
                    () => _communicationService.SendPolicyDocumentsByRole(
                        policyModel.ParentPolicyId.Value,
                        policyModel.PolicyNumber,
                        parentPolicyMember.MemberName,
                        policyMembers,
                        policyModel.BrokerageName,
                        parentPolicyMember.EmailAddress)
                );
            }
        }

        private async Task SendDocumentsBasedOnPreference(PolicyMember member, string communicationType, Func<Task> sendEmailFallback)
        {
            bool prefersSms = member.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS;
            bool hasValidCell = !string.IsNullOrEmpty(member?.CellPhoneNumber);

            if (prefersSms && hasValidCell)
            {
                if (communicationType == PolicyCommunicationTypeEnum.NewOnboarding.ToString())
                {
                    await _communicationService.SendPolicyDocumentsBySms(member, TemplateTypeEnum.RMAFuneralNewBusinessPolicyWelcomeSms);
                }
                else
                {
                    await _communicationService.SendPolicyAmendedNotificationBySms(member, TemplateTypeEnum.RMAFuneralPolicyAmendmentSms);
                }
            }
            else
            {
                await sendEmailFallback();
            }

        }

        public async Task<bool> SendDocumentsToScheme(int policyId, string policyCommunicationType)
        {
            var policyModel = await _policyService.GetPolicy(policyId);
            var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
            var policyMembers = new List<PolicyMember> { policyMember };
            var parentPolicy = await _policyService.GetPolicy(policyModel.ParentPolicyId.Value);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicy.PolicyNumber);
            await SendDocumentsBasedOnPreference(
            parentPolicyMember,
                policyCommunicationType,
                 () => _communicationService.SendPolicyDocumentsByRole(
                     policyModel.ParentPolicyId.Value,
                     policyModel.PolicyNumber,
                     parentPolicyMember.MemberName,
                     policyMembers,
                     policyModel.BrokerageName,
                     parentPolicyMember.EmailAddress)
             );

            return true;

        }

        public async Task<bool> SendDocumentsToBroker(int policyId, string policyCommunicationType)
        {
            var policyModel = await _policyService.GetPolicy(policyId);
            var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
            var policyMembers = new List<PolicyMember> { policyMember };
            var parentPolicy = await _policyService.GetPolicy(policyModel.ParentPolicyId.Value);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicy.PolicyNumber);
            var brokerEmail = parentPolicy.Brokerage?.Contacts?.Where(c => !string.IsNullOrEmpty(c.Email)).Select(c => c.Email).Distinct().ToList();
            parentPolicyMember.EmailAddress = brokerEmail?.FirstOrDefault() ?? parentPolicyMember.EmailAddress;

            await SendDocumentsBasedOnPreference(
       parentPolicyMember,
       policyCommunicationType,
       () => _communicationService.SendGroupPolicySchedulesToBroker(
           policyModel.ParentPolicyId.Value,
           policyModel.PolicyNumber,
           policyModel.BrokerageName,
           policyMembers,
           policyModel.BrokerageName,
           parentPolicyMember.EmailAddress)
   );

            return true;
        }

        public async Task<bool> SendDocumentsToAdmin(int policyId, string policyCommunicationType)
        {
            var policyModel = await _policyService.GetPolicy(policyId);
            var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
            var policyMembers = new List<PolicyMember> { policyMember };
            var parentPolicy = await _policyService.GetPolicy(policyModel.ParentPolicyId.Value);
            var parentPolicyMember = await _premiumListingService.GetPolicyMemberDetails(parentPolicy.PolicyNumber);

            var adminEmail = parentPolicy.PolicyContacts?
              .Where(c => !string.IsNullOrEmpty(c.EmailAddress))
              .Select(c => c.EmailAddress)
              .Distinct()
              .FirstOrDefault();

            parentPolicyMember.EmailAddress = adminEmail ?? parentPolicyMember.EmailAddress;
            parentPolicyMember.CellPhoneNumber = adminEmail ?? parentPolicyMember.CellPhoneNumber;

            await SendDocumentsBasedOnPreference(
                parentPolicyMember,
                    policyCommunicationType,
                () => _communicationService.SendPolicyDocumentsByRole(
                    policyModel.ParentPolicyId.Value,
                    policyModel.PolicyNumber,
                    parentPolicyMember.MemberName,
                    policyMembers,
                    policyModel.BrokerageName,
                    parentPolicyMember.EmailAddress)
            );
            return true;
        }

        public async Task<bool> SendDocumentsToMember(int policyId, string policyCommunicationType)
        {
            var policyModel = await _policyService.GetPolicy(policyId);
            var policyMember = await _premiumListingService.GetPolicyMemberDetails(policyModel.PolicyNumber);
            var policyMembers = new List<PolicyMember> { policyMember };

            await SendDocumentsBasedOnPreference(
       policyMember,
       policyCommunicationType,
        () => _communicationService.SendIndividualPolicyMemberPolicyDocuments(
            policyModel.PolicyId,
            policyModel.PolicyNumber,
            policyMember.MemberName,
            policyMember.IdNumber,
            policyMember.EmailAddress,
            false, true, true, true)
        );
            return true;

        }

        public async Task<bool> SendUnfullfilledCommunications()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository.SqlQueryAsync<PolicyCommunicationUnfulfilledDetail>(
                    DatabaseConstants.GetPoliciesUnfulfilledWithin30days
                );

                foreach (var policy in policies)
                {
                    string communicationType = PolicyCommunicationTypeEnum.NewOnboarding.ToString();

                    await SendPolicyDocuments(policy.PolicyId, communicationType);
                }
            }
            return true;
        }
        public async Task<bool> SendUnfullfilledOnceOffCommunications()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository.SqlQueryAsync<PolicyCommunicationUnfulfilledDetail>(
                    DatabaseConstants.GetPoliciesUnfulfilledWithin30days
                );

                foreach (var policy in policies)
                {
                    string communicationType = PolicyCommunicationTypeEnum.PolicyAmendment.ToString();

                    await SendPolicyDocuments(policy.PolicyId, communicationType);
                }
            }
            return true;
        }
        public async Task<bool> SendUnfullfilledSchemeCommunications()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository.SqlQueryAsync<PolicyCommunicationUnfulfilledDetail>(
                    DatabaseConstants.GetUnfulfilledSchemesWithin30Days
                );

                foreach (var policy in policies)
                {
                    string communicationType = PolicyCommunicationTypeEnum.NewOnboarding.ToString();

                    await SendPolicyDocuments(policy.PolicyId, communicationType);
                }
            }
            return true;
        }

        public async Task<bool> SendUnfullfilledOnceOffSchemeCommunications()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository.SqlQueryAsync<PolicyCommunicationUnfulfilledDetail>(
                    DatabaseConstants.GetSchemesUnfulfilledOnceOff
                );

                foreach (var policy in policies)
                {
                    string communicationType = PolicyCommunicationTypeEnum.PolicyAmendment.ToString();

                    await SendPolicyDocuments(policy.PolicyId, communicationType);
                }
            }
            return true;
        }
        #endregion
    }
}
