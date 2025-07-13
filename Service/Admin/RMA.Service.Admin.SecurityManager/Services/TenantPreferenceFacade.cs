using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class TenantPreferenceFacade : RemotingStatelessService, ITenantPreferenceService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_TenantPreference> _tenantPreferenceRepository;
        private readonly IMapper _mapper;

        public TenantPreferenceFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_TenantPreference> preferenceRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _tenantPreferenceRepository = preferenceRepository;
            _mapper = mapper;
        }

        public async Task<TenantPreference> GetTenantPreference(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _tenantPreferenceRepository
                    .ProjectTo<TenantPreference>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id, $"The tenant preference with id {id} could not be found");
            }
        }

        public async Task<TenantPreference> GetTenantPreferenceByTenantId(int tenantId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tenantPreference = await _tenantPreferenceRepository
                    .ProjectTo<TenantPreference>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync(s => s.TenantId == tenantId && s.IsActive);
                if (tenantPreference == null)
                {
                    tenantPreference = new TenantPreference
                    {
                        Id = 0,
                        TenantId = tenantId,
                        Preferences = "{}"
                    };
                }
                return tenantPreference;
            }
        }

        public async Task ResetTenantPreference(int id)
        {
            RmaIdentity.DemandPermission(Permissions.SaveTenantPreference);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var tenantPreference = await _tenantPreferenceRepository
                    .ProjectTo<TenantPreference>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id, $"The tenant preference with id {id} could not be found");

                tenantPreference.Preferences = "{}";

                var entity = _mapper.Map<security_TenantPreference>(tenantPreference);
                _tenantPreferenceRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> SaveTenantPreference(TenantPreference tenantPreference)
        {
            Contract.Requires(tenantPreference != null);
            RmaIdentity.DemandPermission(Permissions.SaveTenantPreference);

            using (var scope = _dbContextScopeFactory.Create())
            {
                int id = 0;
                var preference = await _tenantPreferenceRepository
                    .SingleOrDefaultAsync(s => s.TenantId == tenantPreference.TenantId);

                if (preference == null)
                {
                    var entity = _mapper.Map<security_TenantPreference>(tenantPreference);
                    entity.IsActive = true;
                    entity.IsDeleted = false;
                    _tenantPreferenceRepository.Create(entity);
                    id = entity.Id;
                }
                else
                {
                    preference.IsActive = true;
                    preference.IsDeleted = false;
                    preference.Preferences = tenantPreference.Preferences;
                    id = preference.Id;
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return id;
            }
        }
    }
}