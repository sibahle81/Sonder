using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Api.Controllers
{
    [Route("api/[controller]")]
    public class TravelAuthorisationController: RmaApiController
    {
        private readonly ITravelAuthorisationService _travelAuthorisationService;

        public TravelAuthorisationController(ITravelAuthorisationService travelAuthorisationService)
        {
            _travelAuthorisationService = travelAuthorisationService;
        }

        [HttpPost("AddMediCareTravelAuthorisation")]
        public async Task<ActionResult<int>> AddTravelAuthorisation([FromBody] TravelAuthorisation travelAuthorisation)
        {
            var id = await _travelAuthorisationService.AddTravelAuthorisation(travelAuthorisation);
            return Ok(id);
        }

        [HttpPut("EditMediCareTravelAuthorisation")]
        public async Task<ActionResult<int>> EditTravelAuthorisation([FromBody] TravelAuthorisation travelAuthorisation)
        {
            await _travelAuthorisationService.EditTravelAuthorisation(travelAuthorisation);
            return Ok();
        }

        [HttpDelete("DeleteTravelAuthorisation/{travelAuthId}")]
        public async Task DeleteTravelAuthorisation(int travelAuthId)
        {
            await _travelAuthorisationService.DeleteTravelAuthorisation(travelAuthId);
        }

        [HttpPost("AddTravelAuthorisationRejectionComment/{travelAuthId}/{comment}")]
        public async Task<ActionResult<int>> AddTravelAuthorisationRejectionComment(int travelAuthId, string comment)
        {
            await _travelAuthorisationService.AddTravelAuthorisationRejectionComment(travelAuthId, comment);
            return Ok();
        }

        public async Task<ActionResult<IEnumerable<TravelAuthorisation>>> GetTravelAuthorisations()
        {
            var travelAuthorisations = await _travelAuthorisationService.GetTravelAuthorisations();
            return Ok(travelAuthorisations);
        }

        [HttpGet("GetTravelAuthorisation/{travelAuthorisationId}")]
        public async Task<ActionResult<TravelAuthorisation>> GetTravelAuthorisation(int travelAuthorisationId)
        {
            var travelAuthorisation = await _travelAuthorisationService.GetTravelAuthorisation(travelAuthorisationId);
            return Ok(travelAuthorisation);
        }


        [HttpGet("GetPagedTravelAuthorisations/{personEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<TravelAuthorisation>>> GetPagedTravelAuthorisations(int personEventId, int page = 1, int pageSize = 5, string orderBy = "TravelAuthorisationId", string sortDirection = "asc", string query = "")
        {
            var result = await _travelAuthorisationService.GetPagedTravelAuthorisations(personEventId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }

        [HttpGet("GetPagedTravelAuthorisationsByAuthorisedParty/{personEventId}/{authorisationPartyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<TravelAuthorisation>>> GetPagedTravelAuthorisationsByAuthorisedParty(int personEventId, int authorisationPartyId, int page = 1, int pageSize = 5, string orderBy = "TravelAuthorisationId", string sortDirection = "asc", string query = "")
        {
            var result = await _travelAuthorisationService.GetPagedTravelAuthorisationsByAuthorisedParty(personEventId, authorisationPartyId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }

        [HttpGet("GetTebaInvoiceAuthorisations/{treatmentFromDate}/{rolePlayId}/{personEventId}")]
        public async Task<ActionResult<IEnumerable<TravelAuthorisation>>> GetTebaInvoiceAuthorisations(DateTime treatmentFromDate, int rolePlayId, int personEventId)
        {
            var invoicePreAuthNumbers = await _travelAuthorisationService.GetTebaInvoiceAuthorisations(treatmentFromDate, rolePlayId, personEventId);
            return Ok(invoicePreAuthNumbers);
        }

        [HttpGet("IsTravelauthInvoiceProcessed/{travelAuthorisationId}/{personEventId}")]
        public async Task<ActionResult<bool>> IsTravelAuthInvoiceProcessed(int travelAuthorisationId, int personEventId)
        {
            var invoiceStatus = await _travelAuthorisationService.IsTravelauthInvoiceProcessed(travelAuthorisationId, personEventId);
            return Ok(invoiceStatus);
        }
    }
}
