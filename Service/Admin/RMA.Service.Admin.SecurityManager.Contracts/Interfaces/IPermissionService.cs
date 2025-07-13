using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IPermissionService : IService
    {
        Task<List<Permission>> GetUserPermissions(string userToken, int userId, bool isActiveOnly);
        Task<List<Permission>> GetRolePermissions(int roleId);
        Task<List<Permission>> GetPermissions();
        Task<Permission> GetPermissionByName(string name);
        Task<List<UserPermission>> GetUserPermissionsOverride(string userToken, int userId, bool includeSoftDeletedRecords);
        Task UpdateUserPermissionsOverride(int userId, List<UserPermission> userPermissionOverrides);
    }
}