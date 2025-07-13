using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AdditionalTaxTypeController : RmaApiController
    {
        private readonly IAdditionalTaxTypeService _additionalTaxTypeService;

        public AdditionalTaxTypeController(IAdditionalTaxTypeService additionalTaxTypeService)
        {
            _additionalTaxTypeService = additionalTaxTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var additionalTaxTypes = await _additionalTaxTypeService.GetAdditionalTaxTypes();
            return Ok(additionalTaxTypes);
        }

    }
}
