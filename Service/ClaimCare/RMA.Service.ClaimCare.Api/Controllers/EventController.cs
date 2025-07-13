using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class EventController : RmaApiController
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Event eventEntity)
        {
            var eventId = await _eventService.AddEventDetails(eventEntity).ConfigureAwait(false);
            return Ok(eventId);
        }

        [HttpGet("AddMember/{parentRolePlayerId}/{relation}")]
        public async Task<ActionResult<int>> AddInsuredLifeDetail([FromBody] RolePlayer rolePlayer, int parentRolePlayerId, int relation)
        {
            return await _eventService.AddInsuredLifeDetail(rolePlayer, parentRolePlayerId, relation);
        }

        [HttpGet("GetEvent/{eventId}")]
        public async Task<Event> GetEvent(int eventId)
        {
            var result = await _eventService.GetEvent(eventId);
            return result;
        }

        [HttpGet("GetPersonEventDeathDetail/{id}")]
        public async Task<PersonEventDeathDetail> GetPersonEventDeathDetail(int id)
        {
            var result = await _eventService.GetPersonEventDeathDetailByPersonEventId(id);
            return result;
        }

        [HttpGet("GetPersonEvent/{personEventId}")]
        public async Task<PersonEvent> GetPersonEvent(int personEventId)
        {
            var result = await _eventService.GetPersonEvent(personEventId);
            return result;
        }

        [HttpGet("GetPersonEventByPolicyId/{personEventId}/{policyId}")]
        public async Task<PersonEvent> GetPersonEventByPolicyId(int personEventId, int policyId)
        {
            var result = await _eventService.GetPersonEventByPolicyId(personEventId, policyId);
            return result;

        }

        [HttpPut("UpdateEventWizard")]
        public async Task<ActionResult> UpdateEventWizard([FromBody] Event eventEntity)
        {
            await _eventService.UpdateEvent(eventEntity);
            return Ok();
        }

        [HttpGet("GetPersonEventByInsuredLifeId/{Id}")]
        public async Task<ActionResult<PersonEvent>> GetPersonEventByInsuredLifeId(int insuredLifeIdId)
        {
            var result = await _eventService.GetPersonEventByInsuredLifeId(insuredLifeIdId);
            return Ok(result);
        }

        [HttpGet("GetPersonEventsByEventId/{Id}")]
        public async Task<ActionResult<List<PersonEvent>>> GetPersonEventsByEventId(int eventId)
        {
            await Task.Delay(1);
            return new List<PersonEvent> { new PersonEvent { EventId = eventId } };
        }

        [HttpGet("SearchPolicies/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<List<SearchResult>>> SearchPolicies(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _eventService.SearchPoliciesWithoutClaim(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpGet("SearchInsuredLives/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerSearchResult>>> SearchInsuredLives(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _eventService.SearchInsuredLives(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpGet("SearchClaimantInsuredLives/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerSearchResult>>> SearchClaimantInsuredLives(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _eventService.SearchClaimantInsuredLives(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpGet("SearchEvents/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Event>>> SearchEvents(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var events = await _eventService.SearchEvents(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(events);
        }

        [HttpGet("GetEventList/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<List<Event>>> GetEventList(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var events = await _eventService.GetEventList(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(events);
        }

        [HttpGet("GetDuplicatePersonEventCheckByInsuredLifeId/{Id}")]
        public async Task<ActionResult<PersonEvent>> GetDuplicatePersonEventCheckByInsuredLifeId(int id)
        {
            var result = await _eventService.GetDuplicatePersonEventCheckByInsuredLifeId(id);
            return Ok(result);
        }

        [HttpGet("GetDuplicateEventsCheck")]
        public async Task<ActionResult<Event>> GetDuplicateEventsCheck([FromBody]Event eventBE)
        {
            var result = await _eventService.GetDuplicateEventsCheck(eventBE);
            return Ok(result);
        }

        [HttpGet("StillBornCheck/{claimantId}")]
        public async Task<ActionResult<PersonEvent>> StillBornCheck(int claimantId)
        {
            var result = await _eventService.StillBornCheck(claimantId);
            return Ok(result);
        }

        [HttpGet("GeneratePersonEventUniqueReferenceNumber")]
        public async Task<ActionResult> GeneratePersonEventUniqueReferenceNumber()
        {
            var result = await _eventService.GeneratePersonEventUniqueReferenceNumber();
            return Ok(result);
        }

        [HttpPost("StillBornDuplicateCheck")]
        public async Task<ActionResult<int>> StillBornDuplicateCheck([FromBody] Person person)
        {
            var rolePlayer = await _eventService.StillBornDuplicateCheck(person);
            return Ok(rolePlayer);
        }

        [HttpPost("GetCoidPersonEvents")]
        public async Task<ActionResult<PagedRequestResult<PersonEventSearch>>> GetCoidPersonEvents([FromBody] PersonEventSearchParams filter)
        {
            var personEvents = await _eventService.GetCoidPersonEvents(filter);
            return Ok(personEvents);
        }

        [HttpPost("GetExitReasonPersonEvents")]
        public async Task<ActionResult<PagedRequestResult<PersonEventSearch>>> GetExitReasonPersonEvents([FromBody] ExitReasonSearchParams filter)
        {
            var personEvents = await _eventService.GetExitReasonPersonEvents(filter);
            return Ok(personEvents);
        }

        [HttpGet("GeneratePersonEventReferenceNumber")]
        public async Task<ActionResult> GeneratePersonEventReferenceNumber()
        {
            var result = await _eventService.GeneratePersonEventReferenceNumber();
            return Ok(result);
        }

        [HttpPost("SendDocumentRejectionEmail")]
        public async Task<int> SendDocumentRejectionEmail([FromBody] RejectDocument rejectDocument)
        {
            return await _eventService.SendDocumentRejectionEmail(rejectDocument);
        }

        [HttpGet("CheckIsPersonEvent/{personEventId}")]
        public async Task<bool> CheckIsPersonEvent(int personEventId)
        {
            var isPersonEvent = await _eventService.CheckIsPersonEvent(personEventId);
            return isPersonEvent;
        }
        
        [HttpGet("GetPersonEventDetails/{personEventId}")]
        public async Task<ActionResult> GetPersonEventDetails(int personEventId)
        {
            var result = await _eventService.GetPersonEventDetails(personEventId);
            return Ok(result);
        }

        [HttpGet("GetEventDetails/{eventId}")]
        public async Task<ActionResult> GetEventDetails(int eventId)
        {
            var result = await _eventService.GetEventDetails(eventId);
            return Ok(result);
        }

        [HttpGet("GetNonStpCoidPersonEvents/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<CadPool>>> GetNonStpCoidPersonEvents(int page = 1, int pageSize = 5, string orderBy = "PersonEventNumber", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetNonStpCoidPersonEvents(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(personEvents);
        }

        [HttpPut("UpdatePersonEventDetails")]
        public async Task<ActionResult> UpdatePersonEventDetails([FromBody] PersonEvent personEvent)
        {
            await _eventService.UpdatePersonEventDetails(personEvent);
            return Ok();
        }

        [HttpPost("EventSearch")]
        public async Task<ActionResult<PagedRequestResult<EventSearch>>> EventSearch(EventSearchParams filter)
        {
            var personEvents = await _eventService.EventSearch(filter);
            return Ok(personEvents);
        }

        [HttpPost("GetVopdOverview")]
        public async Task<ActionResult<VopdDash>> GetVopdOverview([FromBody] VopdOverview vopdFilter)
        {
            var personEvents = await _eventService.GetVopdOverview(vopdFilter);
            return Ok(personEvents);
        }

        [HttpPost("GetStmOverview")]
        public async Task<ActionResult<StmDash>> GetStmOverview([FromBody] StmDashboardFields stmFilter)
        {
            var personEvents = await _eventService.GetStmOverview(stmFilter);
            return Ok(personEvents);
        }

        [HttpPost("GetStpOverview")]
        public async Task<ActionResult<StmDash>> GetStpOverview([FromBody] ExitReasonDashboardFields stpFilter)
        {
            var personEvents = await _eventService.GetExitReasonClaimOverview(stpFilter);
            return Ok(personEvents);
        }

        [HttpGet("GetCmcPoolData/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<CadPool>>> GetCmcPoolData(int page = 1, int pageSize = 5, string orderBy = "PersonEventNumber", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetCmcPoolData(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(personEvents);
        }

        [HttpGet("GetInvestigationPoolData/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<CadPool>>> GetInvestigationPoolData(int page = 1, int pageSize = 5, string orderBy = "PersonEventNumber", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetInvestigationPoolData(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(personEvents);
        }

        [HttpGet("GetAssesorPoolData/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<CadPool>>> GetAssesorPoolData(int page = 1, int pageSize = 5, string orderBy = "PersonEventNumber", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetAssesorPoolData(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(personEvents);
        }

        [HttpGet("GetExitReasonsByEventNumber/{personEventId}")]
        public async Task<ActionResult<List<PersonEventExitReason>>> GetExitReasonsByEventNumber(int personEventId)
        {
            var personEventExitReasons = await _eventService.GetExitReasonsByEventNumber(personEventId);
            return Ok(personEventExitReasons);
        }

        [HttpGet("GetPagedPersonEvents/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PersonEvent>>> GetPagedPersonEvents(int page = 1, int pageSize = 5, string orderBy = "eventId", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetPagedPersonEvents(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(personEvents);
        }

        [HttpGet("GetPersonEventInjuryDetails/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> GetPersonEventInjuryDetails(int personEventId)
        {
            var personEvent = await _eventService.GetPersonEventInjuryDetails(personEventId);
            return Ok(personEvent);
        }

        [HttpGet("GetPhysicalDamage/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> GetPhysicalDamage(int personEventId)
        {
            var personEvent = await _eventService.GetPhysicalDamage(personEventId);
            return Ok(personEvent);
        }

        [HttpGet("GetPersonEventAddress/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> GetPersonEventAddress(int personEventId)
        {
            var personEvent = await _eventService.GetPersonEventAddress(personEventId);
            return Ok(personEvent);
        }

        [HttpGet("GetPersonEventEarningsDetails/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> GetPersonEventEarningsDetails(int personEventId)
        {
            var personEvent = await _eventService.GetPersonEventEarningsDetails(personEventId);
            return Ok(personEvent);
        }

        [HttpGet("GetPagedPersonEventsByPersonEventId/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PersonEvent>>> GetPagedPersonEventsByPersonEventId(int page = 1, int pageSize = 5, string orderBy = "eventId", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetPagedPersonEventsByPersonEventId(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(personEvents);
        }

        [HttpPut("UpdatePersonEvent")]
        public async Task<ActionResult> UpdatePersonEvent([FromBody] PersonEvent personEvent)
        {
            await _eventService.UpdatePersonEvent(personEvent);
            return Ok(true);
        }

        [HttpGet("GetClaimWorkPool/{assignedToUserId}/{userLoggedIn}/{isUserBox}/{workPoolId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimPool>>> GetClaimWorkPool(string assignedToUserId, int userLoggedIn, bool isUserBox, int workPoolId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetClaimWorkPool(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), assignedToUserId, userLoggedIn, workPoolId, isUserBox);
            return Ok(personEvents);
        }

        [HttpGet("GetPagedClaimInvoices/{PersonEventId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimInvoicePayment>>> GetPagedClaimInvoices(int personEventId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var personEvents = await _eventService.GetPagedClaimInvoices(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), personEventId);
            return Ok(personEvents);
        }

        [HttpGet("GetPagedMemberInsuredLives/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerSearchResult>>> GetPagedMemberInsuredLives(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _eventService.GetPagedMemberInsuredLives(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }
    }
}