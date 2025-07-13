using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ReferralController : RmaApiController
    {
        private readonly IReferralService _referralService;

        public ReferralController(IReferralService referralService)
        {
            _referralService = referralService;
        }

        [HttpPost("CreateReferral")]
        public async Task<ActionResult<Referral>> CreateReferral([FromBody] Referral referral)
        {
            var result = await _referralService.CreateReferral(referral);
            return Ok(result);
        }

        [HttpPost("GetReferral")]
        public async Task<ActionResult<Referral>> GetReferral([FromBody] int referralId)
        {
            var result = await _referralService.GetReferral(referralId);
            return Ok(result);
        }

        [HttpPost("UpdateReferral")]
        public async Task<ActionResult<Referral>> UpdateReferral([FromBody] Referral referral)
        {
            var result = await _referralService.UpdateReferral(referral);
            return Ok(result);
        }

        [HttpPost("UpdateReferralNatureOfQuery")]
        public async Task<ActionResult<ReferralNatureOfQuery>> UpdateReferralNatureOfQuery([FromBody] ReferralNatureOfQuery referralNatureOfQuery)
        {
            var result = await _referralService.UpdateReferralNatureOfQuery(referralNatureOfQuery);
            return Ok(result);
        }

        [HttpPost("GetPagedReferrals")]
        public async Task<ActionResult<PagedRequestResult<Referral>>> GetPagedReferrals([FromBody] ReferralSearchRequest referralSearchRequest)
        {
            var results = await _referralService.GetPagedReferrals(referralSearchRequest);
            return Ok(results);
        }

        [HttpGet("GetReferralNatureOfQuery")]
        public async Task<ActionResult<List<ReferralNatureOfQuery>>> GetReferralNatureOfQuery()
        {
            var results = await _referralService.GetReferralNatureOfQuery();
            return Ok(results);
        }

        [HttpPost("GetPagedReferralNatureOfQuery")]
        public async Task<ActionResult<PagedRequestResult<ReferralNatureOfQuery>>> GetPagedReferralNatureOfQuery([FromBody] ReferralSearchRequest referralSearchRequest)
        {
            var results = await _referralService.GetPagedReferralNatureOfQuery(referralSearchRequest);
            return Ok(results);
        }
    }
}