using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces
{
    public interface IWizardConfigurationRouteSettingService : IService
    {
        Task<WizardConfigurationRouteSetting> GetWizardConfigurationRouteSettingByWorkflowType(string workflowType);
        Task<WizardConfigurationRouteSetting> GetWizardConfigurationRouteSettingById(int wizardConfigurationRouteSettingId);
    }
}
