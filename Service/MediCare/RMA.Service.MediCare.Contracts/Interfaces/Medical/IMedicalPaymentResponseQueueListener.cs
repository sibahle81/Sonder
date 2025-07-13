using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IMedicalPaymentResponseQueueListener
    {
        Task ReceiveMessageAsync(PaymentResponseModel paymentResponseModel, CancellationToken cancellationToken);
    }
}
