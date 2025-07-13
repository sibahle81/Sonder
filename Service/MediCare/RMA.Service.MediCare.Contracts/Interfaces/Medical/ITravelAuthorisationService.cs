using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ITravelAuthorisationService : IService
    {
        Task<int> AddTravelAuthorisation(TravelAuthorisation travelAuthorisation);
        Task EditTravelAuthorisation(TravelAuthorisation travelAuthorisation);
        Task DeleteTravelAuthorisation(int travelAuthId);
        Task AddTravelAuthorisationRejectionComment(int travelAuthId, string comment);
        Task<List<TravelAuthorisation>> GetTravelAuthorisations();
        Task<TravelAuthorisation> GetTravelAuthorisation(int travelAuthorisationId);
        Task<PagedRequestResult<TravelAuthorisation>> GetPagedTravelAuthorisations(int personEventId, PagedRequest request);
        Task<PagedRequestResult<TravelAuthorisation>> GetPagedTravelAuthorisationsByAuthorisedParty(int personEventId, int authorisationPartyId, PagedRequest request);
        Task<List<TravelAuthorisation>> GetTebaInvoiceAuthorisations(DateTime treatmentFromDate, int rolePlayerId, int personEventId);
        Task<List<TravelAuthorisation>> CheckIfTravelPreAuthExists(MedicalPreAuthExistCheckParams travelPreAuthExistCheckParams);
        Task<bool> IsTravelauthInvoiceProcessed(int travelAuthorisationId, int personEventId);
    }
}
