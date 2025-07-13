using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class ClaimRequirementController : RmaApiController
    {
        private readonly IClaimRequirementService _claimRequirementService;

        public ClaimRequirementController(IClaimRequirementService claimRequirementService)
        {
            _claimRequirementService = claimRequirementService;
        }

        [HttpGet("GetPersonEventRequirements/{personEventId}")]
        public async Task<ActionResult> GetAccidentClaim(int personEventId)
        {
            var claim = await _claimRequirementService.GetPersonEventRequirements(personEventId);
            return Ok(claim);
        }

        [HttpGet("GetClaimRequirementCategory")]
        public async Task<ActionResult> GetClaimRequirementCategory()
        {
            var claimsDocuments = await _claimRequirementService.GetClaimRequirementCategory();
            return Ok(claimsDocuments);
        }

        [HttpPost("AddClaimRequirement")]
        public async Task<ActionResult<int>> AddClaimRequirement([FromBody] PersonEventClaimRequirement requirement)
        {
            var result = await _claimRequirementService.AddClaimRequirement(requirement);
            return Ok(result);
        }

        [HttpPost("AddPersonEventClaimRequirements")]
        public async Task<ActionResult<int>> AddPersonEventClaimRequirements([FromBody] List<PersonEventClaimRequirement> personEventClaimRequirements)
        {
            var result = await _claimRequirementService.AddPersonEventClaimRequirements(personEventClaimRequirements);
            return Ok(result);
        }


        [HttpPost("UpdatePersonEventClaimRequirement")]
        public async Task<ActionResult<int>> UpdatePersonEventClaimRequirement([FromBody] PersonEventClaimRequirement requirement)
        {
            var result = await _claimRequirementService.UpdatePersonEventClaimRequirement(requirement);
            return Ok(result);
        }

        [HttpPost("UpdatePersonEventClaimRequirements")]
        public async Task<ActionResult<int>> UpdatePersonEventClaimRequirements([FromBody] List<PersonEventClaimRequirement> requirements)
        {
            var result = await _claimRequirementService.UpdatePersonEventClaimRequirements(requirements);
            return Ok(result);
        }

        [HttpGet("GetRequirementCategoryPersonEvent/{personEventId}")]
        public async Task<ActionResult> GetClaimRequirementCategoryLinkedToPersonEvent(int personEventId)
        {
            var claim = await _claimRequirementService.GetClaimRequirementCategoryLinkedToPersonEvent(personEventId);
            return Ok(claim);
        }

        [HttpGet("GetPersonEventRequirementByCategoryId/{personEventId}/{categoryId}")]
        public async Task<ActionResult<PersonEventClaimRequirement>> GetPersonEventRequirementByCategoryId(int personEventId, int categoryId)
        {
            var claim = await _claimRequirementService.GetPersonEventRequirementByCategoryId(personEventId, categoryId);
            return Ok(claim);
        }

        [HttpGet("GetRequirementByDocumentTypeId/{personEventId}/{documentTypeId}")]
        public async Task<ActionResult<PersonEventClaimRequirement>> GetRequirementByDocumentTypeId(int personEventId, DocumentTypeEnum documentTypeId)
        {
            var claim = await _claimRequirementService.GetRequirementByDocumentTypeId(personEventId, documentTypeId);
            return Ok(claim);
        }

        [HttpPost("GetConfiguredRequirements")]
        public async Task<ActionResult<List<PersonEventClaimRequirement>>> GetConfiguredRequirements([FromBody] PersonEvent personEvent)
        {
            var results = await _claimRequirementService.GetConfiguredRequirements(personEvent);
            return Ok(results);
        }

        [HttpPost("GetPagedClaimRequirementCategory")]
        public async Task<ActionResult<PagedRequestResult<ClaimRequirementCategory>>> GetPagedClaimRequirementCategory([FromBody] ClaimRequirementCategorySearchRequest claimRequirementCategorySearchRequest)
        {
            var results = await _claimRequirementService.GetPagedClaimRequirementCategory(claimRequirementCategorySearchRequest);
            return Ok(results);
        }

        [HttpPost("SendAdhocClaimRequirementCommunication")]
        public async Task<ActionResult<bool>> SendAdhocClaimRequirementCommunication([FromBody] AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest)
        {
            var result = await _claimRequirementService.SendAdhocClaimRequirementCommunication(adhocClaimRequirementCommunicationRequest);
            return Ok(result);
        }

        [HttpPost("SendAdhocClaimRequirementCommunicationSms")]
        public async Task<ActionResult<bool>> SendAdhocClaimRequirementCommunicationSms([FromBody] AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest)
        {
            var result = await _claimRequirementService.SendAdhocClaimRequirementCommunicationSms(adhocClaimRequirementCommunicationRequest);
            return Ok(result);
        }
    }
}