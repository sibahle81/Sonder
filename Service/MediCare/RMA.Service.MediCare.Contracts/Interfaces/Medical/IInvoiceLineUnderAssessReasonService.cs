using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceLineUnderAssessReasonService : IService
    {
        Task<int> AddInvoiceLineUnderAssessReason(InvoiceLineUnderAssessReason invoiceLineUnderAssessReason);
        Task<List<InvoiceLineUnderAssessReason>> GetInvoiceLineUnderAssessReasonsByInvoiceLineId(int invoiceLineId, int tebaInvoiceLineId);
        Task<int> DeleteInvoiceLineUnderAssessReason(InvoiceLineUnderAssessReason invoiceLineUnderAssessReason);
    }
}
