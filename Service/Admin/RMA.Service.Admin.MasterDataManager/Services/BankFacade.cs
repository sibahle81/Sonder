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
    public class BankFacade : RemotingStatelessService, IBankService
    {
        private readonly IRepository<common_Bank> _bankRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public BankFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Bank> bankRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _bankRepository = bankRepository;
            _mapper = mapper;
        }

        public async Task<Bank> GetBank(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bankResult = await _bankRepository
                    .ProjectTo<Bank>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(bank => bank.IsActive
                                        && !bank.IsDeleted
                                        && bank.Id == id);

                return bankResult;
            }
        }

        public async Task<List<Bank>> GetBanks()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var banks = await _bankRepository
                    .OrderBy(bank => bank.Name)
                    .Select(bank => new Bank
                    {
                        Id = bank.Id,
                        Name = bank.Name,
                        UniversalBranchCode = bank.UniversalBranchCode,
                        IsForeign = bank.IsForeign
                    }).ToListAsync();

                return banks;
            }
        }
    }
}