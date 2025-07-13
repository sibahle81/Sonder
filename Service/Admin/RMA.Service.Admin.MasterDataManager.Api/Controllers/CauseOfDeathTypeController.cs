using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CauseOfDeathTypeController : RmaApiController
    {
        private readonly ICauseOfDeathService _causeOfDeathService;

        public CauseOfDeathTypeController(ICauseOfDeathService causeOfDeathService)
        {
            _causeOfDeathService = causeOfDeathService;
        }

        //GET: mdm/api/CauseOfDeathType/{typeOfDeathId}
        [HttpGet("{typeOfDeathId}")]
        public async Task<ActionResult<IEnumerable<CauseOfDeathType>>> Get(int typeOfDeathId)
        {
            var causesOfDeath = await _causeOfDeathService.GetCauseOfDeathList(typeOfDeathId);
            return Ok(causesOfDeath);
        }
    }
}