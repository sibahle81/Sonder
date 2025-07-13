using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionGroupController : RmaApiController
    {
        private readonly IPermissionGroupService _permissionGroupService;
        public PermissionGroupController(IPermissionGroupService permissionGroupService)
        {
            _permissionGroupService = permissionGroupService;
        }
        // GET: sec/api/PermissionGroup/id
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<PermissionGroup>>> Get(int id)
        {
            var results = await _permissionGroupService.GetPermissionGroups(id);
            return Ok(results);
        }

        [HttpGet("getByGroupId/{id}")]
        public async Task<ActionResult<PermissionGroup>> getByGroupId(int id)
        {
            var results = await _permissionGroupService.GetPermissionGroupByGroupId(id);
            return Ok(results);
        }

        [HttpGet("getPermissionGroupsOnly")]
        public async Task<ActionResult<IEnumerable<PermissionGroup>>> GetGroupsOnly()
        {
            var results = await _permissionGroupService.GetPermissionGroupsOnly();
            return Ok(results);
        }
    }
}