using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceCompCareMapService : IService
    {
        Task<InvoiceCompCareMap> GetInvoiceCompCareMapByInvoiceId(int invoiceId);
        Task<InvoiceCompCareMap> GetInvoiceCompCareMapByCompCareInvoiceId(int invoiceId);
        Task<int> AddInvoiceCompCareMap(InvoiceCompCareMap invoiceCompCareMap);
    }
}
