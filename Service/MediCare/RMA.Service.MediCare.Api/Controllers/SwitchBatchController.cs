using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class SwitchBatchController : RmaApiController
    {
        private readonly ISwitchBatchService _switchBatchService;

        public SwitchBatchController(ISwitchBatchService switchBatchService)
        {
            _switchBatchService = switchBatchService;
        }

        [HttpPost("AddSwitchBatch")]
        public async Task<ActionResult<int>> AddSwitchBatch([FromBody] SwitchBatch switchBatchModel)
        {
            var id = await _switchBatchService.AddSwitchBatch(switchBatchModel);
            return Ok(id);
        }

        [HttpGet("GetSwitchBatches")]
        public async Task<ActionResult<IEnumerable<SwitchBatch>>> GetSwitchBatches()
        {
            var switchBatchs = await _switchBatchService.GetSwitchBatches();
            return Ok(switchBatchs);
        }

        [HttpGet("GetSwitchBatch/{switchBatchId}")]
        public async Task<ActionResult<SwitchBatch>> GetSwitchBatch(int switchBatchId)
        {
            var switchBatch = await _switchBatchService.GetSwitchBatch(switchBatchId);
            return Ok(switchBatch);
        }

        [HttpGet("GetActiveSwitches")]
        public async Task<ActionResult<IEnumerable<Switch>>> GetActiveSwitches()
        {
            var switchTypes = await _switchBatchService.GetActiveSwitches();
            return Ok(switchTypes);
        }
    }
}