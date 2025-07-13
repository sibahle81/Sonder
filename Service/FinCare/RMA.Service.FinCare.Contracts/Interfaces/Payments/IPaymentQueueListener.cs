using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentQueueListener
    {
        Task ReceiveMessageAsync(PaymentMessage message, CancellationToken cancellationToken);
    }
}
