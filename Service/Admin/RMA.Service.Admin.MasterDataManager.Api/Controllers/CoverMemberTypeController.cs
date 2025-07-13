using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CoverMemberTypeController : RmaApiController
    {
        private readonly ICoverMemberTypeService _coverMemberTypeRepository;

        public CoverMemberTypeController(ICoverMemberTypeService coverMemberTypeRepository)
        {
            _coverMemberTypeRepository = coverMemberTypeRepository;
        }

        // GET: mdm/api/CoverMemberType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var coverMemberTypes = await _coverMemberTypeRepository.GetCoverMemberTypes();
            return Ok(coverMemberTypes);
        }
    }
}