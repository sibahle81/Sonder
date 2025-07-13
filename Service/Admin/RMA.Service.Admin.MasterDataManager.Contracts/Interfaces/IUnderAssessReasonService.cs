using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IUnderAssessReasonService : IService
    {
        Task<List<UnderAssessReason>> GetUnderAssessReasons();
        Task<UnderAssessReason> GetUnderAssessReason(int underAssessReasonId);
        Task<List<UnderAssessReason>> GetLineUnderAssessReasons();
        Task<List<UnderAssessReason>> GetUnderAssessReasonsByInvoiceStatus(InvoiceStatusEnum invoiceStatus);
        Task<int> SetInvoiceUnderAssessReason(UnderAssessReason underAssessReason);
    }
}
