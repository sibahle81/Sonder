using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ClaimCare.Contracts.Entities;
using System.Threading.Tasks;

using static RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionRequest;
using static RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionResponse;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface ISuspiciousTransactionModelService : IService
    {
        Task<RootSuspiciousTransactionResponse> SendSTMRequest(RootSuspiciousTransactionRequest request, PersonEvent personEvent);
    }
}
