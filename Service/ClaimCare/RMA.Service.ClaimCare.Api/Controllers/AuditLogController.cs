using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    [Route("api/Claim/[controller]")]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        // GET: clc/api/Claim/AuditLog/ById/{1}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: clc/api/Claim/AuditLog/GetAuditLogByEnum/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(int itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName((ClaimItemTypeEnum)itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        // GET: clc/api/Claim/AuditLog/ByToken/{correlationToken}
        [HttpGet("ByToken/{corrolationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(ClaimItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var auditResults = await _auditLog.GetAuditLogsPaged(GetItemTypeName(itemType), new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(auditResults);
        }

        private static string GetItemTypeName(ClaimItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case ClaimItemTypeEnum.PersonEventDeathDetail:
                    return "claim_PersonEventDeathDetail";
                case ClaimItemTypeEnum.PersonEventAccidentDetail:
                    return "claim_PersonEventAccidentDetail";
                case ClaimItemTypeEnum.PersonEventDiseaseDetail:
                    return "claim_PersonEventDiseaseDetail";
                case ClaimItemTypeEnum.ClaimNote:
                    return "claim_ClaimNote";
                case ClaimItemTypeEnum.PhysicalDamage:
                    return "claim_PhysicalDamage";
                case ClaimItemTypeEnum.PersonEvent:
                    return "claim_PersonEvent";
                case ClaimItemTypeEnum.Claim:
                    return "claim_Claim";
                case ClaimItemTypeEnum.PoolWorkFlow:
                    return "common_PoolWorkFlow";
                case ClaimItemTypeEnum.ClaimEstimate:
                    return "claim_ClaimEstimate";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }

    }
}
