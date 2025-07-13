using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class SendEmailFacade : RemotingStatelessService, ISendEmailService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IEmailService _emailService;
        private readonly IRepository<campaign_TargetAudience> _targetAudienceRepository;
        private readonly IRepository<campaign_TargetCompany> _companyRepository;
        private readonly IRepository<campaign_TargetPerson> _personRepository;
        private readonly IRepository<campaign_Campaign> _campaignRepository;
        private readonly IConfigurationService _configuration;

        private SendMailRequest _request;

        public SendEmailFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IDbContextScopeFactory dbContextScopeFactory,
            IEmailService emailService,
            IRepository<campaign_Campaign> campaignRepository,
            IRepository<campaign_TargetPerson> personRepository,
            IRepository<campaign_TargetCompany> companyRepository,
            IRepository<campaign_TargetAudience> targetAudienceRepository
            )
            : base(context)
        {
            _configuration = configuration;
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailService = emailService;
            _personRepository = personRepository;
            _companyRepository = companyRepository;
            _campaignRepository = campaignRepository;
            _targetAudienceRepository = targetAudienceRepository;
        }

        public async Task<int> SendEmail(SendMailRequest request)
        {
            _request = request;
            SmtpClient smtp = null;
            MailMessage message = null;

            if (request != null)
            {
                try
                {
                    if (string.IsNullOrEmpty(request.Recipients)) return (int)HttpStatusCode.OK;

                    var host = await _configuration.GetModuleSetting(SystemSettings.CampaignManagerSmtpHost);
                    var username = await _configuration.GetModuleSetting(SystemSettings.CampaignManagerSmtpUsername);
                    var smtpPass = await _configuration.GetModuleSetting(SystemSettings.CampaignManagerSmtpPassword);
                    var port = (await _configuration.GetModuleSetting(SystemSettings.CampaignManagerSmtPort)).ToInt(587);
                    var enableSsl = (await _configuration.GetModuleSetting(SystemSettings.CampaignManagerSmtpEnableSsl)).ToBoolean(true);
                    var allowExternalSending = (await _configuration.GetModuleSetting(SystemSettings.AllowExternalCommunication)).ToBoolean(true);

                    message = await GetMailMessage(username, request, allowExternalSending);
                    message.DeliveryNotificationOptions = DeliveryNotificationOptions.OnSuccess;
                    message.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;

                    smtp = new SmtpClient(host, port)
                    {
                        Credentials = new NetworkCredential(username, smtpPass),
                        EnableSsl = enableSsl
                    };

                    await smtp.SendMailAsync(message);

                    _request.isSuccess = true;

                    return (int)HttpStatusCode.OK;
                }
                catch (SmtpException ex)
                {
                    request.isSuccess = false;
                    request.ProcessDescription = $"{ex?.Message}: {ex?.InnerException?.Message}";
                    ex.LogException();
                    return (int)ex.StatusCode;
                }
                finally
                {
                    await _emailService.AddEmailAudit(request);
                    smtp?.Dispose();
                    message?.Dispose();
                }
            }
            return await Task.FromResult(0);
        }

        public async Task<int> SendCampaign(int campaignId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var count = 0;
                var campaign = await _campaignRepository.SingleAsync(
                    c => c.Id == campaignId,
                    $"Campaign with id {campaignId} could not be found."
                );
                if (campaign.CampaignType != CampaignTypeEnum.Email)
                {
                    throw new BusinessException($"Campaign with id {campaignId} is not an email campaign.");
                }
                var email = await _emailService.GetCampaignEmail(campaignId);
                var messageContent = await _emailService.GetEmailContentByEmailId(email.Id);
                var audience = await GetTargetAudience(campaignId);
                foreach (var member in audience)
                {
                    if (AdHocRecipient(member))
                    {
                        count += await SendAdHocEmail(campaign, member, messageContent);
                    }
                    else
                    {
                        count += await SendMembersEmail(campaign, member, messageContent);
                    }
                }
                return count;
            }
        }

        private async Task<MailMessage> GetMailMessage(string username, SendMailRequest request, bool allowExternalCommunication)
        {
            var message = new MailMessage();
            var environment = await _configuration.GetModuleSetting(SystemSettings.Environment);

            environment = environment != "PROD" ? $"{environment}: " : string.Empty;

            if (request != null)
            {
                await AddRecipients(message, 1, request.Recipients, allowExternalCommunication);
                await AddRecipients(message, 2, request.RecipientsCC, allowExternalCommunication);
                await AddRecipients(message, 3, request.RecipientsBCC, allowExternalCommunication);

                message.From = new MailAddress(username);

                if (!string.IsNullOrEmpty(request.FromAddress))
                {
                    message.ReplyToList.Add(request.FromAddress);
                }

                message.Subject = environment + request.Subject;
                message.IsBodyHtml = request.IsHtml;
                message.Body = await GetEmailBody(request);

                if (request.Attachments?.Length > 0)
                {
                    foreach (var attachment in request.Attachments)
                    {
                        if (attachment == null) continue;
                        var stream = new MemoryStream(attachment.AttachmentByteData);
                        message.Attachments.Add(new System.Net.Mail.Attachment(stream, attachment.FileName, attachment.FileType));
                    }
                }
            }
            return message;
        }

        private async Task AddRecipients(MailMessage message, int type, string recipients, bool allowExternalEmailSending)
        {
            var _recipients = GetEmailAddresses(recipients);

            if (_recipients.Count <= 0)
            {
                return;
            }

            if (!allowExternalEmailSending)
            {
                _recipients.RemoveAll(s => !s.Address.Contains("@randmutual.co.za"));
                if (_recipients.Count <= 0)
                {
                    var requestRecipientsBCC = await _configuration.GetModuleSetting(SystemSettings.InternalCommunicationEmails);
                    _recipients = GetEmailAddresses(requestRecipientsBCC);
                }
            }

            foreach (var recipient in _recipients)
            {
                switch (type)
                {
                    case 1:
                        message.To.Add(recipient.Address);
                        break;
                    case 2:
                        message.CC.Add(recipient.Address);
                        break;
                    case 3:
                        message.Bcc.Add(recipient.Address);
                        break;
                }
            }
        }

        private async Task<string> GetEmailBody(SendMailRequest request)
        {
            if (request.EmailId == null || request.EmailId == 0)
            {
                return request.Body;
            }
            var content = await _emailService.GetEmailContentByEmailId((int)request.EmailId);
            return content.Content;
        }

        private static List<MailAddress> GetEmailAddresses(string addressList)
        {
            if (string.IsNullOrWhiteSpace(addressList)) return new List<MailAddress>();
            var recipients = new List<MailAddress>();
            addressList = addressList.Replace(',', ';');
            recipients.AddRange(addressList.TrimEnd(';').Split(';').Select(i => new MailAddress(i)).ToList());
            return recipients;
        }

        private async Task<int> SendMembersEmail(campaign_Campaign campaign, campaign_TargetAudience member, MessageContent messageContent)
        {
            var count = 0;
            var list = GetRecipientList(member);
            foreach (var recipient in list)
            {
                var email = recipient.Email;
                if (email?.IsValidEmail() == true)
                {
                    var request = GetEmailRequest(campaign.Name, email, messageContent.Content);
                    var status = await SendEmail(request);
                    count += status == 200 ? 1 : 0;
                }
            }
            return count;
        }

        private async Task<int> SendAdHocEmail(campaign_Campaign campaign, campaign_TargetAudience member, MessageContent messageContent)
        {
            var recipient = (member.ItemType.Equals("Company", StringComparison.OrdinalIgnoreCase))
                ? _companyRepository.FirstOrDefault(c => c.Id == member.ItemId)?.Email
                : _personRepository.FirstOrDefault(p => p.Id == member.ItemId)?.Email;
            if (recipient == null) { return 0; }
            if (!recipient.IsValidEmail()) { return 0; }
            var request = GetEmailRequest(campaign.Name, recipient, messageContent.Content);
            var status = await SendEmail(request);
            return status == 200 ? 1 : 0;
        }

        private List<TargetAudienceMember> GetRecipientList(campaign_TargetAudience member)
        {
            List<TargetAudienceMember> list = new List<TargetAudienceMember>();
            switch (member.ItemType)
            {
                case "Client":
                case "ClientType":
                case "Group":
                case "Industry":
                case "IndustryClass":
                    break;
                case "Lead":
                case "LeadClientType":
                case "LeadIndustryClass":
                    break;
            }
            return list;
        }

        private static bool AdHocRecipient(campaign_TargetAudience member)
        {
            var itemTypes = new string[] { "Company", "Person" };
            return itemTypes.Contains(member.ItemType);
        }

        private static SendMailRequest GetEmailRequest(string subject, string recipient, string content)
        {
            var request = new SendMailRequest
            {
                Subject = subject,
                FromAddress = "",
                Recipients = recipient,
                Body = content,
                IsHtml = true
            };
            return request;
        }

        private async Task<List<campaign_TargetAudience>> GetTargetAudience(int campaignId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audience = await _targetAudienceRepository
                    .Where(a => a.CampaignId == campaignId && a.IsActive && !a.IsDeleted)
                    .ToListAsync();
                return audience;
            }
        }

        public async Task<bool> Resend(int emailAuditId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var emailAudit = await _emailService.EmailAuditAndAttachment(emailAuditId);
                var mailResult = -1;

                if (emailAudit == null) { return false; }

                if (!string.IsNullOrEmpty(emailAudit.Reciepients))
                {
                    var mailRequest = new SendMailRequest
                    {
                        Attachments = emailAudit.Attachments?.ToArray(),
                        Body = emailAudit.Body,
                        FromAddress = emailAudit.FromAddress,
                        IsHtml = emailAudit.IsHtml.Value,
                        ItemId = emailAudit.ItemId,
                        ItemType = emailAudit.ItemType,
                        Recipients = emailAudit.Reciepients,
                        Subject = emailAudit.Subject
                    };

                    mailResult = await SendEmail(mailRequest);
                }

                return mailResult == 200;
            }
        }

        public async Task<int> ResendEmail(EmailAudit emailAudit)
        {
            Contract.Requires(emailAudit != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var mailRequest = new SendMailRequest
                {
                    Attachments = emailAudit.Attachments?.ToArray(),
                    Body = emailAudit.Body,
                    FromAddress = emailAudit.FromAddress,
                    IsHtml = emailAudit.IsHtml.Value,
                    ItemId = emailAudit.ItemId,
                    ItemType = emailAudit.ItemType,
                    Recipients = emailAudit.Reciepients,
                    Subject = emailAudit.Subject
                };

                return await SendEmail(mailRequest);
            }
        }
    }
}
