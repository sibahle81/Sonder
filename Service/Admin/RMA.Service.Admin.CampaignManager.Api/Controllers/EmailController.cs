using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    [Route("api/[controller]")]
    public class EmailController : RmaApiController
    {
        private readonly IEmailService _emailService;
        private readonly ISendEmailService _sendEmailService;

        public EmailController(
            IEmailService emailService,
            ISendEmailService sendEmailService
        )
        {
            _emailService = emailService;
            _sendEmailService = sendEmailService;
        }

        [HttpGet("GetContent")]
        public async Task<ActionResult<MessageContent>> GetContent([FromBody] Email email)
        {
            var content = await _emailService.GetEmailContent(email);
            return Ok(content);
        }

        [HttpGet("GetContent/{emailId}")]
        public async Task<ActionResult<MessageContent>> GetContent(int emailId)
        {
            var content = await _emailService.GetEmailContentByEmailId(emailId).ConfigureAwait(false);
            return Ok(content);
        }

        [HttpGet("ById/{id}")]
        public async Task<ActionResult<Email>> Get(int id)
        {
            var email = await _emailService.GetEmail(id);
            return Ok(email);
        }

        [HttpGet("Campaign/{campaignId}")]
        public async Task<ActionResult<Email>> GetCampaignEmail(int campaignId)
        {
            var email = await _emailService.GetCampaignEmail(campaignId);
            return Ok(email);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Email email)
        {
            var emailId = await _emailService.AddEmail(email);
            return Ok(emailId);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Email email)
        {
            await _emailService.EditEmail(email);
            return Ok();
        }

        //GET: cmp/api/Email/GetEmailAudit/{itemType}/{itemId}
        [HttpGet("GetEmailAudit/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<EmailAudit>>> GetEmailAudit(string itemType, int itemId)
        {
            var notifications = await _emailService.GetEmailAudit(itemId, itemType);
            return Ok(notifications);
        }

        //GET: cmp/api/Email/GetMailAttachmentsByAuditId/{auditId}
        [HttpGet("GetMailAttachmentsByAuditId/{auditId}")]
        public async Task<ActionResult<IEnumerable<MailAttachment>>> GetMailAttachmentsByAuditId(int auditId)
        {
            var attachments = await _emailService.GetMailAttachmentsByAuditId(auditId);
            return Ok(attachments);
        }

        [HttpGet("GetEmailAuditAndAttachment/{Id}")]
        public async Task<ActionResult<EmailAudit>> GetEmailAuditAndAttachment(int Id)
        {
            var notifications = await _emailService.EmailAuditAndAttachment(Id);
            return Ok(notifications);
        }

        [HttpGet("GetEmailAuditByDate")]
        public async Task<ActionResult<IEnumerable<EmailAudit>>> GetEmailAuditByDate(string itemType, DateTime startDate)
        {
            var notifications = await _emailService.GetEmailAuditByDate(itemType, startDate);
            return Ok(notifications);
        }

        [HttpGet("GetPagedEmailAudits/{itemId}/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<EmailAudit>>> GetPagedEmailAudits(int itemId, string itemType, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var results = await _emailService.GetPagedEmailAudits(itemId, itemType, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("Resend/{emailAuditId}")]
        public async Task<ActionResult<int>> Resend(int emailAuditId)
        {
            var result = await _sendEmailService.Resend(emailAuditId);
            return Ok(result);
        }

        [HttpPost("ResendEmail")]
        public async Task<ActionResult<int>> ResendEmail([FromBody] EmailAudit emailAudit)
        {
            var result = await _sendEmailService.ResendEmail(emailAudit);
            return Ok(result);
        }

        [HttpGet("GetEmailAuditForPolicy/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<EmailAudit>>> GetEmailAuditForPolicy(int policyId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var results = await _emailService.GetEmailAuditForPolicy(policyId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

    }
}
