using AutoMapper;

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
    public class ModuleFacade : RemotingStatelessService, IModuleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Module> _moduleRepository;
        private readonly IMapper _mapper;

        public ModuleFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Module> moduleRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _moduleRepository = moduleRepository;
            _mapper = mapper;
        }

        public async Task<List<Module>> GetModules()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var modules = await _moduleRepository
                    .Where(module => module.IsActive && !module.IsDeleted)
                    .OrderBy(module => module.OderIndex)
                    .ToListAsync();
                //.ProjectTo<Module>()
                return _mapper.Map<List<Module>>(modules);
            }
        }
    }
}