using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using UserInfo = RMA.Service.Admin.SecurityManager.Contracts.Entities.UserInfo;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface IUserService : IService
    {
        Task<PagedRequestResult<User>> SearchUsers(PagedRequest request, List<string> permissions);
        Task<PagedRequestResult<User>> SearchUsersPermissionPageRequest(PagedRequest request, string permissions);
        Task<List<User>> SearchUsersByPermission(string permission);
        Task<User> SearchUserByEmail(string email);
        Task<AuthenticationTypeEnum> GetAuthenticationType(string email);
        Task<Tenant> GetUserTenant(string email);
        Task<User> GetUserAndUpdateToken(string email);
        Task<bool> ValidateUserToken(string email, Guid token);
        Task<List<User>> GetUsers();
        Task<List<Lookup>> GetTenants();
        Task<List<User>> GetUsersByUserIds(List<int> ids);
        Task<User> GetUserById(int id);
        Task<User> GetUserByEmail(string email);
        Task<User> GetUserByUsername(string username);
        Task<string> GetUserDisplayName(string username);
        Task<Dictionary<string, string>> GetUserDisplayNamesFromEmail(List<string> emails);
        Task<Dictionary<string, string>> GetUserDisplayNames(List<string> usernames);
        Task<User> EditUser(User user);
        Task<int> AddUser(User user);
        Task<int> ChangePassword(string username, string oldPassword, string newPassword);
        Task<User> GetUserByToken(Guid token);
        Task<bool> GetUserIsActive(string email);
        Task<bool> HasPermission(string username, string permissionName);
        Task<bool> HasAnyPermission(string username, List<string> permissionNames);
        Task<Common.Entities.UserInfo> GetUserImpersonationInfo(string username);
        Task ApproveUser(User user);
        Task<User> UpdateLoginFailedAttempts(string email);
        Task<List<User>> GetUsersInRoles(List<int> roleIds);
        Task<List<User>> GetUsersByRoleName(string roleName);
        Task<UserInfo> GetUserInfo();
        Task GeneratePasswordResetToken(string userEmail);
        Task<PagedRequestResult<User>> GetUsersInRolePaged(PagedRequest request);
        Task<UserDetails> GetUserDetailsByIdNumber(string idNumber);
        Task<string> RegisterUserDetails(UserDetails userDetails);
        Task<int> UpdateUserPassword(string username, string newPassword);
        Task<List<UserHealthCareProvider>> GetHealthCareProvidersLinkedToUser(string email);
        Task<bool> SaveUserHealthCareProviders(List<UserHealthCareProvider> userHealthcareProviders, int userId);
        Task<List<UserBrokerageMap>> GetMemberBrokerageList(int memberId);
        Task<User> GetUsersByRoleAndEmail(string roleName, string email);
        Task<List<CompcareUser>> GetCompcareUsersByEmailAddress(string email);
        Task<decimal> GetAmountLimit(int amountLimitTypeId);
        Task<RoleAmountLimit> GetAuthorisationAmountLimit(AmountLimitTypeEnum amountLimitType, RoleEnum role);
        Task<User> GetUserLinkedToHealthCareProviderId(int healthCareProviderId);
        Task<List<UserHealthCareProvider>> GetHealthCareProvidersForInternalUser(string searchString);
        Task<int> AddUserCompanyMap(UserCompanyMap userCompanyMap);
        Task<PagedRequestResult<UserCompanyMap>> GetPagedUserCompanyMap(PagedRequest request);
        Task EditUserCompanyMap(UserCompanyMap userCompanyMap);
        Task<List<UserCompanyMap>> GetUserCompanyMapsByUserActivationId(int userActivationId);
        Task<int> AddUserContact(UserContact userContact);
        Task EditUserContact(UserContact userContact);
        Task<UserContact> GetUserContact(int userId);
        Task<int> GetLinkedMember(int userId);
        Task<List<UserCompanyMap>> GetUserCompanyMaps(int userId);
        Task<List<UserCompanyMap>> GetPendingUserCompanyMaps(int companyId, int userActivationId);
        Task<List<User>> GetUsersByBrokerageId(int brokerId);
        Task<int> GetHealthCareProviderIdLinkedToExternalUser(int userId);
        Task<PagedRequestResult<UserHealthCareProvider>> GetPagedUserHealthCareProviderMap(PagedRequest request);
        Task<List<User>> SearchUsersByPermissions(List<string> permissions);
        Task<PagedRequestResult<Role>> GetPagedRoles(PagedRequest request);
        Task<PagedRequestResult<User>> GetPagedUsers(UserSearchRequest userSearchRequest);
        Task<Role> GetRole(int roleId);
    }
}