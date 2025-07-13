using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IRefundHeaderDetailService : IService
    {
        Task<List<RefundHeaderDetail>> GetRefundHeaderDetails();
        Task<RefundHeaderDetail> GetRefundHeaderDetail(int id);
        Task<int> AddRefundHeaderDetail(RefundHeaderDetail refundHeaderDetail);
        Task<List<RefundHeaderDetail>> GetRefundHeaderDetailByHeaderId(int id);
        Task EditRefundHeaderEdit(RefundHeaderDetail refundHeaderDetail);
        Task<List<RefundHeaderDetail>> GetRefundHeaderDetailByClientCoverId(int id);
    }
}
