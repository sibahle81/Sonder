using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.ClientCare.Contracts.Enums.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        // GET: clc/api/Product/AuditLog/{id}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: clc/api/Product/AuditLog/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByType(ProductItemType itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetTypeName(itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        private string GetTypeName(ProductItemType itemType)
        {
            switch (itemType)
            {
                case ProductItemType.Benefit:
                    return ("product_Benefit");
                case ProductItemType.BenefitRule:
                    return ("product_BenefitRule");
                case ProductItemType.Product:
                    return ("product_Product");
                case ProductItemType.ProductRule:
                    return ("product_ProductRule");
                case ProductItemType.BenefitSet:
                    return ("product_BenefitSet");
                case ProductItemType.ProductOption:
                    return ("product_ProductOption");
                case ProductItemType.ProductOptionRule:
                    return ("product_ProductOptionRule");
                case ProductItemType.DiscountType:
                    return ("product_DiscountType");
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }

        // GET: clc/api/Product/AuditLog/{correlationToken}
        [HttpGet("ByToken/{correlationToken}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByToken(string correlationToken)
        {
            var auditResult = await _auditLog.GetAuditLogsByToken(correlationToken);
            return Ok(auditResult);
        }
    }
}