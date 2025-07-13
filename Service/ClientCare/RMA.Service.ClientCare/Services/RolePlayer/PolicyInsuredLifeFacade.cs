using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class PolicyInsuredLifeFacade : RemotingStatelessService, IPolicyInsuredLifeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_PolicyInsuredLife> _policyInsuredLifeRepository;
        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public PolicyInsuredLifeFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<policy_PolicyInsuredLife> policyInsuredLifeRepository,
            IConfigurationService configurationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyInsuredLifeRepository = policyInsuredLifeRepository;
            _configurationService = configurationService;
        }

        public async Task<List<PolicyInsuredLife>> GetPolicyInsuredLives(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuredLives = await _policyInsuredLifeRepository
                    .Where(pil => pil.PolicyId == policyId)
                    .ToListAsync();
                return Mapper.Map<List<PolicyInsuredLife>>(insuredLives);
            }
        }

        public async Task<List<PolicyInsuredLife>> GetPolicyInsuredLivesForPolicyOwners(List<int> policyIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuredLives = await _policyInsuredLifeRepository
                    .Where(pil => policyIds.Contains(pil.PolicyId) && pil.RolePlayerTypeId == (int)RolePlayerTypeEnum.PolicyOwner)
                    .ToListAsync();
                return Mapper.Map<List<PolicyInsuredLife>>(insuredLives);
            }
        }
        public async Task<PolicyInsuredLife> GetPolicyInsuredForPolicyOwner(int policyId, int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuredLive = _policyInsuredLifeRepository
                    .FirstOrDefault(pil => pil.PolicyId == policyId
                    && pil.RolePlayerTypeId == (int)RolePlayerTypeEnum.PolicyOwner
                    && pil.RolePlayerId == rolePlayerId);

                return Mapper.Map<PolicyInsuredLife>(insuredLive);
            }
        }



        public async Task<bool> IsPolicyMainMember(int policyId, int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var isMainMember = _policyInsuredLifeRepository
                    .Any(pil => pil.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf && pil.RolePlayerId == rolePlayerId && pil.PolicyId == policyId);

                return await Task.FromResult(isMainMember);
            }
        }

        public async Task<int> GetPolicyMainMember(int policyId, int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = await _policyInsuredLifeRepository
                    .FirstOrDefaultAsync(pil => pil.PolicyId == policyId
                                                && pil.RolePlayerId == rolePlayerId
                                                && pil.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf);

                return rolePlayer.RolePlayerId;
            }
        }
    }
}
