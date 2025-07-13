using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
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
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByType(CampaignItemTypeEnum itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName(itemType), itemId);
            return Ok(auditLogs);
        }

        private static string GetItemTypeName(CampaignItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case CampaignItemTypeEnum.Campaign:
                    return "campaign_Campaign";
                case CampaignItemTypeEnum.EmailTemplate:
                    return "campaign_EmailTemplate";
                case CampaignItemTypeEnum.SmsTemplate:
                    return "campaign_SmsTemplate";
                case CampaignItemTypeEnum.Reminder:
                    return "campaign_Reminder";
                case CampaignItemTypeEnum.TargetAudience:
                    return "campaign_TargetAudience";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }

        [HttpGet("ByToken/{correlationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByToken(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }
    }
}