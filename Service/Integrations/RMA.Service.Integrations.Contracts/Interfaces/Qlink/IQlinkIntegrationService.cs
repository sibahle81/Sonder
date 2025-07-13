using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.Qlink;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Qlink
{
    public interface IQlinkIntegrationService : IService
    {
        Task<List<QlinkTransactionModel>> SubmitQlinkTransactionRequestAsync(List<QlinkTransactionRequest> qlinkTransactionRequests);
    }
}
