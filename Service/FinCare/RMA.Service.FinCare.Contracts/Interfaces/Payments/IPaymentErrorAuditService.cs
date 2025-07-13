using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentErrorAuditService : IService
    {
        Task<int> CreateErrorAudit(Payment payment, string errorMessage);
    }
}
