using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class RolePlayerQueryController : RmaApiController
    {
        private readonly IRolePlayerQueryService _rolePlayerQueryService;

        public RolePlayerQueryController(IRolePlayerQueryService rolePlayerQueryService)
        {
            _rolePlayerQueryService = rolePlayerQueryService;
        }

        [HttpPost("AddRolePlayerItemQuery")]
        public async Task<ActionResult<RolePlayerItemQuery>> AddRolePlayerItemQuery([FromBody] RolePlayerItemQuery rolePlayerItemQuery)
        {
            var result = await _rolePlayerQueryService.AddRolePlayerItemQuery(rolePlayerItemQuery);
            return Ok(result);
        }

        [HttpPut("UpdateRolePlayerItemQuery")]
        public async Task<ActionResult<int>> UpdateRolePlayerItemQuery([FromBody] RolePlayerItemQuery rolePlayerItemQuery)
        {
            var result = await _rolePlayerQueryService.UpdateRolePlayerItemQuery(rolePlayerItemQuery);
            return Ok(result);
        }

        [HttpGet("GetPagedRolePlayerItemQueries/{rolePlayerQueryItemType}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<RolePlayerItemQuery>>> GetPagedRolePlayerItemQueries(RolePlayerQueryItemTypeEnum rolePlayerQueryItemType, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "desc", string query = "")
        {
            var result = await _rolePlayerQueryService.GetPagedRolePlayerItemQueries(rolePlayerQueryItemType, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "desc"));
            return Ok(result);
        }

        [HttpPost("AddRolePlayerItemQueryResponse")]
        public async Task<ActionResult<int>> AddRolePlayerItemQueryResponse([FromBody] RolePlayerItemQueryResponse rolePlayerItemQueryResponse)
        {
            var result = await _rolePlayerQueryService.AddRolePlayerItemQueryResponse(rolePlayerItemQueryResponse);
            return Ok(result);
        }

        [HttpGet("GetPagedRolePlayerItemQueryResponses/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<RolePlayerItemQueryResponse>>> GePagedtRolePlayerItemQueryResponses(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "desc", string query = "")
        {
            var result = await _rolePlayerQueryService.GetPagedRolePlayerItemQueryResponses(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "desc"));
            return Ok(result);
        }
    }
}
