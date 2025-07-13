using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class EligibilityController : RmaApiController
    {
        private readonly IEligibilityService _eligibilityService;

        public EligibilityController(IEligibilityService eligibilityService)
        {
            _eligibilityService = eligibilityService;
        }

        // GET clc/api/Policy/Eligibility/GetEligiblePolicies
        [HttpPost("GetEligiblePolicies")]
        public async Task<ActionResult<List<Contracts.Entities.Policy.Policy>>> GetEligiblePolicies([FromBody] EligiblePolicy eligible)
        {
            var date = Convert.ToDateTime(eligible?.ClaimDate);
            var cover = await _eligibilityService.GetEligiblePolicies(eligible);
            return Ok(cover);
        }

    }
}