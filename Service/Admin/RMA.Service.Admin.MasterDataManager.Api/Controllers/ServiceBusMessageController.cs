using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ServiceBusMessageController : RmaApiController
    {
        private readonly IServiceBusMessage _serviceBusMessageService;

        public ServiceBusMessageController(IServiceBusMessage serviceBusMessageService)
        {
            _serviceBusMessageService = serviceBusMessageService;
        }

        [HttpGet("GetUnProcessedSTPMessages")]
        public async Task<ActionResult<IEnumerable<MessageType>>> GetUnProcessedSTPMessages()
        {
            return Ok(await _serviceBusMessageService.GetUnProcessedSTPMessages());
        }
    }
}
