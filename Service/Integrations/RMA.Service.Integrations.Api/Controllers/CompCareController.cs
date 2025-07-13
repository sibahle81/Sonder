using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Integrations.Contracts.Entities.CompCare;
using RMA.Service.Integrations.Contracts.Interfaces.CompCare;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Api.Controllers
{
    [Route("api/compcare/[controller]")]
    public class CCClaimsController : RmaApiController
    {
        private readonly ICCClaimService _ccclaimService;
        private readonly IMedicalReportService _medicalReportService;

        public CCClaimsController(ICCClaimService ccclaimService, IMedicalReportService fmrService)
        {
            _ccclaimService = ccclaimService;
            _medicalReportService = fmrService;
        }

        [HttpPost("CCClaimPost")]
        public async Task<ActionResult<RootCCClaimResponse>> Post([FromBody] RootCCClaimRequest request)
        {
            var response = await _ccclaimService.SendClaimRequest(request);
            return Ok(response);
        }

        [HttpGet("GetMedicalReportCategories")]
        public async Task<ActionResult<List<RootMedicalReportCategory>>> GetMedicalReportCategories()
        {
            var result = await _ccclaimService.GetMedicalReportCategories();
            return Ok(result);
        }

        [HttpGet("GetMedicalReportTypes")]
        public async Task<ActionResult<List<RootMedicalReportType>>> GetMedicalReportTypes()
        {
            var result = await _ccclaimService.GetMedicalReportTypes();
            return Ok(result);
        }

        [HttpPost("AddCompCareMedicalReport")]
        public async Task<ActionResult<RootMedicalReportSubmissionResponse>> AddCompCareMedicalReport([FromBody] RootMedicalReportSubmissionRequest request)
        {
            var response = await _medicalReportService.SubmitCompCareMedicalReport(request);
            return Ok(response);
        }
    }
}
