using RMA.Service.Billing.Contracts.Entities;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IQLinkMonthlyPremiumQueueListener
    {
        Task ReceiveMessageAsync(QLinkMonthlyPremiumReferenceMessage message, CancellationToken cancellationToken);
    }
}
