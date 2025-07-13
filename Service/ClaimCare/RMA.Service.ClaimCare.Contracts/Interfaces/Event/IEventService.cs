using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Event
{
    public interface IEventService : IService
    {
        Task<int> AddEvent(Entities.Event eventEntity);
        Task<int> AddPersonEvent(Entities.PersonEvent personEvent);
        Task<int> AddPersonEventDeathDetail(Entities.PersonEventDeathDetail personEventDeathDetail);
        Task<int> AddPersonEventAccidentDetail(Entities.PersonEventAccidentDetail personEventAccidentDetail);
        Task<int> AddPersonEventDiseaseDetail(Entities.PersonEventDiseaseDetail personEventDiseaseDetail);
        Task UpdateEvent(Entities.Event eventEntity);
        Task<Entities.Event> GetEvent(int id);
        Task<Entities.PersonEvent> GetPersonEventByInsuredLifeId(int insuredLifeId);
        Task<Entities.PersonEvent> GetPersonEvent(int personEventId);
        Task<Entities.PersonEvent> GetPersonEventByPolicyId(int personEventId, int policyId);
        Task<string> GenerateEventUniqueReferenceNumber();
        Task<string> GeneratePersonEventUniqueReferenceNumber();
        Task<int> AddEventAndPersonEventDetails(Contracts.Entities.Event eventEntity, List<PersonEvent> personEvents);
        Task<List<SearchResult>> SearchPoliciesWithoutClaim(PagedRequest request, bool showActive);
        Task<PagedRequestResult<Entities.Event>> SearchEvents(PagedRequest request);
        Task<List<Contracts.Entities.Event>> GetEventList(PagedRequest request);
        Task<PersonEventDeathDetail> GetPersonEventDeathDetail(int id);
        Task<PersonEventDeathDetail> GetPersonEventDeathDetailByPersonEventId(int id);
        Task<PagedRequestResult<RolePlayerSearchResult>> SearchInsuredLives(PagedRequest request, bool showActive);
        Task<int> AddEventDetails(Contracts.Entities.Event eventEntity);
        Task<string> SendEmailCommunication(Contracts.Entities.Event eventEntity);
        Task UpdatePersonEventDeathDetail(PersonEventDeathDetail personEventDeathDetail);
        Task<int> AddInsuredLifeDetail(RolePlayer rolePlayer, int parentRolePlayerId, int relation);
        Task UpdatePersonEventDetails(PersonEvent personEvent);
        Task<int> SubmitRolePlayerForApproval(string reference, string stepData);
        Task<PagedRequestResult<RolePlayerSearchResult>> SearchClaimantInsuredLives(PagedRequest request, bool showActive);
        Task<PersonEvent> GetDuplicatePersonEventCheckByInsuredLifeId(int insuredLifeId);
        Task<List<Entities.Event>> GetDuplicateEventsCheck(Entities.Event eventBE);
        Task<bool> StillBornCheck(int claimantId);
        Task<int> StillBornDuplicateCheck(Person person);
        Task<List<PersonEvent>> GetAllPersonEvents();
        Task<List<PersonEvent>> GetPersonEventsByInsuredLife(int insuredLifeId);
        Task<PersonEvent> GetPersonEventByInsuredLife(int insuredLifeId);
        Task<DeathTypeEnum> GetPersonEventDeathType(int personEventId);
        Task<PagedRequestResult<PersonEventSearch>> GetCoidPersonEvents(PersonEventSearchParams request);
        Task<string> GeneratePersonEventReferenceNumber();
        Task<int> SendDocumentRejectionEmail(RejectDocument rejectDocument);
        Task<bool> CheckIsPersonEvent(int personEventId);
        Task<Contracts.Entities.Event> GetPersonEventDetails(int personEventId);
        Task<Person> GetPersonDetailsByPersonEventId(int personEventId);
        Task<Contracts.Entities.Event> GetEventDetails(int eventId);
        Task<int> CreateEventDetails(Contracts.Entities.Event eventEntity);
        Task<PagedRequestResult<CadPool>> GetNonStpCoidPersonEvents(PagedRequest request);
        Task<List<PersonEvent>> GetPersonEventsForFollowUps();
        Task<List<PersonEvent>> GetCompCarePersonEventsForFollowUps();
        Task<PagedRequestResult<EventSearch>> EventSearch(EventSearchParams request);
        Task<int> CreatePersonEventDetails(PersonEvent eventEntity);
        Task<VopdDash> GetVopdOverview(VopdOverview filter);
        Task<StmDash> GetStmOverview(StmDashboardFields filter);
        Task<List<PersonEvent>> GetPersonEventsByPersonEventReferenceNumber(string personEventReferenceNumber);
        Task<List<Entities.Event>> GetEventByEventReferenceNumber(string eventReferenceNumber);
        Task<StpDash> GetExitReasonClaimOverview(ExitReasonDashboardFields filter);
        Task<PagedRequestResult<PersonEventSearch>> GetExitReasonPersonEvents(ExitReasonSearchParams request);
        Task<bool> CheckIfPersonEventAlreadyExists(int compCarePersonEventId, int employeeId, int companyId);
        Task<PagedRequestResult<CadPool>> GetCmcPoolData(PagedRequest request);
        Task<PagedRequestResult<CadPool>> GetInvestigationPoolData(PagedRequest request);
        Task<PagedRequestResult<CadPool>> GetAssesorPoolData(PagedRequest request);
        Task<List<PersonEventExitReason>> GetExitReasonsByEventNumber(int personEventId);
        Task<PagedRequestResult<PersonEvent>> GetPagedPersonEvents(PagedRequest request);
        Task<PersonEvent> GetPersonEventInjuryDetails(int personEventId);
        Task<PhysicalDamage> GetPhysicalDamage(int personEventId);
        Task<List<RolePlayerAddress>> GetPersonEventAddress(int personEventId);
        Task<Entities.Event> GetPersonEventEarningsDetails(int personEventId);
        Task<PagedRequestResult<PersonEvent>> GetPagedPersonEventsByPersonEventId(PagedRequest request);
        Task<Entities.Event> GetEventDetailsForReceiptLetters(int eventId);
        Task UpdatePersonEvent(PersonEvent personEvent);
        Task<PagedRequestResult<ClaimPool>> GetClaimWorkPool(PagedRequest request, string assignedToUserId, int userLoggedIn, int workPoolId, bool isUserBox);
        Task<PagedRequestResult<ClaimInvoicePayment>> GetPagedClaimInvoices(PagedRequest request, int personEventId);
        Task<PagedRequestResult<RolePlayerSearchResult>> GetPagedMemberInsuredLives(PagedRequest request, bool showActive);
        Task<PersonEvent> GetPersonEventByClaimant(int claimantId);
        Task SendFollowUpsForInternalNotifications();
        Task<PersonEvent> GetPersonEventWithNoReferenceData(int personEventId);
        Task<bool> CreateDisabiltyToFatalDeathCaptured(PersonEvent personEvent);
    }
}