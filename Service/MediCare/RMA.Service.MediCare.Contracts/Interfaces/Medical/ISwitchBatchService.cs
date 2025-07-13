using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchBatchService : IService
    {
        Task<int> AddSwitchBatch(SwitchBatch switchBatch);
        Task<List<SwitchBatch>> GetSwitchBatches();
        Task<SwitchBatch> GetSwitchBatch(int switchBatchId);
        Task<SwitchBatch> GetSwitchBatchDetail(string switchBatchNumber, int switchId);
        Task<Switch> GetSwitch(int switchId);
        Task<List<Switch>> GetActiveSwitches();
        Task<SwitchBatchInvoice> GetSwitchBatchInvoice(int switchBatchInvoiceId);
    }
}
