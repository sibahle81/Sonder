using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IWorkPoolService : IService
    {
        Task<List<WorkPool>> Get();
        Task<List<User>> GetUsers();
        Task<List<WorkPoolsModel>> GetWorkPoolsForUser(int userId);
        Task<List<WorkPoolsModel>> GetUsersForWorkPool(WorkPoolEnum workPoolEnum, string roleName, int userId);
        Task<bool> IsUserInWorkPool(int? userId, WorkPoolEnum workPoolEnum);
        Task<List<WorkPoolsModel>> GetAllWorkPoolUsersByIds(List<int> userIds);
        Task<bool> RoleHasPermission(int roleId, List<string> permissions);
    }
}