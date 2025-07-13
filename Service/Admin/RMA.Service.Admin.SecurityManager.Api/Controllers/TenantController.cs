using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class TenantController : RmaApiController
    {
        private readonly IUserService _userService;

        public TenantController(IUserService userService)
        {
            _userService = userService;
        }

        // GET sec/api/Tenant/{email}
        [HttpGet("{email}")]
        public async Task<ActionResult<Tenant>> Get(string email)
        {
            var tenant = await _userService.GetUserTenant(email);
            return Ok(tenant);
        }

        // GET sec/api/Tenant
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tenant>>> Get()
        {
            var users = await _userService.GetTenants();

            return Ok(users);
        }
    }
}