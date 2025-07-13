using RMA.Service.Billing.Contracts.Entities;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IRegenerateInvoiceNonFinancialsBusListener
    {
        Task ReceiveMessageAsync(InvoiceNonFinancialReGenBusMessage message, CancellationToken cancellationToken);
    }
}
