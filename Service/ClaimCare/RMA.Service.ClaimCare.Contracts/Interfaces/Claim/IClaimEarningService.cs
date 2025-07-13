using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClaimCare.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimEarningService : IService
    {
        Task<Earning> GetEarning(int earningId);
        Task<List<Earning>> GetEarningsByPersonEventId(int personEventId);
        Task<Earning> CreateEarning(Earning earning);
        Task<Earning> UpdateEarning(Earning earning);
        Task<List<EarningType>> GetClaimEarningTypes(bool isVariable);
        Task<List<EarningType>> GetAllEarningTypes();
        Task<bool> NotifyToRecaptureEarnings(int personEventId);
        Task<Earning> GetActualEarningsByPersonEventId(int personEventId);
    }
}
