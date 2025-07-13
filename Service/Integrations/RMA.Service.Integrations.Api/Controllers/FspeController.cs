using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Integrations.Contracts.Entities.Fspe;
using RMA.Service.Integrations.Contracts.Interfaces.Fspe;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Api.Controllers
{
    [Route("api/fspe/[controller]")]
    public class FspeController : RmaApiController
    {
        private readonly IFspeService _fspeService;

        public FspeController(IFspeService fspeService)
        {
            _fspeService = fspeService;
        }

        // GET: int/api/Integrations/Fspe/{fspNumber}
        [HttpGet("{fspNumber}")]
        public async Task<ActionResult<Fsp>> Get(string fspNumber)
        {

            var listFsp = new List<string>() { fspNumber };
            var brokerage = await _fspeService.GetFspDetails(listFsp);
            return Ok(brokerage);
        }
    }
}