using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface IEmailService : IService
    {
        Task<MessageContent> GetEmailContent(Email email);
        Task<MessageContent> GetEmailContentByEmailId(int emailId);
        Task<Email> GetEmail(int id);
        Task<Email> GetCampaignEmail(int campaignId);
        Task<int> AddEmail(Email email);
        Task<int> AddEmailAudit(SendMailRequest sendMail);
        Task EditEmail(Email email);
        Task<List<EmailAudit>> GetEmailAudit(int itemId, string itemType);
        Task CopyEmails(int campaignId, int newCampaignId);
        Task ModifyCampaignEmails(List<Email> campaignEmails);
        Task<List<MailAttachment>> GetMailAttachmentsByAuditId(int emailAuditId);
        Task<bool> EmailAlreadySent(string itemType, int itemId, List<string> recipients, DateTime date);
        Task<EmailAudit> EmailAuditAndAttachment(int Id);
        Task<bool> CheckEmailAlreadySent(string itemType, string subject, int itemId, List<string> recipients, DateTime date);
        Task<bool> CheckIfEmailAlreadySent(string itemType, string subject, int itemId, List<string> recipients);
        Task<List<EmailAudit>> GetEmailAuditByDate(string itemType, DateTime startDate);
        Task<PagedRequestResult<EmailAudit>> GetPagedEmailAudit(PagedRequest request, string itemType, DateTime startDate);
        Task<DateTime> GetEmailSentDate(int itemId, string itemType, string subject);
        Task<List<EmailAudit>> GetEmailAuditDetails(int itemId, string itemType);
        Task<PagedRequestResult<EmailAudit>> GetPagedEmailAudits(int itemId, string itemType, PagedRequest pagedRequest);
        Task<PagedRequestResult<EmailAudit>> GetEmailAuditForPolicy(int policyId, PagedRequest pagedRequest);
    }
}