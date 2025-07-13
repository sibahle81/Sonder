using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class PermissionFacade : RemotingStatelessService, IPermissionService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_Permission> _permissionRepository;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_User> _userRepository;
        private readonly IRepository<security_RolePermissionFfl> _rolePermissionFflRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<security_UserPermission2> _userPermissionRepository;
        private readonly IMapper _mapper;

        private const string SoftDeleteFilter = "SoftDeletes";
        private const string UserModulePermissions = "UserModulePermissionCheck";

        public PermissionFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_Permission> permissionRepository, IRepository<security_Role> roleRepository, IRepository<security_User> userRepository, IConfigurationService configurationService,
            IRepository<security_RolePermissionFfl> rolePermissionFflRepository,
            IRepository<security_UserPermission2> userPermissionRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _permissionRepository = permissionRepository;
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _configurationService = configurationService;
            _rolePermissionFflRepository = rolePermissionFflRepository;
            _userPermissionRepository = userPermissionRepository;
            _mapper = mapper;
        }

        public async Task<List<Permission>> GetPermissions()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _permissionRepository
                    .Where(role => role.IsActive && !role.IsDeleted)
                    .ProjectTo<Permission>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
        }

        public async Task<List<Permission>> GetRolePermissions(int roleId)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!permissionChangeFFL)
                {
                    List<ICollection<security_Permission>> permissions = await _roleRepository
                       .Where(r => r.Id == roleId)
                       .Select(rp => rp.Permissions)
                       .AtLeastOneAsync("No Permissions found for Role");

                    return permissions.First().Select(rp => new Permission
                    {
                        Id = rp.Id,
                        Name = rp.Name,
                        IsActive = true
                    }).ToList();
                }
                else
                {
                    var rolePermissions = await _rolePermissionFflRepository
                       .Where(r => r.RoleId == roleId)
                       .Select(rp => rp.PermissionId)
                       .AtLeastOneAsync("No Permissions found for Role");

                    var permissions = await GetPermissions();

                    permissions.RemoveAll(_ => !rolePermissions.Contains(_.Id));

                    return permissions;
                }
            }

        }

        public async Task<Permission> GetPermissionByName(string permissionName)
        {
            if (string.IsNullOrWhiteSpace(permissionName))
                throw new ArgumentNullException("permissionName");

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var permission = await _permissionRepository
                    .Where(_ => _.Name == permissionName).FirstOrDefaultAsync();

                return _mapper.Map<Permission>(permission);
            }

        }

        public async Task<List<Permission>> GetUserPermissions(string userToken, int userId, bool isActiveOnly)
        {
            var permissionChangeFFL = await _configurationService.IsFeatureFlagSettingEnabled("RefactorPermissionImplementation");

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!permissionChangeFFL)
                {
                    var guidToken = Guid.Parse(userToken);


                    using (_dbContextScopeFactory.CreateReadOnly())
                    {
                        List<ICollection<security_Permission>> permissions = await _userRepository
                            .Where(r => r.Token == guidToken)
                            .Select(rp => rp.Permissions)
                            .AtLeastOneAsync("No Permissions found for User Token");

                        return permissions.First().Select(rp => new Permission
                        {
                            Id = rp.Id,
                            Name = rp.Name
                        }).ToList();
                    }

                }
                else// this is the consolidated permissions list between the Role permission for the user and the useroverride table called UserPermission2
                {
                    var useToken = !string.IsNullOrWhiteSpace(userToken);
                    var guidToken = new Guid();

                    if (useToken)
                        guidToken = Guid.Parse(userToken);

                    var userRoleUserPermissions = await _userRepository.
                    Where(u => (useToken && u.Token == guidToken) || (userId > 0 && u.Id == userId)).Select(_ => new userRoleUserPermission() { RoleId = _.RoleId, UserPermissions = _.UserPermission2.ToList() }).FirstOrDefaultAsync();

                    var rolePermissions = new List<Permission>();
                    if (userRoleUserPermissions?.RoleId > 0)
                    {
                        rolePermissions = await GetRolePermissions(userRoleUserPermissions.RoleId).ConfigureAwait(false);
                    }

                    var permissions = await GetPermissions();
                    var userPermissions = new List<security_UserPermission2>();
                    if (permissions?.Count > 0 && userRoleUserPermissions?.UserPermissions != null)
                    {
                        userPermissions = userRoleUserPermissions.UserPermissions;
                    }

                    //delete from userpermission if it matches rolepermission as this is a "duplicate"
                    foreach (var rolePermission in rolePermissions)
                    {
                        userPermissions.RemoveAll(_ => _.PermissionId == rolePermission.Id && _.IsActive);
                    }

                    foreach (var userPermission in userPermissions)
                    {
                        var matchingPermission = permissions.FirstOrDefault(p => p.Id == userPermission.PermissionId);

                        if (matchingPermission != null)
                        {
                            matchingPermission.OverridesRolePermission = true;
                            matchingPermission.IsActive = userPermission.IsActive;

                            rolePermissions.RemoveAll(_ => _.Id == matchingPermission.Id);
                            rolePermissions.Add(matchingPermission);
                        }
                    }

                    if (isActiveOnly)
                        rolePermissions.RemoveAll(_ => !_.IsActive);

                    if (permissions == null || !permissions.Any())
                        throw new BusinessException("No Permissions found for User Token");

                    return rolePermissions;
                }
            }
        }

        public async Task<List<UserPermission>> GetUserPermissionsOverride(string userToken, int userId, bool includeSoftDeletedRecords)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var useToken = !string.IsNullOrWhiteSpace(userToken);
                var guidToken = new Guid();

                if (useToken)
                    guidToken = Guid.Parse(userToken);

                if (includeSoftDeletedRecords)
                    _userRepository.DisableFilter(SoftDeleteFilter);

                var userPermissions = await _userRepository.
                Where(u => (useToken && u.Token == guidToken) || (userId > 0 && u.Id == userId)).Select(_ => _.UserPermission2.ToList()).FirstOrDefaultAsync();

                if (includeSoftDeletedRecords)
                    _userRepository.EnableFilter(SoftDeleteFilter);

                return _mapper.Map<List<UserPermission>>(userPermissions);

            }
        }

        public async Task UpdateUserPermissionsOverride(int userId, List<UserPermission> userPermissionOverrides)
        {
            Contract.Requires(userPermissionOverrides != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(UserModulePermissions))
                RmaIdentity.DemandPermission(Permissions.UpdateUser);

            if (userId == 0) return;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var currentPermissionOverride = await GetUserPermissionsOverride(null, userId, true);
                foreach (var permissionOverride in userPermissionOverrides)
                {
                    if (currentPermissionOverride == null ||
                            (currentPermissionOverride != null && !currentPermissionOverride.Equals(permissionOverride)))
                        await _userPermissionRepository.ExecuteSqlCommandAsync(DatabaseConstants.InsertUpdateUserPermissions,
                        new SqlParameter("@UserId", userId),
                        new SqlParameter("@PermissionId", permissionOverride.PermissionId),
                        new SqlParameter("@IsActive", permissionOverride.IsActive),
                        new SqlParameter("@IsDeleted", permissionOverride.IsDeleted),
                        new SqlParameter("@ModifiedBy", RmaIdentity.UsernameOrBlank)
                        );
                }
            }
        }


        private class userRoleUserPermission
        {
            public int RoleId { get; set; }
            public List<security_UserPermission2> UserPermissions { get; set; }
        }

    }
}