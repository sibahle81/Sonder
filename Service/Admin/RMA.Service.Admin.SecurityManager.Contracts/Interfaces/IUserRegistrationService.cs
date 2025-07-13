using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IUserRegistrationService : IService
    {
        Task<UserDetails> GetUserDetailsByIdNumber(string idNumber);
        Task<bool> RegisterUserDetails(UserDetails userDetails);
        Task<int> SendMemberActivationEmail(UserDetails userDetails);
        Task<UserActivation> CreateMemberActivation(UserDetails userDetails);
        Task RejectOnMemberApproval(UserDetails userDetails, string rejectMessage);
        Task OnVopdFailed(UserDetails userDetails);
        Task OnDocumentUpload(UserDetails userDetails);
        Task ProcessVopdResponse();
        Task<UserDetails> GetMemberDetailsByActivateId(string ActivateId);
        Task<string> CreateNewMember(UserDetails userDetails);
        Task<UserDetails> GetUserDetailsByEmail(string emailAddress);
        Task<bool> ResendUserActivation(string activateId);
        Task<bool> SendMemberPasswordResetLink(string emailAddress);
        Task<int> UpdateMember(UserDetails userDetails);
        Task<int> CheckIfBrokerageExists(string fspNumber);
        Task<string> GetUserDetailsVopdResponse(string idNumber);
        Task<UserActivation> GetUserActivation(string idNumber, string email);
        Task<bool> CheckIfBrokerIsLinkedToMemberPortal(string email);
        Task<bool> DeRegisterUserDetails(UserDetails userDetails);
        Task<bool> CheckIfBrokerHasActivatedLinkCreated(string email);
        Task<string> GetUserActivateId(string email);
        Task<UserBrokerageMap> GetUserBrokerageMap(int userId);
        Task<UserDetails> GetUserByUserDetailId(int userDetailId);
        Task<UserDetails> GetUserActivationUserDetailsByUserActivationId(int userActivationId);
        Task<bool> ResendUserActivationEmail(int userActivationId);
        Task<bool> IsUserPendingRegistration(string userName);
        Task<int> GetPendingUserActivation(string userName);
        Task<int> CreateUser(UserDetails userDetails);
    }
}