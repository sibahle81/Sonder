using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Database.Entities;
using RMA.Service.Audit.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Services
{
    public class LastViewedFacade : RemotingStatelessService, ILastViewedService
    {
        private readonly ILastViewedV1Service _lastViewedService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<rules_Rule> _ruleRepository;
        private readonly IMapper _mapper;

        public LastViewedFacade(StatelessServiceContext serviceContext
            , ILastViewedV1Service lastViewedService, IDbContextScopeFactory dbContextScopeFactory
            , IRepository<rules_Rule> ruleRepository, IMapper mapper)
            : base(serviceContext)
        {
            _lastViewedService = lastViewedService;
            _dbContextScopeFactory = dbContextScopeFactory;
            _ruleRepository = ruleRepository;
            _mapper = mapper;
        }

        public async Task<List<LastViewedItem>> GetLastViewedItemsForUser(string user, string itemType)
        {
            var detail = await _lastViewedService.GetLastViewedItemsForUser(user, itemType, 5);
            return detail
                .Select(n => new LastViewedItem()
                {
                    ItemId = n.ItemId,
                    Date = n.Date
                }).ToList();
        }

        public async Task<List<Rule>> GetLastViewedRules()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(RmaIdentity.Username, typeof(rules_Rule).Name);
                var ids = lastViewedItems
                    .Select(lastViewedItem => lastViewedItem.ItemId)
                    .ToList();

                var items = await _ruleRepository.Where(n => ids.Contains(n.Id) && n.IsActive && !n.IsDeleted)
                    .ProjectTo<Rule>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                items.ForEach(rule =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == rule.Id);
                    if (lastViewedItem != null) rule.DateViewed = lastViewedItem.Date;
                });

                return items;
            }
        }
    }
}