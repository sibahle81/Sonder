using RMA.Service.ClientCare.Contracts.Entities.Lead;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Client
{
    public interface ILeadUploadServiceBusListener
    {
        Task ReceiveMessageAsync(LeadUploadServiceBusMessage message, CancellationToken cancellationToken);
    }
}