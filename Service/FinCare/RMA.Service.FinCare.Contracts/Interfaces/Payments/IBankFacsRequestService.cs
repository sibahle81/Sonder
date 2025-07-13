using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Net.Http;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IBankFacsRequestService : IService
    {
        Task<HttpResponseMessage> SubmitPayment(Payment payment, string transactionType);
    }
}