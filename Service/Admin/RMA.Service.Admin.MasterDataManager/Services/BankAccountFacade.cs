using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class BankAccountFacade : RemotingStatelessService, IBankAccountService
    {
        private readonly IRepository<common_BankAccount> _bankAccountRepository;
        private readonly IRepository<common_BankBranch> _bankBranchRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        public BankAccountFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_BankAccount> bankAccountRepository,
            IRepository<common_BankBranch> bankBranchRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _bankAccountRepository = bankAccountRepository;
            _bankBranchRepository = bankBranchRepository;
        }

        public async Task<BankAccount> GetBankAccount(string departmentName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from account in _bankAccountRepository
                              join branch in _bankBranchRepository
                                  on new { Code = account.Bank.UniversalBranchCode, account.BankId } equals new
                                  { branch.Code, branch.BankId }
                              select new BankAccount
                              {
                                  Id = account.Id,
                                  DepartmentName = account.DepartmentName,
                                  BankName = account.Bank.Name,
                                  BranchName = branch.Name,
                                  BranchCode = branch.Code,
                                  AccountNumber = account.AccountNumber
                              }
                    ).FirstOrDefaultAsync(x => x.DepartmentName == departmentName);
            }
        }
        public async Task<BankAccount> GetBankAccountById(int bankId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from account in _bankAccountRepository
                              join branch in _bankBranchRepository
                                  on new { Code = account.Bank.UniversalBranchCode, account.BankId } equals new
                                  { branch.Code, branch.BankId }
                              select new BankAccount
                              {
                                  Id = account.Id,
                                  DepartmentName = account.DepartmentName,
                                  BankName = account.Bank.Name,
                                  BranchName = branch.Name,
                                  BranchCode = branch.Code,
                                  AccountNumber = account.AccountNumber
                              }
                    ).FirstOrDefaultAsync(x => x.Id == bankId);
            }
        }


        public async Task<List<BankAccount>> GetBankAccounts()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                //TODO BUG Account Table must have foreign key to Branch on Account.branchId = branch.id
                return await (from account in _bankAccountRepository
                              join branch in _bankBranchRepository on account.BranchId equals branch.Id
                              select new BankAccount
                              {
                                  Id = account.Id,
                                  DepartmentName = account.DepartmentName,
                                  BankName = account.Bank.Name,
                                  BranchName = branch.Name,
                                  BranchCode = branch.Code,
                                  AccountNumber = account.AccountNumber,
                                  AccountName = account.AccountName,
                                  ClientType = account.ClientType
                              }).ToListAsync();
            }
        }

        public async Task<BankAccount> GetBankAccountByAccountNumber(int bankAccountId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from account in _bankAccountRepository
                              join branch in _bankBranchRepository
                                  on new { Code = account.Bank.UniversalBranchCode, account.BankId } equals new
                                  { branch.Code, branch.BankId }
                              select new BankAccount
                              {
                                  Id = account.Id,
                                  DepartmentName = account.DepartmentName,
                                  BankName = account.Bank.Name,
                                  BranchName = branch.Name,
                                  BranchCode = branch.Code,
                                  AccountNumber = account.AccountNumber,
                                  TransactionType = account.TransactionType
                              }
                    ).FirstOrDefaultAsync(x => x.Id == bankAccountId);
            }
        }
        public async Task<List<BankAccount>> GetBankAccountsByAccountIds(List<int> bankIdBankAccountIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from account in _bankAccountRepository
                              join branch in _bankBranchRepository
                                  on new { Code = account.Bank.UniversalBranchCode, account.BankId } equals new
                                  { branch.Code, branch.BankId }
                              select new BankAccount
                              {
                                  Id = account.Id,
                                  DepartmentName = account.DepartmentName,
                                  BankName = account.Bank.Name,
                                  BranchName = branch.Name,
                                  BranchCode = branch.Code,
                                  AccountNumber = account.AccountNumber
                              }
                    ).Where(x => bankIdBankAccountIds.Contains(x.Id)).ToListAsync();
            }
        }

        public async Task<BankAccount> GetBankAccountByStringAccountNumber(string accountNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = new BankAccount();
                var accounts = await (from account in _bankAccountRepository
                                      join branch in _bankBranchRepository
                                          on new { Code = account.Bank.UniversalBranchCode, account.BankId } equals new
                                          { branch.Code, branch.BankId }
                                      select new BankAccount
                                      {
                                          Id = account.Id,
                                          DepartmentName = account.DepartmentName,
                                          BankName = account.Bank.Name,
                                          BranchName = branch.Name,
                                          BranchCode = branch.Code,
                                          AccountNumber = account.AccountNumber,
                                          TransactionType = account.TransactionType
                                      }
                    ).ToListAsync();
                if (accounts.Count > 0)
                {
                    if (accounts.FirstOrDefault(x => x.AccountNumber == accountNumber) != null)
                        results = accounts.FirstOrDefault(x => x.AccountNumber == accountNumber);
                }
                return results;
            }
        }
    }
}