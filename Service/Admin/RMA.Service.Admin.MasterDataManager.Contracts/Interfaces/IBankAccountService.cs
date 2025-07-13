using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IBankAccountService : IService
    {
        Task<List<BankAccount>> GetBankAccounts();
        Task<BankAccount> GetBankAccount(string departmentName);
        Task<BankAccount> GetBankAccountById(int bankId);
        Task<BankAccount> GetBankAccountByAccountNumber(int bankAccountId);
        Task<List<BankAccount>> GetBankAccountsByAccountIds(List<int> bankIdBankAccountIds);
        Task<BankAccount> GetBankAccountByStringAccountNumber(string accountNumber);

    }
}