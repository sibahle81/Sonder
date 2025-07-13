using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/Medicare/[controller]")]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        // GET: med/api/Medicare/AuditLog/ById/{1}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: med/api/Medicare/AuditLog/GetAuditLogByEnum/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(int itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName((MedicareItemTypeEnum)itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        // GET: med/api/Medicare/AuditLog/ByToken/{correlationToken}
        [HttpGet("ByToken/{corrolationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(MedicareItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var auditResults = await _auditLog.GetAuditLogsPaged(GetItemTypeName(itemType), new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(auditResults);
        }

        private string GetItemTypeName(MedicareItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case MedicareItemTypeEnum.Invoice:
                    return "medical_Invoice";
                case MedicareItemTypeEnum.InvoiceLine:
                    return "medical_InvoiceLine";

                case MedicareItemTypeEnum.PmpRegionTransfer:
                    return "medical_PmpRegionTransfer";
                case MedicareItemTypeEnum.PensionerInterviewForm:
                    return "medical_PensionerInterviewForm";
                case MedicareItemTypeEnum.PensionerInterviewFormDetail:
                    return "medical_PensionerInterviewFormDetail";

                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }

    }
}
