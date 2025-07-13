using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class SendSmsController : RmaApiController
    {
        private readonly ISendSmsService _smsService;

        public SendSmsController(ISendSmsService smsService)
        {
            _smsService = smsService;
        }

        [HttpPost("Send")]
        public async Task<ActionResult<int>> Post([FromBody] SendSmsRequest sendRequest)
        {
            if (sendRequest == null) return BadRequest();

            if (sendRequest.Department == 0)
            {
                sendRequest.Department = RMADepartmentEnum.Unspecified;
            }
            var code = await _smsService.SendSmsMessage(sendRequest);
            return Ok(code);
        }

        [HttpPost("Send/Template")]
        public async Task<ActionResult<int>> Post([FromBody] TemplateSmsRequest sendRequest)
        {
            if (sendRequest == null) return BadRequest();

            if (sendRequest.Department == 0)
            {
                sendRequest.Department = RMADepartmentEnum.Unspecified;
            }
            var code = await _smsService.SendTemplateSms(sendRequest);
            return Ok(code);
        }

        //GET: cmp/api/SendSms/GetSmsAudit/{itemType}/{itemId}
        [HttpGet("GetSmsAudit/{itemType}/{itemId}/{pageNumber}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<IEnumerable<SmsAudit>>> GetSmsAudit(string itemType, int itemId, int pageNumber, int pageSize, string orderBy = "createdDate", string sortDirection = "desc")
        {
            var query = itemId + "," + itemType;
            var notifications = await _smsService.GetSmsAudit(new PagedRequest(query, pageNumber, pageSize, orderBy, sortDirection == "asc"));
            return Ok(notifications);
        }

        [HttpPost("AddSmsStatusAuditDetail")]
        public async Task<ActionResult<int>> AddSmsStatusAuditDetail([FromBody] SmsAuditDetail smsAuditDetail)
        {
            var result = await _smsService.AddSmsStatusAuditDetail(smsAuditDetail);
            return Ok(result);
        }
    }
}