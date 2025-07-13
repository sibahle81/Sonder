using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyCommunicationFacade : RemotingStatelessService, IPolicyCommunicationService
    {
        #region only these services are required in this service
        private readonly IEmailService _emailService;
        private readonly ISendEmailService _sendEmailService;
        private readonly ISendSmsService _sendSmsService;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly IDocumentGeneratorService _documentGeneratorService;   
        #endregion

        private string _fromAddress;
        private string _reportserverUrl;
        private string _parameters;
        private readonly ISmsTemplateService _smsTemplateService;

        private WebHeaderCollection _headerCollection;
        private const int defaultBatchCount = 20;            

        [SuppressMessage("Usage", "VSTHRD002:Avoid problematic synchronous waits")]

        public PolicyCommunicationFacade(
            StatelessServiceContext context,
            IEmailService emailService,
            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IDocumentIndexService documentIndexService,
            ISendSmsService sendSmsService,
            IEmailTemplateService emailTemplateService,
            IDocumentGeneratorService documentGeneratorService,
            ISmsTemplateService smsTemplateService
        ) : base(context)
        {
            _parameters = null;
            _headerCollection = null;
            _emailService = emailService;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _documentIndexService = documentIndexService;
            _sendSmsService = sendSmsService;
            _emailTemplateService = emailTemplateService;
            _documentGeneratorService = documentGeneratorService; 
            _smsTemplateService = smsTemplateService;
            Task.Run(() => this.SetupPolicyCommunicationVariables()).Wait();
        }

        private async Task SetupPolicyCommunicationVariables()
        {
            _fromAddress = "noreply@randmutual.co.za"; // await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportserverUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClientCare.Policy";
        }

        public async Task SendFuneralPolicyDocuments(int wizardId, Case caseModel, Case parentCaseModel, PolicySendDocsProcessTypeEnum policySendDocsProcessType)
        {
            Contract.Requires(caseModel != null);

            _parameters = $"&wizardId={wizardId}&policyNumber={caseModel.Code}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            switch (policySendDocsProcessType)
            {
                case PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicySchedule:
                    await SendIndividualFuneralPolicyScheduleDocuments(caseModel);
                    break;

                case PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicyCancellation:
                case PolicySendDocsProcessTypeEnum.SendGroupFuneralPolicyCancellation:
                    await SendIndividualFuneralPolicyCancellationDocuments(caseModel, policySendDocsProcessType);
                    break;

                case PolicySendDocsProcessTypeEnum.SendGroupFuneralPolicyMembershipCertificate:
                    await SendGroupFuneralPolicyMembershipCertificate(caseModel, parentCaseModel);
                    //TO DO: Send message to service bus for child policy policy schedule
                    break;
            }
        }

        private async Task SendIndividualFuneralPolicyScheduleDocuments(Case caseModel)
        {
            switch ((CommunicationTypeEnum)caseModel?.MainMember.PreferredCommunicationTypeId)
            {
                case CommunicationTypeEnum.Email:
                    await SendFuneralPolicyScheduleByEmail(caseModel);
                    break;
                case CommunicationTypeEnum.SMS:
                    await SendFuneralPolicyScheduleBySMS(caseModel);
                    break;
            }
        }

        private async Task SendIndividualFuneralPolicyCancellationDocuments(Case caseModel, PolicySendDocsProcessTypeEnum policyType)
        {
            if (caseModel.MainMember == null || caseModel.MainMember.Policies.Count == 0 || caseModel.MainMember.Person == null)
            {
                return;
            }
            var representativeEmail = caseModel.Representative?.Email ?? "";
            await SendPolicyCancellationDocuments(
                caseModel.MainMember.Policies[0].PolicyId,
                caseModel.MainMember.Policies[0].PolicyNumber,
                caseModel.MainMember.Person.FirstName + " " + caseModel.MainMember.Person.Surname,
                caseModel.MainMember.EmailAddress,
                representativeEmail,
                policyType,
                caseModel.MainMember.Policies[0].ProductOption.Product.ProductClass
            );
        }

        public async Task SendPolicyCancellationSms(string cellNumber, int policyId, string policyNumber)
        {
            var msg = "Dear RMA valued Client, Kindly be advised that your RMA policy "
                + policyNumber
                + " has been cancelled. Kind Regards, RMA Life Operation Retention Team";

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = BusinessAreaEnum.RetentionsCancellations,
                SmsNumbers = new List<string>() { cellNumber },
                Message = msg,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);
        }

        public async Task SendPolicyCancellationDocuments(
            int policyId,
            string policyNumber,
            string memberName,
            string memberEmail,
            string representativeEmail,
            PolicySendDocsProcessTypeEnum policySendType,
            ProductClassEnum productClass)
        {
            byte[] policyCancellationDocBytes = null;

            _parameters = $"&wizardId={0}&policyId={policyId}&rs:Command=ClearSession";

            var emailBody = string.Empty;

            if (!string.IsNullOrEmpty(_parameters))
            {
                if (productClass == ProductClassEnum.ValuePlus)
                {
                    emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAMvpNewBusinessIndividualPolicyCancellationEmailBody));
                    policyCancellationDocBytes = await GetUriDocumentByteData(
                    new Uri($"{_reportserverUrl}/RMAMVPPolicyCancellationLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                }
                else
                {
                    emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralNewBusinessIndividualPolicyCancellationEmailBody));
                    policyCancellationDocBytes = await GetUriDocumentByteData(
                    new Uri($"{_reportserverUrl}/RMAFuneralPolicyCancellationLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                }
            }

            if (_headerCollection == null)
            {
                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };
            }

            List<MailAttachment> attachments = null;
            if (policyCancellationDocBytes != null)
            {
                attachments = new List<MailAttachment>
                {
                    new MailAttachment
                    {
                        AttachmentByteData = policyCancellationDocBytes,
                        FileName = "PolicyCancellation.pdf",
                        FileType = "application/pdf"
                    }
                };
            }

            var emailRequest = new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = BusinessAreaEnum.RetentionsCancellations,
                FromAddress = _fromAddress,
                Recipients = memberEmail,
                RecipientsCC = representativeEmail,
                Subject = $"RMA Funeral Plan Policy Cancellation: {policyNumber}",
                Body = emailBody
                    .Replace("{0}", memberName)
                    .Replace("{1}", "Your Policy " + policyNumber + " has been cancelled."),
                IsHtml = true
            };

            if (attachments != null)
            {
                emailRequest.Attachments = attachments.ToArray();
            }

            await _sendEmailService.SendEmail(emailRequest);

            if (policyCancellationDocBytes != null)
            {
                await UploadPolicyDocument
                (
                    DocumentTypeEnum.ConfirmationofCancellation,
                    "PolicyCancellation.pdf",
                    new Dictionary<string, string> { { "CaseCode", policyNumber } },
                    "application/pdf",
                    DocumentSetEnum.PolicyCancellation,
                    policyCancellationDocBytes
                );
            }
        }

        private async Task SendGroupFuneralPolicyMembershipCertificate(Case caseModel, Case parentCaseModel)
        {
            if (caseModel != null && parentCaseModel != null)
            {
                string premiumListingType = "RMAFuneralPolicyEmployerPremiumListing";

                if (caseModel.MainMember.Policies[0].ParentPolicyId.HasValue && caseModel.MainMember.Policies[0].ParentPolicyId.Value > 0)
                {
                    if (parentCaseModel?.MainMember.Company?.CompanyIdType == CompanyIdTypeEnum.Group)
                    {
                        premiumListingType = "RMAFuneralPolicyMemberCertificate";
                    }
                }
                else if (caseModel.MainMember.Company?.CompanyIdType == CompanyIdTypeEnum.Group)
                {
                    premiumListingType = "RMAFuneralPolicyMemberCertificate";
                }

                var premiumListing = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{premiumListingType}{_parameters}&rs:Format=EXCEL"), _headerCollection);
                var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = premiumListing, FileName = "PremiumListing.xls", FileType = "application/vnd.ms-excel"}
                };
                var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralNewBusinessGroupPolicyMemberCertificateEmailBody));
                if (caseModel.MainMember.Company != null)
                {
                    emailBody = emailBody.Replace("{0}", caseModel.MainMember.Company.ContactPersonName).Replace("{1}", caseModel.ClientReference);
                }

                var request = new SendMailRequest
                {
                    ItemId = caseModel.MainMember.Policies[0].PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                    FromAddress = _fromAddress,
                    Recipients = caseModel.MainMember.EmailAddress,
                    Subject = "RMA Funeral Plan Member Documents",
                    Body = emailBody,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                };

                await _sendEmailService.SendEmail(request);

                await UploadPolicyDocument
                  (
                      DocumentTypeEnum.GroupPolicySchedule,
                      "PremiumListing.xls",
                      new Dictionary<string, string> { { "CaseCode", caseModel.ClientReference } },
                      "application/vnd.ms-excel",
                      DocumentSetEnum.PolicyDocumentsgroup,
                      premiumListing
                  );
            }
        }

        public async Task SendChildOverAgeSMS(int policyId, string policyNumber, string cellNumber, string childName, int daysNotification)
        {
            var smsMessage = daysNotification > 0
                ? (await _configurationService.GetModuleSetting(SystemSettings.ChildOverAgeNotification))
                : (await _configurationService.GetModuleSetting(SystemSettings.ChildOverAgeFinalNotification));

            smsMessage = smsMessage.Replace("[ChildName]", childName);
            smsMessage = smsMessage.Replace("[PolicyNumber]", policyNumber);
            smsMessage = smsMessage.Replace("[DaysNotification]", daysNotification.ToString());

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = BusinessAreaEnum.RetentionsOverAge,
                SmsNumbers = new List<string>() { cellNumber },
                Message = smsMessage,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);
        }
        private async Task SendFuneralPolicyScheduleBySMS(Case caseModel)
        {
            Contract.Requires(caseModel != null);
            var pauseSmsPolicyScheduleDelivery = await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.PauseSmsPolicyScheduleDelivery);

            if (pauseSmsPolicyScheduleDelivery) { return; }

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            var rolePlayer = caseModel.MainMember;
            var policy = rolePlayer.Policies[0];
            var isCfp = policy.PolicyLifeExtension != null;

            var password = rolePlayer.Person.IdNumber;
            if (string.IsNullOrEmpty(password) || string.IsNullOrWhiteSpace(password))
            {
                password = rolePlayer.Person.PassportNumber;
            }
            if (!string.IsNullOrEmpty(caseModel.MainMember.Policies[0]?.ParentPolicyNumber) || !string.IsNullOrWhiteSpace(caseModel.MainMember.Policies[0]?.ParentPolicyNumber))
            {
                password = caseModel.MainMember.Policies[0]?.ParentPolicyNumber;
            }

            _parameters = isCfp
                ? $"&wizardId={caseModel.MainMember.Policies[0].PolicyId}&rs:Command=ClearSession"
                : $"&policyId={caseModel.MainMember.Policies[0].PolicyId}&rs:Command=ClearSession";

            var welcomeLetter = isCfp
                    ? await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection)
                    : await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
            var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(caseModel.MainMember.Policies[0].PolicyNumber, password, fileEncryptRequest);

            _parameters = $"&policyId={caseModel.MainMember.Policies[0].PolicyId}&rs:Command=ClearSession";

            var policySchedule = isCfp
                ? await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection)
                : await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            var scheduleEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = policySchedule };
            var encryptedpolicySchedule = await _documentGeneratorService.PasswordProtectPdf(caseModel.MainMember.Policies[0].PolicyNumber, password, scheduleEncryptRequest);

            var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralNewBusinessIndividualPolicyScheduleSmsMessage));
            var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

            smsMessage = smsMessage
                        .Replace("{0}", caseModel.MainMember.Policies[0].PolicyNumber)
                        .Replace("{1}", urlAppend);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                SmsNumbers = new List<string>() { caseModel.MainMember.CellNumber },
                Message = smsMessage,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = caseModel.MainMember.Policies[0].PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);

            var memberName = $"{caseModel.MainMember.Person.FirstName.Trim()}-{caseModel.MainMember.Person.Surname.Trim()}".ToUpper();

            await UploadPolicyDocument
            (
                DocumentTypeEnum.WelcomeLetter,
                $"WelcomeLetter-{memberName}-{policy.PolicyNumber}.pdf",
                new Dictionary<string, string> { { "CaseCode", policy.PolicyNumber } },
                "application/pdf",
                DocumentSetEnum.PolicyDocumentsindividual,
                encryptedWelcomeLetter.encryptedDocumentBytes
            );

            await UploadPolicyDocument
            (
                DocumentTypeEnum.PolicySchedule,
                $"PolicySchedule-{memberName}-{policy.PolicyNumber}.pdf",
                new Dictionary<string, string> { { "CaseCode", policy.PolicyNumber } },
                "application/pdf",
                DocumentSetEnum.PolicyDocumentsindividual,
                encryptedpolicySchedule.encryptedDocumentBytes
            );
        }

        private async Task SendFuneralPolicyScheduleByEmail(Case caseModel)
        {
            Contract.Requires(caseModel != null);

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            var rolePlayer = caseModel.MainMember;
            var policy = rolePlayer.Policies[0];
            var isCfp = policy.PolicyLifeExtension != null;

            var password = rolePlayer.Person.IdNumber;
            if (string.IsNullOrEmpty(password) || string.IsNullOrWhiteSpace(password))
            {
                password = rolePlayer.Person.PassportNumber;
            }
            if (!string.IsNullOrEmpty(caseModel.MainMember.Policies[0]?.ParentPolicyNumber) || !string.IsNullOrWhiteSpace(caseModel.MainMember.Policies[0]?.ParentPolicyNumber))
            {
                password = caseModel.MainMember.Policies[0]?.ParentPolicyNumber;
            }

            _parameters = isCfp
                ? $"&wizardId={caseModel.MainMember.Policies[0].PolicyId}&rs:Command=ClearSession"
                : $"&policyId={caseModel.MainMember.Policies[0].PolicyId}&rs:Command=ClearSession";

            var welcomeLetter = isCfp
                ? await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection)
                : await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
            var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(caseModel.MainMember.Policies[0].PolicyNumber, password, fileEncryptRequest);

            _parameters = $"&policyId={caseModel.MainMember.Policies[0].PolicyId}&rs:Command=ClearSession";

            var policySchedule = isCfp
                ? await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection)
                : await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            var scheduleEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = policySchedule };
            var encryptedpolicySchedule = await _documentGeneratorService.PasswordProtectPdf(caseModel.MainMember.Policies[0].PolicyNumber, password, scheduleEncryptRequest);

            var termsAndConditions = isCfp
                ? await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralPolicyTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection)
                : await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralCoverTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
                {
                    new MailAttachment { AttachmentByteData = encryptedWelcomeLetter.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf"},
                    new MailAttachment { AttachmentByteData = encryptedpolicySchedule.encryptedDocumentBytes, FileName = "PolicySchedule.pdf", FileType = "application/pdf"},
                    new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf"},
                };

            var isEuropAssist = caseModel.MainMember.Policies[0].IsEuropAssist;
            if (isEuropAssist)
            {
                var europAssistProductWording = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAEuropAssistProductWording.pdf&rs:Format=PDF"), _headerCollection);
                attachments.Add(new MailAttachment { AttachmentByteData = europAssistProductWording, FileName = "RMAEuropAssistProductWording.pdf", FileType = "application/pdf" });
            }

            var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralGroupPolicyWelcomeLetter));

            var idNumber = rolePlayer.Person.IdNumber;
            var passportNumber = rolePlayer.Person.PassportNumber;

            string maskedNumber;
            string maskedHint = "";

            if (!string.IsNullOrEmpty(idNumber) && !string.IsNullOrWhiteSpace(idNumber))
            {
                maskedNumber = idNumber.Length >= 13 ? idNumber.Substring(0, 3) + new string('*', 7) + idNumber.Substring(10) : idNumber;
                maskedHint = $"<p>Password hint: Use Your ID Number {maskedNumber} to open the documents.</p>";
            }
            else if (!string.IsNullOrEmpty(passportNumber) && !string.IsNullOrWhiteSpace(passportNumber))
            {
                maskedNumber = passportNumber.Length >= 8 ? passportNumber.Substring(0, 1) + new string('*', 5) + passportNumber.Substring(6) : passportNumber;
                maskedHint = $"<p>Password hint: Use Your Passport Number {maskedNumber} to open the documents.</p>";
            }

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = caseModel.MainMember.Policies[0].PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                FromAddress = _fromAddress,
                Recipients = caseModel.MainMember.EmailAddress,
                RecipientsCC = caseModel.Representative?.Email,
                Subject = $"RMA Funeral Plan Policy Schedule: {policy.PolicyNumber}",
                Body = emailBody.Replace("{0}", caseModel.MainMember.Person.FirstName + " " + caseModel.MainMember.Person.Surname)
                                .Replace("{1}", policy.PolicyNumber)
                                .Replace("{2}", maskedHint),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });

            var memberName = $"{caseModel.MainMember.Person.FirstName.Trim()}-{caseModel.MainMember.Person.Surname.Trim()}".ToUpper();

            await UploadPolicyDocument
            (
                DocumentTypeEnum.WelcomeLetter,
                $"WelcomeLetter-{memberName}-{policy.PolicyNumber}.pdf",
                new Dictionary<string, string> { { "CaseCode", policy.PolicyNumber } },
                "application/pdf",
                DocumentSetEnum.PolicyDocumentsindividual,
                encryptedWelcomeLetter.encryptedDocumentBytes
            );

            await UploadPolicyDocument
            (
                DocumentTypeEnum.PolicySchedule,
                $"PolicySchedule-{memberName}-{policy.PolicyNumber}.pdf",
                new Dictionary<string, string> { { "CaseCode", policy.PolicyNumber } },
                "application/pdf",
                DocumentSetEnum.PolicyDocumentsindividual,
                encryptedpolicySchedule.encryptedDocumentBytes
            );

            if (isEuropAssist)
            {
                await UploadPolicyDocument
                (
                    DocumentTypeEnum.EuropAssistProductWording,
                    "RMAEuropAssistProductWording.pdf",
                    new Dictionary<string, string> { { "CaseCode", caseModel.MainMember.Policies[0].PolicyNumber } },
                    "application/pdf",
                    DocumentSetEnum.PolicyDocumentsindividual,
                    policySchedule
                );
            }
        }

        private async Task UploadPolicyDocument(DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes)
        {
            if (!string.IsNullOrEmpty(fileName) && !string.IsNullOrEmpty(fileExtension) && documentBytes != null)
            {
                var policyDocument = new Document
                {
                    DocTypeId = (int)documentType,
                    SystemName = "PolicyManager",
                    FileName = fileName,
                    Keys = keys,
                    DocumentStatus = DocumentStatusEnum.Received,
                    FileExtension = fileExtension,
                    DocumentSet = documentSet,
                    FileAsBase64 = Convert.ToBase64String(documentBytes),
                    MimeType = MimeMapping.GetMimeMapping(fileName)
                };
                await _documentIndexService.UploadDocument(policyDocument);
            }
        }

        private async Task ReplacePolicyDocument(DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes)
        {
            if (!string.IsNullOrEmpty(fileName) && !string.IsNullOrEmpty(fileExtension) && documentBytes != null)
            {
                var policyDocument = new Document
                {
                    DocTypeId = (int)documentType,
                    SystemName = "PolicyManager",
                    FileName = fileName,
                    Keys = keys,
                    DocumentStatus = DocumentStatusEnum.Received,
                    FileExtension = fileExtension,
                    DocumentSet = documentSet,
                    FileAsBase64 = Convert.ToBase64String(documentBytes),
                    MimeType = MimeMapping.GetMimeMapping(fileName)
                };
                await _documentIndexService.UpdateDocument(policyDocument);
            }
        }
        private string GetPasswordAndMaskedHint(string idNumber, string policyNumber, out string maskedHint)
        {
            string password = "";
            if (string.IsNullOrEmpty(idNumber))
            {
                password = policyNumber;
                maskedHint = password.Substring(0, 7)
                    + new string('*', 2)
                    + "-"
                    + new string('*', password.Length - 10);
                maskedHint = $"<p>Password hint: Use Your Policy Number {maskedHint} to open the documents.</p>";
            }
            else
            {
                password = idNumber;
                maskedHint = password.Substring(0, 3)
                    + new string('*', password.Length - 6)
                    + password.Substring(password.Length - 3, 3);
                maskedHint = $"<p>Password hint: Use Your ID Number {maskedHint} to open the documents.</p>";
            }
            return password;
        }

        public async Task SendGroupSchemePolicyDocuments(
            PolicyModel policy,
            int policyId,
            string policyNumber,
            string memberName,
            string emailAddress,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {
            Contract.Requires(policy != null);
            var attachments = new List<MailAttachment>();
            var welcomeLetterName = "RMAFuneralGroupWelcomeLetter";
            var termsAndConditionsName = "RMAFuneralPolicyGroupTermsAndConditions";
            var policyScheduleName = "RMAFuneralGroupPolicySchedule";
            var bodyTemplate = SystemSettings.RMAFuneralGroupPolicyWelcomeLetter;
            var subject = $"RMA Policy Schedule";

            if (policy.PolicyLifeExtension != null)
            {
                await SendCFPSchemePolicyDocuments(policy, sendWelcomeLetter, sendPolicySchedule, sendTermsAndConditions);
                return;
            }

            if (policy.ProductOption.ProductOptionSettings != null && policy.ProductOption.ProductOptionSettings.Any(x => x != null))
            {
                if (policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.PolicyScheduler)?.FirstOrDefault().Value.Length > 0)
                    policyScheduleName = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.PolicyScheduler)?.FirstOrDefault().Value;

                if (policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeLetter)?.FirstOrDefault().Value.Length > 0)
                    welcomeLetterName = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeLetter)?.FirstOrDefault().Value;

                if (policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.TermsAndConditions)?.FirstOrDefault().Value.Length > 0)
                    termsAndConditionsName = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.TermsAndConditions)?.FirstOrDefault().Value;

                if (policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmail)?.FirstOrDefault().Value.Length > 0)
                    bodyTemplate = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmail)?.FirstOrDefault().Value;

                if (policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmailSubject)?.FirstOrDefault().Value.Length > 0)
                    subject = policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmailSubject)?.FirstOrDefault().Value;

            }

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";

            var rolePlayer = policy.PolicyOwner;

            var password = GetPasswordAndMaskedHint(rolePlayer?.Person?.IdNumber, policy.PolicyNumber, out string maskedHint);
            var body = await _configurationService.GetModuleSetting(bodyTemplate);
            body = body.Replace("{0}", memberName).Replace("{1}", policyNumber).Replace("{2}", maskedHint);

            var policyIdentifier = rolePlayer.Person != null
                    ? $"{rolePlayer.Person.FirstName.Trim()}-{rolePlayer.Person.Surname.Trim()}-{policyNumber}"
                    : policyNumber;

            // Welcome Letter
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{welcomeLetterName}{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policy.PolicyNumber, password, fileEncryptRequest);
                await SavePolicyDocument(policyNumber, "WelcomeLetter.pdf", encryptedWelcomeLetter.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.WelcomeLetter, true);
                if (sendWelcomeLetter)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedWelcomeLetter.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }
            }

            // Terms and Conditions
            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{termsAndConditionsName}.pdf&rs:Format=PDF"), _headerCollection);
            if (termsAndConditions.Length > 0)
            {
                await SavePolicyDocument(policyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.TermsConditions, true);
                if (sendTermsAndConditions)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }
            }

            // Policy Schedule
            var policySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{policyScheduleName}{_parameters}&rs:Format=PDF"), _headerCollection);
            if (policySchedule.Length > 0)
            {
                var scheduleEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = policySchedule };
                var encryptedPolicySchedule = await _documentGeneratorService.PasswordProtectPdf(policy.PolicyNumber, password, scheduleEncryptRequest);
                await SavePolicyDocument(policyNumber, $"PolicySchedule-{policyIdentifier}.pdf", encryptedPolicySchedule.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.GroupPolicySchedule, true);
                if (sendPolicySchedule)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedPolicySchedule.encryptedDocumentBytes, FileName = $"PolicySchedule-{policyIdentifier}.pdf", FileType = "application/pdf" });
                }
            }

            // Europ assist 
            if (policy.IsEuropAssist)
            {
                var europAssistProductWording = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAEuropAssistProductWording.pdf&rs:Format=PDF"), _headerCollection);
                if (europAssistProductWording.Length > 0)
                {
                    await SavePolicyDocument(policyNumber, "RMAEuropAssistProductWording.pdf", europAssistProductWording, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.EuropAssistProductWording, true);
                    attachments.Add(new MailAttachment { AttachmentByteData = europAssistProductWording, FileName = "RMAEuropAssistProductWording.pdf", FileType = "application/pdf" });
                }
            }

            if (string.IsNullOrEmpty(emailAddress) || attachments.Count == 0) return;

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = subject,
                Body = body,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        public async Task SendCFPSchemePolicyDocuments(
            PolicyModel policy,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {
            Contract.Requires(policy != null);
            var attachments = new List<MailAttachment>();

            _parameters = $"&wizardId={policy.PolicyId}&rs:Command=ClearSession";

            var rolePlayer = policy.PolicyOwner;

            var password = GetPasswordAndMaskedHint(rolePlayer?.Person?.IdNumber, policy.PolicyNumber, out string maskedHint);

            var policyIdentifier = rolePlayer.Person != null
                    ? $"{rolePlayer.Person.FirstName.Trim()}-{rolePlayer.Person.Surname.Trim()}-{policy?.PolicyNumber}"
                    : policy?.PolicyNumber;

            var body = await _configurationService.GetModuleSetting(SystemSettings.RMACFPFuneralWelcomeLetter);
            body = body.Replace("{0}", policy.PolicyOwner.Person.FirstName)
                .Replace("{1}", policy.PolicyNumber)
                .Replace("{2}", maskedHint);


            var cfpWelcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (cfpWelcomeLetter?.Length > 0)
            {
                var encryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = cfpWelcomeLetter };
                var encryptedCfpWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policy.PolicyNumber, password, encryptRequest);
                await SavePolicyDocument(policy.PolicyNumber, "WelcomeLetter.pdf", encryptedCfpWelcomeLetter.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.WelcomeLetter, true);
                if (sendWelcomeLetter)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedCfpWelcomeLetter.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }
            }

            _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";

            var cfpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            if (cfpPolicySchedule?.Length > 0)
            {
                var encryptScheduleRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = cfpPolicySchedule };
                var encryptedCfpPolicySchedule = await _documentGeneratorService.PasswordProtectPdf(policy.PolicyNumber, password, encryptScheduleRequest);
                await SavePolicyDocument(policy.PolicyNumber, $"PolicySchedule-{policyIdentifier}.pdf", encryptedCfpPolicySchedule.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.GroupPolicySchedule, true);
                if (sendPolicySchedule)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedCfpPolicySchedule.encryptedDocumentBytes, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
                }
            }

            var cfpTermsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);
            if (cfpTermsAndConditions.Length > 0)
            {
                await SavePolicyDocument(policy.PolicyNumber, "TermsAndConditions.pdf", cfpTermsAndConditions, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.TermsConditions, true);
                if (sendTermsAndConditions)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = cfpTermsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }
            }

            if (string.IsNullOrEmpty(policy.PolicyOwner.EmailAddress) || attachments.Count == 0) return;

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policy.PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                FromAddress = _fromAddress,
                Recipients = policy.PolicyOwner.EmailAddress,
                Subject = $"RMA Consolidated Funeral Policy Schedule",
                Body = body,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        public async Task SendGroupPolicyOrganisationDocuments(PolicyModel policy, int policyId, string policyNumber, string memberName, string emailAddress)
        {
            await SendGroupSchemePolicyDocuments(policy, policyId, policyNumber, memberName, emailAddress, true, true, true);
        }

        public async Task SendGroupPolicyMemberPolicyDocuments(
            int policyId,
            string policyNumber,
            string memberName,
            string idNumber,
            string emailAddress,
            bool isEuropAssist,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {

            Contract.Requires(policyNumber != null);

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";
            var attachments = new List<MailAttachment>();

            var password = GetPasswordAndMaskedHint(idNumber, policyNumber, out string maskedHint);

            var policyIdentifier = string.IsNullOrWhiteSpace(memberName)
                    ? policyNumber
                    : $"{memberName}-{policyNumber}";

            var body = await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralGroupPolicyMembershipCertificate);
            body = body.Replace("{0}", memberName)
                .Replace("{1}", policyNumber)
                .Replace("{2}", maskedHint);

            // Welcome letter
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralGroupWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var encryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptRequest);
                await SavePolicyDocument(policyNumber, "WelcomeLetter.pdf", encryptedWelcomeLetter.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.WelcomeLetter, true);
                if (sendWelcomeLetter)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedWelcomeLetter.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }
            }

            // Policy schedule
            var membershipCertificate = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAGroupPolicyMemberCertificate{_parameters}&rs:Format=PDF"), _headerCollection);
            if (membershipCertificate.Length > 0)
            {
                var encryptCertificateRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = membershipCertificate };
                var encryptedPolicySchedule = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptCertificateRequest);
                await SavePolicyDocument(policyNumber, $"PolicySchedule-{policyIdentifier}.pdf", encryptedPolicySchedule.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.PolicySchedule, true);
                if (sendPolicySchedule)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedPolicySchedule.encryptedDocumentBytes, FileName = "MembershipCertificate.pdf", FileType = "application/pdf" });
                }
            }

            // Terms and conditions
            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralPolicyGroupTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);
            if (termsAndConditions.Length > 0)
            {
                await SavePolicyDocument(policyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.TermsConditions, true);
                if (sendTermsAndConditions)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }
            }

            // Europ Assist policy wording
            if (isEuropAssist)
            {
                var europAssistProductWording = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAEuropAssistProductWording.pdf&rs:Format=PDF"), _headerCollection);
                if (europAssistProductWording.Length > 0)
                {
                    var encryptEuropRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = europAssistProductWording };
                    var encryptedEurop = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptEuropRequest);
                    await SavePolicyDocument(policyNumber, "RMAEuropAssistProductWording.pdf", encryptedEurop.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.EuropAssistProductWording, true);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedEurop.encryptedDocumentBytes, FileName = "RMAEuropAssistProductWording.pdf", FileType = "application/pdf" });
                }
            }

            if (string.IsNullOrEmpty(emailAddress) || attachments.Count == 0) return;

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = "RMA Policy Membership Certificate",
                Body = body,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        public async Task SendIndividualPolicyMemberPolicyDocuments(
          int policyId,
          string policyNumber,
          string memberName,
          string idNumber,
          string emailAddress,
          bool isEuropAssist,
          bool sendWelcomeLetter,
          bool sendPolicySchedule,
          bool sendTermsAndConditions)
        {

            Contract.Requires(policyNumber != null);

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";
            var attachments = new List<MailAttachment>();

            var password = GetPasswordAndMaskedHint(idNumber, policyNumber, out string maskedHint);

            var policyIdentifier = string.IsNullOrWhiteSpace(memberName)
                    ? policyNumber
                    : $"{memberName}-{policyNumber}";

            string templateKey = (sendWelcomeLetter && sendPolicySchedule && sendTermsAndConditions)
                                    ? SystemSettings.RMAFuneralNewBusinessIndividualPolicyScheduleEmailBody
                                    : SystemSettings.RMAFuneralAmendedIndividualPolicyScheduleEmailBody;

            var body = await _configurationService.GetModuleSetting(templateKey);
            body = body.Replace("{0}", memberName)
                .Replace("{1}", policyNumber)
                .Replace("{2}", maskedHint);
                       

            // Welcome letter
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralIndividualWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var encryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptRequest);
                await SavePolicyDocument(policyNumber, "WelcomeLetter.pdf", encryptedWelcomeLetter.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.WelcomeLetter, true);
                if (sendWelcomeLetter)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedWelcomeLetter.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }
            }

            // Policy schedule
            var membershipCertificate = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            if (membershipCertificate.Length > 0)
            {
                var encryptCertificateRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = membershipCertificate };
                var encryptedPolicySchedule = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptCertificateRequest);
                await SavePolicyDocument(policyNumber, $"PolicySchedule-{policyIdentifier}.pdf", encryptedPolicySchedule.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.PolicySchedule, true);
                if (sendPolicySchedule)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedPolicySchedule.encryptedDocumentBytes, FileName = $"PolicySchedule-{policyIdentifier}.pdf", FileType = "application/pdf" });
                }
            }

            // Terms and conditions
            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAFuneralCoverTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);
            if (termsAndConditions.Length > 0)
            {
                await SavePolicyDocument(policyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.TermsConditions, true);
                if (sendTermsAndConditions)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }
            }

            // Europ Assist policy wording
            if (isEuropAssist)
            {
                var europAssistProductWording = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAEuropAssistProductWording.pdf&rs:Format=PDF"), _headerCollection);
                if (europAssistProductWording.Length > 0)
                {
                    var encryptEuropRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = europAssistProductWording };
                    var encryptedEurop = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptEuropRequest);
                    await SavePolicyDocument(policyNumber, "RMAEuropAssistProductWording.pdf", encryptedEurop.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.EuropAssistProductWording, true);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedEurop.encryptedDocumentBytes, FileName = "RMAEuropAssistProductWording.pdf", FileType = "application/pdf" });
                }
            }

            if (string.IsNullOrEmpty(emailAddress) || attachments.Count == 0) return;

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = "RMA Policy Membership Certificate",
                Body = body,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }


        public async Task SendPremiumListingGroupPolicyMemberPolicyDocuments(
           PolicyModel policy,
           int policyId,
           string policyNumber,
           string memberName,
           string idNumber,
           string emailAddress,
           bool isEuropAssist,
           bool sendWelcomeLetter,
           bool sendPolicySchedule,
           bool sendTermsAndConditions)
        {

            Contract.Requires(policy != null);
            Contract.Requires(policyNumber != null);

            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";
            var attachments = new List<MailAttachment>();

            var password = GetPasswordAndMaskedHint(idNumber, policyNumber, out string maskedHint);

            var policyIdentifier = string.IsNullOrWhiteSpace(memberName)
                    ? policyNumber
                    : $"{memberName}-{policyNumber}";

            var bodyTemplate = SystemSettings.RMAFuneralGroupPolicyMembershipCertificate;
            var body = await _configurationService.GetModuleSetting(bodyTemplate);
            var subject = "RMA Policy Membership Certificate";            

            var policyScheduleName = policy.ProductOption.ProductOptionSettings?.Where(t => t.SettingTypeId == (int)SettingTypeEnum.PolicyScheduler)?.FirstOrDefault()?.Value;
            var welcomeLetterName = policy.ProductOption.ProductOptionSettings?.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeLetter)?.FirstOrDefault()?.Value;
            var termsAndConditionsName = policy.ProductOption.ProductOptionSettings?.Where(t => t.SettingTypeId == (int)SettingTypeEnum.TermsAndConditions)?.FirstOrDefault()?.Value;
            var welcomeEmail = policy.ProductOption.ProductOptionSettings?.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmail)?.FirstOrDefault()?.Value;
            var welcomeEmailSubject = policy.ProductOption.ProductOptionSettings?.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmailSubject)?.FirstOrDefault()?.Value;

            if (string.IsNullOrEmpty(policyScheduleName))
                policyScheduleName = "RMAGroupPolicyMemberCertificate";

            if (string.IsNullOrEmpty(welcomeLetterName))
                welcomeLetterName = "RMAFuneralWelcomeLetter";

            if (string.IsNullOrEmpty(termsAndConditionsName))
                termsAndConditionsName = "RMAFuneralCoverTermsAndConditions";

            if (!string.IsNullOrEmpty(welcomeEmail))
            {
                body = (await _configurationService.GetModuleSetting(policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmail)?.FirstOrDefault().Value));
            }

            if (!string.IsNullOrEmpty(welcomeEmailSubject))
            {
                subject = (await _configurationService.GetModuleSetting(policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeEmailSubject)?.FirstOrDefault().Value));
            }

            body = body.Replace("{0}", memberName)
                .Replace("{1}", policyNumber)
                .Replace("{2}", maskedHint);

            // Welcome letter
            var welcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{welcomeLetterName}{_parameters}&rs:Format=PDF"), _headerCollection);
            if (welcomeLetter.Length > 0)
            {
                var encryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = welcomeLetter };
                var encryptedWelcomeLetter = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptRequest);
                await SavePolicyDocument(policyNumber, "WelcomeLetter.pdf", encryptedWelcomeLetter.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.WelcomeLetter, true);
                if (sendWelcomeLetter)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedWelcomeLetter.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }
            }

            // Policy schedule
            var membershipCertificate = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{policyScheduleName}{_parameters}&rs:Format=PDF"), _headerCollection);
            if (membershipCertificate.Length > 0)
            {
                var encryptCertificateRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = membershipCertificate };
                var encryptedPolicySchedule = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptCertificateRequest);
                await SavePolicyDocument(policyNumber, $"PolicySchedule-{policyIdentifier}.pdf", encryptedPolicySchedule.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.PolicySchedule, true);
                if (sendPolicySchedule)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedPolicySchedule.encryptedDocumentBytes, FileName = "MembershipCertificate.pdf", FileType = "application/pdf" });
                }
            }

            // Terms and conditions
            var termsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{termsAndConditionsName}.pdf&rs:Format=PDF"), _headerCollection);
            if (termsAndConditions.Length > 0)
            {
                await SavePolicyDocument(policyNumber, "TermsAndConditions.pdf", termsAndConditions, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.TermsConditions, true);
                if (sendTermsAndConditions)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = termsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }
            }

            // Europ Assist policy wording
            if (isEuropAssist)
            {
                var europAssistProductWording = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAEuropAssistProductWording.pdf&rs:Format=PDF"), _headerCollection);
                if (europAssistProductWording.Length > 0)
                {
                    var encryptEuropRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = europAssistProductWording };
                    var encryptedEurop = await _documentGeneratorService.PasswordProtectPdf(policyNumber, password, encryptEuropRequest);
                    await SavePolicyDocument(policyNumber, "RMAEuropAssistProductWording.pdf", encryptedEurop.encryptedDocumentBytes, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.EuropAssistProductWording, true);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptedEurop.encryptedDocumentBytes, FileName = "RMAEuropAssistProductWording.pdf", FileType = "application/pdf" });
                }
            }

            if (string.IsNullOrEmpty(emailAddress) || attachments.Count == 0) return;

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = subject,
                Body = body,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }
        public async Task SendGroupPolicyMemberDocuments(int policyId, string policyNumber, string memberName, string emailAddress, bool isEuropAssist)
        {
            _parameters = $"&policyId={policyId}&rs:Command=ClearSession";

            var membershipCertificate = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAGroupPolicyMemberCertificate{_parameters}&rs:Format=PDF"), _headerCollection);
            var europAssistProductWording = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAEuropAssistProductWording.pdf&rs:Format=PDF"), _headerCollection);
            await SavePolicyDocument(policyNumber, $"PolicySchedule-{policyNumber}.pdf", membershipCertificate, DocumentSetEnum.PolicyDocumentsindividual, DocumentTypeEnum.PolicySchedule, true);

            if (string.IsNullOrEmpty(emailAddress)) return;

            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = membershipCertificate,
                    FileName = "MembershipCertificate.pdf",
                    FileType = "application/pdf"
                }
            };

            if (isEuropAssist)
            {
                await SavePolicyDocument(policyNumber, "RMAEuropAssistProductWording.pdf", europAssistProductWording, DocumentSetEnum.PolicyDocumentsgroup, DocumentTypeEnum.EuropAssistProductWording, true);
                attachments.Add(new MailAttachment { AttachmentByteData = europAssistProductWording, FileName = "RMAEuropAssistProductWording.pdf", FileType = "application/pdf" });
            }

            var body = await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralGroupPolicyMembershipCertificate);
            body = body.Replace("{0}", memberName).Replace("{1}", policyNumber);

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = "RMA Policy Membership Certificate",
                Body = body,
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        public async Task SendGroupPolicySchedulesToBroker(int parentPolicyId, string parentPolicyNumber, string schemeName, List<PolicyMember> policyMembers, string brokerName, string recipient)
        {
            Contract.Requires(policyMembers != null);
            Contract.Requires(policyMembers.Count > 0);
            Contract.Requires(schemeName != null);

            try
            {
                if (string.IsNullOrEmpty(recipient)) return;

                var setting = await _configurationService.GetModuleSetting(SystemSettings.BatchEmailCount);
                if (!int.TryParse(setting, out int batchCount))
                {
                    batchCount = defaultBatchCount;
                }

                var batchId = 1;
                var remainder = policyMembers.Count / batchCount;
                var archiveSets = policyMembers.Count / batchCount;
                if (remainder > 0) archiveSets++;
                if (archiveSets == 0) archiveSets++;

                while (policyMembers.Count > 0)
                {
                    var count = policyMembers.Count > batchCount ? batchCount : policyMembers.Count;
                    var policies = policyMembers.Take(count).ToList();

                    List<MailAttachment> attachments;
                    using (var stream = new MemoryStream())
                    {
                        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
                        {
                            foreach (var policy in policies)
                            {
                                _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";
                                var policySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAGroupPolicyMemberCertificate{_parameters}&rs:Format=PDF"), _headerCollection);
                                if (policySchedule.Length > 0)
                                {
                                    // Encrypt the file. Password is the member's ID number
                                    var encryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = policySchedule };
                                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(policy.PolicyNumber, policy.IdNumber, encryptRequest);

                                    // Add the file to the zip archive
                                    var fileName = $"PolicySchedule-{policy.MemberName.Trim().ToUpper()}-{policy.PolicyNumber}.pdf";
                                    var zipArchiveEntry = archive.CreateEntry(fileName, CompressionLevel.Optimal);
                                    using (var zipStream = zipArchiveEntry.Open())
                                    {
                                        await zipStream.WriteAsync(encryptResponse.encryptedDocumentBytes, 0, encryptResponse.encryptedDocumentBytes.Length);
                                    }
                                }
                            }
                        }

                        var zipData = new byte[stream.Length];
                        stream.Seek(0, SeekOrigin.Begin);
                        await stream.ReadAsync(zipData, 0, zipData.Length);

                        attachments = new List<MailAttachment>
                        {
                            new MailAttachment
                            {
                                AttachmentByteData = zipData,
                                FileName = parentPolicyNumber + $"_Schedules_{batchId}.zip",
                                FileType = "application/zip"
                            }
                        };
                    }

                    var body = $"RMA Policy Membership Certificates file {batchId} of {archiveSets} for {schemeName}.";

                    await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = parentPolicyId,
                        ItemType = "Policy",
                        FromAddress = _fromAddress,
                        Recipients = recipient,
                        Subject = $"{schemeName.ToUpper()}: Policy Membership Certificates",
                        Body = body,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });

                    while (policies.Count > 0)
                    {
                        var policy = policies[0];
                        policyMembers.Remove(policy);
                        policies = policies.GetRange(1, policies.Count - 1);
                    }

                    batchId++;
                }
            }
            catch (Exception ex)
            {
                // This task will run in a background thread, because it ALWAYS times out.
                // We'll have to check the logs if the broker does not get his emails.
                ex.LogException($"Bulk policy {parentPolicyNumber} send error.");
            }
        }

        private async Task SavePolicyDocument(string policyNumber, string fileName, byte[] byteDate, DocumentSetEnum documentSet, DocumentTypeEnum documentType, bool replaceExistingDocument)
        {
            try
            {
                var documentExists = await _documentIndexService.PolicyScheduleDocumentExists(policyNumber, documentType);

                if (documentExists)
                {
                    if (replaceExistingDocument)
                    {
                        await ReplacePolicyDocument
                        (
                            documentType,
                            fileName,
                            new Dictionary<string, string> { { "CaseCode", policyNumber } },
                            "application/pdf",
                            documentSet,
                            byteDate
                        );
                    }
                }
                else
                {
                    await UploadPolicyDocument
                    (
                        documentType,
                        fileName,
                        new Dictionary<string, string> { { "CaseCode", policyNumber } },
                        "application/pdf",
                        documentSet,
                        byteDate
                    );
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task SendOnePremiumMissedCommunication(PolicyCommunication policyCommunication)
        {
            if (policyCommunication?.PreferredCommunicationTypeId != null)
            {
                switch ((CommunicationTypeEnum)policyCommunication?.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        await SendPremiumMissedCommunicationByEmail(policyCommunication, "RMAOnePremiumMissedLetter");
                        break;

                    case CommunicationTypeEnum.SMS:
                        await SendPremiumMissedCommunicationBySms(policyCommunication, "RMAOnePremiumMissedLetter");
                        break;
                }
            }
        }

        public async Task SendSecondPremiumMissedCommunication(PolicyCommunication policyCommunication)
        {
            if (policyCommunication?.PreferredCommunicationTypeId != null)
            {
                switch ((CommunicationTypeEnum)policyCommunication?.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        await SendPremiumMissedCommunicationByEmail(policyCommunication,
                            "RMASecondPremiumMissedLetter");
                        break;

                    case CommunicationTypeEnum.SMS:
                        await SendPremiumMissedCommunicationBySms(policyCommunication, "RMASecondPremiumMissedLetter");
                        break;
                }
            }
        }

        public async Task SendLapseCommunication(PolicyCommunication policyCommunication)
        {
            if (policyCommunication?.PreferredCommunicationTypeId != null)
            {
                switch ((CommunicationTypeEnum)policyCommunication?.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        await SendPremiumMissedCommunicationByEmail(policyCommunication, "RMALapseLetter");
                        break;

                    case CommunicationTypeEnum.SMS:
                        await SendPremiumMissedCommunicationBySms(policyCommunication, "RMALapseLetter");
                        break;
                }
            }
        }

        public async Task SendLapseCommunication(List<PolicyCommunication> policyCommunications)
        {
            if (policyCommunications?.Count == 0) return;
            foreach (var policyCommunication in policyCommunications)
            {
                await SendLapseCommunication(policyCommunication);
            }
        }

        public async Task SendPolicyCancellationCommunication(Case caseModel)
        {
            Contract.Requires(caseModel != null);
            // Send a policy cancellation notification to the policy member
            switch ((CommunicationTypeEnum)caseModel.MainMember.PreferredCommunicationTypeId)
            {
                case CommunicationTypeEnum.Email:
                    await SendIndividualFuneralPolicyCancellationDocuments(caseModel, PolicySendDocsProcessTypeEnum.SendIndividualFuneralPolicyCancellation);
                    break;

                case CommunicationTypeEnum.SMS:
                    await SendPolicyCancellationCommunicationBySms(caseModel);
                    break;
            }
            // Send an email to the broker if the policy is part of a scheme.
            if (caseModel.MainMember.Policies[0].ParentPolicyId.HasValue)
            {
                if (caseModel.Brokerage?.Contacts?.Count > 0)
                {
                    var contacts = caseModel.Brokerage.Contacts
                        .Where(c => !String.IsNullOrEmpty(c.Email))
                        .Select(c => c.Email)
                        .Distinct()
                        .ToList();
                    if (contacts.Count > 0)
                    {
                        await SendPolicyCancellationDocuments(
                            caseModel.MainMember.Policies[0].PolicyId,
                            caseModel.MainMember.Policies[0].PolicyNumber,
                            caseModel.MainMember.Person.FirstName + " " + caseModel.MainMember.Person.Surname,
                            String.Join(";", contacts.ToArray()),
                            "",
                            PolicySendDocsProcessTypeEnum.SendGroupFuneralPolicyCancellation,
                            caseModel.MainMember.Policies[0].ProductOption.Product.ProductClass
                        );
                    }
                }
            }
        }

        private async Task SendPremiumMissedCommunicationByEmail(PolicyCommunication policyCommunication, string type)
        {
            if (policyCommunication == null) return; //Sonar Cube Fix.

            byte[] policyLapseDocBytes = null;
            List<MailAttachment> attachments = null;

            if (_headerCollection == null)
            {
                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };
            }

            var body = string.Empty;
            var businessArea = BusinessAreaEnum.MissedPremiumCommunication;

            var emailBody = (await _configurationService.GetModuleSetting((type == "RMAOnePremiumMissedLetter") ? SystemSettings.RMAOnePremiumMissedLetter : (type == "RMASecondPremiumMissedLetter") ? SystemSettings.RMASecondPremiumMissedLetter : SystemSettings.RMALapseLetter));
            switch (type)
            {
                case "RMAOnePremiumMissedLetter":
                    body = emailBody.Replace("{0}", policyCommunication.DisplayName).Replace("{1}", policyCommunication.PolicyNumber).Replace("{2}", policyCommunication.InvoiceDate.ToString("MMM yyyy"));
                    businessArea = BusinessAreaEnum.RetentionsFirstMissedPremiums;
                    break;
                case "RMASecondPremiumMissedLetter":
                    body = emailBody.Replace("{0}", policyCommunication.DisplayName).Replace("{1}", policyCommunication.PolicyNumber).Replace("{2}", policyCommunication.InvoiceDate.ToString("MMM yyyy"));
                    businessArea = BusinessAreaEnum.RetentionsSecondMissedPremiums;
                    break;
                case "RMALapseLetter":
                    body = emailBody.Replace("{0}", policyCommunication.DisplayName).Replace("{1}", policyCommunication.PolicyNumber);
                    businessArea = BusinessAreaEnum.RetentionsLapsed;

                    if (emailBody != null)
                    {
                        _parameters = $"&displayname={policyCommunication.DisplayName}&policynumber={policyCommunication.PolicyNumber}&rs:Command=ClearSession";
                        if (!string.IsNullOrEmpty(_parameters))
                        {
                            policyLapseDocBytes = await GetUriDocumentByteData(
                                new Uri($"{_reportserverUrl}/RMAPolicyLapseLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                        }

                        if (policyLapseDocBytes != null)
                        {
                            attachments = new List<MailAttachment>
                            {
                                new MailAttachment
                                {
                                    AttachmentByteData = policyLapseDocBytes,
                                    FileName = "PolicyLapse.pdf",
                                    FileType = "application/pdf"
                                }
                            };
                        }

                        await UploadPolicyDocument
                        (
                            DocumentTypeEnum.ConfirmationofLapse,
                            "PolicyCancellation.pdf",
                            new Dictionary<string, string> { { "CaseCode", policyCommunication.PolicyNumber } },
                            "application/pdf",
                            DocumentSetEnum.LapsePolicyDocumentSet,
                            policyLapseDocBytes
                        );
                    }
                    break;
            }

            var representativeEmail = policyCommunication?.CCEmail;

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = policyCommunication.PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = businessArea,
                FromAddress = _fromAddress,
                Recipients = policyCommunication.EmailAddress,
                RecipientsCC = representativeEmail,
                Subject = type == "RMALapseLetter" ? $"RMA Policy Lapse: {policyCommunication.PolicyNumber}" : $"RMA Unpaid Policy Premium: {policyCommunication.PolicyNumber}",
                Body = body,
                IsHtml = true,
                Attachments = attachments?.ToArray()
            });
        }

        private async Task SendPremiumMissedCommunicationBySms(PolicyCommunication policyCommunication, string type)
        {
            var msg = string.Empty;
            var businessArea = BusinessAreaEnum.MissedPremiumCommunication;

            switch (type)
            {
                case "RMAOnePremiumMissedLetter":
                    businessArea = BusinessAreaEnum.RetentionsFirstMissedPremiums;
                    var invoiceDate = policyCommunication.InvoiceDate.ToString("MMM yyyy");
                    msg = "Dear RMA valued Client, We have not received premiums for " + invoiceDate + " for your RMA policy " + policyCommunication.PolicyNumber + "." +
                          "Kindly be advised that your policy is now within the 30 days grace period. You may contact our Contact Centre on 0860102532 or forward a special payment request to debit all outstanding premiums to retentions@randmutual.co.za. RMA AUTH FSP.";
                    break;
                case "RMASecondPremiumMissedLetter":
                    businessArea = BusinessAreaEnum.RetentionsSecondMissedPremiums;
                    msg = "Dear RMA valued Client, We have not received two or more premiums for your RMA policy " + policyCommunication.PolicyNumber + "." +
                         "Kindly note that if the outstanding premiums are not received within 14 days from date of this communication, your policy will be lapsed." +
                         "You may contact our Contact Centre on 0860102532 or forward a special payment request to debit all outstanding premiums to retentions@randmutual.co.za. RMA AUTH FSP.";
                    break;
                case "RMALapseLetter":
                    businessArea = BusinessAreaEnum.RetentionsLapsed;
                    msg = "Dear RMA valued Client, Please note that RMA did not receive two or more premiums for Policy: " + policyCommunication.PolicyNumber + ". As a result, your policy have lapsed and you have no cover. " +
                        "Your policy may still be reinstated within three months from date of this communication. Please feel free to contact our Contact Centre on 0860102532 or forward a special payment request to debit all outstanding premiums to retentions@randmutual.co.za. RMA AUTH FSP.";
                    break;
            }

            if (string.IsNullOrEmpty(msg))
            {
                throw new Exception("SendPremiumMissedCommunicationBySms: Sms message is empty");
            }

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = businessArea,
                SmsNumbers = new List<string>() { policyCommunication.CellNumber },
                Message = msg,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = policyCommunication.PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);
        }

        private async Task SendPolicyCancellationCommunicationBySms(Case caseModel)
        {
            Contract.Requires(caseModel != null);
            var msg = "Dear RMA valued Client, Kindly be advised that your RMA policy "
                + caseModel.MainMember.Policies[0].PolicyNumber
                + " has been cancelled. RMA AUTH FSP.";

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = BusinessAreaEnum.RetentionsCancellations,
                SmsNumbers = new List<string>() { caseModel.MainMember.CellNumber },
                Message = msg,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = caseModel.MainMember.Policies[0].PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);
        }

        public async Task<bool> SendOneTimePin(ItemTypeEnum itemType, int itemId, string cellNumber, int oneTimePin)
        {
            var message = await _configurationService.GetModuleSetting(SystemSettings.PolicyDocumentsOneTimePinMessage);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                SmsNumbers = new List<string>() { cellNumber },
                Message = message.Replace("{0}", oneTimePin.ToString()),
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = itemId,
                ItemType = itemType.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);
            return await Task.FromResult(true);
        }

        public async Task SendGroupOnboardingDocuments(
            PolicyModel policy,
            PolicyEmail policyEmail,
            PolicyMember parentPolicyMember,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsandConditions)
        {
            Contract.Requires(policy != null);
            Contract.Requires(policyEmail != null);
            Contract.Requires(parentPolicyMember != null);

            var groupPolicy = policy;
            var recipientSpecified = policyEmail.Recipients.Count > 0;


            if (policyEmail.SendGroupPolicySchedule)
            {
                if (recipientSpecified)
                {
                    foreach (var recipient in policyEmail.Recipients)
                    {
                        await SendGroupSchemePolicyDocuments(
                            policy,
                            groupPolicy.PolicyId,
                            parentPolicyMember.PolicyNumber,
                            parentPolicyMember.MemberName,
                            recipient,
                            sendWelcomeLetter,
                            sendPolicySchedule,
                            sendTermsandConditions
                        );
                    }
                }
                else if (!string.IsNullOrEmpty(parentPolicyMember.EmailAddress))
                {
                    await SendGroupSchemePolicyDocuments(
                        policy,
                        groupPolicy.PolicyId,
                        parentPolicyMember.PolicyNumber,
                        parentPolicyMember.MemberName,
                        parentPolicyMember.EmailAddress,
                        sendWelcomeLetter,
                        sendPolicySchedule,
                        sendTermsandConditions
                    );
                }
            }
        }

        public async Task SendGroupPolicyMemberSchedules(
            PolicyEmail policyEmail,
            List<PolicyMember> policyMembers,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {
            Contract.Requires(policyEmail != null);
            Contract.Requires(policyMembers != null);

            var setting = await _configurationService.GetModuleSetting(SystemSettings.BatchEmailCount);
            if (!int.TryParse(setting, out int batchCount))
            {
                batchCount = defaultBatchCount;
            }
            while (policyMembers.Count > 0)
            {
                var count = policyMembers.Count > batchCount ? batchCount : policyMembers.Count;
                var policies = policyMembers.GetRange(0, count);
                _ = Task.Run(() => SendPolicySchedules(policies, policyEmail.Recipients, sendWelcomeLetter, sendPolicySchedule, sendTermsAndConditions));
                policyMembers.RemoveRange(0, count);
            }
        }

        public async Task SendPremiumListingGroupPolicyMemberSchedules(
            PolicyModel policyModel,
            PolicyEmail policyEmail,
            List<PolicyMember> policyMembers,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {
            Contract.Requires(policyEmail != null);
            Contract.Requires(policyMembers != null);

            var setting = await _configurationService.GetModuleSetting(SystemSettings.BatchEmailCount);
            if (!int.TryParse(setting, out int batchCount))
            {
                batchCount = defaultBatchCount;
            }
            while (policyMembers.Count > 0)
            {
                var count = policyMembers.Count > batchCount ? batchCount : policyMembers.Count;
                var policies = policyMembers.GetRange(0, count);
                _ = Task.Run(() => SendPolicySchedules(policyModel, policies, policyEmail.Recipients, sendWelcomeLetter, sendPolicySchedule, sendTermsAndConditions));
                policyMembers.RemoveRange(0, count);
            }
        }

        private async Task SendPolicySchedules(
            List<PolicyMember> policyMembers,
            List<string> recipientList,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {
            foreach (var policy in policyMembers)
            {
                if (policy.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS && !string.IsNullOrEmpty(policy.CellPhoneNumber))
                {
                    await SendPolicyScheduleBySms(policy);
                }
                else
                {
                    await SendPolicyScheduleByEmail(policy, recipientList, sendWelcomeLetter, sendPolicySchedule, sendTermsAndConditions);
                }
            }
        }

        private async Task SendPolicySchedules(
            PolicyModel policyModel,
            List<PolicyMember> policyMembers,
            List<string> recipientList,
            bool sendWelcomeLetter,
            bool sendPolicySchedule,
            bool sendTermsAndConditions)
        {
            Contract.Requires(policyModel != null);
            Contract.Requires(policyMembers != null);
            foreach (var policyMember in policyMembers)
            {
                if (policyMember.PreferredCommunicationTypeId == (int)CommunicationTypeEnum.SMS && !string.IsNullOrEmpty(policyMember.CellPhoneNumber))
                {
                    await SendPremiumListingPolicyScheduleBySms(policyModel, policyMember);
                }
                else
                {
                    await SendPolicyScheduleByEmail(policyModel, policyMember, recipientList, sendWelcomeLetter, sendPolicySchedule, sendTermsAndConditions);
                }
            }
        }
        
        private async Task SendPolicyScheduleByEmail(PolicyMember policy, List<string> recipientList, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions)
        {
            Contract.Requires(policy != null);
            try
            {
                // Get the list of recipients
                var recipients = GetPolicyRecipients(recipientList, policy.EmailAddress);
                // Do not send if the schedule was already sent
                var alreadySent = await _emailService.EmailAlreadySent("Policy", policy.PolicyId, recipients, DateTime.Now);
                if (!alreadySent)
                {
                    var recipient = string.Join(",", recipients);
                    await SendGroupPolicyMemberPolicyDocuments(
                        policy.PolicyId,
                        policy.PolicyNumber,
                        policy.MemberName,
                        policy.IdNumber,
                        recipient,
                        policy.IsEuropAssist,
                        sendWelcomeLetter,
                        sendPolicySchedule,
                        sendTermsAndConditions
                    );
                }
            }
            catch (Exception ex)
            {
                // Do not stop the transmission if one email fails
                ex.LogException($"Policy Schedule Error: {policy.PolicyNumber} {ex.Message}");
            }

        }

        private async Task SendPolicyScheduleByEmail(PolicyModel policy, PolicyMember policyMember, List<string> recipientList, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions)
        {
            Contract.Requires(policy != null);
            Contract.Requires(policyMember != null);
            try
            {
                // Get the list of recipients
                var recipients = GetPolicyRecipients(recipientList, policyMember.EmailAddress);
                // Do not send if the schedule was already sent
                var alreadySent = await _emailService.EmailAlreadySent("Policy", policy.PolicyId, recipients, DateTime.Now);
                if (!alreadySent)
                {
                    var recipient = string.Join(",", recipients);
                    await SendPremiumListingGroupPolicyMemberPolicyDocuments(
                        policy,
                        policyMember.PolicyId,
                        policyMember.PolicyNumber,
                        policyMember.MemberName,
                        policyMember.IdNumber,
                        recipient,
                        policyMember.IsEuropAssist,
                        sendWelcomeLetter,
                        sendPolicySchedule,
                        sendTermsAndConditions
                    );
                }
            }
            catch (Exception ex)
            {
                // Do not stop the transmission if one email fails
                ex.LogException($"Policy Schedule Error: {policy.PolicyNumber} {ex.Message}");
            }
        }

        public async Task SendPolicyScheduleBySms(PolicyMember policy)
        {
            Contract.Requires(policy != null);

            try
            {

              
                var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralNewBusinessIndividualPolicyScheduleSmsMessage));
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                smsMessage = smsMessage
                            .Replace("{0}", policy.PolicyNumber)
                            .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                    SmsNumbers = new List<string>() { policy.CellPhoneNumber },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };

                var isAlreadySent = await _sendSmsService.SmsAlreadySent(policy.PolicyId, "Policy", smsMessage, policy.CellPhoneNumber);
                if (!isAlreadySent)
                    await _sendSmsService.SendSmsMessage(smsRequest);

            }
            catch (Exception ex)
            {
                ex.LogException($"SendPolicyScheduleBySms Failed -  PolicyNumber:{policy.PolicyNumber}, CelPhoneNumber:{policy.CellPhoneNumber}, ExMessage:{ex.Message}, StackTrace:{ex.StackTrace}");
            }
        }

        public async Task SendPolicyScheduleUpdateNotificationBySms(PolicyMember policyMember)
        {
            Contract.Requires(policyMember != null);

            try
            {
                var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralUpdatedPolicyScheduleSmsMessage));
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                smsMessage = smsMessage
                            .Replace("{0}", policyMember.PolicyNumber)
                            .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                    SmsNumbers = new List<string>() { policyMember.CellPhoneNumber },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = policyMember.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };
              
                    await _sendSmsService.SendSmsMessage(smsRequest);

            }
            catch (Exception ex)
            {
                ex.LogException($"SendPolicyScheduleBySms Failed -  PolicyNumber:{policyMember.PolicyNumber}, CelPhoneNumber:{policyMember.CellPhoneNumber}, ExMessage:{ex.Message}, StackTrace:{ex.StackTrace}");
            }
        }
        public async Task SendPremiumListingPolicyScheduleBySms(PolicyModel policy, PolicyMember policyMember)
        {
            Contract.Requires(policy != null);

            try
            {
                var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralNewBusinessIndividualPolicyScheduleSmsMessage));
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                smsMessage = smsMessage
                            .Replace("{0}", policy.PolicyNumber)
                            .Replace("{1}", urlAppend);
               
                if (policy != null)
                {
                    if (policy.ProductOption.ProductOptionSettings != null && policy.ProductOption.ProductOptionSettings.Any(x => x != null))
                    {
                        if (policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeSms)?.FirstOrDefault().Value.Length > 0)
                            smsMessage = (await _configurationService.GetModuleSetting(policy.ProductOption.ProductOptionSettings.Where(t => t.SettingTypeId == (int)SettingTypeEnum.WelcomeSms)?.FirstOrDefault().Value));
                    }
                }

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                    SmsNumbers = new List<string>() { policyMember?.CellPhoneNumber },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };

                var isAlreadySent = await _sendSmsService.SmsAlreadySent(policy.PolicyId, "Policy", smsMessage, policyMember.CellPhoneNumber);
                if (!isAlreadySent)
                    await _sendSmsService.SendSmsMessage(smsRequest);

            }
            catch (Exception ex)
            {
                ex.LogException($"SendPolicyScheduleBySms Failed -  PolicyNumber:{policy.PolicyNumber}, CelPhoneNumber:{policyMember?.CellPhoneNumber}, ExMessage:{ex.Message}, StackTrace:{ex.StackTrace}");
            }
        }

        private List<string> GetPolicyRecipients(List<string> recipientList, string emailAddress)
        {
            List<string> recipients = new List<string>();
            if (recipientList.Count > 0)
            {
                recipients = recipientList;
            }
            else if (!string.IsNullOrEmpty(emailAddress))
            {
                recipients.Add(emailAddress);
            }
            return recipients;
        }

        public async Task SendModifiedCOIDPolicySchedule(PolicyModel policy, int wizardId)
        {
            if (policy == null) return;
            _parameters = $"&WizardId={wizardId}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            var policyScheduleURI = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACOIDPolicyScheduleJSON{_parameters}&rs:Format=PDF"), _headerCollection);
            var policyNumber = policy.PolicyNumber;

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = policyScheduleURI, FileName = $"{policyNumber}.pdf", FileType = "application/pdf"},
            };

            var dict = new Dictionary<string, string>
            {
                ["[date]"] = DateTimeHelper.SaNow.ToString("yyyy-MM-dd"),
                ["[memberNo]"] = policy.PolicyOwner.FinPayee.FinPayeNumber,
                ["[memberCompanyName]"] = policy.PolicyOwner.DisplayName,
                ["[dateUpdateNotice]"] = DateTimeHelper.SaNow.ToString("yyyy-MM-dd"),
                ["[dateUpdateEffectiveFrom]"] = Convert.ToString(policy.PolicyInceptionDate)
            };

            var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.COIDPolicyScheduleTemplate, dict);

            foreach (var contact in policy.PolicyOwner.RolePlayerContacts)
            {
                var emailAddress = contact.EmailAddress;

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                    FromAddress = _fromAddress,
                    Recipients = emailAddress,
                    Subject = $"Policy Schedule: {policyNumber}",
                    Body = htmlBody.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
        }

        public async Task SendRMAAssurancePolicySchedule(PolicyModel policy, int wizardId)
        {
            if (policy == null) return;
            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            _parameters = $"&PolicyId={policy.PolicyId}&WizardId={wizardId}&rs:Command=ClearSession";

            var rolePlayer = policy.PolicyOwner;
            var policyScheduleURI = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAPolicySchedules/RMAAssurancePolicySchedule/RMAAssurancePolicySchedulePreview{_parameters}&rs:Format=PDF"), _headerCollection);

            var productOptionNames = policy.ProductOption != null ? policy.ProductOption.Name : string.Empty;

            var policyScheduleFileName = $"{productOptionNames}_Policy_Schedule_{DateTime.Now:yyyy-MM-dd}.pdf";

            await _documentIndexService.UploadDocumentFromCommunication(
           DocumentSystemNameEnum.PolicyManager,
           DocumentTypeEnum.Schedule,
           policyScheduleFileName,
           new Dictionary<string, string> { { "PolicyId", policy.PolicyId.ToString() } },
           "application/pdf",
           DocumentSetEnum.PolicyDocuments,
           policyScheduleURI,
           true);

            var rolePlayerPostalAddress = rolePlayer.RolePlayerAddresses.Find(t => t.AddressType == AddressTypeEnum.Postal);

            var dict = new Dictionary<string, string>
            {
                ["[memberNo]"] = rolePlayer.FinPayee.FinPayeNumber,
                ["[memberCompanyName]"] = rolePlayer.DisplayName,
            };

            var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.COIDNewPolicyEmailBodyTemplate, dict);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = policyScheduleURI, FileName = policyScheduleFileName, FileType = "application/pdf"},
            };

            var primaryContacts = new List<RolePlayerContact>();

            if (policy.PolicyOwner.RolePlayerContacts?.Count > 0)
            {
                primaryContacts = policy.PolicyOwner.RolePlayerContacts.Where(s => s.Title == TitleEnum.Memb && s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).ToList();
            }

            foreach (var primaryContact in primaryContacts)
            {
                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                    FromAddress = _fromAddress,
                    Recipients = primaryContact.EmailAddress,
                    Subject = $"Policy Schedule: {policy.PolicyNumber}",
                    Body = htmlBody.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
        }
        public async Task SendMaintainRMAAssurancePolicySchedule(PolicyModel policy)
        {
            if (policy == null) return;
            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };

            _parameters = $"&PolicyId={policy.PolicyId}&rs:Command=ClearSession";

            var rolePlayer = policy.PolicyOwner;
            var policyScheduleURI = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAPolicySchedules/RMAAssurancePolicySchedule/RMAAssurancePolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);

            var productOptionNames = policy.ProductOption != null ? policy.ProductOption.Name : string.Empty;

            var policyScheduleFileName = $"{productOptionNames}_Policy_Schedule_{DateTime.Now:yyyy-MM-dd}.pdf";

            await _documentIndexService.UploadDocumentFromCommunication(
           DocumentSystemNameEnum.PolicyManager,
           DocumentTypeEnum.Schedule,
           policyScheduleFileName,
           new Dictionary<string, string> { { "PolicyId", policy.PolicyId.ToString() } },
           "application/pdf",
           DocumentSetEnum.PolicyDocuments,
           policyScheduleURI,
           true);

            var rolePlayerPostalAddress = rolePlayer.RolePlayerAddresses.Find(t => t.AddressType == AddressTypeEnum.Postal);

            var dict = new Dictionary<string, string>
            {
                ["[memberNo]"] = rolePlayer.FinPayee.FinPayeNumber,
                ["[memberCompanyName]"] = rolePlayer.DisplayName,
            };

            var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.COIDNewPolicyEmailBodyTemplate, dict);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = policyScheduleURI, FileName = policyScheduleFileName, FileType = "application/pdf"},
            };

            var primaryContacts = new List<RolePlayerContact>();

            if (policy.PolicyOwner.RolePlayerContacts?.Count > 0)
            {
                primaryContacts = policy.PolicyOwner.RolePlayerContacts.Where(s => s.Title == TitleEnum.Memb && s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).ToList();
            }

            foreach (var primaryContact in primaryContacts)
            {
                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFPolicyUpdate,
                    FromAddress = _fromAddress,
                    Recipients = primaryContact.EmailAddress,
                    Subject = $"Policy Schedule: {policy.PolicyNumber}",
                    Body = htmlBody.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
        }

        public async Task SendCancelPolicySchedule(PolicyModel policy)
        {
            if (policy == null) return;

            var dict = new Dictionary<string, string>
            {
                ["[date]"] = DateTimeHelper.SaNow.ToString("yyyy-MM-dd"),
                ["[memberNo]"] = policy.PolicyOwner.FinPayee.FinPayeNumber,
                ["[memberCompanyName]"] = policy.PolicyOwner.DisplayName,
                ["[dateUpdateNotice]"] = policy.CancellationInitiatedDate?.ToString("yyyy-MM-dd"),
                ["[dateUpdateEffectiveFrom]"] = policy.CancellationDate?.ToString("yyyy-MM-dd")
            };

            var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.COIDCancelPolicyEmailBodyTemplate, dict);

            var primaryContacts = new List<RolePlayerContact>();

            if (policy.PolicyOwner.RolePlayerContacts?.Count > 0)
            {
                primaryContacts = policy.PolicyOwner.RolePlayerContacts.Where(s => s.Title == TitleEnum.Memb && s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).ToList();
            }

            foreach (var primaryContact in primaryContacts)
            {
                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = policy.PolicyId,
                    ItemType = "Policy",
                    FromAddress = _fromAddress,
                    Recipients = primaryContact.EmailAddress,
                    Subject = $"Policy {policy.PolicyNumber} Cancelled",
                    Body = htmlBody.Content,
                    IsHtml = true
                });
            }
        }

        public async Task SendReinstatePolicySchedule(PolicyModel policy, int wizardId)
        {
            Contract.Requires(policy != null);

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  environment}
            };
            _parameters = $"&PolicyId={policy.PolicyId}&rs:Command=ClearSession";
            var policyScheduleURI = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAPolicySchedules/RMAAssurancePolicySchedule/RMAAssurancePolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = policyScheduleURI, FileName = $"{policy.PolicyNumber}.pdf", FileType = "application/pdf"},
            };

            var dict = new Dictionary<string, string>
            {
                ["[date]"] = DateTimeHelper.SaNow.ToString("yyyy-MM-dd"),
                ["[memberNo]"] = policy.PolicyOwner.FinPayee.FinPayeNumber,
                ["[memberCompanyName]"] = policy.PolicyOwner.DisplayName,
                ["[dateUpdateNotice]"] = policy.CancellationInitiatedDate?.ToString("yyyy-MM-dd"),
                ["[dateUpdateEffectiveFrom]"] = policy.CancellationDate?.ToString("yyyy-MM-dd")
            };

            var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.COIDReinstatePolicyEmailBodyTemplate, dict);

            var primaryContacts = new List<RolePlayerContact>();

            if (policy.PolicyOwner.RolePlayerContacts?.Count > 0)
            {
                primaryContacts = policy.PolicyOwner.RolePlayerContacts.Where(s => s.Title == TitleEnum.Memb && s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact).ToList();
            }

            foreach (var primaryContact in primaryContacts)
            {
                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Retentions,
                    BusinessArea = BusinessAreaEnum.RetentionsReinstatements,
                    FromAddress = _fromAddress,
                    Recipients = primaryContact.EmailAddress,
                    Subject = $"Policy {policy.PolicyNumber} Reinstated",
                    Body = htmlBody.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
        }

        public async Task SendPolicyReinstatedMessages(Case @case, DateTime reinstateDate)
        {
            switch ((CommunicationTypeEnum)@case?.MainMember.PreferredCommunicationTypeId)
            {
                case CommunicationTypeEnum.Email:
                    await SendPolicyReinstatedEmail(@case, reinstateDate);
                    await SendFuneralPolicyScheduleByEmail(@case);
                    break;
                case CommunicationTypeEnum.SMS:
                    await SendPolicyReinstatedSms(@case, reinstateDate);
                    await SendFuneralPolicyScheduleBySMS(@case);
                    break;
            }
        }

        private async Task SendPolicyReinstatedEmail(Case @case, DateTime reinstateDate)
        {
            if (@case != null)
            {
                var dictionary = new Dictionary<string, string>
                {
                    ["[date]"] = DateTimeHelper.SaNow.ToString("yyyy-MM-dd"),
                    ["[memberName]"] = @case.MainMember.DisplayName,
                    ["[policyNumber]"] = @case.MainMember.Policies[0].PolicyNumber,
                    ["[reinstateDate]"] = reinstateDate.ToString("yyyy-MM-dd")
                };

                var body = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.FuneralPolicyReinstatedNotification, dictionary);

                await _sendEmailService.SendEmail(
                    new SendMailRequest
                    {
                        ItemId = @case.MainMember.RolePlayerId,
                        ItemType = "PolicyReinstate",
                        Department = RMADepartmentEnum.Retentions,
                        BusinessArea = BusinessAreaEnum.RetentionsReinstatements,
                        FromAddress = _fromAddress,
                        Recipients = @case.MainMember.EmailAddress,
                        Subject = $"RMA Funeral Policy Reinstate: {@case.MainMember.Policies[0].PolicyNumber}",
                        Body = body.Content,
                        IsHtml = true
                    }
                );
            }
        }

        private async Task SendPolicyReinstatedSms(Case @case, DateTime reinstateDate)
        {
            if (@case != null)
            {
                var dictionary = new Dictionary<string, string>
                {
                    ["[policyNumber]"] = @case.MainMember.Policies[0].PolicyNumber,
                    ["[reinstateDate]"] = reinstateDate.ToString("yyyy-MM-dd")
                };
                var body = await _emailTemplateService.GenerateSmsContent(TemplateTypeEnum.FuneralPolicyReinstatedNotification, dictionary);
                await _sendSmsService.SendSmsMessage(
                    new SendSmsRequest()
                    {
                        Department = RMADepartmentEnum.Retentions,
                        BusinessArea = BusinessAreaEnum.RetentionsReinstatements,
                        ItemId = @case.MainMember.RolePlayerId,
                        ItemType = "PolicyReinstate",
                        SmsNumbers = new List<string>() { @case.MainMember.CellNumber },
                        Message = body.Content,
                        WhenToSend = DateTimeHelper.SaNow
                    }
                );
            }
        }

        public async Task SendInsuredLifeUploadMessages(int successMessageCount, int failedMessageCount, List<string> messages)
        {
            Contract.Requires(messages != null);

            StringBuilder emailMessages = new StringBuilder();
            emailMessages.Append($"<p>Successfully uploaded : {successMessageCount}</p>");
            emailMessages.Append($"<p>Failed to upload : {failedMessageCount}</p>");

            if (messages.Count > 0)
            {
                emailMessages.Append("<p>Following error/s occured while uploading</p>");
            }
            foreach (var message in messages)
            {
                emailMessages.Append("<p>").Append(message).Append("</p>");
            }

            await _sendEmailService.SendEmail(
                new SendMailRequest
                {
                    ItemType = "UploadInsuredLives",
                    FromAddress = _fromAddress,
                    Recipients = RmaIdentity.Email,
                    Subject = $"Insured lives upload result",
                    Body = emailMessages.ToString(),
                    IsHtml = true
                }
            );
        }

        public async Task SendPolicySchemeChangedSmsNotification(string schemeName, string cellNumber, int policyId, string policyNumber, DateTime effectiveDate)
        {
            if (string.IsNullOrEmpty(cellNumber)) return;

            var dictionary = new Dictionary<string, string>
            {
                ["[schemeName]"] = schemeName,
                ["[policyNumber]"] = policyNumber,
                ["[effectiveDate]"] = effectiveDate.ToString("dd/MM/yyyy")
            };
            var body = await _emailTemplateService.GenerateSmsContent(TemplateTypeEnum.PolicySchemeMovedSMS, dictionary);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.NewBusinessPolicyTransfer,
                SmsNumbers = new List<string>() { cellNumber },
                Message = body.Content,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };
            await _sendSmsService.SendSmsMessage(smsRequest);
        }

        public async Task SendPolicyCancellationAfterThreeLapses(Case policyCase, bool isGroup, string parentEmail)
        {
            Contract.Requires(policyCase != null);

            var policy = policyCase.MainMember.Policies[0];
            var changeInfo = new Dictionary<string, string>();

            changeInfo.Add("[Recipients]", policyCase.MainMember.EmailAddress);
            changeInfo.Add("[Mobile]", policyCase.MainMember.CellNumber);
            changeInfo.Add("[Client_Name]", policyCase.MainMember.DisplayName);
            changeInfo.Add("[Policy_Number]", policy.PolicyNumber);
            changeInfo.Add("[client_Address1]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.AddressLine1);
            changeInfo.Add("[client_Address2]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.AddressLine2);
            changeInfo.Add("[client_Address3]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.City);
            changeInfo.Add("[postal_Code]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.PostalCode);
            changeInfo.Add("[Date]", DateTimeHelper.SaNowStdString);
            changeInfo.Add("[Cancellation_Date]", DateTimeHelper.FormatDate(policy.CancellationDate, "dd/MM/yyyy"));
            changeInfo.Add("[Lapse_Date]", DateTimeHelper.FormatDate(policy.LastLapsedDate, "dd/MM/yyyy"));
            changeInfo.Add("[cc]", string.Empty);
            if (isGroup)
            {
                changeInfo.Remove("[cc]");
                changeInfo.Add("[cc]", parentEmail);
            }

            changeInfo.Add("[Subject]", "Lapsed Policy " + policy.PolicyNumber + " was cancelled");
            changeInfo.Add("[Email]", policyCase.MainMember.EmailAddress);

            switch ((CommunicationTypeEnum)policyCase.MainMember.PreferredCommunicationTypeId)
            {
                case CommunicationTypeEnum.Email:
                    await SendContactChangeEmail(changeInfo, TemplateTypeEnum.Policy3xLapseCancel, policy.PolicyId);
                    break;
                case CommunicationTypeEnum.SMS:
                    await SendContactChangeSms(changeInfo, TemplateTypeEnum.Policy3xLapseCancel, policy.PolicyId);
                    break;
            }
        }

        public async Task SendContactChangeMessages(Case policyCase, bool amendEmail, bool amendContact, bool amendPostal, bool amendBanking, bool isGroup)
        {
            Contract.Requires(policyCase != null);
            if (policyCase == null) return;

            var policy = policyCase.MainMember.Policies[0];

            var changeInfo = new Dictionary<string, string>();
            changeInfo.Add("[Recipients]", policyCase.MainMember.EmailAddress);
            changeInfo.Add("[Mobile]", policyCase.MainMember.CellNumber);
            changeInfo.Add("[Client_Name]", policyCase.MainMember.DisplayName);
            changeInfo.Add("[Policy_Number]", policy.PolicyNumber);
            changeInfo.Add("[client_Address1]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.AddressLine1);
            changeInfo.Add("[client_Address2]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.AddressLine2);
            changeInfo.Add("[client_Address3]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.City);
            changeInfo.Add("[postal_Code]", policyCase.MainMember.RolePlayerAddresses.Where(a => a.AddressType == AddressTypeEnum.Postal).FirstOrDefault()?.PostalCode);
            changeInfo.Add("[Date]", DateTimeHelper.SaNowStdString);
            changeInfo.Add("[cc]", string.Empty);

            var attachments = new List<MailAttachment>();

            if (amendEmail)
            {
                changeInfo.Add("[Email]", policyCase.MainMember.EmailAddress);

                switch ((CommunicationTypeEnum)policyCase.MainMember.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        _parameters = $"&policyId={policy.PolicyId}&Email={policyCase.MainMember.EmailAddress}&rs:Command=ClearSession";
                        var emailChangeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAAmendmentEmailLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                        attachments.Add(new MailAttachment { AttachmentByteData = emailChangeLetter, FileName = "Email Amendment.pdf", FileType = "application/pdf" });
                        break;
                    case CommunicationTypeEnum.SMS:
                        await SendContactChangeSms(changeInfo, TemplateTypeEnum.PolicyEmailChange, policyCase.MainMember.PolicyId);
                        break;
                }
            }

            if (amendPostal)
            {
                switch ((CommunicationTypeEnum)policyCase.MainMember.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        _parameters = $"&policyId={policy.PolicyId}&client_Address1={changeInfo["[client_Address1]"]}&client_Address2={changeInfo["[client_Address2]"]}&client_Address3={changeInfo["[client_Address3]"]}&postal_Code={changeInfo["[postal_Code]"]}&rs:Command=ClearSession";
                        var postalChangeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAAmendmentPostalAddressLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                        attachments.Add(new MailAttachment { AttachmentByteData = postalChangeLetter, FileName = "Postal Amendment.pdf", FileType = "application/pdf" });
                        break;
                    case CommunicationTypeEnum.SMS:
                        await SendContactChangeSms(changeInfo, TemplateTypeEnum.PolicyPostalChange, policyCase.MainMember.PolicyId);
                        break;
                }

            }

            if (amendContact)
            {
                switch ((CommunicationTypeEnum)policyCase.MainMember.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        _parameters = $"&policyId={policy.PolicyId}&NewCellNumber={policyCase.MainMember.CellNumber}&rs:Command=ClearSession";
                        var contactChangeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAContactDetailsAmendmentLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                        attachments.Add(new MailAttachment { AttachmentByteData = contactChangeLetter, FileName = "Contact Amendment.pdf", FileType = "application/pdf" });
                        break;
                    case CommunicationTypeEnum.SMS:
                        await SendContactChangeSms(changeInfo, TemplateTypeEnum.PolicyContactChange, policyCase.MainMember.PolicyId);
                        break;
                }
            }

            if (amendBanking)
            {
                var banking = policy.PolicyOwner.RolePlayerBankingDetails[0];

                switch ((CommunicationTypeEnum)policyCase.MainMember.PreferredCommunicationTypeId)
                {
                    case CommunicationTypeEnum.Email:
                        _parameters = $"&policyId={policy.PolicyId}&Bank_Name={banking.BankName}&Branch_Code={banking.BankBranchName}&Account_Number={banking.AccountNumber}&Account_type={banking.AccountType}&rs:Command=ClearSession";
                        var bankChangeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAAmendmentPostalAddressLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                        attachments.Add(new MailAttachment { AttachmentByteData = bankChangeLetter, FileName = "Banking Amendment.pdf", FileType = "application/pdf" });
                        break;
                    case CommunicationTypeEnum.SMS:
                        await SendContactChangeSms(changeInfo, TemplateTypeEnum.PolicyBankingChange, policyCase.MainMember.PolicyId);
                        break;
                }
            }

            if (CommunicationTypeEnum.Email == (CommunicationTypeEnum)policyCase.MainMember.PreferredCommunicationTypeId)
            {
                var body = await _configurationService.GetModuleSetting(SystemSettings.PolicyAmendmentCover);
                body = body.Replace("{0}", changeInfo["[Client_Name]"]).Replace("{1}", policy.PolicyNumber);

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.Membership,
                    BusinessArea = BusinessAreaEnum.MembershipClientContactChange,
                    FromAddress = _fromAddress,
                    Recipients = changeInfo["[Recipients]"],
                    Subject = "RMA Policy Amendment Confirmation",
                    Body = body,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
        }

        private async Task SendContactChangeEmail(Dictionary<string, string> changeInfo, TemplateTypeEnum templateType, int policyId)
        {
            if (changeInfo != null)
            {
                var body = await _emailTemplateService.GenerateTemplateContent(templateType, changeInfo);
                await _sendEmailService.SendEmail(

                    new SendMailRequest
                    {
                        Department = RMADepartmentEnum.Membership,
                        BusinessArea = BusinessAreaEnum.MembershipClientContactChange,
                        ItemType = templateType.ToString(),
                        FromAddress = _fromAddress,
                        Recipients = changeInfo["[Recipients]"],
                        RecipientsCC = changeInfo["[cc]"],
                        Subject = changeInfo["[Subject]"],
                        Body = body.Content,
                        ItemId = policyId,
                        IsHtml = true
                    }
                );
            }
        }

        private async Task SendContactChangeSms(Dictionary<string, string> changeInfo, TemplateTypeEnum templateType, int policyId)
        {
            var body = await _emailTemplateService.GenerateSmsContent(templateType, changeInfo);
            await _sendSmsService.SendSmsMessage(
                new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.Membership,
                    BusinessArea = BusinessAreaEnum.MembershipClientContactChange,
                    ItemType = templateType.ToString(),
                    SmsNumbers = new List<string>() { changeInfo["[Mobile]"] },
                    Message = body.Content,
                    ItemId = policyId,
                    WhenToSend = DateTimeHelper.SaNow
                }
            );
        }

        public async Task SendBulkDeclarationSms(List<Contracts.Entities.RolePlayer.RolePlayer> rolePlayers)
        {
            Contract.Requires(rolePlayers != null);

            var bulkSms = new List<SendSmsRequest>();
            foreach (var rolePlayer in rolePlayers)
            {
                foreach (var contact in rolePlayer.RolePlayerContacts)
                {
                    var contactInformationList = contact.RolePlayerContactInformations.Where(r => r.ContactInformationType == ContactInformationTypeEnum.Declarations).ToList();

                    if (contactInformationList.Count > 0)
                    {
                        var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.DeclarationInitiationSms));
                        var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.ApplicationUrl));

                        smsMessage = smsMessage
                            .Replace("{0}", contact.Firstname)
                            .Replace("{1}", urlAppend);

                        var smsRequest = new SendSmsRequest()
                        {
                            Department = RMADepartmentEnum.Membership,
                            BusinessArea = BusinessAreaEnum.MembershipMemberDeclarations,
                            SmsNumbers = new List<string>() { contact.ContactNumber },
                            Message = smsMessage,
                            WhenToSend = DateTimeHelper.SaNow,
                            ItemId = contact.RolePlayerId,
                            ItemType = "RolePlayer"
                        };

                        bulkSms.Add(smsRequest);
                    }
                }
            }
            await _sendSmsService.SendBulkSms(bulkSms);
        }

        public async Task SendConsolidatedFuneralPolicySchedules(List<ConsolidatedFuneralSummary> consolidatedFuneralSummaries)
        {
            Contract.Requires(consolidatedFuneralSummaries != null);
            foreach (var consolidatedFuneralSummary in consolidatedFuneralSummaries)
            {
                await SendCFPolicySchedule(consolidatedFuneralSummary);
            }
        }
        public async Task SendMyValuePlusPolicySchedules(List<MyValuePlusSummary> myValuePlusSummaries)
        {
            Contract.Requires(myValuePlusSummaries != null);
            foreach (var myValuePlusSummary in myValuePlusSummaries)
            {
                await SendMVPPolicySchedule(myValuePlusSummary);
            }
        }

        private async Task SendCFPolicySchedule(ConsolidatedFuneralSummary consolidatedFuneralSummary)
        {
            Contract.Requires(consolidatedFuneralSummary != null);
            var attachments = new List<MailAttachment>();
            try
            {
                if (_headerCollection == null)
                {
                    var environment = await _configurationService.GetModuleSetting("Environment");
                    _headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };
                }

                _parameters = $"&policyId={consolidatedFuneralSummary.PolicyId}&rs:Command=ClearSession";

                var idPassportNumber = consolidatedFuneralSummary?.ClientIdNumber == null ? consolidatedFuneralSummary?.ClientPassportNumber : consolidatedFuneralSummary?.ClientIdNumber;

                var password = GetPasswordAndMaskedHint(idPassportNumber, consolidatedFuneralSummary?.PolicyNumber, out string maskedHint);

                var policyIdentifier = string.IsNullOrEmpty(idPassportNumber) || string.IsNullOrWhiteSpace(idPassportNumber)
                                ? $"{consolidatedFuneralSummary.ClientName}-{consolidatedFuneralSummary?.PolicyNumber}"
                                : consolidatedFuneralSummary?.PolicyNumber;

                var cfpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
                var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = cfpPolicySchedule };
                var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(password, consolidatedFuneralSummary.PolicyNumber, fileEncryptRequest);
                if (cfpPolicySchedule?.Length > 0)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptResponse.encryptedDocumentBytes, FileName = $"PolicySchedule-{policyIdentifier}.pdf", FileType = "application/pdf" });
                }

                if (attachments.Count == 0) return;

                var body = await _configurationService.GetModuleSetting(SystemSettings.RMAConsolidatedFuneralPolicyScheduleEmailBody);
                body = body.Replace("{0}", consolidatedFuneralSummary.ClientName)
                    .Replace("{1}", consolidatedFuneralSummary.PolicyNumber)
                    .Replace("{2}", maskedHint);

                if (consolidatedFuneralSummary.PreferredCommunicationType == CommunicationTypeEnum.SMS && !string.IsNullOrEmpty(consolidatedFuneralSummary.ClientCellNo))
                {
                    await SendCFPFuneralPolicyScheduleBySMS(consolidatedFuneralSummary);
                }

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFActivations,
                    ItemId = consolidatedFuneralSummary.PolicyId,
                    FromAddress = _fromAddress,
                    Recipients = consolidatedFuneralSummary.PreferredCommunicationType == CommunicationTypeEnum.Email
                        ? consolidatedFuneralSummary.ClientEmail
                        : consolidatedFuneralSummary.BrokerEmail,
                    RecipientsCC = consolidatedFuneralSummary.BrokerEmail,
                    Subject = $"RMA Consolidated Funeral Policy Documents",
                    Body = body,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });

            }
            catch (Exception ex)
            {
                ex.LogException("CFP Premium Increase Policy Send Error");
            }
        }

        private async Task SendMVPPolicySchedule(MyValuePlusSummary myValuePlusSummary)
        {
            if (myValuePlusSummary == null) { return; }
            var attachments = new List<MailAttachment>();
            try
            {
                if (_headerCollection == null)
                {
                    var environment = await _configurationService.GetModuleSetting("Environment");
                    _headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };
                }
                _parameters = $"&policyId={myValuePlusSummary.PolicyId}&rs:Command=ClearSession";
                var mvpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAMVPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
                if (mvpPolicySchedule?.Length > 0)
                {
                    var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = mvpPolicySchedule };
                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(myValuePlusSummary.IdNumberPassportNumber.ToUpper(), myValuePlusSummary.IdNumberPassportNumber.ToUpper(), fileEncryptRequest);

                    attachments.Add(new MailAttachment { AttachmentByteData = encryptResponse.encryptedDocumentBytes, FileName = $"PolicySchedule-{myValuePlusSummary.PolicyNumber}.pdf", FileType = "application/pdf" });
                }

                if (attachments.Count == 0) return;

                var body = (await _emailTemplateService.GetEmailTemplate((int)Admin.CampaignManager.Contracts.Enums.EmailTemplate.WelcomeletterEmail)).Template;
                body = body.Replace("{0}", myValuePlusSummary.ClientName).Replace("{1}", myValuePlusSummary.PolicyNumber);

                if (myValuePlusSummary.PreferredCommunicationType == CommunicationTypeEnum.SMS && !string.IsNullOrEmpty(myValuePlusSummary.ClientCellNo))
                {
                    var cellNumber = await SendMVPFuneralPolicyScheduleBySMS(myValuePlusSummary);
                }

                if (string.IsNullOrEmpty(body)) return;

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemType = "Policy",
                    ItemId = myValuePlusSummary.PolicyId,
                    FromAddress = _fromAddress,
                    Recipients = myValuePlusSummary.PreferredCommunicationType == CommunicationTypeEnum.Email
                        ? myValuePlusSummary.ClientEmail
                        : myValuePlusSummary.BrokerEmail,
                    RecipientsCC = myValuePlusSummary.BrokerEmail,
                    Subject = $"RMA My Value Plus Policy Documents",
                    Body = body,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });

            }
            catch (Exception ex)
            {
                ex.LogException("MVP Policy Svhedule Send Error");
            }
        }

        public async Task<int> SendConsolidatedFuneralPolicyDocuments(List<ConsolidatedFuneralSummary> consolidatedFuneralSummaries)
        {
            Contract.Requires(consolidatedFuneralSummaries != null);
            Contract.Requires(consolidatedFuneralSummaries.Count > 0);

            var count = 0;
            foreach (var consolidatedFuneralSummary in consolidatedFuneralSummaries)
            {
                await SendCFPolicyDocument(consolidatedFuneralSummary);
                count++;
            }
            return count;
        }

        public async Task<List<SendCommunicationResult>> SendMyValuePlusPolicyDocuments(List<MyValuePlusSummary> myValuePlusSummaries)
        {
            Contract.Requires(myValuePlusSummaries != null);
            Contract.Requires(myValuePlusSummaries.Count > 0);

            List<SendCommunicationResult> sendCommunicationResults = new List<SendCommunicationResult>();

            foreach (var myValuePlusSummary in myValuePlusSummaries)
            {
                var result = await SendMVPPolicyDocument(myValuePlusSummary);
                if (result.IsSuccess)
                {
                    sendCommunicationResults.Add(result);
                }
            }

            return sendCommunicationResults;
        }

        private async Task SendCFPolicyDocument(ConsolidatedFuneralSummary consolidatedFuneralSummary)
        {
            Contract.Requires(consolidatedFuneralSummary != null);
            var attachments = new List<MailAttachment>();

            try
            {
                if (_headerCollection == null)
                {
                    var environment = await _configurationService.GetModuleSetting("Environment");

                    _headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };
                }

                _parameters = $"&wizardId={consolidatedFuneralSummary.PolicyId}&rs:Command=ClearSession";

                var idPassportNumber = consolidatedFuneralSummary?.ClientIdNumber == null ? consolidatedFuneralSummary?.ClientPassportNumber : consolidatedFuneralSummary?.ClientIdNumber;

                var password = GetPasswordAndMaskedHint(idPassportNumber, consolidatedFuneralSummary?.PolicyNumber, out string maskedHint);

                var policyIdentifier = string.IsNullOrEmpty(idPassportNumber) || string.IsNullOrWhiteSpace(idPassportNumber)
                                ? $"{consolidatedFuneralSummary.ClientName}-{consolidatedFuneralSummary?.PolicyNumber}"
                                : consolidatedFuneralSummary?.PolicyNumber;
                var cfpWelcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralGroupWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);

                _parameters = $"&policyId={consolidatedFuneralSummary.PolicyId}&rs:Command=ClearSession";
                var cfpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);
                var cfpTermsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPFuneralPolicyGroupTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);

                if (cfpWelcomeLetter?.Length > 0)
                {
                    var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = cfpWelcomeLetter };
                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(consolidatedFuneralSummary.ClientIdNumber.ToUpper(), consolidatedFuneralSummary.ClientIdNumber.ToUpper(), fileEncryptRequest);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptResponse.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }

                if (cfpPolicySchedule?.Length > 0)
                {
                    var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = cfpPolicySchedule };
                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(consolidatedFuneralSummary.ClientIdNumber.ToUpper(), consolidatedFuneralSummary.ClientIdNumber.ToUpper(), fileEncryptRequest);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptResponse.encryptedDocumentBytes, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
                }

                if (cfpTermsAndConditions?.Length > 0)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = cfpTermsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }

                if (attachments.Count == 0) return;

                var body = await _configurationService.GetModuleSetting(SystemSettings.RMAConsolidatedFuneralPolicyScheduleEmailBody);
                body = body.Replace("{0}", consolidatedFuneralSummary.ClientName)
                    .Replace("{1}", consolidatedFuneralSummary.PolicyNumber)
                    .Replace("{2}", maskedHint);

                if (consolidatedFuneralSummary.PreferredCommunicationType == CommunicationTypeEnum.SMS && !string.IsNullOrEmpty(consolidatedFuneralSummary.ClientCellNo))
                {
                    await SendCFPFuneralPolicyScheduleBySMS(consolidatedFuneralSummary);
                }

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = consolidatedFuneralSummary.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFActivations,
                    FromAddress = _fromAddress,
                    Recipients = consolidatedFuneralSummary.PreferredCommunicationType == CommunicationTypeEnum.Email ? consolidatedFuneralSummary.ClientEmail : consolidatedFuneralSummary.BrokerEmail,
                    RecipientsCC = consolidatedFuneralSummary.BrokerEmail,
                    Subject = $"RMA Consolidated Funeral Policy Documents",
                    Body = body,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
            catch (Exception ex)
            {
                ex.LogException($"SendCFPolicyDocument > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        private async Task<SendCommunicationResult> SendMVPPolicyDocument(MyValuePlusSummary myValuePlusSummary)
        {
            Contract.Requires(myValuePlusSummary != null);

            var attachments = new List<MailAttachment>();
            var recipientCellNumber = "";
            SendCommunicationResult sendCommunicationResult = new SendCommunicationResult { IsSuccess = false };

            try
            {
                if (_headerCollection == null)
                {
                    var environment = await _configurationService.GetModuleSetting("Environment");

                    _headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };
                }

                _parameters = $"&policyId={myValuePlusSummary.PolicyId}&rs:Command=ClearSession";

                var mvpWelcomeLetter = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAMVPWelcomeLetter{_parameters}&rs:Format=PDF"), _headerCollection);
                var mvpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAMVPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);

                _parameters = $"&policyId={myValuePlusSummary.PolicyId}&rs:Command=ClearSession";
                var mvpTermsAndConditions = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/MVPLifeTermsAndConditions.pdf&rs:Format=PDF"), _headerCollection);

                if (mvpWelcomeLetter?.Length > 0)
                {
                    var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = mvpWelcomeLetter };
                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(myValuePlusSummary.IdNumberPassportNumber.ToUpper(), myValuePlusSummary.IdNumberPassportNumber.ToUpper(), fileEncryptRequest);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptResponse.encryptedDocumentBytes, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }

                if (mvpPolicySchedule?.Length > 0)
                {
                    var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = mvpPolicySchedule };
                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(myValuePlusSummary.IdNumberPassportNumber.ToUpper(), myValuePlusSummary.IdNumberPassportNumber.ToUpper(), fileEncryptRequest);
                    attachments.Add(new MailAttachment { AttachmentByteData = encryptResponse.encryptedDocumentBytes, FileName = "PolicySchedule.pdf", FileType = "application/pdf" });
                }

                if (mvpTermsAndConditions?.Length > 0)
                {
                    attachments.Add(new MailAttachment { AttachmentByteData = mvpTermsAndConditions, FileName = "TermsAndConditions.pdf", FileType = "application/pdf" });
                }

                if (attachments.Count == 0) return sendCommunicationResult;

                var body = (await _configurationService.GetModuleSetting(SystemSettings.RMAMvpPolicyScheduleEmailBody));
                body = body.Replace("{0}", myValuePlusSummary.ClientName).Replace("{1}", myValuePlusSummary.PolicyNumber);

                if (myValuePlusSummary.PreferredCommunicationType == CommunicationTypeEnum.SMS && !string.IsNullOrEmpty(myValuePlusSummary.ClientCellNo))
                {
                    recipientCellNumber = await SendMVPFuneralPolicyScheduleBySMS(myValuePlusSummary);
                }

                var sendMailRequest = new SendMailRequest
                {
                    ItemId = myValuePlusSummary.PolicyId,
                    ItemType = "Policy",
                    FromAddress = _fromAddress,
                    Recipients = myValuePlusSummary.PreferredCommunicationType == CommunicationTypeEnum.Email ? myValuePlusSummary.ClientEmail : myValuePlusSummary.BrokerEmail,
                    RecipientsCC = myValuePlusSummary.BrokerEmail,
                    Subject = $"RMA My Value Plus Policy Documents",
                    Body = body,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                };

                await _sendEmailService.SendEmail(sendMailRequest);

                return new SendCommunicationResult { IsSuccess = true, PolicyId = myValuePlusSummary.PolicyId, Recipients = sendMailRequest.Recipients + ", " + sendMailRequest.RecipientsCC + ", " + recipientCellNumber };
            }
            catch (Exception ex)
            {
                ex.LogException($"SendMvpPolicyDocument > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                return sendCommunicationResult;
            }
        }

        public async Task SendAnnualIncreasePolicyScheduleEmail(PolicyMember member)
        {
            Contract.Requires(member != null);

            try
            {
                if (_headerCollection == null)
                {
                    var environment = await _configurationService.GetModuleSetting("Environment");
                    _headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                        { SystemSettings.Environment,  environment}
                    };
                }

                _parameters = $"&policyId={member.PolicyId}&rs:Command=ClearSession";

                var cfpPolicySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMACFPPolicySchedule{_parameters}&rs:Format=PDF"), _headerCollection);

                var attachments = new List<MailAttachment> {
                    new MailAttachment {
                        AttachmentByteData = cfpPolicySchedule,
                        FileName = "PolicySchedule.pdf",
                        FileType = "application/pdf"
                    }
                };

                var dict = new Dictionary<string, string>
                {
                    ["memberName"] = member.MemberName,
                    ["policyNumber"] = member.PolicyNumber
                };

                var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.LifeSystemsPolicyIncreaseSchedule, dict);

                await _sendEmailService.SendEmail(new SendMailRequest
                {
                    ItemId = member.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFPolicyUpdate,
                    FromAddress = _fromAddress,
                    Recipients = member.EmailAddress,
                    Subject = $"RMA Consolidated Funeral Policy Documents",
                    Body = htmlBody.Content,
                    IsHtml = true,
                    Attachments = attachments.ToArray()
                });
            }
            catch (Exception ex)
            {
                ex.LogException("CFP Annual Increase Email Error");
            }
        }

        public async Task SendAnnualIncreasePolicyScheduleSms(PolicyMember member)
        {
            Contract.Requires(member != null);

            try
            {
                var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.ConsolidatedFuneralPremiumIncreaseSmsMessage));
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                smsMessage = smsMessage
                            .Replace("{0}", member.PolicyNumber)
                            .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFPolicyUpdate,
                    SmsNumbers = new List<string>() { member.CellPhoneNumber },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = member.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };
            }
            catch (Exception ex)
            {
                ex.LogException("CFP Annual Increase SMS Error");
            }
        }

        private async Task SendCFPFuneralPolicyScheduleBySMS(ConsolidatedFuneralSummary consolidatedFuneralSummary)
        {
            Contract.Requires(consolidatedFuneralSummary != null);
            try
            {
                var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.RMAConsolidatedFuneralPolicyScheduleSmsMessage));
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                smsMessage = smsMessage
                            .Replace("{0}", consolidatedFuneralSummary.PolicyNumber)
                            .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFActivations,
                    SmsNumbers = new List<string>() { consolidatedFuneralSummary.ClientCellNo },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = consolidatedFuneralSummary.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };

                await _sendSmsService.SendSmsMessage(smsRequest);
            }
            catch (Exception ex)
            {
                ex.LogException($"SendCFPFuneralPolicyScheduleBySMS > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        private async Task<string> SendMVPFuneralPolicyScheduleBySMS(MyValuePlusSummary myValuePlusSummary)
        {
            Contract.Requires(myValuePlusSummary != null);
            try
            {
                var smsMessage = (await _configurationService.GetModuleSetting(SystemSettings.RMAMvpPolicyScheduleSmsBody));
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                smsMessage = smsMessage
                            .Replace("{0}", myValuePlusSummary.PolicyNumber)
                            .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.CFActivations,
                    SmsNumbers = new List<string>() { myValuePlusSummary.ClientCellNo },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = myValuePlusSummary.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };

                await _sendSmsService.SendSmsMessage(smsRequest);

                return myValuePlusSummary.ClientCellNo;
            }
            catch (Exception ex)
            {
                ex.LogException($"SendMvpFuneralPolicyScheduleBySMS > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                return "";
            }
        }

        public async Task SendEmail(string recipient, string subject, string body)
        {
            await _sendEmailService.SendEmail(new SendMailRequest
            {
                FromAddress = _fromAddress,
                Recipients = recipient,
                Subject = subject,
                Body = body,
                IsHtml = true
            });
        }

        public async Task SendEmailWithCopies(string recipient, string cc, string bcc, string subject, string body)
        {
            await _sendEmailService.SendEmail(new SendMailRequest
            {
                FromAddress = _fromAddress,
                Recipients = recipient,
                RecipientsCC = cc,
                RecipientsBCC = bcc,
                Subject = subject,
                Body = body,
                IsHtml = true
            });
        }

        public async Task<bool> SendAnnualIncreaseEmail(PolicyMember member, AnnualIncrease increase)
        {
            Contract.Requires(member != null);
            Contract.Requires(increase != null);

            var dict = new Dictionary<string, string>
            {
                ["memberName"] = member.MemberName,
                ["policyNumber"] = member.PolicyNumber,
                ["premiumBefore"] = increase.PremiumBefore.Value.ToString("#,##0.00"),
                ["premiumAfter"] = increase.PremiumAfter.Value.ToString("#,##0.00"),
                ["effectiveDate"] = increase.EffectiveDate.ToString("dd/MM/yyyy")
            };

            var htmlBody = await _emailTemplateService.GenerateTemplateContent(TemplateTypeEnum.LifeSystemsPolicyIncreaseNotification, dict);

            var status = await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.CFAnnualIncrease,
                ItemId = increase.PolicyId,
                FromAddress = _fromAddress,
                Recipients = member.EmailAddress,
                Subject = $"Annual Increase on Policy {member.PolicyNumber}",
                Body = htmlBody.Content,
                IsHtml = true
            });

            return status == (int)HttpStatusCode.OK;
        }

        public async Task<bool> SendAnnualIncreaseSms(PolicyMember member, AnnualIncrease increase)
        {
            Contract.Requires(member != null);
            Contract.Requires(increase != null);

            var content = await _configurationService.GetModuleSetting(SystemSettings.PolicyIncreaseNotificationSms);
            content = string.Format(content,
                member.MemberName,
                member.PolicyNumber,
                increase.PremiumAfter.Value.ToString("#,##0.00", CultureInfo.InvariantCulture),
                increase.EffectiveDate.ToString("d MMM yyyy"));
            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.CFAnnualIncrease,
                SmsNumbers = new List<string>() { member.CellPhoneNumber },
                Message = content,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = increase.PolicyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };
            var result = await _sendSmsService.SendSmsMessage(smsRequest);
            return result > 0;
        }

        public async Task SendPolicyHolderBirthdayWishesBySMS(PolicyholderBirthdaySMSModel policyholderBirthdaySMS)
        {
            Contract.Requires(policyholderBirthdaySMS != null);

            try
            {
                var smsRequest = new SendSmsRequest()
                {
                    Campaign = "PolicyHolder BirthDay",
                    Department = RMADepartmentEnum.Retentions,
                    BusinessArea = BusinessAreaEnum.RetentionsBirthDay,
                    SmsNumbers = new List<string>() { policyholderBirthdaySMS.CellNumber },
                    Message = policyholderBirthdaySMS.Message,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = policyholderBirthdaySMS.RolePlayerId,
                    ItemType = "Person"
                };

                await _sendSmsService.SendSmsMessage(smsRequest);
            }
            catch (Exception ex)
            {
                ex.LogException($"SendPolicyHolderBirthdayWishesBySMS Failed -  RolePlayerId:{policyholderBirthdaySMS.RolePlayerId}, CelPhoneNumber:{policyholderBirthdaySMS.CellNumber}, ExMessage:{ex.Message}, StackTrace:{ex.StackTrace}");
            }
        }

        public async Task<bool> SendPaybackConfirmationSms(PolicyMember member, PremiumPayback payback)
        {
            Contract.Requires(member != null);
            Contract.Requires(payback != null);

            var content = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackConfirmationSms);
            content = content.Replace("[Amount]", payback.PaybackAmount.Value.ToString("#,##.00", CultureInfo.InvariantCulture));
            return await SendPaybackSms(member, content, payback.PolicyId);
        }

        public async Task<bool> SendPaybackNotificationSms(PolicyMember member, PremiumPayback payback)
        {
            Contract.Requires(member != null);
            Contract.Requires(payback != null);

            var content = await _configurationService.GetModuleSetting(SystemSettings.PremiumPaybackNotificationSms);
            return await SendPaybackSms(member, content, payback.PolicyId);
        }

        private async Task<bool> SendPaybackSms(PolicyMember member, string content, int policyId)
        {
            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.LifeOperations,
                BusinessArea = BusinessAreaEnum.CFPremiumPayback,
                SmsNumbers = new List<string>() { member?.CellPhoneNumber },
                Message = content,
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
            };
            var result = await _sendSmsService.SendSmsMessage(smsRequest);
            return result > 0;
        }

        public async Task SendChildOverAgeEmail(int policyId, int childRolePlayerId, int daysNotification, string policyNumber, string emailAddress, string displayName, string childName)

        {
            byte[] overAgeNotificationLetterBytes = null;

            _parameters = $"&policyId={policyId}&rolePlayerId={childRolePlayerId}&rs:Command=ClearSession";

            if (daysNotification > 0)
            {
                overAgeNotificationLetterBytes = await GetUriDocumentByteData(
                    new Uri($"{_reportserverUrl}/RMAOverAgeReminderLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            }
            else
            {
                overAgeNotificationLetterBytes = await GetUriDocumentByteData(
                        new Uri($"{_reportserverUrl}/RMAOverAgeFinalLetter{_parameters}&rs:Format=PDF"), _headerCollection);
            }

            if (_headerCollection == null)
            {
                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                    { SystemSettings.Environment,  environment}
                };
            }

            List<MailAttachment> attachments = null;
            if (overAgeNotificationLetterBytes != null)
            {
                attachments = new List<MailAttachment>
                {
                    new MailAttachment
                    {
                        AttachmentByteData = overAgeNotificationLetterBytes,
                        FileName = "OverAgeNotification.pdf",
                        FileType = "application/pdf"
                    }
                };
            }

            var emailBody = daysNotification > 0
                ? await _configurationService.GetModuleSetting(SystemSettings.ChildOverAgeEmailBody)
                : await _configurationService.GetModuleSetting(SystemSettings.ChildOverAgeEmailBodyFinal);

            var emailRequest = new SendMailRequest
            {
                ItemId = policyId,
                ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                Department = RMADepartmentEnum.Retentions,
                BusinessArea = BusinessAreaEnum.RetentionsOverAge,
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = $"RMA Funeral Plan - Child Over Age Notification: {policyNumber}",
                Body = emailBody
                    .Replace("[ChildName]", childName)
                    .Replace("[PolicyNumber]", policyNumber)
                    .Replace("[DaysNotification]", daysNotification.ToString()),
                IsHtml = true
            };
            await _sendEmailService.SendEmail(emailRequest);
        }


        public async Task SendPolicyDocumentsBySms(PolicyMember policy, TemplateTypeEnum templateType)
        {
            Contract.Requires(policy != null);

            try
            {
                var template = await _smsTemplateService.GetSmsTemplateByTemplateId(templateType);
               
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

                var smsMessage=template.Template.Replace("{0}", policy.PolicyNumber)
                                .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                    SmsNumbers = new List<string>() { policy.CellPhoneNumber },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = policy.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };

                var isAlreadySent = await _sendSmsService.SmsAlreadySent(policy.PolicyId, "Policy", smsMessage, policy.CellPhoneNumber);
                        if (!isAlreadySent)
                            await _sendSmsService.SendSmsMessage(smsRequest);
    }
            catch (Exception ex)
            {
                ex.LogException($"SendPolicyScheduleBySms Failed -  PolicyNumber:{policy.PolicyNumber}, CelPhoneNumber:{policy.CellPhoneNumber}, ExMessage:{ex.Message}, StackTrace:{ex.StackTrace}");
            }
        }


        public async Task SendPolicyAmendedNotificationBySms(PolicyMember policyMember, TemplateTypeEnum templateType)
        {
            Contract.Requires(policyMember != null);

            try
            {
                var template = await _smsTemplateService.GetSmsTemplateByTemplateId(templateType);
                var urlAppend = (await _configurationService.GetModuleSetting(SystemSettings.PolicyScheduleShortUrl));

              var  smsMessage = template.Template
                            .Replace("{0}", policyMember.PolicyNumber)
                            .Replace("{1}", urlAppend);

                var smsRequest = new SendSmsRequest()
                {
                    Department = RMADepartmentEnum.LifeOperations,
                    BusinessArea = BusinessAreaEnum.NewBusinessActivation,
                    SmsNumbers = new List<string>() { policyMember.CellPhoneNumber },
                    Message = smsMessage,
                    WhenToSend = DateTimeHelper.SaNow,
                    ItemId = policyMember.PolicyId,
                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue()
                };

                await _sendSmsService.SendSmsMessage(smsRequest);

            }
            catch (Exception ex)
            {
                ex.LogException($"SendPolicyScheduleBySms Failed -  PolicyNumber:{policyMember.PolicyNumber}, CelPhoneNumber:{policyMember.CellPhoneNumber}, ExMessage:{ex.Message}, StackTrace:{ex.StackTrace}");
            }
        }


        public async Task SendPolicyDocumentsByRole(int parentPolicyId, string parentPolicyNumber, string schemeName, List<PolicyMember> policyMembers, string brokerName, string recipient)
        {
            Contract.Requires(policyMembers != null);
            Contract.Requires(policyMembers.Count > 0);
            Contract.Requires(schemeName != null);

            try
            {
                if (string.IsNullOrEmpty(recipient)) return;

                var setting = await _configurationService.GetModuleSetting(SystemSettings.BatchEmailCount);
                if (!int.TryParse(setting, out int batchCount))
                {
                    batchCount = defaultBatchCount;
                }

                var batchId = 1;
                var remainder = policyMembers.Count / batchCount;
                var archiveSets = policyMembers.Count / batchCount;
                if (remainder > 0) archiveSets++;
                if (archiveSets == 0) archiveSets++;

                while (policyMembers.Count > 0)
                {
                    var count = policyMembers.Count > batchCount ? batchCount : policyMembers.Count;
                    var policies = policyMembers.Take(count).ToList();

                    List<MailAttachment> attachments;
                    using (var stream = new MemoryStream())
                    {
                        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
                        {
                            foreach (var policy in policies)
                            {
                                _parameters = $"&policyId={policy.PolicyId}&rs:Command=ClearSession";
                                var policySchedule = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/RMAGroupPolicyMemberCertificate{_parameters}&rs:Format=PDF"), _headerCollection);
                                if (policySchedule.Length > 0)
                                {
                                    // Encrypt the file. Password is the member's ID number
                                    var encryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = policySchedule };
                                    var encryptResponse = await _documentGeneratorService.PasswordProtectPdf(policy.PolicyNumber, policy.IdNumber, encryptRequest);

                                    // Add the file to the zip archive
                                    var fileName = $"PolicySchedule-{policy.MemberName.Trim().ToUpper()}-{policy.PolicyNumber}.pdf";
                                    var zipArchiveEntry = archive.CreateEntry(fileName, CompressionLevel.Optimal);
                                    using (var zipStream = zipArchiveEntry.Open())
                                    {
                                        await zipStream.WriteAsync(encryptResponse.encryptedDocumentBytes, 0, encryptResponse.encryptedDocumentBytes.Length);
                                    }
                                }
                            }
                        }

                        var zipData = new byte[stream.Length];
                        stream.Seek(0, SeekOrigin.Begin);
                        await stream.ReadAsync(zipData, 0, zipData.Length);

                        attachments = new List<MailAttachment>
                        {
                            new MailAttachment
                            {
                                AttachmentByteData = zipData,
                                FileName = parentPolicyNumber + $"_Schedules_{batchId}.zip",
                                FileType = "application/zip"
                            }
                        };
                    }

                    var body = $"RMA Policy Membership Certificates file {batchId} of {archiveSets} for {schemeName}.";

                    await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = parentPolicyId,
                        ItemType = "Policy",
                        FromAddress = _fromAddress,
                        Recipients = recipient,
                        Subject = $"{schemeName.ToUpper()}: Policy Membership Certificates",
                        Body = body,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });

                    while (policies.Count > 0)
                    {
                        var policy = policies[0];
                        policyMembers.Remove(policy);
                        policies = policies.GetRange(1, policies.Count - 1);
                    }

                    batchId++;
                }
            }
            catch (Exception ex)
            {
                // This task will run in a background thread, because it ALWAYS times out.
                // We'll have to check the logs if the broker does not get his emails.
                ex.LogException($"Bulk policy {parentPolicyNumber} send error.");
            }
        }
    }
}
