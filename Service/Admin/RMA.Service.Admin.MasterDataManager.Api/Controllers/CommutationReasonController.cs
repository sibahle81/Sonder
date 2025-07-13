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
    public class CommutationReasonController : RmaApiController
    {
        private readonly ICommutationReasonService _repository;

        public CommutationReasonController(ICommutationReasonService repository)
        {
            _repository = repository;
        }

        // GET: mdm/api/CommutationReason
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommutationReasonEnum>>> Get()
        {
            return Ok(await _repository.GetCommutationReasons());
        }
    }
}
