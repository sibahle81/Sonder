using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    [Route("api/[controller]")]
    public class CancellationReasonController : RmaApiController
    {
        private readonly ICancellationReasonService _cancellationReasonRepository;

        public CancellationReasonController(ICancellationReasonService cancellationReasonRepository)

        {
            _cancellationReasonRepository = cancellationReasonRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var cancellationReasons = await _cancellationReasonRepository.GetCancellationReasons();
            return Ok(cancellationReasons);
        }
    }

}
