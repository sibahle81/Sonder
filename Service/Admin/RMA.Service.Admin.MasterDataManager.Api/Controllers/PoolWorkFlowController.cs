using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PoolWorkFlowController : RmaApiController
    {
        private readonly IPoolWorkFlowService _poolWorkFlowService;

        public PoolWorkFlowController(IPoolWorkFlowService poolWorkFlowService)
        {
            _poolWorkFlowService = poolWorkFlowService;
        }

        [HttpPost("HandlePoolWorkFlow")]
        public async Task HandlePoolWorkFlow([FromBody] PoolWorkFlow poolWorkFlow)
        {
            await _poolWorkFlowService.HandlePoolWorkFlow(poolWorkFlow);
        }

        [HttpGet("GetPoolWorkFlow/{itemId}/{workPoolId}")]
        public async Task<ActionResult<PoolWorkFlow>> GetPoolWorkFlow(int itemId, WorkPoolEnum workPoolId)
        {
            return await _poolWorkFlowService.GetPoolWorkFlow(itemId, workPoolId);
        }

        [HttpGet("GetPoolWorkFlowClaimsAssignedToUser/{assignedToUserId}")]
        public async Task<ActionResult<List<int>>> GetPoolWorkFlowClaimsAssignedToUser(int assignedToUserId)
        {
            return await _poolWorkFlowService.GetPoolWorkFlowClaimsAssignedToUser(assignedToUserId);
        }

        [HttpPost("GetPoolWorkFlowByTypeAndId")]
        public async Task<ActionResult<PoolWorkFlow>> GetPoolWorkFlowByTypeAndId([FromBody] PoolWorkFlowRequest poolWorkFlowRequest)
        {
            return await _poolWorkFlowService.GetPoolWorkFlowByTypeAndId(poolWorkFlowRequest);
        }
    }
}