using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ModuleController : RmaApiController
    {
        private readonly IModuleService _moduleRepository;

        public ModuleController(IModuleService moduleRepository)
        {
            _moduleRepository = moduleRepository;
        }

        // GET: mdm/api/Module
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Module>>> Get()
        {
            var modules = await _moduleRepository.GetModules();
            return Ok(modules);
        }
    }
}