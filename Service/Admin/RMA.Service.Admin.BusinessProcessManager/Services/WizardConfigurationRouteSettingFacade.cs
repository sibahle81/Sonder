using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;

using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class WizardConfigurationRouteSettingFacade : RemotingStatelessService, IWizardConfigurationRouteSettingService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<bpm_WizardConfigurationRouteSetting> _wizardConfigurationRouteSettingRepository;
        private readonly IMapper _mapper;

        public WizardConfigurationRouteSettingFacade(StatelessServiceContext context,
            IRepository<bpm_WizardConfigurationRouteSetting> wizardConfigurationRouteSettingRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IMapper mapper)
            : base(context)
        {
            _wizardConfigurationRouteSettingRepository = wizardConfigurationRouteSettingRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<WizardConfigurationRouteSetting> GetWizardConfigurationRouteSettingByWorkflowType(string workflowType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizardConfigurationRouteSetting = await _wizardConfigurationRouteSettingRepository
                    .Where(c => c.WorkflowType == workflowType)
                    .OrderBy(c => c.Name)
                    .FirstOrDefaultAsync();

                return _mapper.Map<WizardConfigurationRouteSetting>(wizardConfigurationRouteSetting);
            }
        }

        public async Task<WizardConfigurationRouteSetting> GetWizardConfigurationRouteSettingById(int wizardConfigurationRouteSettingId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizardConfiguration = await _wizardConfigurationRouteSettingRepository
                    .Where(c => c.Id == wizardConfigurationRouteSettingId)
                    .OrderBy(c => c.Name)
                    .FirstOrDefaultAsync();

                return _mapper.Map<WizardConfigurationRouteSetting>(wizardConfiguration);
            }
        }
    }
}
