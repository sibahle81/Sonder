using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IBankAccountVerificationCreatorService : IService
    {
        Task<bool> DoBankAccountVerification(string accountNo, BankAccountTypeEnum accountType, string branchCode, string initials, string lastName, string idNumber, BankAccountVerificationPurposeTypeEnum bankAccountVerificationPurposeType);
    }
}
