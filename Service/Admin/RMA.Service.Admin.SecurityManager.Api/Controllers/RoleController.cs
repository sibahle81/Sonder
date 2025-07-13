using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class RoleController : RmaApiController
    {
        private readonly ILastViewedService _lastViewedService;
        private readonly IPermissionService _permissionService;
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService, ILastViewedService lastViewedService,
            IPermissionService permissionService)
        {
            _roleService = roleService;
            _lastViewedService = lastViewedService;
            _permissionService = permissionService;
        }

        // GET sec/api/Role/GetRolePermissions/{id}
        [HttpGet("GetRolePermissions/{id}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetRolePermissions(int id)
        {
            var permissions = await _permissionService.GetRolePermissions(id);
            return Ok(permissions);
        }

        // GET sec/api/Role/Search/{query}
        [HttpGet("Search/{query}")]
        public async Task<ActionResult<IEnumerable<Role>>> SearchRoles(string query)
        {
            var roles = await _roleService.SearchRoles(query);
            return Ok(roles);
        }

        // GET sec/api/Role/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Role>>> LastViewed()
        {
            var roles = await _lastViewedService.GetLastViewedRoles();
            return Ok(roles);
        }

        // GET sec/api/Role/ByIds/{ids}
        [HttpGet("ByIds/{ids}")]
        public async Task<ActionResult<IEnumerable<Role>>> GetClients(string ids)
        {
            var roleIds = ids?.Split(',').Select(int.Parse).ToList();
            var roles = await _roleService.GetRolesById(roleIds);
            return Ok(roles);
        }

        // GET: sec/api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> Get()
        {
            var roles = await _roleService.GetRoles();
            return Ok(roles);
        }

        // GET: sec/api/Role/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> Get(int id)
        {
            var role = await _roleService.GetRole(id);
            return Ok(role);
        }

        //POST: sec/api/Role/{role}
        [HttpPost]
        public async Task<ActionResult<int>> Post(Role role)
        {
            var id = await _roleService.AddRole(role);
            return Ok(id);
        }

        //PUT: sec/api/Role/{role}
        [HttpPut]
        public async Task<ActionResult<bool>> Put(Role role)
        {
            await _roleService.EditRole(role);
            return Ok(true);
        }

        // GET sec/api/Role/GetCDABrokerRoles/
        [HttpGet("GetCDABrokerRoles/")]
        public async Task<ActionResult<IEnumerable<Role>>> GetCDABrokerRoles()
        {
            var roles = await _roleService.GetCDABrokerRoles();
            return Ok(roles);
        }

        [HttpGet("GetRolesByPermission/{permissionName}")]
        public async Task<ActionResult<List<Role>>> GetRolesByPermission(string permissionName)
        {
            var roles = await _roleService.GetRolesByPermission(permissionName);
            return Ok(roles);
        }
    }
}