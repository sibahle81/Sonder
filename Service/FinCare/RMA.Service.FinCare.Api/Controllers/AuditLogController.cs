using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.FinCare.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Interfaces.Payments;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.FinCare.Api.Controllers
{
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLog)
        {
            _auditLog = auditLog;
        }

        // GET: clc/api/Lead/AuditLog/{1}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: clc/api/Lead/AuditLog/{correlationToken}
        [HttpGet("ByToken/{correlationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }

        // GET: clc/api/Lead/AuditLog/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> Get(ItemType itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName(itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        private static string GetItemTypeName(ItemType itemType)
        {
            switch (itemType)
            {
                case ItemType.EarningsDeclaration:
                    return "billing_EarningsDeclaration";
                case ItemType.Rate:
                    return "billing_Rate";
                case ItemType.Invoice:
                    return "billing_Invoice";
                case ItemType.Debtors:
                    return "billing_Debtor";
                case ItemType.DebitOrder:
                    return "billing_DebitOrder";
                case ItemType.Payment:
                    return "payment_Payment";
                case ItemType.Statement:
                    return "billing_Statement";
                case ItemType.PaymentAllocation:
                    return "billing_PaymentAllocation";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }

       
    }
}
