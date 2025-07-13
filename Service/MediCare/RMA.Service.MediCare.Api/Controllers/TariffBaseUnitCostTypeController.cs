using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class TariffBaseUnitCostTypeController : RmaApiController
    {
        private readonly ITariffBaseUnitCostTypeService _tariffBaseUnitCostTypeService;

        public TariffBaseUnitCostTypeController(ITariffBaseUnitCostTypeService tariffBaseUnitCostTypeService)
        {
            _tariffBaseUnitCostTypeService = tariffBaseUnitCostTypeService;
        }

        [HttpGet("GetTariffBaseUnitCostTypes")]
        public async Task<ActionResult<IEnumerable<TariffBaseUnitCostType>>> GetTariffBaseUnitCostTypes()
        {
            var tariffBaseUnitCostTypes = await _tariffBaseUnitCostTypeService.GetTariffBaseUnitCostTypes();
            return Ok(tariffBaseUnitCostTypes);
        }
    }
}
