using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class WizardConfigurationFacade : RemotingStatelessService, IWizardConfigurationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<bpm_WizardConfiguration> _wizardConfigurationRepository;
        private readonly IMapper _mapper;

        private DateTime _cacheDateTime = DateTime.MinValue;
        private const int CacheDurationMinutes = 60;
        private List<WizardConfiguration> _wizardConfigurationList = new List<WizardConfiguration>();

        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);

        private async Task<List<WizardConfiguration>> GetConfigurationList()
        {
            await _locker.WaitAsync();
            try
            {
                if (_cacheDateTime == DateTime.MinValue || _cacheDateTime.AddMinutes(CacheDurationMinutes) < DateTimeHelper.SaNow || _wizardConfigurationList.Count == 0)
                {
                    await PopulateCache();
                    _cacheDateTime = DateTimeHelper.SaNow;
                }

                return _wizardConfigurationList;
            }
            finally
            {
                _locker.Release();
            }
        }

        public WizardConfigurationFacade(StatelessServiceContext context,
            IRepository<bpm_WizardConfiguration> wizardConfigurationRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IRoleService roleService,
            IMapper mapper)
            : base(context)
        {
            _wizardConfigurationRepository = wizardConfigurationRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<WizardConfiguration> GetWizardConfigurationByName(string wizardConfigurationName)
        {
            var wizardConfiguration = (await GetConfigurationList())
                .Where(c => c.Name == wizardConfigurationName)
                .Single($"Could not find a wizard configuration with the name {wizardConfigurationName}");

            return wizardConfiguration;
        }

        public async Task<WizardConfiguration> GetWizardConfigurationById(int wizardConfigurationId)
        {
            var wizardConfiguration = (await GetConfigurationList())
                .Where(c => c.Id == wizardConfigurationId)
                .Single($"Could not find a wizard configuration with the id {wizardConfigurationId}");

            return wizardConfiguration;
        }

        public async Task<List<WizardConfiguration>> GetWizardConfigurations()
        {
            return await GetConfigurationList();
        }

        private async Task PopulateCache()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _wizardConfigurationRepository
                    .Select(config => new
                    {
                        WizardConfiguration = config,
                        WizardPermissions = config.WizardPermissions
                    }).ToListAsync();

                var wizardConfigurations = data
                    .Select(c => new WizardConfiguration
                    {
                        Id = c.WizardConfiguration.Id,
                        Name = c.WizardConfiguration.Name,
                        DisplayName = c.WizardConfiguration.DisplayName,
                        Description = c.WizardConfiguration.Description,
                        SlaWarning = c.WizardConfiguration.SlaWarning,
                        SlaEscalation = c.WizardConfiguration.SlaEscalation,
                        UserSlaWarning = c.WizardConfiguration.UserSlaWarning,
                        UserSlaEscalation = c.WizardConfiguration.UserSlaEscalation,
                        AllowEditOnApproval = c.WizardConfiguration.AllowEditOnApproval,
                        IsOverridable = c.WizardConfiguration.IsOverridable
                    }).ToList();

                foreach (var wizardConfiguration in wizardConfigurations)
                {
                    var wizardPermissions = data.Single(w => w.WizardConfiguration.Id == wizardConfiguration.Id).WizardPermissions;
                    wizardConfiguration.StartPermissions = wizardPermissions.Where(p => p.WizardPermissionType == WizardPermissionTypeEnum.Start).Select(p => p.PermissionName).ToList();
                    wizardConfiguration.ContinuePermissions = wizardPermissions.Where(p => p.WizardPermissionType == WizardPermissionTypeEnum.Continue).Select(p => p.PermissionName).ToList();
                    wizardConfiguration.ApprovalPermissions = wizardPermissions.Where(p => p.WizardPermissionType == WizardPermissionTypeEnum.Approve).Select(p => p.PermissionName).ToList();
                }

                _wizardConfigurationList = wizardConfigurations;
            }
        }

        public async Task<List<WizardConfiguration>> GetWizardConfigurationByIds(List<int> ids)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizardConfiguration = await _wizardConfigurationRepository
                    .Where(c => ids.Contains(c.Id))
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return _mapper.Map<List<WizardConfiguration>>(wizardConfiguration);
            }
        }
    }
}
