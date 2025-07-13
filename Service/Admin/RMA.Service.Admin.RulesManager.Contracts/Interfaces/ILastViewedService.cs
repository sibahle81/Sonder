using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Contracts.Interfaces
{
    public interface ILastViewedService : IService
    {
        Task<List<Rule>> GetLastViewedRules();
        Task<List<LastViewedItem>> GetLastViewedItemsForUser(string user, string itemType);
    }
}