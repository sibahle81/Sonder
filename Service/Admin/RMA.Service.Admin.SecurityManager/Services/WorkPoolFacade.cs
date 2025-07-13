using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class WorkPoolFacade : RemotingStatelessService, IWorkPoolService
    {
        private const string IndividualAssessorPool = "Individual Assessor pool";
        private const string SecondAssessorPool = "Second Approver pool";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_WorkPoolUser> _workPoolUserRepository;
        private readonly IRepository<security_User> _userRepository;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_Permission> _permissionRepository;
        private readonly IPermissionService _permissionService;
        private readonly IMapper _mapper;

        public WorkPoolFacade(StatelessServiceContext context, IDbContextScopeFactory dbContextScopeFactory,
            IRepository<security_WorkPoolUser> workPoolUserRepository, IRepository<security_Permission> permissionRepository,
            IRepository<security_User> userRepository, IRepository<security_Role> roleRepository,
            IPermissionService permissionService, IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _workPoolUserRepository = workPoolUserRepository;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _permissionRepository = permissionRepository;
            _permissionService = permissionService;
            _mapper = mapper;
        }

        public Task<List<WorkPool>> Get()
        {
            var result = RMA.Common.Extensions.EnumHelper.EnumToList(typeof(WorkPoolEnum));
            return Task.FromResult(_mapper.Map<List<WorkPool>>(result));
        }

        public Task<List<User>> GetUsers()
        {
            throw new NotImplementedException();
        }

        public async Task<List<WorkPoolsModel>> GetWorkPoolsForUser(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (from workPoolUser in _workPoolUserRepository
                                    where workPoolUser.UserId == userId
                                    select new WorkPoolsModel()
                                    {
                                        WorkPool = workPoolUser.WorkPool,
                                        UserId = workPoolUser.UserId,
                                        IsPoolSuperUser = workPoolUser.IsPoolSuperUser,
                                    })
                    .ToListAsync();

                return result;
            }
        }

        public async Task<bool> IsUserInWorkPool(int? userId, WorkPoolEnum workPool)
        {
            return Common.Security.RmaIdentity.HasClaim(workPool.DisplayAttributeValue());
        }

        public async Task<List<WorkPoolsModel>> GetUsersForWorkPool(WorkPoolEnum workPool, string roleName, int userId)
        {
            Contract.Requires(!string.IsNullOrEmpty(roleName));
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (roleName == "Claims Assessor")
                {
                    return await (from workPoolUser in _workPoolUserRepository
                                  join user in _userRepository
                                      on workPoolUser.UserId equals user.Id
                                  where workPoolUser.WorkPool == workPool && workPoolUser.UserId == userId
                                  select new WorkPoolsModel()
                                  {
                                      WorkPool = workPoolUser.WorkPool,
                                      UserName = user.DisplayName,
                                      UserId = workPoolUser.UserId,
                                      UserEmail = user.Email,
                                      IsPoolSuperUser = workPoolUser.IsPoolSuperUser
                                  }).OrderBy(r => r.UserName)
                         .ToListAsync();
                }
                else if (roleName.Contains("Medical")
                    || roleName == MedicalUsersConstants.clinicalClaimsAdjudicator
                    || roleName == MedicalUsersConstants.clinicalClaimsAdjudicatorManager
                    || roleName == MedicalUsersConstants.managedCareAndDisabilityManager
                    || roleName == MedicalUsersConstants.rehabilitationManager
                    || roleName == MedicalUsersConstants.rehabilitationPractitioner
                    || roleName == MedicalUsersConstants.socialWorker
                    || roleName == MedicalUsersConstants.teamLeaderCaseManager
                    || roleName == MedicalUsersConstants.teamLeaderPMCA
                    )
                {
                    return await (from user in _userRepository
                                  join role in _roleRepository
                                      on user.RoleId equals role.Id
                                  where role.Name.Contains(roleName)
                                  select new WorkPoolsModel()
                                  {
                                      WorkPool = WorkPoolEnum.Medicalpool,
                                      UserName = user.DisplayName,
                                      UserId = user.Id,
                                      UserEmail = user.Email,
                                      IsPoolSuperUser = false
                                  }).OrderBy(r => r.UserName)
                    .ToListAsync();

                }

                var result = await (from workPoolUser in _workPoolUserRepository
                                    join user in _userRepository
                                        on workPoolUser.UserId equals user.Id
                                    where workPoolUser.WorkPool == workPool
                                    select new WorkPoolsModel()
                                    {
                                        WorkPool = workPoolUser.WorkPool,
                                        UserName = user.DisplayName,
                                        UserId = workPoolUser.UserId,
                                        UserEmail = user.Email,
                                        IsPoolSuperUser = workPoolUser.IsPoolSuperUser
                                    }).OrderBy(r => r.UserName)
                    .ToListAsync();

                return result;
            }
        }

        public async Task<List<WorkPoolsModel>> GetAllWorkPoolUsersByIds(List<int> userIds)
        {
            Contract.Requires(userIds != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = new List<WorkPoolsModel>();
                var InvestigationPool = WorkPoolEnum.Investigationpool.DisplayAttributeValue();
                foreach (var user in userIds)
                {
                    var userExist = await _permissionRepository
                    .Where(p => p.Users.Any(u => u.Id == user) && (p.Name == IndividualAssessorPool || p.Name == SecondAssessorPool || p.Name == InvestigationPool)).AnyAsync();

                    if (userExist)
                    {
                        WorkPoolsModel workPoolsModel = new WorkPoolsModel();
                        workPoolsModel.UserId = user;
                        workPoolsModel.WorkPool = WorkPoolEnum.IndividualAssessorpool;
                        result.Add(workPoolsModel);
                    }
                }

                return result;
            }
        }
        public async Task<bool> RoleHasPermission(int roleId, List<string> permissions)
        {
            Contract.Requires(permissions != null);
            bool hasPermission = false;
            var rolePermission = await _permissionService.GetRolePermissions(roleId);
            permissions.ForEach(permission =>
            {
                if (rolePermission.Any(permissiom => permissiom.Name.Equals(permission)))
                {
                    hasPermission = true;
                }

            });
            return hasPermission;
        }

    }
}