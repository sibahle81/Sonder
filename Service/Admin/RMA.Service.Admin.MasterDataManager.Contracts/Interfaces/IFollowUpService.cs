using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IFollowUpService : IService
    {
        Task<List<FollowUp>> GetFollowUps();
        Task<List<FollowUp>> GetActiveFollowUps(string username);
        Task<FollowUp> GetFollowUp(int id);
        Task<int> AddFollowUp(FollowUp followUp, string username);
        Task UpdateFollowUp(FollowUp followUp, string username);
        Task RemoveFollowUp(int id, string username);
    }
}