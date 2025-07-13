using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyScheduleMessageListener
    {
        Task ReceiveMessageAsync(PolicyScheduleMessage message, CancellationToken cancellationToken);
    }
}
