using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IRecoveryReceiptService : IService
    {
        Task<RecoveryReceipt> CreateRecoveryReceipt(RecoveryReceipt recoveryReceipt);
        Task<RecoveryReceipt> GetRecoveryReceipt(int recoveryReceiptId);
        Task<RecoveryReceipt> UpdateRecoveryReceipt(RecoveryReceipt recoveryReceipt);
        Task<PagedRequestResult<RecoveryReceipt>> GetPagedRecoveryReceipts(RecoveryReceiptSearchRequest recoveryReceiptSearchRequest);
    }
}