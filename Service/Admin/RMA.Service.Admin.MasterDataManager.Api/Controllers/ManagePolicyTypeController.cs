using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ManagePolicyTypeController : RmaApiController
    {
        private readonly IManagePolicyTypeService _managePolicyTypeService;

        public ManagePolicyTypeController(IManagePolicyTypeService managePolicyTypeService)
        {
            _managePolicyTypeService = managePolicyTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var types = await _managePolicyTypeService.GetManagePolicyTypes();
            return Ok(types);
        }
    }
}
