using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class InterestController : RmaApiController
    {
        private readonly IInterestService _interestService;

        public InterestController(IInterestService interestService)
        {
            _interestService = interestService;
        }

        [HttpPost("StartInterestCalculation")]
        public async Task<ActionResult<bool>> StartInterestCalculation([FromBody] InterestCalculationRequest interestCalculationRequest)
        {
            var result = await _interestService.StartInterestCalculation(interestCalculationRequest);
            return Ok(result);
        }

        [HttpPost("ProcessInterestCalculation")]
        public async Task<ActionResult<bool>> ProcessInterestCalculation([FromBody] InterestCalculationRequest interestCalculationRequest)
        {
            var result = await _interestService.ProcessInterestCalculation(interestCalculationRequest);
            return Ok(result);
        }

        [HttpPost("GetPagedCalculatedInterest")]
        public async Task<ActionResult<PagedRequestResult<Interest>>> GetPagedCalculatedInterest([FromBody] InterestSearchRequest interestSearchRequest)
        {
            var results = await _interestService.GetPagedCalculatedInterest(interestSearchRequest);
            return Ok(results);
        }

        [HttpPut("UpdateCalculatedInterest")]
        public async Task<ActionResult<PagedRequestResult<Interest>>> UpdateCalculatedInterest([FromBody] List<Interest> interests)
        {
            var results = await _interestService.UpdateCalculatedInterest(interests);
            return Ok(results);
        }
    }
}