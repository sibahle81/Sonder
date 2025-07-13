using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class ConfigurationFacade : RemotingStatelessService, IConfigurationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Setting> _settingsRepository;
        private readonly IRepository<common_FeatureFlagSetting> _featureFlagSettingRepository;
        private readonly IMapper _mapper;

        public ConfigurationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_Setting> settingsRepository,
            IRepository<common_FeatureFlagSetting> featureFlagSettingsRepository,
            IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _settingsRepository = settingsRepository;
            _featureFlagSettingRepository = featureFlagSettingsRepository;
            _mapper = mapper;
        }

        public async Task<string> GetModuleSetting(string key)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _settingsRepository
                    .SingleOrDefaultAsync(t => t.Key == key);
                return result?.Value.Trim();
            }
        }

        public async Task SetModuleSetting(ModuleSetting setting)
        {
            Contract.Requires(setting != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _settingsRepository.SingleOrDefaultAsync(t => t.Key == setting.Key);
                entity.Value = setting.Value;
                _settingsRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

            }
        }

        public async Task<List<ModuleSetting>> GetModuleSettingByKeyList(ModuleSetting moduleSetting)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _settingsRepository.Where(t => moduleSetting.Keys.Contains(t.Key)).ToListAsync();

                return _mapper.Map<List<ModuleSetting>>(result);
            }
        }

        public async Task<bool> IsFeatureFlagSettingEnabled(string key)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _featureFlagSettingRepository.Where(t => t.Key == key)
                    .SingleOrDefaultAsync();
                return Convert.ToBoolean(result?.Value.Trim());
            }
        }

        public async Task<List<string>> GetAllActiveEnabledFeatureFlagKeys()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var flags = await _featureFlagSettingRepository
                    .Where(t => t.IsActive
                             && t.Value.Equals("true", StringComparison.OrdinalIgnoreCase))
                    .ToListAsync();
                if (flags?.Count > 0)
                {
                    return flags
                        .Select(_ => _.Key)
                        .ToList();
                }
                return new List<string>();
            }
        }

        public async Task<string> GetModuleAmountToleranceByKey(string key)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _settingsRepository.Where(t => t.Key == key).Select(a => a.Value).SingleOrDefaultAsync();
                return Convert.ToString(result).Trim();
            }
        }
    }
}
