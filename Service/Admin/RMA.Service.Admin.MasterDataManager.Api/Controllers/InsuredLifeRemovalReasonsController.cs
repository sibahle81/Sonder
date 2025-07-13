using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class InsuredLifeRemovalReasonController : RmaApiController
    {
        private readonly IInsuredLifeRemovalReasonService _insuredLifeRemovalReasonService;

        public InsuredLifeRemovalReasonController(IInsuredLifeRemovalReasonService insuredLifeRemovalReasonService)
        {
            _insuredLifeRemovalReasonService = insuredLifeRemovalReasonService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var types = await _insuredLifeRemovalReasonService.GetInsuredLifeRemovalReasons();
            return Ok(types);
        }

    }
}
