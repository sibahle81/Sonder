using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces
{
    public interface IWizardConfigurationService : IService
    {
        Task<WizardConfiguration> GetWizardConfigurationByName(string wizardConfigurationName);
        Task<WizardConfiguration> GetWizardConfigurationById(int wizardConfigurationId);
        Task<List<WizardConfiguration>> GetWizardConfigurations();
        Task<List<WizardConfiguration>> GetWizardConfigurationByIds(List<int> ids);
    }
}