using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CoverTypeController : RmaApiController
    {
        private readonly ICoverTypeService _coverTypeRepository;

        public CoverTypeController(ICoverTypeService coverTypeRepository)
        {
            _coverTypeRepository = coverTypeRepository;
        }

        // GET: mdm/api/CoverType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var coverTypes = await _coverTypeRepository.GetCoverTypes();
            return Ok(coverTypes);
        }

        // GET: mdm/api/CoverType/GetBenefitsByBenefitIds
        [HttpGet("GetCoverTypesByIds")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCoverTypesByIds([FromQuery] List<int> id)
        {
            var coverTypes = await _coverTypeRepository.GetCoverTypesByIds(id);
            return Ok(coverTypes);
        }
        [HttpGet("GetCoverTypesByProduct/{product}")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetCoverTypesByIds(string product)
        {
            var coverTypes = await _coverTypeRepository.GetCoverTypesByProduct(product.Decode());
            return Ok(coverTypes);
        }
    }
}