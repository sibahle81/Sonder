using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Lead
{
    [Route("api/Lead/[controller]")]
    [ApiController]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        // GET: clc/api/Lead/AuditLog/ById/{1}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: clc/api/Lead/AuditLog/GetAuditLogByEnum/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(int itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName((LeadItemTypeEnum)itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        // GET: clc/api/Lead/AuditLog/ByToken/{correlationToken}
        [HttpGet("ByToken/{corrolationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(LeadItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var auditResults = await _auditLog.GetAuditLogsPaged(GetItemTypeName(itemType), new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(auditResults);
        }

        private string GetItemTypeName(LeadItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case LeadItemTypeEnum.Address:
                    return "lead_Address";
                case LeadItemTypeEnum.Company:
                    return "lead_Company";
                case LeadItemTypeEnum.Contact:
                    return "lead_Contact";
                case LeadItemTypeEnum.LeadProduct:
                    return "lead_LeadProduct";
                case LeadItemTypeEnum.Notes:
                    return "lead_Notes";
                case LeadItemTypeEnum.Person:
                    return "lead_Person";
                case LeadItemTypeEnum.Lead:
                    return "lead_Lead";
                case LeadItemTypeEnum.ContactV2:
                    return "lead_ContactV2";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }
    }
}