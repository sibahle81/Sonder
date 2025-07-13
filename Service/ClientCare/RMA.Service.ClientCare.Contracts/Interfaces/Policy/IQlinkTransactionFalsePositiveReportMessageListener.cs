using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.Qlink;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IQlinkTransactionFalsePositiveReportMessageListener : IService
    {
        Task ReceiveMessageAsync(QlinkTransactionResponse qlinkTransactionResponseMessage, CancellationToken cancellationToken);
    }
}
