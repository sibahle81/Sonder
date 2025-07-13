using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class PreAuthClaimController : RmaApiController
    {
        private readonly IPreAuthClaimService _preAuthClaimService;

        public PreAuthClaimController(IPreAuthClaimService preAuthClaimService)
        {
            _preAuthClaimService = preAuthClaimService;
        }

        [HttpGet("GetPreAuthClaimDetail/{claimReferenceNumber}")]
        public async Task<ActionResult<PreAuthClaim>> GetPreAuthClaimDetail(string claimReferenceNumber)
        {
            var preAuthClaim = await _preAuthClaimService.GetPreAuthClaimDetail(claimReferenceNumber);
            return Ok(preAuthClaim);
        }

        [HttpGet("GetPreAuthClaimDetailByPersonEventId/{personEventId}")]
        public async Task<ActionResult<PreAuthClaim>> GetPreAuthClaimDetailByPersonEventId(int personEventId)
        {
            var preAuthClaim = await _preAuthClaimService.GetPreAuthClaimDetailByPersonEventId(personEventId);
            return Ok(preAuthClaim);
        }

        [HttpGet("GetClaimReferenceNumberByPersonEventId/{personEventId}")]
        public async Task<ActionResult<string>> GetClaimReferenceNumberByPersonEventId(int personEventId)
        {
            var claimReferenceNumber = await _preAuthClaimService.GetClaimReferenceNumberByPersonEventId(personEventId);
            return Ok(claimReferenceNumber);
        }

        [HttpGet("GetPersonEventIdByClaimReferenceNumber/{claimReferenceNumber}")]
        public async Task<ActionResult<int>> GetPersonEventIdByClaimReferenceNumber(string claimReferenceNumber)
        {
            var personEventId = await _preAuthClaimService.GetPersonEventIdByClaimReferenceNumber(claimReferenceNumber);
            return Ok(personEventId);
        }

        [HttpGet("CheckIfMedicalBenifitExists/{claimId}")]
        public async Task<ActionResult<bool>> CheckIfMedicalBenifitExists(int claimId)
        {
            var isExist = await _preAuthClaimService.CheckIfMedicalBenifitExists(claimId);
            return Ok(isExist);
        }
    }
}
