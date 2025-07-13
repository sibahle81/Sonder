using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IUserPreferenceService : IService
    {
        Task<UserPreference> GetUserPreference(int id);
        Task<UserPreference> GetUserPreferenceForUser(int userId);
        Task ResetUserPreference(int id);
        Task<int> SaveUserPreference(UserPreference userPreference);
    }
}