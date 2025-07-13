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
    public class CommutationScheduleController : RmaApiController
    {
        private readonly ICommutationScheduleService _repository;

        public CommutationScheduleController(ICommutationScheduleService repository)
        {
            _repository = repository;
        }

        // GET: mdm/api/CommutationSchedule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommutationScheduleEnum>>> Get()
        {
            return Ok(await _repository.GetCommutationSchedules());
        }
    }
}
