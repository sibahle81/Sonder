using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Client;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Client
{
    public class LastViewedFacade : RemotingStatelessService, ILastViewedService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<broker_Brokerage> _brokerages;
        private readonly IRepository<broker_Representative> _brokers;
        private readonly IRepository<client_RolePlayer> _rolePlayers;
        private readonly ILastViewedV1Service _lastViewedService;
        private readonly IConfigurationService _configurationService;

        public LastViewedFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<broker_Representative> brokers,
            IRepository<broker_Brokerage> brokerages, IRepository<client_RolePlayer> rolePlayers, ILastViewedV1Service lastViewedService,
            IConfigurationService configurationService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _brokers = brokers;
            _brokerages = brokerages;
            _rolePlayers = rolePlayers;
            _lastViewedService = lastViewedService;
            _configurationService = configurationService;
        }

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public async Task<List<Contracts.Entities.RolePlayer.RolePlayer>> GetLastViewedClients()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(typeof(client_RolePlayer).Name);
                var ids = lastViewedItems
                    .Select(lastViewedItem => lastViewedItem.ItemId)
                    .ToList();

                var rolePlayers = await _rolePlayers
                    .Where(r => ids.Contains(r.RolePlayerId) && !r.IsDeleted)
                    .ToListAsync();
                var mappedRolePlayers = Mapper.Map<List<Contracts.Entities.RolePlayer.RolePlayer>>(rolePlayers);

                mappedRolePlayers.ForEach(r =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == r.RolePlayerId);
                    if (lastViewedItem != null) r.ModifiedDate = lastViewedItem.Date;
                });

                return mappedRolePlayers.OrderByDescending(r => r.ModifiedDate).ToList();
            }
        }

        public async Task<List<Brokerage>> GetLastViewedBrokerages(bool isBinderPartner)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(typeof(broker_Brokerage).Name);
                var ids = lastViewedItems
                    .Select(lastViewedItem => lastViewedItem.ItemId)
                    .ToList();

                var brokerageType = !isBinderPartner ? BrokerageTypeEnum.Brokerage : BrokerageTypeEnum.BinderPartner;
                var brokerages = await _brokerages
                    .Where(brokerage => ids.Contains(brokerage.Id) && brokerage.IsActive && brokerage.BrokerageType == brokerageType)
                    .ToListAsync();
                var mappedBrokerages = Mapper.Map<List<Brokerage>>(brokerages);

                mappedBrokerages.ForEach(brokerage =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == brokerage.Id);
                    if (lastViewedItem != null) brokerage.ModifiedDate = lastViewedItem.Date;
                });

                return mappedBrokerages.OrderByDescending(brokerage => brokerage.ModifiedDate).ToList();
            }
        }

        public async Task<List<Representative>> GetLastViewedRepresentatives()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(typeof(broker_Representative).Name);
                var ids = lastViewedItems
                    .Select(lastViewedItem => lastViewedItem.ItemId)
                    .ToList();

                var entities = await _brokers
                    .Where(broker => ids.Contains(broker.Id))
                    .ToListAsync();
                var brokers = Mapper.Map<List<Representative>>(entities);

                brokers.ForEach(broker =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == broker.Id);
                    if (lastViewedItem != null) broker.ModifiedDate = lastViewedItem.Date;
                });

                return brokers.OrderByDescending(agent => agent.ModifiedDate).ToList();
            }
        }

        private async Task<List<LastViewedItem>> GetLastViewedItemsForUser(string itemType)
        {
            string user = RmaIdentity.Username;

            var detail = await _lastViewedService.GetLastViewedItemsForUser(user, itemType, 5);
            return detail
                .Select(n => new LastViewedItem()
                {
                    ItemId = n.ItemId,
                    Date = n.Date
                }).ToList();
        }
    }
}