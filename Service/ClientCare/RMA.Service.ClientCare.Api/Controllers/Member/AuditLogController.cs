using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Member
{
    [Route("api/Member/[controller]")]
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
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName((MemberItemTypeEnum)itemType), itemId);
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

        private string GetItemTypeName(MemberItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case MemberItemTypeEnum.Roleplayer:
                case MemberItemTypeEnum.AccountExec:
                case MemberItemTypeEnum.Representative:
                    return "client_RolePlayer";
                case MemberItemTypeEnum.Person:
                    return "client_Person";
                case MemberItemTypeEnum.Company:
                    return "client_Company";
                case MemberItemTypeEnum.BankAccounts:
                    return "client_RolePlayerBankingDetail";
                case MemberItemTypeEnum.Address:
                    return "client_RolePlayerAddressDetail";
                case MemberItemTypeEnum.Contact:
                    return "client_RolePlayerContact";
                case MemberItemTypeEnum.Notes:
                    return "client_RolePlayerNote";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }
    }
}