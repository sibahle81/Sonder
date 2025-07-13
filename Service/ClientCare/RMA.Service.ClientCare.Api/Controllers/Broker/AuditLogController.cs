using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Broker
{
    [Route("api/Broker/[controller]")]

    [ApiController]
    public class AuditLogController : RmaApiController
    {
        private readonly IAuditLogService _auditLog;

        public AuditLogController(IAuditLogService auditLogRepository)
        {
            _auditLog = auditLogRepository;
        }

        // GET: clc/api/Broker/AuditLog/{id}
        [HttpGet("ById/{id}")]
        public async Task<ActionResult<AuditResult>> Get(int id)
        {
            var auditLog = await _auditLog.GetAuditLog(id);
            return Ok(auditLog);
        }

        // GET: clc/api/Broker/{itemType}/{itemId}
        [HttpGet("ByType/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<AuditResult>>> ByType(ClientItemTypeEnum itemType, int itemId)
        {
            var auditLogs = await _auditLog.GetAuditLogs(GetItemTypeName(itemType), itemId);
            var orderedAuditList = auditLogs.OrderByDescending(auditItem => auditItem.Date).ToList();
            return Ok(orderedAuditList);
        }

        [HttpGet("ByTypePaged/{itemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<AuditResult>>> ByTypePaged(BrokerItemTypeEnum itemType, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
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
                    return "client_RolePlayerBankAccount";
                case ClientItemTypeEnum.Client:
                    return "client_RolePlayer";
                case ClientItemTypeEnum.Brokerage:
                    return "broker_Brokerage";
                case ClientItemTypeEnum.Representative:
                    return "broker_Representative";
                case ClientItemTypeEnum.Beneficiary:
                    return "client_RolePlayer";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }

        private string GetItemTypeName(BrokerItemTypeEnum itemType)
        {
            switch (itemType)
            {
                case BrokerItemTypeEnum.Brokerage:
                    return "broker_Brokerage";
                case BrokerItemTypeEnum.BrokerageAddress:
                    return "broker_BrokerageAddress";
                case BrokerItemTypeEnum.BrokerageBankAccount:
                    return "broker_BrokerageBankAccount";
                case BrokerItemTypeEnum.BrokerageBranch:
                    return "broker_BrokerageBranch";
                case BrokerItemTypeEnum.BrokerageBrokerConsultant:
                    return "broker_BrokerageBrokerConsultant";
                case BrokerItemTypeEnum.BrokerageCheck:
                    return "broker_BrokerageCheck";
                case BrokerItemTypeEnum.BrokerageContact:
                    return "broker_BrokerageContact";
                case BrokerItemTypeEnum.BrokerageFscaLicenseCategory:
                    return "broker_BrokerageFscaLicenseCategory";
                case BrokerItemTypeEnum.BrokerageNote:
                    return "broker_BrokerageNote";
                case BrokerItemTypeEnum.BrokerageProductOption:
                    return "broker_BrokerageProductOption";
                case BrokerItemTypeEnum.BrokerageRepresentative:
                    return "broker_BrokerageRepresentative";
                case BrokerItemTypeEnum.BrokerPartnership:
                    return "broker_BrokerPartnership";
                case BrokerItemTypeEnum.OrganisationOptionItemValue:
                    return "client_OrganisationOptionItemValue";
                default:
                    throw new ArgumentOutOfRangeException(nameof(itemType), itemType, null);
            }
        }
    }
}