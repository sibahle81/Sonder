using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class PensionMedicalPlanController : RmaApiController
    {
        private readonly IPensionMedicalPlanService _pmpRegionTransferService;
        private const string DefaultSortOrder = "desc";
        private const string AscendingOrder = "asc";

        public PensionMedicalPlanController(IPensionMedicalPlanService pmpRegionTransferService)
        {
            _pmpRegionTransferService = pmpRegionTransferService;
        }

        [HttpGet("GetPmpRegionTransfer/{pmpRegionTransferId}")]
        public async Task<ActionResult<PmpRegionTransfer>> GetPmpRegionTransfer(int pmpRegionTransferId)
        {
            var pmpRegionTransfer = await _pmpRegionTransferService.GetPmpRegionTransfer(pmpRegionTransferId);

            return Ok(pmpRegionTransfer);
        }

        [HttpGet("GetPmpRegionTransferByClaimId/{claimId}")]
        public async Task<ActionResult<List<PmpRegionTransfer>>> GetPmpRegionTransferByClaimId(int claimId)
        {
            var result = await _pmpRegionTransferService.GetPmpRegionTransferByClaimId(claimId);
            return Ok(result);
        }

        [HttpPost("CreatePmpRegionTransfer")]
        public async Task<ActionResult<int>> CreatePmpRegionTransfer([FromBody] PmpRegionTransfer pmpRegionTransfer)
        {
            var result = await _pmpRegionTransferService.CreatePmpRegionTransfer(pmpRegionTransfer);

            return Ok(result);
        }

        [HttpGet("GetPensionerInterviewFormDetailById/{pensionerInterviewFormId}")]
        public async Task<ActionResult<PensionerInterviewForm>> GetPensionerInterviewFormDetailById(int pensionerInterviewFormId)
        {
            var pmpRegionTransfer = await _pmpRegionTransferService.GetPensionerInterviewFormDetailById(pensionerInterviewFormId);

            return Ok(pmpRegionTransfer);
        }

        [HttpGet("GetPensionerInterviewFormByPensionerId/{pensionerId}")]
        public async Task<ActionResult<List<PensionerInterviewForm>>> GetPensionerInterviewFormByPensionerId(int pensionerId)
        {
            var result = await _pmpRegionTransferService.GetPensionerInterviewFormByPensionerId(pensionerId);
            return Ok(result);
        }

        [HttpPost("CreatePensionerInterviewFormDetail")]
        public async Task<ActionResult<int>> CreatePensionerInterviewFormDetail([FromBody] PensionerInterviewForm pensionerInterviewForm)
        {
            var result = await _pmpRegionTransferService.CreatePensionerInterviewFormDetail(pensionerInterviewForm);

            return Ok(result);
        }

        [HttpPut("UpdatePmpRegionTransfer")]
        public async Task<ActionResult<int>> UpdatePmpRegionTransfer([FromBody] PmpRegionTransfer pmpRegionTransfer)
        {
            var result = await _pmpRegionTransferService.UpdatePmpRegionTransfer(pmpRegionTransfer);
            return Ok(result);
        }

        [HttpPut("UpdatePensionerInterviewForm")]
        public async Task<ActionResult<int>> UpdatePensionerInterviewForm([FromBody] PensionerInterviewForm pensionerInterviewForm)
        {
            var result = await _pmpRegionTransferService.UpdatePensionerInterviewForm(pensionerInterviewForm);
            return Ok(result);
        }



    }
}
