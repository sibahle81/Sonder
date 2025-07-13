using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Integrations.Contracts.Entities.Hyphen;

using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Hyphen
{
    public interface IHyphenAccountVerificationService : IService
    {
        Task<RootHyphenVerificationResult> VerifyAccount(string accountNo, BankAccountTypeEnum accountType, string branchCode, string initials, string lastName, string idNumber);
    }
}
