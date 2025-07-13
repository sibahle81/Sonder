using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLog = auditLogService;
        }

        // GET: sec/api/AuditLog/{id}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: sec/api/AuditLog/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByType(SecurityItemTypeEnum itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName(itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(SecurityItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var auditResults = await _auditLog.GetAuditLogsPaged(GetItemTypeName(itemType), new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(auditResults);
        }

        private static string GetItemTypeName(SecurityItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case SecurityItemTypeEnum.Role:
                    return "security_Role";
                case SecurityItemTypeEnum.User:
                    return "security_User";
                case SecurityItemTypeEnum.UserCompanyMap:
                    return "security_UserCompanyMap";
                case SecurityItemTypeEnum.UserContact:
                    return "security_UserContact";

                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }

            return string.Empty;
        }

        // GET: sec/api/AuditLog/{correlationToken}
        [HttpGet("ByToken/{correlationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByToken(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }
    }
}