using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Contracts.Interfaces
{
    public interface IRuleTypeService : IService
    {
        Task<List<Lookup>> GetRuleTypes();
    }
}