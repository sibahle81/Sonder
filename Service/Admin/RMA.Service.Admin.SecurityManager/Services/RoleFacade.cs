using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class RoleFacade : RemotingStatelessService, IRoleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_Permission> _permissionRepository;
        private readonly IAuditWriter _securityAuditWriter;
        private readonly IRepository<security_Tenant> _tenantRepository;
        private readonly IConfigurationService _configurationService;
        private const string UserModulePermissions = "UserModulePermissionCheck";
        private readonly IMapper _mapper;

        public RoleFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_Role> roleRepository,
            IRepository<security_Tenant> tenantRepository,
            IAuditWriter securityAuditWriter, IRepository<security_Permission> permissionRepository
            , IConfigurationService configurationService, IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _roleRepository = roleRepository;
            _tenantRepository = tenantRepository;
            _securityAuditWriter = securityAuditWriter;
            _permissionRepository = permissionRepository;
            _configurationService = configurationService;
            _mapper = mapper;
        }

        public async Task<int> AddRole(Role role)
        {
            Contract.Requires(role != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(UserModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddRole);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<security_Role>(role);
                if (entity.SecurityRank == null)
                {
                    entity.SecurityRank = 1;
                }

                var permissions = new List<security_Permission>();
                if (role.PermissionIds != null)
                {
                    permissions = await _permissionRepository.Where(a => role.PermissionIds.Contains(a.Id)).ToListAsync();
                }

                entity.Permissions = permissions;

                _roleRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                role.Id = entity.Id;

                await _securityAuditWriter.AddLastViewed<security_Role>(role.Id);
                return entity.Id;
            }
        }

        public async Task EditRole(Role role)
        {
            Contract.Requires(role != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(UserModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditRole);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _roleRepository.FindByIdAsync(role.Id);
                await _roleRepository.LoadAsync(entity, e => e.Permissions);

                entity.Name = role.Name;
                var keepPermissions = entity.Permissions;


                var mappedRole = _mapper.Map<security_Role>(role);
                mappedRole.Permissions = await _permissionRepository.Where(a => role.PermissionIds.Contains(a.Id)).ToListAsync();
                var permissions = new List<security_Permission>();
                var removePermissions = mappedRole.Permissions.ToList();
                foreach (var permission in mappedRole.Permissions)
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

                entity.Permissions = permissions;
                _roleRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _securityAuditWriter.AddLastViewed<security_Role>(role.Id);
            }
        }

        public async Task<Role> GetRole(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _roleRepository
                    .SingleAsync(s => s.Id == id, $"Could not find a role with the id {id}");
                await _roleRepository.LoadAsync(entity, r => r.Permissions);

                var role = _mapper.Map<Role>(entity);
                role.PermissionIds = entity.Permissions.Select(a => a.Id).ToList();
                await _securityAuditWriter.AddLastViewed<security_Role>(id);
                return role;
            }
        }

        public async Task<string> GetRoleName(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _roleRepository
                    .Where(s => s.Id == id)
                    .Select(r => r.Name)
                    .FirstOrDefaultAsync();
                return entity;
            }
        }

        public async Task<List<Role>> GetRoles()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roles = await _roleRepository
                    .Where(role => role.IsActive && !role.IsDeleted)
                    //.ProjectTo<Role>()
                    .ToListAsync();

                return _mapper.Map<List<Role>>(roles);
            }
        }

        public async Task<List<Role>> GetRolesById(List<int> ids)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roles = await _roleRepository
                    .Where(role => ids.Contains(role.Id))
                    //.ProjectTo<Role>()
                    .ToListAsync();

                return _mapper.Map<List<Role>>(roles);
            }
        }

        public async Task<List<Role>> SearchRoles(string query)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roles = await _roleRepository
                    .Where(user => user.IsActive && !user.IsDeleted
                                   && user.Name.Contains(query))
                    //.ProjectTo<Role>()
                    .ToListAsync();

                return _mapper.Map<List<Role>>(roles);
            }
        }


        public async Task<Role> GetRoleByName(string roleName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var role = await _roleRepository
                    .Where(t => t.IsActive && !t.IsDeleted
                                && t.Name == roleName)
                    //.ProjectTo<Role>()
                    .FirstOrDefaultAsync();

                return _mapper.Map<Role>(role);
            }
        }

        public async Task<List<Role>> GetRolesByNames(List<string> roleNames)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var role = await _roleRepository
                    .Where(t => t.IsActive && !t.IsDeleted
                                && roleNames.Contains(t.Name))
                    //.ProjectTo<Role>()
                    .ToListAsync();

                return _mapper.Map<List<Role>>(role);
            }
        }

        public async Task<List<Role>> GetRolesByPermission(string permission)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roles = await _roleRepository
                    .Where(r => r.Permissions.Any(p => permission.Equals(p.Name)))
                    .ToListAsync();

                return _mapper.Map<List<Role>>(roles);
            }

        }

        public async Task<List<Role>> GetCDABrokerRoles()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var role = await _roleRepository
                    .Where(t => t.IsActive
                                && t.Name.StartsWith("CDA"))
                    .ToListAsync();

                return _mapper.Map<List<Role>>(role);
            }
        }
    }
}