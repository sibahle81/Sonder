using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;

using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Api.Controllers
{
    public class WizardConfigurationRouteSettingController : RmaApiController
    {
        private readonly IWizardConfigurationRouteSettingService _wizardConfigurationRouteSettingService;

        public WizardConfigurationRouteSettingController(IWizardConfigurationRouteSettingService wizardConfigurationRouteSettingService)
        {
            _wizardConfigurationRouteSettingService = wizardConfigurationRouteSettingService;
        }

        // GET bpm/api/GetWizardConfigurationRouteSettingByWorkflowType/{workflowType}
        [HttpGet("GetWizardConfigurationRouteSettingByWorkflowType{workflowType}")]
        public async Task<ActionResult<WizardConfigurationRouteSetting>> GetWizardConfigurationRouteSettingByWorkflowType(string workflowType)
        {
            var wizardConfigurationRouteSetting = await _wizardConfigurationRouteSettingService.GetWizardConfigurationRouteSettingByWorkflowType(workflowType);
            return Ok(wizardConfigurationRouteSetting);
        }

        // GET bpm/api/GetWizardConfigurationRouteSettingById/{id}
        [HttpGet("GetWizardConfigurationRouteSettingById/{id}")]
        public async Task<ActionResult<WizardConfigurationRouteSetting>> Get(int wizardConfigurationRouteSettingId)
        {
            var wizardConfigurationRouteSetting = await _wizardConfigurationRouteSettingService.GetWizardConfigurationRouteSettingById(wizardConfigurationRouteSettingId);
            return Ok(wizardConfigurationRouteSetting);
        }
    }
}
