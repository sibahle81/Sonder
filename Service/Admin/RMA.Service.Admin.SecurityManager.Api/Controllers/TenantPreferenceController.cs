using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class TenantPreferenceController : RmaApiController
    {
        private readonly ITenantPreferenceService _tenantPreferenceService;

        public TenantPreferenceController(ITenantPreferenceService tenantPreferenceService)
        {
            _tenantPreferenceService = tenantPreferenceService;
        }

        // GET sec/api/TenantPreference/{id}
        [HttpGet]
        public async Task<ActionResult<TenantPreference>> Get(int id)
        {
            var tenantPreference = await _tenantPreferenceService.GetTenantPreference(id);
            return Ok(tenantPreference);
        }

        [HttpGet("ByTenantId/{tenantId}")]
        public async Task<ActionResult<TenantPreference>> GetByTenantId(int tenantId)
        {
            var tenantPreference = await _tenantPreferenceService.GetTenantPreferenceByTenantId(tenantId);
            return Ok(tenantPreference);
        }

        // GET sec/api/TenantPreference/Reset/{id}
        [HttpGet("Reset/{id}")]
        public async Task<ActionResult> ResetTenantPreference(int id)
        {
            await _tenantPreferenceService.ResetTenantPreference(id);
            return Ok();
        }

        // POST sec/api/TenantPreference/{TenantPreference}
        [HttpPost]
        public async Task<ActionResult<int>> Post(TenantPreference TenantPreference)
        {
            var id = await _tenantPreferenceService.SaveTenantPreference(TenantPreference);
            return Ok(id);
        }
    }
}