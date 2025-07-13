using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class PermissionGroupFacade : RemotingStatelessService, IPermissionGroupService
    {
        private readonly IRepository<security_PermissionGroup> _permissionGroupRepository;
        private readonly IRepository<security_Permission> _permissionRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IPermissionService _permissionService;
        private readonly IMapper _mapper;

        public PermissionGroupFacade(IRepository<security_PermissionGroup> permissionGroupRepository, IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context, IRepository<security_Permission> permissionRepository, IPermissionService permissionService, IMapper mapper) : base(context)
        {
            _permissionGroupRepository = permissionGroupRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _permissionRepository = permissionRepository;
            _permissionService = permissionService;
            _mapper = mapper;
        }
        public async Task<PermissionGroup> GetPermissionGroupByGroupId(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var group = await _permissionGroupRepository.FirstOrDefaultAsync(x => x.Id == id);
                await _permissionGroupRepository.LoadAsync(group, c => c.Permissions);
                var permissionGroups = _mapper.Map<PermissionGroup>(group);
                return permissionGroups;
            }
        }

        public async Task<List<PermissionGroup>> GetPermissionGroups(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var groups = await _permissionGroupRepository.ToListAsync();
                await _permissionGroupRepository.LoadAsync(groups, c => c.Permissions);
                var ungrouppedPermissions = _permissionRepository.Where(c => c.PermissionGroupId == null).ToList();

                var defaultPermissionGroup = groups.Where(c => c.Name.Equals("Default Not Grouped", StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
                defaultPermissionGroup.Permissions = ungrouppedPermissions;

                var permissionGroups = _mapper.Map<List<PermissionGroup>>(groups);

                if (userId > 0)
                {
                    var userPermissionOverrides = await _permissionService.GetUserPermissionsOverride(null, userId, false);
                    if (userPermissionOverrides.Any())
                        foreach (var permissionGroup in permissionGroups)
                        {
                            foreach (var permission in permissionGroup.Permissions)
                            {
                                permission.IsActive = true;

                                var matchingUserOverride = userPermissionOverrides.Find(_ => _.PermissionId == permission.Id);
                                if (matchingUserOverride != null)
                                {
                                    permission.OverridesRolePermission = true;
                                    permission.IsActive = matchingUserOverride.IsActive;
                                }
                            }
                        }
                }

                return permissionGroups;
            }
        }

        public async Task<List<PermissionGroup>> GetPermissionGroupsOnly()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var groups = await _permissionGroupRepository.ToListAsync();
                return _mapper.Map<List<PermissionGroup>>(groups);
            }
        }
    }
}
