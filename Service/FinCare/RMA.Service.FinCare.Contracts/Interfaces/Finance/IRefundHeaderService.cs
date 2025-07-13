using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IRefundHeaderService : IService
    {
        Task<List<RefundHeader>> GetRefundHeaders();
        Task<RefundHeader> GetRefundHeader(int id);
        Task<int> AddRefundHeader(RefundHeader refundHeader);
        Task EditRefundHeader(RefundHeader refundHeader);
        Task<List<RefundSummary>> GetRefundSummaryGroupedByDate();
        Task<List<RefundSummary>> GetRefundSummaryGroupedByReason();
        Task<List<RefundSummaryDetail>> GetRefundSummaryDetails();
    }
}
