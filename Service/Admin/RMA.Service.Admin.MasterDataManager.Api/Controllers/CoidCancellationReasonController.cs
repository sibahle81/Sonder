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
    public class CoidCancellationReasonController : RmaApiController
    {
        private readonly ICoidCancellationReasonService _cancellationReasonRepository;

        public CoidCancellationReasonController(ICoidCancellationReasonService cancellationReasonRepository)

        {
            _cancellationReasonRepository = cancellationReasonRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var cancellationReasons = await _cancellationReasonRepository.GetCoidCancellationReasons();
            return Ok(cancellationReasons);
        }
    }

}
