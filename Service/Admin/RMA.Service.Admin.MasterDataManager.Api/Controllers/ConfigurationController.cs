using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ConfigurationController : RmaApiController
    {
        private readonly IConfigurationService _configurationService;

        public ConfigurationController(IConfigurationService configurationService)
        {
            _configurationService = configurationService;
        }

        // GET: mdm/api/Configuration/GetModuleSetting/{key}
        [HttpGet("GetModuleSetting/{key}")]
        public async Task<ActionResult<string>> GetModuleSetting(string key)
        {
            var setting = await _configurationService.GetModuleSetting(key);
            return Ok(setting);
        }

        // POST: mdm/api/Configuration/SetModuleSetting
        [HttpPost("SetModuleSetting")]
        public async Task<ActionResult<string>> SetModuleSetting([FromBody] ModuleSetting setting)
        {
            await _configurationService.SetModuleSetting(setting);
            return Ok();
        }

        // GET: mdm/api/Configuration/GetModuleSettingByKeyList
        [HttpPost("GetModuleSettingByKeyList")]
        public async Task<ActionResult<List<ModuleSetting>>> GetModuleSettingByKeyList([FromBody] ModuleSetting moduleSetting)
        {
            var setting = await _configurationService.GetModuleSettingByKeyList(moduleSetting);
            return Ok(setting);
        }

        // GET: mdm/api/Configuration/IsFeatureFlagSettingEnabled/{key}
        [AllowAnonymous]
        [HttpGet("IsFeatureFlagSettingEnabled/{key}")]
        public async Task<ActionResult<bool>> IsFeatureFlagSettingEnabled(string key)
        {
            var isFeatureEnabled = await _configurationService.IsFeatureFlagSettingEnabled(key);
            return Ok(isFeatureEnabled);
        }

        // GET: mdm/api/Configuration/GetAllActiveEnabledFeatureFlagKeys
        [AllowAnonymous]
        [HttpGet("GetAllActiveEnabledFeatureFlagKeys")]
        public async Task<List<string>> GetAllActiveEnabledFeatureFlagKeys()
        {
            return await _configurationService.GetAllActiveEnabledFeatureFlagKeys();
        }

        [AllowAnonymous]
        [HttpGet("GetModuleSettingAnon/{key}")]
        public async Task<ActionResult<string>> GetModuleSettingAnon(string key)
        {
            var setting = await _configurationService.GetModuleSetting(key);
            return Ok(setting);
        }
    }
}
