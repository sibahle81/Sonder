using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceUnderAssessReasonService : IService
    {
        Task<int> AddInvoiceUnderAssessReason(InvoiceUnderAssessReason invoiceUnderAssessReason);
        Task<List<InvoiceUnderAssessReason>> GetInvoiceUnderAssessReasonsByInvoiceId(int invoiceId, int tebaInvoiceId);
        Task<int> DeleteInvoiceUnderAssessReason(InvoiceUnderAssessReason invoiceUnderAssessReason);
    }
}
