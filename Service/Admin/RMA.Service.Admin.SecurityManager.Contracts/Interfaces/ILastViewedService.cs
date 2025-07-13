using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface ILastViewedService : IService
    {
        Task<List<User>> GetLastViewedUsers();
        Task<List<Role>> GetLastViewedRoles();
    }
}