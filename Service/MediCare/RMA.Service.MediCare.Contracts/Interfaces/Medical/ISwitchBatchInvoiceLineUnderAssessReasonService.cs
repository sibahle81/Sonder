using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchBatchInvoiceLineUnderAssessReasonService : IService
    {
        Task<int> AddSwitchBatchInvoiceLineUnderAssessReason(SwitchBatchInvoiceLineUnderAssessReason switchBatchInvoiceLineUnderAssessReason);
    }
}
