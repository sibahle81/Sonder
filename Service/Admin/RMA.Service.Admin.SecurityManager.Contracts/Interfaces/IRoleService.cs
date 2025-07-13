using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IRoleService : IService
    {
        Task<List<Role>> SearchRoles(string query);
        Task<List<Role>> GetRoles();
        Task<List<Role>> GetRolesById(List<int> ids);
        Task<Role> GetRole(int id);
        Task<int> AddRole(Role role);
        Task EditRole(Role role);
        Task<Role> GetRoleByName(string role);
        Task<string> GetRoleName(int id);
        Task<List<Role>> GetRolesByNames(List<string> roleNames);
        Task<List<Role>> GetRolesByPermission(string permissions);
        Task<List<Role>> GetCDABrokerRoles();
    }
}