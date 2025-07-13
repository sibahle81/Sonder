using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class EligibilityFacade : RemotingStatelessService, IEligibilityService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _policyInsuredLifeRepository;
        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public EligibilityFacade(StatelessServiceContext context

            , IRepository<policy_Policy> policyRepository
            , IRepository<policy_PolicyInsuredLife> policyInsuredLifeRepository
            , IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService)
            : base(context)
        {
            _policyInsuredLifeRepository = policyInsuredLifeRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _configurationService = configurationService;
        }

        public async Task<List<Contracts.Entities.Policy.Policy>> GetEligiblePolicies(EligiblePolicy eligible)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);
            Contract.Requires(eligible != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyIds = await _policyInsuredLifeRepository.Where(p => p.RolePlayerId == eligible.RolePlayerId).Select(a => a.PolicyId).ToListAsync();

                var policies = await _policyRepository
                    .Where(i => policyIds.Contains(i.PolicyId)
                                && (eligible.ClaimDate >= i.PolicyInceptionDate || i.PolicyStatus == Admin.MasterDataManager.Contracts.Enums.PolicyStatusEnum.FreeCover))
                    .ToListAsync();

                await _policyRepository.LoadAsync(policies, p => p.Benefits);
                await _policyRepository.LoadAsync(policies, p => p.ProductOption);

                policies = policies.Where(a => eligible.EligibleProductIds.Contains(a.ProductOption.ProductId) && a.ProductOption.Id == a.ProductOptionId).ToList();

                return Mapper.Map<List<Contracts.Entities.Policy.Policy>>(policies);
            }
        }
    }
}
