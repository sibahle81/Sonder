
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.Services.Lead
{
    public class LeadCommunicationFacade : RemotingStatelessService, ILeadCommunicationService
    {
        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly ISendSmsService _sendSmsService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        // COMMON COMMUNICATION VARIABLES
        private WebHeaderCollection _headerCollection;
        private string _fromAddress;
        private string _ssrsBaseUrl;
        private string _reportserverUrl;

        // SSRS REPORT TEMPLATES
        private string _ssrsRMAAssuranceQuotation;
        private string _ssrsAssistanceRMLAssuranceQuotation;
        private string _ssrsNonStatutoryRMLAssuranceQuotation;

        public LeadCommunicationFacade(
            StatelessServiceContext context,
            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IDocumentIndexService documentIndexService,
            ISendSmsService sendSmsService,
            IDbContextScopeFactory dbContextScopeFactory
        ) : base(context)
        {
            _headerCollection = null;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _documentIndexService = documentIndexService;
            _sendSmsService = sendSmsService;
            _dbContextScopeFactory = dbContextScopeFactory;
            Task.Run(() => this.SetupCommunicationVariables()).Wait();
        }

        public async Task SendRMAAssuranceQuoteEmail(QuoteV2 quotation, List<string> toEmailAddresses, Dictionary<string, string> ssrsReportParameters)
        {
            var parameters = string.Empty;
            if (ssrsReportParameters != null)
            {
                foreach (var ssrsReportParameter in ssrsReportParameters)
                {
                    parameters += $"&{ssrsReportParameter.Key}={ssrsReportParameter.Value}";
                }
            }
            parameters += "&rs:Command=ClearSession";

            byte[] quote = await GetUriDocumentByteData(new Uri($"{_ssrsRMAAssuranceQuotation}{parameters}&rs:Format=PDF"), _headerCollection);
            List<MailAttachment> attachments = new List<MailAttachment>();
            if (quotation != null)
            {
                attachments = new List<MailAttachment>
                { 
                new MailAttachment { AttachmentByteData = quote, FileName = $"RMAAssuranceQuotation:{quotation.QuotationNumber}.pdf", FileType = "application/pdf"},
                };
            }

            var emailBody = "Dear Sir/Madam,<br/><br/>";
            emailBody += "Thank you for giving us the opportunity to offer you the attached quotation for your consideration.<br/>";
            emailBody += "Should you have any queries relating hereto, please do not hesitate to contact me on mmanager@randmutual.co.za.<br/><br/>";
            emailBody += "Yours faithfully,<br/>";
            emailBody += "Membership Manager<br/>";
            emailBody += "Membership Services <br/>";
            emailBody += "Email: mmanager@randmutual.co.za";
            if (toEmailAddresses != null)
            {
                foreach (var emailAddress in toEmailAddresses)
                {
                    var acceptDeclineURL = await GetQuoteAcceptDeclineLink(Convert.ToInt32(quotation?.QuoteId), emailAddress);
                    emailBody += $"</br></br><strong>To accept/decline this quote, click:</strong></br>{acceptDeclineURL}";

                    await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = quotation?.QuoteId,
                        ItemType = "QuoteV2",
                        FromAddress = _fromAddress,
                        Recipients = emailAddress,
                        RecipientsCC = quotation?.ModifiedBy,
                        Subject = $"RMA Assurance Quotation: {quotation?.QuotationNumber}",
                        Body = emailBody,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });
                }
            }
        }

        public async Task SendRMLAssuranceQuoteEmail(QuoteV2 quotation, List<string> toEmailAddresses, Dictionary<string, string> ssrsReportParameters, ProductCategoryTypeEnum productCategoryType)
        {
            var parameters = string.Empty;
            Contract.Requires(ssrsReportParameters != null);
            foreach (var ssrsReportParameter in ssrsReportParameters)
            {
                parameters += $"&{ssrsReportParameter.Key}={ssrsReportParameter.Value}";
            }
            parameters += "&rs:Command=ClearSession";

            var template = productCategoryType == ProductCategoryTypeEnum.VapsAssistance ? _ssrsAssistanceRMLAssuranceQuotation : _ssrsNonStatutoryRMLAssuranceQuotation;
            byte[] quote = await GetUriDocumentByteData(new Uri($"{template}{parameters}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment { AttachmentByteData = quote, FileName = $"RMLAssuranceQuotation:{quotation?.QuotationNumber}.pdf", FileType = "application/pdf"},
            };

            var emailBody = "Dear Sir/Madam,<br/><br/>";
            emailBody += "Thank you for giving us the opportunity to offer you the attached quotation for your consideration.<br/>";
            emailBody += "Should you have any queries relating hereto, please do not hesitate to contact me on mmanager@randmutual.co.za.<br/><br/>";
            emailBody += "Yours faithfully,<br/>";
            emailBody += "Membership Manager<br/>";
            emailBody += "Membership Services <br/>";
            emailBody += "Email: mmanager@randmutual.co.za";
            if (toEmailAddresses != null)
            {
                foreach (var emailAddress in toEmailAddresses)
                {
                    var acceptDeclineURL = await GetQuoteAcceptDeclineLink(Convert.ToInt32(quotation.QuoteId), emailAddress);
                    emailBody += $"</br></br><strong>To accept/decline this quote, click:</strong></br>{acceptDeclineURL}";

                    await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = quotation?.QuoteId,
                        ItemType = "QuoteV2",
                        FromAddress = _fromAddress,
                        Recipients = emailAddress,
                        RecipientsCC = quotation?.ModifiedBy,
                        Subject = $"RML Assurance Quotation: {quotation?.QuotationNumber}",
                        Body = emailBody,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    });
                }
            }
        }

        #region PRIVATE
        private async Task SetupCommunicationVariables()
        {
            _headerCollection = new WebHeaderCollection
            {
                { "Authorization", "Bearer " + RmaIdentity.AccessToken },
                { SystemSettings.Environment,  await _configurationService.GetModuleSetting("Environment")}
            };

            _fromAddress = "noreply@randmutual.co.za"; // await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _ssrsBaseUrl = await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl);
            _reportserverUrl = $"{_ssrsBaseUrl}RMA.Reports.ClientCare";

            // SSRS REPORT TEMPLATES 
            _ssrsRMAAssuranceQuotation = $"{_reportserverUrl}.Quote/RMAAssuranceQuote/RMAAssuranceQuote";
            _ssrsAssistanceRMLAssuranceQuotation = $"{_reportserverUrl}.Quote/RMLAssuranceQuote/RMLAssuranceQuote";
            _ssrsNonStatutoryRMLAssuranceQuotation = $"{_reportserverUrl}.Quote/RMLAssuranceQuote/RMLNonCoidQuote";
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        private async Task<string> GetQuoteAcceptDeclineLink(int quoteId, string emailAddress)
        {
            if (quoteId >0 && !string.IsNullOrEmpty(emailAddress))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var listOfAttachmentIds = new List<int>();
                    string message = string.Empty;

                    var hmac = new HMACSHA512();
                    var linkToken = hmac.ComputeHash(Encoding.UTF8.GetBytes(emailAddress));
                    var linkHash = Regex.Replace(Convert.ToBase64String(linkToken), "[^a-zA-Z0-9_.]+", "");
                    var userHref = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalQuoteLink);

                    return $"<a href=\"{userHref + quoteId.ToString()}\">{linkHash}</a>";
                  
                }
            }
            return string.Empty;
        }
        #endregion

       
    }
}
