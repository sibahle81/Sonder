using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class TenantFacade : RemotingStatelessService, ITenantService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_Tenant> _tenantRepository;
        private readonly IMapper _mapper;

        public TenantFacade(
            IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_Tenant> tenantRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }

        public async Task<Tenant> GetTenant(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _tenantRepository
                    .SingleOrDefaultAsync(t => t.Id == id);
                return _mapper.Map<Tenant>(entity);
            }
        }
    }
}
