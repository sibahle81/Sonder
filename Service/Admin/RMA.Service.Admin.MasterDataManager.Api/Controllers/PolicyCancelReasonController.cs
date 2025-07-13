using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PolicyCancelReasonController : RmaApiController
    {
        private readonly IPolicyCancelReasonService _policyCancelReasonService;

        public PolicyCancelReasonController(IPolicyCancelReasonService policyCancelReasonService)
        {
            _policyCancelReasonService = policyCancelReasonService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var types = await _policyCancelReasonService.GetPolicyCancelReasons();
            return Ok(types);
        }
    }
}


