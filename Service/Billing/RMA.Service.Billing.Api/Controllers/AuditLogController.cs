using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<Billing.Contracts.Entities.AuditResult>>> Get(string itemType, int itemId)
        {
            var auditLogs = await _auditLogService.GetAuditLogs(itemType, itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AuditResult auditResult)
        {
            var res = await _auditLogService.AddAudit(auditResult);
            return Ok(res);
        }
    }
}