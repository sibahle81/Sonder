using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class PermissionController : RmaApiController
    {
        private readonly IPermissionService _permissionService;

        public PermissionController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        // GET sec/api/Permission
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permission>>> Get()
        {
            var permissions = await _permissionService.GetPermissions();
            return Ok(permissions);
        }

        // GET sec/api/Permission/{token}
        [HttpGet("{token}")]
        public async Task<ActionResult<IEnumerable<Permission>>> Get(string token)
        {
            var permissions = await _permissionService.GetUserPermissions(token, 0, true);
            return Ok(permissions);
        }
    }
}