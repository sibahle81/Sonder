using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    [Route("api/[controller]")]
    public class SmsAuditController : RmaApiController
    {
        private readonly ISmsAuditService _smsAuditService;

        public SmsAuditController(
            ISmsAuditService smsAuditService)
        { 
            _smsAuditService = smsAuditService;
        }

        [HttpGet("GetPagedSmsAudits/{itemType}/{itemId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<EmailAudit>>> GetPagedEmailAudits(string itemType, int itemId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var results = await _smsAuditService.GetPagedSmsAudits(itemId, itemType, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("GetSmsAuditForPolicy/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<EmailAudit>>> GetSmsAuditForPolicy(int policyId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var results = await _smsAuditService.GetSmsAuditForPolicy(policyId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }
    }
}
