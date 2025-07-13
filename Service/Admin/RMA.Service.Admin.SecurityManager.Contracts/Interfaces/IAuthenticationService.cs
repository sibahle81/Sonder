using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IAuthenticationService : IService
    {
        Task<User> AuthenticateUser(string email, string password, string ipAddress);
        Task<string> GenerateAuthenticationToken();
        Task<bool> ValidateUserToken(string username, string token);
        Task GeneratePasswordResetToken(string userName);
        Task<bool> ForgotPassword(string username);
        Task<bool> ChangeUserPasswordWithToken(string token, string newPassword);
        Task<bool> VerifyUserToken(User user);
    }
}