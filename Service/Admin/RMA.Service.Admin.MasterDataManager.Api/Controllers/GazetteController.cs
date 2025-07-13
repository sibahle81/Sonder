using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class GazetteController : RmaApiController
    {
        private readonly IGazetteService _gazetteService;

        public GazetteController(IGazetteService gazetteService)
        {
            _gazetteService = gazetteService;
        }

        [HttpPost("GetPensionGazettesAsOfEffectiveDate")]
        public async Task<ActionResult<List<PensionGazetteResult>>> PostPensionGazettesAsOfEffectiveDate([FromBody] DateTime effectiveFromDate)
        {
            var results = await _gazetteService.GetPensionGazettesAsOfEffectiveDate(effectiveFromDate);
            return Ok(results);
        }
    }
}