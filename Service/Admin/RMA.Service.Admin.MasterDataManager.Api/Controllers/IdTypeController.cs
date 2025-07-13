using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IdTypeController : RmaApiController
    {
        private readonly IIdTypeService _repository;

        public IdTypeController(IIdTypeService repository)
        {
            _repository = repository;
        }

        // GET: mdm/api/IdType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IdTypeEnum>>> Get()
        {
            return Ok(await _repository.GetIdTypes());
        }
    }
}