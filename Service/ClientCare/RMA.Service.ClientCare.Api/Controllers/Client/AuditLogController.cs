using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Client
{
    [Route("api/Client/[controller]")]
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
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName((ClientItemTypeEnum)itemType), itemId);
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

        [HttpGet("GetAuditRequest/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> GetAuditRequest(AuditItemTypeEnum itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(itemType.DisplayAttributeValue(), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(ClientItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var auditResults = await _auditLog.GetAuditLogsPaged(GetItemTypeName(itemType), new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(auditResults);
        }

        private string GetItemTypeName(ClientItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case ClientItemTypeEnum.Address:
                    return "client_RolePlayerAddress";
                case ClientItemTypeEnum.BankAccount:
                    return "client_RolePlayerBankingDetail";
                case ClientItemTypeEnum.Client:
                    return "client_RolePlayer";
                case ClientItemTypeEnum.Contact:
                    return "client_RolePlayerContact";
                case ClientItemTypeEnum.Brokerage:
                    return "brokerage_Brokerage";
                case ClientItemTypeEnum.Representative:
                    return "brokerage_Representative";
                case ClientItemTypeEnum.Beneficiary:
                    return "client_RolePlayer";
                case ClientItemTypeEnum.Company:
                    return "client_Company";
                case ClientItemTypeEnum.Person:
                    return "client_Person";
                case ClientItemTypeEnum.PersonEmployment:
                    return "client_PersonEmployment";
                case ClientItemTypeEnum.RolePlayerPolicyDeclaration:
                    return "client_RolePlayerPolicyDeclaration";
                case ClientItemTypeEnum.RolePlayerPolicyDeclarationDetail:
                    return "client_RolePlayerPolicyDeclarationDetail";
                case ClientItemTypeEnum.RolePlayerPolicyTransaction:
                    return "client_RolePlayerPolicyTransaction";
                case ClientItemTypeEnum.LetterOfGoodStanding:
                    return "client_LetterOfGoodStanding";
                case ClientItemTypeEnum.RolePlayerPolicyOnlineSubmission:
                    return "client_RolePlayerPolicyOnlineSubmission";
                case ClientItemTypeEnum.RolePlayerPolicyOnlineSubmissionDetail:
                    return "client_RolePlayerPolicyOnlineSubmissionDetail";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }
    }
}