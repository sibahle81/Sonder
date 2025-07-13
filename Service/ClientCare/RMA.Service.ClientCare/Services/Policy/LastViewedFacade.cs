using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using ILastViewedService = RMA.Service.ClientCare.Contracts.Interfaces.Policy.ILastViewedService;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class LastViewedFacade : RemotingStatelessService, ILastViewedService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly ILastViewedV1Service _lastViewedService;
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _roleplayerService;
        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public LastViewedFacade(StatelessServiceContext serviceContext
            , IDbContextScopeFactory dbContextScopeFactory
            , IPolicyService policyService, IRolePlayerService roleplayerService, ILastViewedV1Service lastViewedService,
            IConfigurationService configurationService) : base(serviceContext)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyService = policyService;
            _roleplayerService = roleplayerService;
            _lastViewedService = lastViewedService;
            _configurationService = configurationService;
        }

        public async Task<List<Contracts.Entities.Policy.Policy>> GetLastViewedPolicies()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.Create())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(typeof(policy_Policy).Name);
                var ids = lastViewedItems
                    .Select(lastViewedItem => lastViewedItem.ItemId)
                    .ToList();

                var policies = await _policyService.GetPoliciesByIds(ids);
                policies.ForEach(policy =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == policy.PolicyId);
                    if (lastViewedItem != null) policy.ModifiedDate = lastViewedItem.Date;
                });

                foreach (var policy in policies)
                {
                    policy.ClientName = (await _roleplayerService.GetRolePlayer(policy.PolicyOwnerId)).DisplayName;
                }

                return policies;
            }
        }

        private async Task<List<LastViewedItem>> GetLastViewedItemsForUser(string itemTypeName)
        {
            string user = RmaIdentity.Username;

            var detail = await _lastViewedService.GetLastViewedItemsForUser(user, itemTypeName, 5);
            return detail
                .Select(n => new LastViewedItem()
                {
                    Id = n.Id,
                    ItemId = n.ItemId,
                    Date = n.Date,
                    User = n.Username
                }).ToList();
        }
    }
}