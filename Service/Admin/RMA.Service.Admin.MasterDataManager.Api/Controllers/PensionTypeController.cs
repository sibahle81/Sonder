using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PensionTypeController : RmaApiController
    {
        private readonly IPensionTypeService _pensionTypeService;

        public PensionTypeController(IPensionTypeService pensionTypeService)
        {
            _pensionTypeService = pensionTypeService;
        }

        // GET: mdm/api/PensionType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var pensionTypes = await _pensionTypeService.GetPensionTypes();
            return Ok(pensionTypes);
        }
    }
}