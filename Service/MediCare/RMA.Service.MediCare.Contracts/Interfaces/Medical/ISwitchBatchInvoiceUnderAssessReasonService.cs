using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchBatchInvoiceUnderAssessReasonService : IService
    {
        Task<int> AddSwitchBatchInvoiceUnderAssessReason(SwitchBatchInvoiceUnderAssessReason switchBatchInvoiceUnderAssessReason);
        Task<List<SwitchBatchInvoiceUnderAssessReason>> GetSwitchBatchInvoiceUnderAssessReasonsBySwitchBatchInvoiceId(int switchBatchInvoiceId);
        Task<int> AddSwitchBatchInvoiceLineUnderAssessReason(SwitchBatchInvoiceLineUnderAssessReason switchBatchInvoiceLineUnderAssessReason);
        Task<int> DeleteSwitchBatchInvoiceUnderAssessReason(SwitchBatchInvoiceUnderAssessReason invoiceUnderAssessReason);
        Task<int> EnableSwitchBatchInvoiceUnderAssessReason(SwitchBatchInvoiceUnderAssessReason invoiceUnderAssessReason);
    }
}
