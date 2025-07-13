using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Api.Controllers
{
    public class WizardConfigurationController : RmaApiController
    {
        private readonly IWizardConfigurationService _wizardConfigurationService;

        public WizardConfigurationController(IWizardConfigurationService wizardConfigurationService)
        {
            _wizardConfigurationService = wizardConfigurationService;
        }

        // GET bpm/api/WizardConfiguration/{type}
        [HttpGet("{type}")]
        public async Task<ActionResult<WizardConfiguration>> Get(string type)
        {
            var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationByName(type);
            return Ok(wizardConfiguration);
        }

        // GET bpm/api/WizardConfiguration/{id}
        [HttpGet("GetConfiguration/{id}")]
        public async Task<ActionResult<WizardConfiguration>> Get(int id)
        {
            var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationById(id);
            return Ok(wizardConfiguration);
        }

        // GET bpm/api/GetWizardConfigurationByIds/{wizardConfigIds}
        [HttpGet("GetWizardConfigurationByIds/{wizardConfigIds}")]
        public async Task<ActionResult<IEnumerable<WizardConfiguration>>> GetWizardConfigurationByIds(string wizardConfigIds)
        {
            var ids = wizardConfigIds?.Split(',').Select(int.Parse).ToList();
            var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationByIds(ids);
            return Ok(wizardConfiguration);
        }
    }
}