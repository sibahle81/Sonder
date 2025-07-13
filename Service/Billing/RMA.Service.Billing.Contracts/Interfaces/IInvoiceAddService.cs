using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IInvoiceAddService : IService
    {
        Task<int> AddInvoiceItem(Invoice invoice);
    }
}