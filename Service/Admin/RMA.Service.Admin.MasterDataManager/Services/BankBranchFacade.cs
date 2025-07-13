using AutoMapper;
using AutoMapper.QueryableExtensions;

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
    public class BankBranchFacade : RemotingStatelessService, IBankBranchService
    {
        private readonly IRepository<common_BankBranch> _bankBranchRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public BankBranchFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_BankBranch> bankBranchRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _bankBranchRepository = bankBranchRepository;
            _mapper = mapper;
        }

        public async Task<List<BankBranch>> GetBranches()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var branches = await _bankBranchRepository
                    .ProjectTo<BankBranch>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return branches;
            }
        }

        public async Task<List<BankBranch>> GetBranchesByBankId(int bankId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var branches = await _bankBranchRepository
                    .Where(bank => bank.BankId == bankId)
                    .ProjectTo<BankBranch>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return branches;
            }
        }

        public async Task<BankBranch> GetBankBranch(int bankBranchId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankBranch = await _bankBranchRepository.FindByIdAsync(bankBranchId);
                await _bankBranchRepository.LoadAsync(bankBranch, d => d.Bank);
                return _mapper.Map<BankBranch>(bankBranch);
            }
        }

        public async Task<string> GetBankBranchName(int bankBranchId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankBranch = await _bankBranchRepository.FindByIdAsync(bankBranchId);
                return bankBranch.Name;
            }
        }

        public async Task<string> GetBankName(int bankBranchId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankBranch = await _bankBranchRepository.FindByIdAsync(bankBranchId);
                await _bankBranchRepository.LoadAsync(bankBranch, d => d.Bank);
                return bankBranch.Bank.Name;
            }
        }

        public async Task<string> GetUniversalBankBranchCode(string bankName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankBranch = await _bankBranchRepository.FirstOrDefaultAsync(x => x.Bank.Name == bankName);
                await _bankBranchRepository.LoadAsync(bankBranch, d => d.Bank);
                return bankBranch.Bank.UniversalBranchCode;
            }
        }
    }
}