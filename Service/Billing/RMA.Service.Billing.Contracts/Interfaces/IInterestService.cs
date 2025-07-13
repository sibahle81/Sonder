using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IInterestService : IService
    {
        Task<bool> StartInterestCalculation(InterestCalculationRequest interestCalculationRequest);
        Task<bool> ProcessInterestCalculation(InterestCalculationRequest interestCalculationRequest);
        Task<PagedRequestResult<Interest>> GetPagedCalculatedInterest(InterestSearchRequest interestSearchRequest);
        Task<bool> UpdateCalculatedInterest(List<Interest> interests);
    }
}
