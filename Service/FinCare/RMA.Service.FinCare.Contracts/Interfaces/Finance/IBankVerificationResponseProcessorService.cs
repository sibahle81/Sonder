using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.Integrations.Contracts.Entities.Hyphen;

using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IBankVerificationResponseProcessorService : IService
    {
        Task UpdateBankAccountVerification(RootHyphenVerificationBankResponse message);
        Task<BankAccountVerificationRequest> GetVerifiedBankAccount(string accountNo, BankAccountTypeEnum accountType, string branchCode);
    }
}
