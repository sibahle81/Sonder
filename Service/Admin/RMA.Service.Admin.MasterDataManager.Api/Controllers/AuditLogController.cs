using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByType(MasterItemTypeEnum itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetTypeName(itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        [HttpGet("ByToken/{correlationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByToken(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }

        [HttpPost("CreateReportViewedAudit")]
        public async Task<ActionResult> CreateReportViewedAudit([FromBody] ReportViewedAudit reportViewedAudit)
        {
            await _auditLog.CreateReportViewedAudit(reportViewedAudit);
            return Ok();
        }

        [HttpPost("GetPagedReportViewedAudit")]
        public async Task<ActionResult<PagedRequestResult<ReportViewedAudit>>> GetPagedRatesUploadErrorAudit([FromBody] ReportViewedAuditPagedRequest reportViewedAuditPagedRequest)
        {
            var results = await _auditLog.GetPagedReportViewedAudit(reportViewedAuditPagedRequest);
            return Ok(results);
        }

        private static string GetTypeName(MasterItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case MasterItemTypeEnum.CommissionBand:
                    return ("common_CommissionBand");
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }
    }
}
