using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class ValidityCheckSetFacade : RemotingStatelessService, IValidityCheckSetService
    {
        private readonly IRepository<common_ValidityCheckSet> _checksetRepository;
        private readonly IRepository<common_ValidityCheckCategory> _checksetCategoryRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public ValidityCheckSetFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_ValidityCheckSet> checksetRepository,
            IRepository<common_ValidityCheckCategory> checksetCategoryRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _checksetRepository = checksetRepository;
            _checksetCategoryRepository = checksetCategoryRepository;
            _mapper = mapper;
        }

        public async Task<List<ValidityCheckSet>> GetValidityChecks(ValidityCheckTypeEnum checkType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var checks = await _checksetRepository
                    .Where(c => !c.IsDeleted && c.ValidityCheckType == checkType)
                    .ToListAsync();

                return _mapper.Map<List<ValidityCheckSet>>(checks);
            }
        }

        public async Task<List<ValidityCheckCategory>> GetValidityCheckCategories(ValidityCheckTypeEnum checkType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var categories = await _checksetCategoryRepository.Where(c => c.ValidityCheckType == checkType).ToListAsync();
                await _checksetCategoryRepository.LoadAsync(categories, c => c.ValidityCheckSets);
                return _mapper.Map<List<ValidityCheckCategory>>(categories);
            }
        }
    }
}
