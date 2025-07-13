using Microsoft.ServiceFabric.Services.Remoting;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IBrokerPaymentScheduleService : IService
    {
        Task<bool> SubmitBrokerPaymentSchedule();
    }
}
