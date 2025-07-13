using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IBankBranchService : IService
    {
        Task<List<BankBranch>> GetBranchesByBankId(int bankId);

        Task<List<BankBranch>> GetBranches();

        Task<BankBranch> GetBankBranch(int bankBranchId);
        Task<string> GetBankBranchName(int bankBranchId);
        Task<string> GetBankName(int bankBranchId);
        Task<string> GetUniversalBankBranchCode(string bankName);
    }
}