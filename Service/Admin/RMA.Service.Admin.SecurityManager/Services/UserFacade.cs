using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;
using RMA.Service.Admin.SecurityManager.Encryption;
using RMA.Service.Admin.SecurityManager.Validator;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using QueryableExtensions = System.Data.Entity.QueryableExtensions;
using UserInfo = RMA.Service.Admin.SecurityManager.Contracts.Entities.UserInfo;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class UserFacade : RemotingStatelessService, IUserService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_Tenant> _tenantRepository;
        private readonly IRepository<security_UserDetail> _userDetailsRepository;
        private readonly IRepository<security_User> _userRepository;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_Permission> _permissionRepository;
        private readonly IRepository<security_UserBrokerageMap> _userBrokerageMapRepository;
        private readonly IAuditWriter _securityAuditWriter;
        private readonly IPermissionService _permissionService;
        private readonly IRepository<security_UserHealthCareProviderMap> _userHealthcareProviderRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<security_UserAmountLimit> _userAmountLimitsRepository;
        private readonly IRepository<security_RoleAmountLimit> _roleAmountLimitsRepository;
        private readonly IRepository<security_UserCompanyMap> _userCompanyMapRepository;
        private readonly IRepository<security_UserContact> _userContactRepository;
        private readonly IRepository<security_UserActivation> _userActivationRepository;
        private readonly IMapper _mapper;
        private string[] SystemUsers = new string[] { "system", "backendprocess" };
        private const string UserModulePermissions = "UserModulePermissionCheck";
        private const string permissionsRefactor = "RefactorPermissionImplementation";

        public UserFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<security_User> userRepository,
            IRepository<security_Tenant> tenantRepository,
            IRepository<security_Role> roleRepository,
            IAuditWriter securityAuditWriter,
            IRepository<security_Permission> permissionRepository,
            IPermissionService permissionService,
            IRepository<security_UserDetail> userDetailsRepository,
            IRepository<security_UserBrokerageMap> userBrokerageMapRepository,
            IRepository<security_UserHealthCareProviderMap> userHealthCareProvideRepository,
            IRepository<security_UserAmountLimit> userAmountLimitsRepository,
            IRepository<security_RoleAmountLimit> roleAmountLimitsRepository,
            IConfigurationService configurationService, IRepository<security_UserCompanyMap> userCompanyMapRepository,
            IRepository<security_UserActivation> userActivationRepository,
            IRepository<security_UserContact> userContactRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _userRepository = userRepository;
            _tenantRepository = tenantRepository;
            _securityAuditWriter = securityAuditWriter;
            _permissionRepository = permissionRepository;
            _roleRepository = roleRepository;
            _permissionService = permissionService;
            _userDetailsRepository = userDetailsRepository;
            _userBrokerageMapRepository = userBrokerageMapRepository;
            _userHealthcareProviderRepository = userHealthCareProvideRepository;
            _configurationService = configurationService;
            _userCompanyMapRepository = userCompanyMapRepository;
            _userAmountLimitsRepository = userAmountLimitsRepository;
            _roleAmountLimitsRepository = roleAmountLimitsRepository;
            _userContactRepository = userContactRepository;
            _userActivationRepository = userActivationRepository;
            _mapper = mapper;
        }

        public async Task<PagedRequestResult<User>> SearchUsers(PagedRequest request, List<string> permissions)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");
            PagedRequestResult<User> users = new PagedRequestResult<User>();

            if (!permissionChangeFFL)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    if (request?.OrderBy.ToLower() == "name") request.OrderBy = "DisplayName";

                    if (permissions?.Count <= 0)
                    {
                        users = await _userRepository
                                 .Where(user => string.IsNullOrEmpty(request.SearchCriteria)
                                    || (user.Email.Contains(request.SearchCriteria)
                                    || user.DisplayName.Contains(request.SearchCriteria)
                                    || user.Permissions.Select(a => a.Name).Contains(request.SearchCriteria)))
                       .ToPagedResult<security_User, User>(request, _mapper);
                    }
                    else
                    {
                        users = await _userRepository
                                .Where(user => user.Permissions.Any(a => permissions.Contains(a.Name))
                                    && string.IsNullOrEmpty(request.SearchCriteria)
                                    || (user.Email.Contains(request.SearchCriteria)
                                    || user.DisplayName.Contains(request.SearchCriteria)
                                    || user.Permissions.Select(a => a.Name).Contains(request.SearchCriteria)))
                                .ToPagedResult<security_User, User>(request, _mapper);
                    }

                    foreach (var lastViewedUser in users.Data)
                    {
                        var role = await _roleRepository.FindByIdAsync(lastViewedUser.RoleId);
                        lastViewedUser.RoleName = role != null ? role.Name : "N/A";

                        if (string.IsNullOrEmpty(lastViewedUser.Name) && !string.IsNullOrEmpty(lastViewedUser.DisplayName))
                        {
                            lastViewedUser.Name = lastViewedUser.DisplayName;
                        }
                        else
                        {
                            lastViewedUser.Name = "N/A";
                        }
                    }

                    return users;
                }
            }
            else
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    if (request?.OrderBy.ToLower() == "name") request.OrderBy = "DisplayName";

                    Permission permission = new Permission();

                    if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
                    {
                        permission = await _permissionService.GetPermissionByName(request.SearchCriteria);

                        if (permission == null)
                            permission = new Permission();
                    }
                    if (permissions?.Count <= 0)
                    {
                        users = await _userRepository
                       .Where(user => string.IsNullOrEmpty(request.SearchCriteria) || (user.Email.Contains(request.SearchCriteria)
                                                                            || user.DisplayName.Contains(request.SearchCriteria)
                                                                            || user.Role.Permissions.Select(a => a.Name).Contains(request.SearchCriteria)
                                                                            || (permission.Id > 0 && user.UserPermission2.Select(a => a.PermissionId).Contains(permission.Id))))
                       .ToPagedResult<security_User, User>(request, _mapper);
                    }
                    else
                    {
                        users = await _userRepository
                                .Where(user => user.Role.Permissions.Any(a => permissions.Contains(a.Name)))
                                .ToPagedResult<security_User, User>(request, _mapper);
                    }

                    foreach (var lastViewedUser in users.Data)
                    {
                        var role = await _roleRepository.FindByIdAsync(lastViewedUser.RoleId);
                        lastViewedUser.RoleName = role != null ? role.Name : "N/A";

                        if (string.IsNullOrEmpty(lastViewedUser.Name) && !string.IsNullOrEmpty(lastViewedUser.DisplayName))
                        {
                            lastViewedUser.Name = lastViewedUser.DisplayName;
                        }
                        else
                        {
                            lastViewedUser.Name = "N/A";
                        }
                    }
                    return users;
                }
            }
        }

        public async Task<List<User>> SearchUsersByPermission(string permission)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            if (!permissionChangeFFL)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _permissionRepository
                        .SingleAsync(p => p.Name == permission,
                            $"Permission {permission} does not exist.");
                    await _permissionRepository.LoadAsync(entity, p => p.Users);
                    return _mapper.Map<List<User>>(entity.Users.OrderBy(u => u.DisplayName));
                }

            }
            else
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var matchingPermission = await _permissionService.GetPermissionByName(permission);

                    if (matchingPermission == null) throw new Exception($"Permission {permission} does not exist.");

                    var users = await _userRepository
                        .Where(user => user.Role.Permissions.Select(a => a.Name).Contains(permission)
                        || user.UserPermission2.Select(a => a.Permission.Name).Contains(permission)).OrderBy(u => u.DisplayName).ToListAsync();
                    return _mapper.Map<List<User>>(users);
                }
            }
        }

        public async Task<PagedRequestResult<User>> SearchUsersPermissionPageRequest(PagedRequest request, string permission)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var matchingPermission = await _permissionService.GetPermissionByName(permission);

                if (matchingPermission == null) throw new Exception($"Permission {permission} does not exist.");



                var users = await _userRepository
                            .Where(user => user.Role.Permissions.Select(a => a.Name).Contains(permission)
                            || user.UserPermission2.Select(a => a.Permission.Name).Contains(permission)).OrderBy(u => u.DisplayName).ToPagedResult(request);

                var results = _mapper.Map<PagedRequestResult<User>>(users);

                return new PagedRequestResult<User>()
                {
                    PageSize = results.PageSize,
                    Page = results.Page,
                    PageCount = results.PageCount,
                    RowCount = results.RowCount,
                    Data = results.Data
                };
            }

        }
        public async Task<User> SearchUserByEmail(string email)
        {
            Contract.Requires(email != null);
            if (Array.IndexOf(SystemUsers, email.ToLower()) >= 0)
            {
                return await Task.FromResult(GetSystemUser(email));
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var client = await _userRepository
                    .SingleOrDefaultAsync(user => user.Email == email);
                return (client == null) ? GetSystemUser(email) : _mapper.Map<User>(client);
            }
        }

        private User GetSystemUser(string email)
        {
            return new User
            {
                Email = email,
                TenantId = 0,
                Name = email,
                AuthenticationType = AuthenticationTypeEnum.FormsAuthentication,
                PortalType = PortalTypeEnum.RMA,
                DateViewed = DateTime.Now,
                RoleId = 1,
                DisplayName = email,
                IsApproved = true
            };
        }


        public async Task<AuthenticationTypeEnum> GetAuthenticationType(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userResult = await _userRepository.Where(u => u.Email == email)
                    .Select(d => d.AuthenticationType)
                    .SingleAsync($"Could not find user type for email {email}");

                return userResult;
            }
        }

        public async Task<Tenant> GetUserTenant(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _userRepository.DisableFilter("MultiTenancyFilter");
                return await (from user in _userRepository
                              join tenant in _tenantRepository on user.TenantId equals tenant.Id
                              where user.Email == email
                              select new Tenant
                              {
                                  Id = tenant.Id,
                                  Name = tenant.Name
                              }
                      ).FirstOrDefaultAsync();
            }
        }

        public async Task<User> GetUserAndUpdateToken(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userRepository
                    .Where(user => user.Email == email)
                    .SingleAsync($"Could not find user for email {email}");

                await _userRepository.LoadAsync(result, r => r.UserPreferences);

                result.Token = Guid.NewGuid();
                result.FailedAttemptCount = 0;
                result.FailedAttemptDate = null;
                result.IsActive = true;

                _userRepository.Update(result);

                var resultUser = new User
                {
                    Token = result.Token?.ToString(),
                    Name = result.DisplayName,
                    Id = result.Id,
                    Email = result.Email,
                    RoleId = result.RoleId,
                    //RoleName = result.p,
                    IsActive = result.IsActive,
                    IsDeleted = result.IsDeleted,
                    Preferences = result.UserPreferences?.Where(p => p.Preferences != null)
                        .Select(preference => preference.Preferences)?.FirstOrDefault()
                };

                return resultUser;
            }
        }

        public async Task<bool> ValidateUserToken(string email, Guid token)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await QueryableExtensions.AnyAsync(_userRepository
                    .Where(user => user.Email == email
                                   && user.Token == token));
            }
        }

        public async Task<List<User>> GetUsers()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userRepository
                    .OrderBy(user => user.DisplayName)
                    .Select(user => new User
                    {
                        Id = user.Id,
                        TenantId = user.TenantId,
                        Name = user.DisplayName,
                        Email = user.Email,
                        DisplayName = user.DisplayName,
                        RoleId = user.RoleId,
                        IsActive = user.IsActive,
                        IsDeleted = user.IsDeleted,
                        AuthenticationType = user.AuthenticationType,
                        PortalType = user.PortalType
                    }).ToListAsync();

                return users;
            }
        }

        public async Task<List<Lookup>> GetTenants()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tenants = await _tenantRepository
                    .OrderBy(tenant => tenant.Name)
                    .Select(tenant => new Lookup
                    {
                        Id = tenant.Id,
                        Name = tenant.Name
                    }).ToListAsync();

                return tenants;
            }
        }

        public async Task<List<User>> GetUsersByUserIds(List<int> ids)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userRepository
                    .Where(user => ids.Contains(user.Id))
                    .OrderBy(user => user.DisplayName)
                    .ToListAsync();

                return _mapper.Map<List<User>>(users);
            }
        }

        public async Task<User> GetUserById(int id)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            if (!permissionChangeFFL)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var result = await _userRepository
                        .Where(user => user.Id == id)
                        .SingleAsync($"Could not find an user with the id {id}");
                    await _userRepository.LoadAsync(result, r => r.Permissions);
                    await _userRepository.LoadAsync(result, r => r.Role);

                    await _securityAuditWriter.AddLastViewed<security_User>(id);
                    var userMapped = _mapper.Map<User>(result);
                    userMapped.PermissionIds = result.Permissions.Select(a => a.Id).ToList();
                    userMapped.RoleName = result.Role.Name;
                    return userMapped;
                }
            }
            else
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var result = await _userRepository
                        .Where(user => user.Id == id)
                        .SingleAsync($"Could not find an user with the id {id}");

                    var permissions = await _permissionService.GetUserPermissions(null, id, true);

                    await _userRepository.LoadAsync(result, r => r.Role);

                    await _securityAuditWriter.AddLastViewed<security_User>(id);
                    var userMapped = _mapper.Map<User>(result);
                    userMapped.PermissionIds = permissions.Select(a => a.Id).ToList();
                    userMapped.RoleName = result.Role.Name;

                    return userMapped;
                }
            }
        }

        public async Task<User> GetUserByEmail(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // _userRepository.DisableFilter("MultiTenancyFilter");
                var result = await _userRepository
                    .FirstOrDefaultAsync(user => user.Email == email);

                if (result != null)
                {
                    var user = _mapper.Map<User>(result);
                    //If same user, don't add to last viewed, 
                    //Counted 11 calls to this method on signing in alone :(o_o):
                    if (RmaIdentity.Email == email)
                    {
                        return user;
                    }

                    await _securityAuditWriter.AddLastViewed<security_User>(result.Id);
                    return user;
                }
                return _mapper.Map<User>(result);
            }

        }

        public async Task<User> GetUserByUsername(string username)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userRepository
                    .Where(user => user.UserName == username)
                    .FirstOrDefaultAsync();

                if (result != null)
                {
                    await _userRepository.LoadAsync(result, s => s.Role);
                    await _securityAuditWriter.AddLastViewed<security_User>(result.Id);
                }

                return _mapper.Map<User>(result);
            }
        }

        public async Task<string> GetUserDisplayName(string username)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userRepository
                    .Where(user => user.UserName == username)
                    .Select(d => d.DisplayName)
                    .FirstOrDefaultAsync();
                return result;
            }
        }

        public async Task<Dictionary<string, string>> GetUserDisplayNamesFromEmail(List<string> emails)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userRepository
                    .Where(u => emails.Contains(u.Email))
                    .ToListAsync();
                var results = users
                    .Select(d => new { Key = d.Email, Value = d.DisplayName })
                    .Distinct();
                return results.ToDictionary(n => n.Key, n => n.Value);
            }
        }

        public async Task<Dictionary<string, string>> GetUserDisplayNames(List<string> usernames)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userRepository
                    .Where(u => usernames.Contains(u.UserName))
                    .ToListAsync();
                var results = users
                    .Select(d => new { Key = d.Email, Value = d.DisplayName })
                    .Distinct();
                return results.ToDictionary(n => n.Key, n => n.Value);
            }
        }

        public async Task<User> EditUser(User user)
        {
            Contract.Requires(user != null);
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");
            var currentPermissionOverride = new List<UserPermission>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var userDb = await _userRepository.FindByIdAsync(user.Id);
                if (!user.IsActive) user.Token = null;

                if (!permissionChangeFFL)
                {
                    await _userRepository.LoadAsync(userDb, c => c.Permissions);
                    var currentPermissions = userDb.Permissions;

                    List<security_Permission> providedPermissions = new List<security_Permission>();
                    if (user.PermissionIds != null)
                    {
                        providedPermissions = await _permissionRepository.Where(a => user.PermissionIds.Contains(a.Id)).ToListAsync();
                    }
                    var keepPermissions = currentPermissions;
                    var permissions = new List<security_Permission>();
                    var removePermissions = providedPermissions;

                    foreach (var permission in permissions)
                    {
                        if (keepPermissions.Contains(permission))
                        {
                            permissions.Add(permission);
                            removePermissions.Remove(permission);
                        }
                    }
                    if (removePermissions.Any())
                    {
                        permissions.AddRange(removePermissions);
                    }

                    userDb.Permissions = permissions;
                }
                else
                {
                    var isRoleChange = userDb.RoleId != user.RoleId;

                    currentPermissionOverride = await _permissionService.GetUserPermissionsOverride(null, user.Id, true);
                    var rolePermissions = await _permissionService.GetRolePermissions(isRoleChange ? user.RoleId : userDb.RoleId);
                    var rolePermissionIds = new HashSet<int>(rolePermissions.Select(_ => _.Id));

                    if (!isRoleChange) //when there is no role change then update the overrides based on the submitted permissionsId
                    {
                        //add user override to inactive rolepermission, if rolepermission is not in submitted list of permissionIds 
                        foreach (var permission in rolePermissionIds)
                            if (!user.PermissionIds.Any(_ => _ == permission))
                            {
                                var matchingCurrentOverride = currentPermissionOverride.FirstOrDefault(_ => _.PermissionId == permission);

                                if (matchingCurrentOverride == null) //When isActive = false && isDeleted = false ==> RolePermission Override
                                    currentPermissionOverride.Add(new UserPermission() { UserId = user.Id, PermissionId = permission, IsActive = false, IsDeleted = false, ModifiedBy = RmaIdentity.Username, ModifiedDate = DateTime.Now });
                                else if (matchingCurrentOverride != null && matchingCurrentOverride.IsActive && !matchingCurrentOverride.IsDeleted)
                                    ChangePermissionStatus(matchingCurrentOverride, false);
                            }

                        //remove existing inactive userpermission if not in  submitted list of permissionIds 
                        foreach (var permission in currentPermissionOverride)
                            if (!user.PermissionIds.Any(_ => _ == permission.PermissionId) && permission.IsActive && !permission.IsDeleted)
                                ChangePermissionStatus(permission, false);

                        //Remove if the existing useroverride permission which is active, matches the roles permission list
                        currentPermissionOverride.RemoveAll(_ => rolePermissionIds.Contains(_.PermissionId) && _.IsActive && !_.IsDeleted);
                        user.PermissionIds.RemoveAll(_ => rolePermissionIds.Contains(_));

                        //add user override if permission not in rolepermission or existing useroverride
                        foreach (var permission in user.PermissionIds)
                            if (!rolePermissionIds.Any(_ => _ == permission))
                            {
                                var matchingCurrentOverride = currentPermissionOverride.FirstOrDefault(_ => _.PermissionId == permission);
                                if (matchingCurrentOverride == null)
                                    currentPermissionOverride.Add(new UserPermission() { UserId = user.Id, PermissionId = permission, IsActive = true, IsDeleted = false, ModifiedBy = RmaIdentity.Username, ModifiedDate = DateTime.Now });
                                else if (!matchingCurrentOverride.IsActive || matchingCurrentOverride.IsDeleted)
                                    ChangePermissionStatus(matchingCurrentOverride, true);
                            }
                    }
                    else //when there is a role change, then only update the overrides and ignore the submitted userpermission
                    {
                        foreach (var permssionOverride in currentPermissionOverride)
                            if (!permssionOverride.IsDeleted)
                            {
                                var rolepermissionId = rolePermissionIds.FirstOrDefault(_ => _ == permssionOverride.PermissionId);
                                permssionOverride.IsDeleted = (rolepermissionId == 0 && !permssionOverride.IsActive) ||
                                                                (rolepermissionId > 0 && permssionOverride.IsActive);//inactivate if the role permission and permission override is the same
                            }
                    }
                }

                userDb.RoleId = user.RoleId;

                userDb.AuthenticationType = user.AuthenticationType;
                userDb.Email = user.Email;
                userDb.DisplayName = user.DisplayName;
                userDb.IsActive = user.IsActive;
                userDb.IsInternalUser = user.IsInternalUser;

                _userRepository.Update(userDb);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                if (permissionChangeFFL)
                    await _permissionService.UpdateUserPermissionsOverride(user.Id, currentPermissionOverride);

                return _mapper.Map<User>(userDb);
            }
        }

        private static void ChangePermissionStatus(UserPermission permission, bool setActive)
        {
            permission.IsActive = setActive;
            permission.IsDeleted = !setActive;
            permission.ModifiedBy = RmaIdentity.Username;
            permission.ModifiedDate = DateTime.Now;
        }

        public async Task<int> AddUser(User user)
        {
            Contract.Requires(user != null);
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<security_User>(user);

                entity.AuthenticationType = user.AuthenticationType;

                var role = await _roleRepository.FindByIdAsync(user.RoleId);

                if (!permissionChangeFFL)
                {
                    await _roleRepository.LoadAsync(role, a => a.Permissions);
                    var newPermissions = role.Permissions;

                    var permissions = new List<security_Permission>();

                    if (user.PermissionIds != null)
                    {
                        permissions = await _permissionRepository.Where(a => user.PermissionIds.Contains(a.Id)).ToListAsync();
                    }
                    var permissionsList = new List<security_Permission>();
                    var removePermissions = newPermissions;
                    foreach (var permission in newPermissions)
                    {
                        if (entity.Permissions.Contains(permission))
                        {
                            permissionsList.Add(permission);
                            removePermissions.Remove(permission);
                        }

                    }
                    foreach (var permission in newPermissions)
                    {
                        if (entity.Permissions.Contains(permission))
                        {
                            permissionsList.Add(permission);
                            removePermissions.Remove(permission);
                        }
                    }
                    if (removePermissions.Any())
                    {
                        permissionsList.AddRange(removePermissions);
                        permissionsList.AddRange(permissions);
                    }

                    entity.RoleId = role.Id;
                    entity.Permissions = permissionsList;
                }
                else
                {
                    entity.RoleId = user.RoleId;
                }

                entity.Role = role;

                _userRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<int> ChangePassword(string username, string oldPassword, string newPassword)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(UserModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ChangeUserPassword);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var oldPass = RijndaelEncryption.Encrypt(oldPassword);
                var result = await _userRepository
                    .Where(u => u.Email == username && u.Password == oldPass
                                && (u.AuthenticationType == AuthenticationTypeEnum.FormsAuthentication))
                    .SingleAsync("Error in resetting password");

                result.FailedAttemptCount = 0;
                result.FailedAttemptDate = null;
                result.IsActive = true;
                var validation = new PasswordValidator() { RequireDigit = true, RequiredLength = 11, RequireLowercase = true, RequireNonLetterOrDigit = true, RequireUppercase = true };
                validation.Validate(newPassword);


                result.Password = RijndaelEncryption.Encrypt(newPassword);

                _userRepository.Update(result);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return result.Id;
            }
        }

        public async Task<User> GetUserByToken(Guid token)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userRepository
                    .FirstOrDefaultAsync(user => user.Token == token);

                if (!permissionChangeFFL)
                {
                    await _userRepository.LoadAsync(result, user => user.Permissions);
                    return _mapper.Map<User>(result);
                }
                else
                {
                    var permissions = await _permissionService.GetUserPermissions(token.ToString(), 0, true).ConfigureAwait(false);
                    var user = _mapper.Map<User>(result);
                    user.PermissionIds = permissions.Select(_ => _.Id).ToList();
                    return user;
                }

            }
        }

        public async Task<bool> GetUserIsActive(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userResult = await _userRepository
                    .Where(user => user.Email == email || user.UserName == email)
                    .Select(a => a.IsActive)
                    .SingleAsync($"Could not find active flag for email {email}");

                return userResult;
            }
        }

        public async Task<bool> HasPermission(string username, string permissionName)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            if (!permissionChangeFFL)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var hasPermission = await _userRepository
                        .Where(user => (user.Email == username || user.UserName == username) && user.Permissions.Any(p => p.IsActive && p.Name == permissionName))
                        .AnyAsync();

                    return hasPermission;
                }
            }
            else
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var user = await _userRepository
                        .Where(u => (u.Email == username || u.UserName == username)).FirstAsync();

                    var userPermission = await _permissionService.GetUserPermissions(user.Token?.ToString(), user.Id, true);

                    var hasPermission = userPermission.Any(p => p.IsActive && p.Name == permissionName);

                    return hasPermission;
                }

            }
        }

        public async Task<bool> HasAnyPermission(string username, List<string> permissionNames)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = await _userRepository.Where(u => (u.Email == username || u.UserName == username)).FirstAsync();
                var userPermissions = await _permissionService.GetUserPermissions(user.Token?.ToString(), user.Id, true);
                return userPermissions.Any(p => p.IsActive && permissionNames.Contains(p.Name));
            }
        }

        public async Task<Common.Entities.UserInfo> GetUserImpersonationInfo(string username)
        {
            var userImpersonationName = username ?? SystemSettings.SystemUserAccount;
            var user = await GetUserByEmail(userImpersonationName);

            var userInfo = new Common.Entities.UserInfo
            {
                Name = user.DisplayName,
                Username = user.Email,
                Email = user.Email,
                Preferences = user.Preferences,
                Role = user.RoleName ?? "N/A",
                RoleId = user.RoleId,
                Sub = user.Id,
                AuthenticationTypeId = (int)user.AuthenticationType,
                TenantId = user.TenantId
            };

            userInfo.Permissions = new List<string>();

            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            if (!permissionChangeFFL)
            {
                var permissions = await _permissionService.GetRolePermissions(user.RoleId);

                foreach (var permission in permissions)
                {
                    userInfo.Permissions.Add(permission.Name);
                }
            }
            else
            {
                var userConsolidatedPermissions = await _permissionService.GetUserPermissions(user.Token, user.Id, true);

                foreach (var permission in userConsolidatedPermissions)
                {
                    if (permission.IsActive)
                        userInfo.Permissions.Add(permission.Name);
                }
            }
            return userInfo;
        }

        public async Task ApproveUser(User user)
        {
            Contract.Requires(user != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(UserModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ApproveUser);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataUser = await _userRepository.SingleAsync(i => i.Id == user.Id);
                dataUser.IsActive = true;
                _userRepository.Update(dataUser);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _securityAuditWriter.AddLastViewed<security_User>(user.Id);
            }
        }

        public async Task<User> UpdateLoginFailedAttempts(string email)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _userRepository
                    .SingleAsync(userResult =>
                            string.Compare(userResult.Email, email, StringComparison.InvariantCultureIgnoreCase) == 0,
                        $"Could not find user for email {email}");

                if (result.FailedAttemptCount == null)
                    result.FailedAttemptCount = 1;
                else
                    result.FailedAttemptCount++;

                result.FailedAttemptDate = DateTimeHelper.SaNow;

                if (result.FailedAttemptCount > 2)
                    result.IsActive = false;

                _userRepository.Update(result);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                var user = new User
                {
                    Email = result.Email,
                    FailedAttemptCount = result.FailedAttemptCount,
                    FailedAttemptDate = result.FailedAttemptDate,
                    IsActive = result.IsActive
                };

                return user;
            }
        }

        public async Task<List<User>> GetUsersInRoles(List<int> roleIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userRepository
                    .Where(user => roleIds.Contains(user.RoleId))
                    .OrderBy(user => user.DisplayName)
                    .Select(user => new User
                    {
                        Id = user.Id,
                        Name = user.DisplayName,
                        DisplayName = user.DisplayName,
                        Email = user.Email,
                        AuthenticationType = user.AuthenticationType,
                        TenantId = user.TenantId,
                        PortalType = user.PortalType,
                        RoleId = user.RoleId,
                        IsActive = user.IsActive,
                        IsDeleted = user.IsDeleted,
                        ModifiedBy = user.ModifiedBy,
                        ModifiedDate = user.ModifiedDate,
                        CreatedBy = user.CreatedBy,
                        CreatedDate = user.CreatedDate
                    }).ToListAsync();

                return users;
            }
        }

        public async Task<List<User>> GetUsersByRoleName(string roleName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var role = _roleRepository.FirstOrDefault(r =>
                    r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase));
                if (role == null) return new List<User>();
                var users = await _userRepository
                    .Where(user => user.RoleId == role.Id)
                    .OrderBy(user => user.DisplayName)
                    .Select(user => new User
                    {
                        Id = user.Id,
                        Name = user.DisplayName,
                        DisplayName = user.DisplayName,
                        Email = user.Email,
                        AuthenticationType = user.AuthenticationType,
                        PortalType = user.PortalType,
                        TenantId = user.TenantId,
                        RoleId = user.RoleId,
                        IsActive = user.IsActive,
                        IsDeleted = user.IsDeleted,
                        ModifiedBy = user.ModifiedBy,
                        ModifiedDate = user.ModifiedDate,
                        CreatedBy = user.CreatedBy,
                        CreatedDate = user.CreatedDate
                    }).ToListAsync();

                return users;
            }
        }

        public async Task<UserInfo> GetUserInfo()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userId = RmaIdentity.UserId;
                var tenantId = RmaIdentity.TenantId;

                var permissions = new List<string>();

                if (!await _configurationService.IsFeatureFlagSettingEnabled(permissionsRefactor))
                    permissions = await _permissionRepository.Where(p => p.Users.Any(u => u.Id == userId)).Select(p => p.Name).ToListAsync();
                else
                {
                    var permissionsList = await _permissionService.GetUserPermissions(RmaIdentity.UserToken, RmaIdentity.UserId, true);
                    permissions = permissionsList.Select(_ => _.Name)?.ToList();
                }

                var user = await GetUserByEmail(RmaIdentity.Email);

                if (user?.Id > 0) // value is zero for client secret flows
                {
                    tenantId = user.TenantId;
                    return new UserInfo
                    {
                        Sub = RmaIdentity.UserId,
                        Username = RmaIdentity.Username,
                        Name = RmaIdentity.DisplayName,
                        Role = RmaIdentity.Role,
                        RoleId = RmaIdentity.RoleId,
                        Email = RmaIdentity.Email,
                        Token = RmaIdentity.UserToken,
                        Preferences = RmaIdentity.Preferences,
                        Permissions = permissions,
                        TenantId = user.TenantId
                    };
                }
                else
                {
                    return new UserInfo
                    {
                        Sub = 0,
                        Username = RmaIdentity.Username,
                        Name = RmaIdentity.DisplayName,
                        Role = RmaIdentity.Role,
                        RoleId = RmaIdentity.RoleId,
                        Email = RmaIdentity.Email,
                        Token = RmaIdentity.UserToken,
                        Preferences = RmaIdentity.Preferences,
                        Permissions = new List<string>(),
                        TenantId = tenantId
                    };
                }
            }
        }

        public Task GeneratePasswordResetToken(string userEmail)
        {
            throw new NotImplementedException();
        }

        public async Task<PagedRequestResult<User>> GetUsersInRolePaged(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var role = _roleRepository
                    .FirstOrDefault(r => r.Name.Equals(request.SearchCriteria, StringComparison.OrdinalIgnoreCase));
                var users = await _userRepository
                    .Where(c => c.Role.Id == role.Id && c.IsActive)
                    .ToPagedResult<security_User, User>(request, _mapper);
                return users;
            }
        }

        public async Task<UserDetails> GetUserDetailsByIdNumber(string idNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = await _userDetailsRepository.Where(a => a.SaId == idNumber).FirstOrDefaultAsync();

                return _mapper.Map<UserDetails>(user);
            }
        }
        public async Task<string> RegisterUserDetails(UserDetails userDetails)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                //TODO: VOPD check will happen here
                //TODO: Activation details will also be created
                //TODO: verify the Company and broker exist in Client care
                //TODO: Based on certain checks we need to activate a wizard from here.
                var entity = _mapper.Map<security_UserDetail>(userDetails);
                _userDetailsRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                if (userDetails?.IdTypeEnum == IdTypeEnum.SAIDDocument)
                {
                    var savedUserDetails = _mapper.Map<UserDetails>(entity);
                    //await _rolePlayerService.UserPlayerVopdRequest(savedUserDetails);
                }
                return "Registration has been processed, an activation email will be sent through to complete registration";
            }
        }

        public async Task<int> UpdateUserPassword(string username, string newPassword)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _userRepository.FirstOrDefaultAsync(u => u.Email == username);

                result.FailedAttemptCount = 0;
                result.FailedAttemptDate = null;
                result.IsActive = true;
                result.Password = newPassword.ComputeHashSHA512();

                _userRepository.Update(result);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return result.Id;
            }
        }
        public async Task<List<UserHealthCareProvider>> GetHealthCareProvidersLinkedToUser(string email)
        {
            List<UserHealthCareProvider> result;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                result = await _userDetailsRepository.SqlQueryAsync<UserHealthCareProvider>(
                    DatabaseConstants.GetHealthCareProvidersLinkedToUserEmail,
                    new SqlParameter("@Email", email));
            }

            return result;
        }

        public async Task<List<UserHealthCareProvider>> GetHealthCareProvidersForInternalUser(string searchString)
        {
            List<UserHealthCareProvider> result;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                result = await _userDetailsRepository.SqlQueryAsync<UserHealthCareProvider>(
                    DatabaseConstants.GetHealthCareProvidersForInternalUser,
                    new SqlParameter("@SearchCriteria", searchString));
            }

            return result;
        }

        public async Task<int> AddUserCompanyMap(UserCompanyMap userCompanyMap)
        {
            Contract.Requires(userCompanyMap != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var role = await _roleRepository.FirstOrDefaultAsync(r => r.Name == userCompanyMap.RoleName);
                userCompanyMap.RoleId = role.Id;
                var entity = _mapper.Map<security_UserCompanyMap>(userCompanyMap);
                entity.Role = null;
                _userCompanyMapRepository.Create(entity);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<User> GetUserLinkedToHealthCareProviderId(int healthCareProviderId)
        {

            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var userHealthcareProvider = await _userHealthcareProviderRepository.Where(x => x.HealthCareProviderId == healthCareProviderId).FirstOrDefaultAsync();
                if (userHealthcareProvider == null)
                    return null;
                var user = _userRepository.Where(usr => usr.Id == userHealthcareProvider.UserId).FirstOrDefault();
                return _mapper.Map<User>(user);
            }
        }

        public async Task<bool> SaveUserHealthCareProviders(List<UserHealthCareProvider> userHealthcareProviders, int userId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(UserModulePermissions))
                RmaIdentity.DemandPermission(Permissions.UpdateUser);

            var result = false;

            if (userHealthcareProviders == null) return result;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var currentUserHealthCareProviderListDB = await _userHealthcareProviderRepository.Where(_ => _.UserId == userId && _.IsActive).ToListAsync();
                List<UserHealthCareProvider> currentUserHealthCareProviderList = _mapper.Map<List<UserHealthCareProvider>>(currentUserHealthCareProviderListDB);

                var removeFromCurrentList = currentUserHealthCareProviderList.Except(userHealthcareProviders);
                if (removeFromCurrentList != null && removeFromCurrentList.Any())
                {
                    foreach (var userHealthcareProvider in removeFromCurrentList)
                    {
                        var entity = await _userHealthcareProviderRepository.FirstOrDefaultAsync(_ => _.UserId == userId && _.HealthCareProviderId == userHealthcareProvider.HealthCareProviderId);

                        if (entity != null && entity.IsActive)
                        {
                            entity.IsActive = false;
                            entity.ModifiedBy = RmaIdentity.Username;
                            entity.ModifiedDate = DateTime.Now;

                            _userHealthcareProviderRepository.Update(entity);
                        }
                    }
                }

                var addFromNewList = userHealthcareProviders.Except(currentUserHealthCareProviderList);
                if (addFromNewList != null && addFromNewList.Any())
                {
                    foreach (UserHealthCareProvider userHcp in addFromNewList)
                    {
                        if (userHcp == null) continue;

                        var entity = await _userHealthcareProviderRepository.Where(_ => _.UserId == userId && _.HealthCareProviderId == userHcp.HealthCareProviderId).FirstOrDefaultAsync();

                        if (entity == null)
                        {
                            var newEntity = _mapper.Map<security_UserHealthCareProviderMap>(userHcp);
                            newEntity.CreatedBy = RmaIdentity.Username;
                            newEntity.CreatedDate = DateTime.Now;
                            newEntity.IsActive = true;
                            _userHealthcareProviderRepository.Create(newEntity);
                        }
                        else if (entity != null && !entity.IsActive)//reinstate
                        {
                            entity.IsActive = true;
                            entity.ModifiedBy = RmaIdentity.Username;
                            entity.ModifiedDate = DateTime.Now;

                            _userHealthcareProviderRepository.Update(entity);
                        }
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                result = true;
            }

            return result;
        }

        public async Task<List<UserBrokerageMap>> GetMemberBrokerageList(int memberId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userBrokerageMap = await _userBrokerageMapRepository.Where(t => t.UserId == memberId).ToListAsync();
                return _mapper.Map<List<UserBrokerageMap>>(userBrokerageMap);
            }
        }

        public async Task<User> GetUsersByRoleAndEmail(string roleName, string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var role = _roleRepository.FirstOrDefault(r =>
                    r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase));

                if (role == null) return new User();

                return await _userRepository
                     .Where(user => user.RoleId == role.Id && user.Email == email)
                     .OrderBy(user => user.DisplayName)
                     .Select(user => new User
                     {
                         Id = user.Id,
                         Name = user.DisplayName,
                         DisplayName = user.DisplayName,
                         Email = user.Email,
                         AuthenticationType = user.AuthenticationType,
                         PortalType = user.PortalType,
                         TenantId = user.TenantId,
                         RoleId = user.RoleId,
                         IsActive = user.IsActive,
                         IsDeleted = user.IsDeleted,
                         ModifiedBy = user.ModifiedBy,
                         ModifiedDate = user.ModifiedDate,
                         CreatedBy = user.CreatedBy,
                         CreatedDate = user.CreatedDate
                     }).FirstOrDefaultAsync();
            }
        }

        public async Task<List<CompcareUser>> GetCompcareUsersByEmailAddress(string email)
        {
            List<CompcareUser> result;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                result = await _userDetailsRepository.SqlQueryAsync<CompcareUser>(
                    DatabaseConstants.GetCompcareUsersLinkedToEmailAddress,
                    new SqlParameter("@Email", email));
            }

            return result;
        }

        public async Task<decimal> GetAmountLimit(int amountLimitTypeId)
        {
            decimal? amountLimit;

            User userInfo;

            if (RmaIdentity.UserId == 0)
            {
                userInfo = await GetUserByEmail(SystemSettings.SystemUserAccount);
            }
            else
            {
                userInfo = await GetUserById(RmaIdentity.UserId);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userLimit = await _userAmountLimitsRepository.Where(a => a.UserId == userInfo.Id
                                                    && a.AmountLimitType == (AmountLimitTypeEnum)amountLimitTypeId).FirstOrDefaultAsync();
                var roleLimit = await _roleAmountLimitsRepository.Where(a => a.RoleId == userInfo.RoleId
                                                    && a.AmountLimitType == (AmountLimitTypeEnum)amountLimitTypeId).FirstOrDefaultAsync();

                var userAmountLimit = userLimit == null ? 0 : userLimit.AmountLimit;
                var roleAmountLimit = roleLimit == null ? 0 : roleLimit.AmountLimit;

                amountLimit = userAmountLimit > roleAmountLimit ? userAmountLimit : roleAmountLimit;
            }

            return amountLimit == null ? 0 : decimal.Parse(amountLimit.ToString());
        }

        public async Task<RoleAmountLimit> GetAuthorisationAmountLimit(AmountLimitTypeEnum amountLimitType, RoleEnum role)
        {
            var amountLimits = new security_RoleAmountLimit();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                amountLimits = await _roleAmountLimitsRepository.FirstOrDefaultAsync(a => a.AmountLimitType == amountLimitType && a.RoleId == (int)role);
            }

            return _mapper.Map<RoleAmountLimit>(amountLimits);
        }

        public async Task<PagedRequestResult<UserCompanyMap>> GetPagedUserCompanyMap(PagedRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerId = Convert.ToInt32(request.SearchCriteria);
                var userCompanyMaps = await _userCompanyMapRepository.Where(l => l.CompanyId == rolePlayerId).ToPagedResult<security_UserCompanyMap, UserCompanyMap>(request, _mapper);

                foreach (var item in userCompanyMaps.Data)
                {
                    if (item.UserId == null && item.UserActivationId != null)
                    {
                        var role = await _roleRepository.FirstOrDefaultAsync(s => s.Id == item.RoleId);
                        var roleName = role == null ? "N/A" : role.Name;
                        var userDetail = await GetUserActivationUserDetailsByUserActivationId(Convert.ToInt32(item.UserActivationId));

                        item.RoleName = roleName;
                        item.UserName = userDetail.UserContact != null ? userDetail.UserContact.Email : "N/A";
                        item.DisplayName = userDetail.Name + ' ' + userDetail.Surname;
                    }
                    else
                    {
                        var user = await GetUserById(Convert.ToInt32(item.UserId));
                        item.RoleName = user.RoleName;
                        item.UserName = user.Email;
                        item.DisplayName = user.DisplayName;
                    }

                }

                return new PagedRequestResult<UserCompanyMap>()
                {
                    Page = request.Page,
                    PageCount = request.PageSize,
                    RowCount = userCompanyMaps.RowCount,
                    PageSize = request.PageSize,
                    Data = userCompanyMaps.Data
                };
            }
        }

        private async Task<UserDetails> GetUserActivationUserDetailsByUserActivationId(int userActivationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userActivation = await _userActivationRepository.FirstOrDefaultAsync(a => a.UserActivationId == userActivationId);

                var userDetails = JsonConvert.DeserializeObject<UserDetails>(userActivation.Data);
                return userDetails;
            }
        }

        public async Task<List<UserCompanyMap>> GetUserCompanyMapsByUserActivationId(int userActivationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userCompanyMapRepository.Where(t => t.UserActivationId == userActivationId).ToListAsync();
                return _mapper.Map<List<UserCompanyMap>>(result);
            }
        }

        public async Task EditUserCompanyMap(UserCompanyMap userCompanyMap)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<security_UserCompanyMap>(userCompanyMap);
                entity.Role = null;
                _userCompanyMapRepository.Update(entity);
                await scope.SaveChangesAsync();
            }
        }

        public async Task<int> AddUserContact(UserContact userContact)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<security_UserContact>(userContact);
                _userContactRepository.Create(entity);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task EditUserContact(UserContact userContact)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<security_UserContact>(userContact);
                _userContactRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<UserContact> GetUserContact(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userContactRepository.FirstOrDefaultAsync(t => t.UserId == userId);
                return _mapper.Map<UserContact>(result);
            }
        }

        public async Task<int> GetLinkedMember(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _userCompanyMapRepository.FirstOrDefaultAsync(t => t.UserId == userId);
                return result != null ? result.CompanyId : -1;
            }
        }

        public async Task<List<UserCompanyMap>> GetUserCompanyMaps(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _userCompanyMapRepository.Where(t => t.UserId == userId).ToListAsync();
                return _mapper.Map<List<UserCompanyMap>>(results);
            }
        }

        public async Task<List<UserCompanyMap>> GetPendingUserCompanyMaps(int companyId, int userActivationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _userCompanyMapRepository.Where(t => t.CompanyId == companyId && t.UserActivationId == userActivationId && t.UserCompanyMapStatus == UserCompanyMapStatusEnum.Pending).ToListAsync();
                return _mapper.Map<List<UserCompanyMap>>(results);
            }
        }

        public async Task<List<User>> GetUsersByBrokerageId(int brokerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userList = await (from userbrokeragemap in _userBrokerageMapRepository.Where(t => t.BrokerageId == brokerId)
                                      join user in _userRepository on userbrokeragemap.UserId equals user.Id
                                      select user).ToListAsync();

                return _mapper.Map<List<User>>(userList);
            }
        }

        public async Task<int> GetHealthCareProviderIdLinkedToExternalUser(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var map = await _userHealthcareProviderRepository.FirstOrDefaultAsync(u => u.UserId == userId);
                return map?.HealthCareProviderId ?? 0;
            }
        }

        public async Task<PagedRequestResult<UserHealthCareProvider>> GetPagedUserHealthCareProviderMap(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    int healthCareProviderId = int.TryParse(pagedRequest.SearchCriteria, out int parsedHcpId) ? parsedHcpId : 0;

                    var healthCareProviderUsers =
                     await (
                            from map in _userHealthcareProviderRepository
                            join user in _userRepository on map.UserId equals user.Id
                            where map.HealthCareProviderId == healthCareProviderId
                            select new UserHealthCareProvider
                            {
                                UserHealthCareProviderMapId = map.UserHealthCareProviderMapId,
                                HealthCareProviderId = map.UserHealthCareProviderMapId,
                                Name = user.DisplayName,
                                UserId = user.Id,
                                CompCareMSPId = map.UserHealthCareProviderMapId,
                                TenantId = user.TenantId,
                                UserHealthCareProviderMapStatus = map.UserHealthCareProviderMapStatus
                            }).ToPagedResult(pagedRequest);

                    var data = _mapper.Map<List<UserHealthCareProvider>>(healthCareProviderUsers.Data);

                    return new PagedRequestResult<UserHealthCareProvider>
                    {
                        Page = pagedRequest.Page,
                        PageCount = (int)Math.Ceiling(healthCareProviderUsers.RowCount / (double)pagedRequest.PageSize),
                        RowCount = healthCareProviderUsers.RowCount,
                        PageSize = pagedRequest.PageSize,
                        Data = data
                    };
                }
            }
        }

        public async Task<List<User>> SearchUsersByPermissions(List<string> permissions)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userRepository
                       .Where(user => user.Role.Permissions.Any(a => permissions.Contains(a.Name))
                           || user.UserPermission2.Any(a => permissions.Contains(a.Permission.Name)))
                       .OrderBy(u => u.DisplayName).ToListAsync();

                return _mapper.Map<List<User>>(users);
            }
        }

        public async Task<PagedRequestResult<Role>> GetPagedRoles(PagedRequest request)
        {
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _roleRepository.AsQueryable();

                if (!string.IsNullOrEmpty(request.SearchCriteria))
                {
                    var filter = request.SearchCriteria;
                    query = query.Where(r => r.Name.Contains(filter));
                }

                var roles = await query.ToPagedResult(request);
                var data = _mapper.Map<List<Role>>(roles.Data);

                return new PagedRequestResult<Role>
                {
                    Page = request.Page,
                    PageCount = (int)Math.Ceiling(roles.RowCount / (double)request.PageSize),
                    RowCount = roles.RowCount,
                    PageSize = request.PageSize,
                    Data = data
                };
            }
        }

        public async Task<PagedRequestResult<User>> GetPagedUsers(UserSearchRequest userSearchRequest)
        {
            Contract.Requires(userSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _userRepository.AsQueryable();

                if (userSearchRequest.RoleIds?.Count > 0)
                {
                    query = query.Where(r => userSearchRequest.RoleIds.Contains(r.RoleId));
                }

                if (userSearchRequest.Permissions?.Count > 0)
                {
                    var requestedPermissions = userSearchRequest.Permissions;
                    query = query.Where(r =>
                        r.Role.Permissions.Any(p => requestedPermissions.Contains(p.Name)) ||
                        r.UserPermission2.Any(up => requestedPermissions.Contains(up.Permission.Name))
                    );
                }

                if (userSearchRequest.UserType.HasValue)
                {
                    var userType = userSearchRequest.UserType.Value;
                    if (userType == Contracts.Enums.UserTypeEnum.Internal)
                    {
                        query = query.Where(r => r.IsInternalUser);
                    }
                    else if (userType == Contracts.Enums.UserTypeEnum.External)
                    {
                        query = query.Where(r => !r.IsInternalUser);
                    }
                }

                if (!string.IsNullOrEmpty(userSearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = userSearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.Email.Contains(filter) || r.DisplayName.Contains(filter) || r.UserName.Contains(filter));
                }

                var users = await query.ToPagedResult(userSearchRequest.PagedRequest);

                await _userRepository.LoadAsync(users.Data, r => r.Role);

                var data = _mapper.Map<List<User>>(users.Data);

                return new PagedRequestResult<User>
                {
                    Page = userSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(users.RowCount / (double)userSearchRequest.PagedRequest.PageSize),
                    RowCount = users.RowCount,
                    PageSize = userSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task<Role> GetRole(int roleId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _roleRepository.FirstOrDefaultAsync(u => u.Id == roleId);
                return _mapper.Map<Role>(entity);
            }
        }
    }
}