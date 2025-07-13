using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class MedicalEstimatesController : RmaApiController
    {
        private readonly IMedicalEstimatesService _medicalEstimatesService;

        public MedicalEstimatesController(IMedicalEstimatesService medicalEstimatesService)
        {
            _medicalEstimatesService = medicalEstimatesService;
        }

        [HttpPost("GetICD10Estimates")]
        public async Task<ActionResult> GetICD10Estimates([FromBody] ICD10EstimateFilter icd10EstimateFilter)
        {
            var results = await _medicalEstimatesService.GetICD10Estimates(icd10EstimateFilter);
            return Ok(results);
        }
    }
}