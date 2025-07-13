using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        // GET: clc/api/Policy/AuditLog/{id}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: clc/api/Policy/AuditLog/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(PolicyItemTypeEnum itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName(itemType), itemId);
            return Ok(auditLogs);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(PolicyItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var auditResults = await _auditLog.GetAuditLogsPaged(GetItemTypeName(itemType), new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(auditResults);
        }

        private string GetItemTypeName(PolicyItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case PolicyItemTypeEnum.Policy:
                    return "policy_Policy";
                case PolicyItemTypeEnum.InsuredLife:
                    return "policy_PolicyInsuredLives";
                case PolicyItemTypeEnum.PolicyNote:
                    return "policy_PolicyNote";
                case PolicyItemTypeEnum.Beneficiary:
                    return "client_RolePlayer";
                case PolicyItemTypeEnum.PolicyDocument:
                    return "documents_Document";
                case PolicyItemTypeEnum.PolicyCover:
                    return "policy_Cover";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }

            return string.Empty;
        }

        // GET: clc/api/Policy/AuditLog/correlationToken/{correlationToken}
        [HttpGet("ByToken/{correlationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }
    }
}