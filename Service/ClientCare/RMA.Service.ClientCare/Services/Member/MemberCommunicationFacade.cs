using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Member
{
    public class MemberCommunicationFacade : RemotingStatelessService, IMemberCommunicationService
    {
        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentIndexService _documentIndexService;

        // COMMON COMMUNICATION VARIABLES
        private WebHeaderCollection _headerCollection;
        private string _fromAddress;
        private string _ssrsBaseUrl;
        private string _reportServerUrl;

        // SSRS REPORT TEMPLATE
        private string _ssrsRMAMemberLetterOfGoodStanding;

        public MemberCommunicationFacade(
            StatelessServiceContext context,
            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IDocumentIndexService documentIndexService
        ) : base(context)
        {
            _headerCollection = null;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _documentIndexService = documentIndexService;
            Task.Run(this.SetupMemberCommunicationVariables).Wait();
        }

        private async Task SetupMemberCommunicationVariables()
        {
            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  await _configurationService.GetModuleSetting("Environment")}
            };

            _fromAddress = "noreply@randmutual.co.za"; // await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _ssrsBaseUrl = await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl);
            _reportServerUrl = $"{_ssrsBaseUrl}RMA.Reports.ClientCare";

            // SSRS REPORT TEMPLATES 
            _ssrsRMAMemberLetterOfGoodStanding = $"{_reportServerUrl}.Policy/LOGS/RMAMemberLetterOfGoodStanding";
        }

        public async Task<int> SendMemberLogsEmail(LetterOfGoodStanding letterOfGoodStanding, int declarationYear, int productOptionId, bool uploadDocument)
        {
            Contract.Requires(letterOfGoodStanding != null);

            var parameters = $"&RolePlayerId={letterOfGoodStanding.RolePlayerId}&DeclarationYear={declarationYear}&ProductOptionId={productOptionId}&rs:Command=ClearSession";

            byte[] logs = await GetUriDocumentByteData(new Uri($"{_ssrsRMAMemberLetterOfGoodStanding}{parameters}&rs:Format=PDF"), _headerCollection);
            var fileName = $"Letter of Good Standing {letterOfGoodStanding.CertificateNo}.pdf";

            if (uploadDocument)
            {
                await _documentIndexService.UploadDocumentFromCommunication(
                DocumentSystemNameEnum.PolicyManager,
                DocumentTypeEnum.LetterOfGoodStanding,
                fileName,
                new Dictionary<string, string> { { "PolicyId", letterOfGoodStanding.PolicyId.ToString() } },
                "application/pdf",
                DocumentSetEnum.LettersOfGoodStanding,
                logs,
                true);
            }

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = logs, FileName = fileName, FileType = "application/pdf"},
            };

            var emailBody = await _configurationService.GetModuleSetting(SystemSettings.LetterOfGoodStanding);

            var emailAddress = letterOfGoodStanding.MemberEmail;
            return await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = letterOfGoodStanding.PolicyId,
                ItemType = "Policy",
                FromAddress = _fromAddress,
                Recipients = emailAddress,
                Subject = $"Letter of Good Standing: {letterOfGoodStanding.CertificateNo}",
                Body = emailBody.Replace("{0}", letterOfGoodStanding.MemberName).Replace("{1}", DateTimeHelper.SaNow.ToString()),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }
    }
}
