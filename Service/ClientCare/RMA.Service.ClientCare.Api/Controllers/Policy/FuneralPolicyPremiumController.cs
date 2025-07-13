using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class FuneralPolicyPremiumController : RmaApiController
    {
        private readonly IFuneralPolicyPremiumService _funeralPolicyPremiumService;

        public FuneralPolicyPremiumController(IFuneralPolicyPremiumService funeralPolicyPremiumService)
        {
            _funeralPolicyPremiumService = funeralPolicyPremiumService;
        }

        [HttpGet("IndividualPolicyPremium/{baseRate}/{adminPercentage}/{commissionPercentage}/{binderFeePercentage}/{premiumAdjustmentPercentage}")]
        public async Task<ActionResult<FuneralPolicyPremium>> GetIndividualPolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage)
        {
            var premium = await _funeralPolicyPremiumService.GetIndividualPolicyPremium(baseRate, adminPercentage, commissionPercentage, binderFeePercentage, premiumAdjustmentPercentage);
            return Ok(premium);
        }

        [HttpGet("GroupPolicyPremium/{baseRate}/{adminPercentage}/{commissionPercentage}/{binderFeePercentage}/{premiumAdjustmentPercentage}")]
        public async Task<ActionResult<decimal>> GetGroupPolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage)
        {
            var premium = await _funeralPolicyPremiumService.GetGroupPolicyPremium(baseRate, adminPercentage, commissionPercentage, binderFeePercentage, premiumAdjustmentPercentage);
            return Ok(premium);
        }

        [HttpGet("GroupSchemePolicyPremium/{baseRate}/{adminPercentage}/{commissionPercentage}/{binderFeePercentage}/{premiumAdjustmentPercentage}")]
        public async Task<ActionResult<decimal>> GetGroupSchemePolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage)
        {
            var premium = await _funeralPolicyPremiumService.GetGroupSchemePolicyPremium(baseRate, adminPercentage, commissionPercentage, binderFeePercentage, premiumAdjustmentPercentage);
            return Ok(premium);
        }

    }
}
