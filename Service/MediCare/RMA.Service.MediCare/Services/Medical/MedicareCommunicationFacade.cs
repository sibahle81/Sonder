using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class MedicareCommunicationFacade : RemotingStatelessService, IMedicareCommunicationService
    {

        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentGeneratorService _documentGeneratorService;

        // COMMON COMMUNICATION VARIABLES
        private WebHeaderCollection _headerCollection;
        private string _fromAddress;
        private string _ssrsBaseUrl;
        private string _reportServerUrl;

        // SSRS REPORT TEMPLATE
        private string _ssrsAuthorizedFormLetter;

        public MedicareCommunicationFacade(
            StatelessServiceContext context,
            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IDocumentGeneratorService documentGeneratorService
        ) : base(context)
        {
            _headerCollection = null;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _documentGeneratorService = documentGeneratorService;
            Task.Run(this.SetupMemberCommunicationVariables).Wait();
        }

        private async Task SetupMemberCommunicationVariables()
        {
            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  await _configurationService.GetModuleSetting("Environment")}
            };

            _fromAddress = "noreply@randmutual.co.za"; 
            _ssrsBaseUrl = await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl);
            _reportServerUrl = $"{_ssrsBaseUrl}RMA.Reports.Medicare";
            
        }

        public async Task SendAuthorizedFormLetter(string PreAuthNumber, string ClaimId, List<string> toEmailAddresses, PreAuthTypeEnum preAuthType)
        {
            byte[] preAuthPDF = Array.Empty<byte>();
            var fileName = "";
            var subject = "";
            var emailBody = "";           
            FileEncryptRequest pdfencryptRequest;
            FileEncryptResponse encryptedAuthorizationPDF = new FileEncryptResponse();
            var parameters = $"&PreAuthNumber={PreAuthNumber}&rs:Command=ClearSession";
            if (preAuthType == PreAuthTypeEnum.Hospitalization)
            {
                // SSRS REPORT TEMPLATES 
                _ssrsAuthorizedFormLetter = $"{_reportServerUrl}/HospitalAuthorization";
                preAuthPDF = await GetUriDocumentByteData(new Uri($"{_ssrsAuthorizedFormLetter}{parameters}&rs:Format=PDF"), _headerCollection);
                fileName = $"HospitalAuthorization.pdf";
                subject = $"Hospital Authorization Confirmation Letter";
                emailBody = "hospital authorization confirmation letter";
            }
            else if (preAuthType == PreAuthTypeEnum.Treatment)
            {
                // SSRS REPORT TEMPLATES 
                _ssrsAuthorizedFormLetter = $"{_reportServerUrl}/TreatmentAuthorizationDetailsReport";
                preAuthPDF = await GetUriDocumentByteData(new Uri($"{_ssrsAuthorizedFormLetter}{parameters}&rs:Format=PDF"), _headerCollection);
                fileName = $"TreatmentAuthorizationDetailsReport.pdf";
                subject = $"Treatment Authorization Confirmation Letter";
                emailBody = "Treatment Authorization confirmation letter";
            }
            else if (preAuthType == PreAuthTypeEnum.ChronicMedication)
            {
                // SSRS REPORT TEMPLATES 
                _ssrsAuthorizedFormLetter = $"{_reportServerUrl}/ChronicAuthorization";               
                preAuthPDF = await GetUriDocumentByteData(new Uri($"{_ssrsAuthorizedFormLetter}{parameters}&rs:Format=PDF"), _headerCollection);
                fileName = $"ChronicAuthorizationDetailsReport.pdf";
                subject = $"Confirmation: Your Chronic Medication Authorization";
                emailBody = " disclaimer : This communication contains confidential information.";

                //adding password ecryption to the pdf
                pdfencryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = preAuthPDF };
                encryptedAuthorizationPDF = await _documentGeneratorService.PasswordProtectPdf(ClaimId, null, pdfencryptRequest);
                preAuthPDF = encryptedAuthorizationPDF.encryptedDocumentBytes;

            }
            else if (preAuthType == PreAuthTypeEnum.Prosthetic)
            {
                // SSRS REPORT TEMPLATES 
                _ssrsAuthorizedFormLetter = $"{_reportServerUrl}/ProstheticOrthoticsAuthorisation";
                preAuthPDF = await GetUriDocumentByteData(new Uri($"{_ssrsAuthorizedFormLetter}{parameters}&rs:Format=PDF"), _headerCollection);
                fileName = $"ProstheticOrthoticsAuthorisation.pdf";
                subject = $"Prostetic Authorization Confirmation Letter";
                emailBody = "Prostetic Authorization confirmation letter";
            }

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = preAuthPDF, FileName = fileName, FileType = "application/pdf"},
            };

            if (toEmailAddresses != null)
            {
                foreach (var emailAddress in toEmailAddresses)
                {
                    await _sendEmailService.SendEmail(new SendMailRequest
                    {

                        ItemType = "Authorization",
                        FromAddress = _fromAddress,
                        Recipients = emailAddress,
                        Subject = subject,
                        Body = emailBody,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });
                }
            }
                   
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }
    }
}
