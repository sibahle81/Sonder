using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IPermissionGroupService : IService
    {
        Task<PermissionGroup> GetPermissionGroupByGroupId(int groupId);
        Task<List<PermissionGroup>> GetPermissionGroups(int userId);
        Task<List<PermissionGroup>> GetPermissionGroupsOnly();
    }
}
