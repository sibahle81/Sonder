using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.Audit.Database.Entities;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;

namespace RMA.Service.Audit.Services
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    public class LastViewedV1Facade : RemotingStatelessService, ILastViewedV1Service
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<audit_LastViewed> _lastViewedRepository;

        public LastViewedV1Facade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory,
            IRepository<audit_LastViewed> lastViewedRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _lastViewedRepository = lastViewedRepository;
        }

        public async Task<LastViewedResult> GetLastViewed(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewed = await _lastViewedRepository.SingleAsync(d => d.Id == id, $"Last viewed with id {id} could not be found.");
                return new LastViewedResult(lastViewed.Id,
                    lastViewed.ItemId,
                    lastViewed.ItemType,
                    lastViewed.Date,
                    lastViewed.Username);
            }
        }

        public async Task<List<LastViewedResult>> GetLastViewedByType(string itemTypeName, int itemId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var dbItems = await _lastViewedRepository.Where(a => a.ItemType == itemTypeName && a.ItemId == itemId).GroupBy(a => new { a.ItemId, a.ItemType, a.Username })
                    .Select(a => new {Id = a.Max(b => b.Id), group = a.Key, Date = a.Max(b => b.Date)}).ToListAsync();

                var result = new List<LastViewedResult>();
                foreach (var lastViewed in dbItems)
                {
                    result.Add(new LastViewedResult(
                        lastViewed.Id,
                        lastViewed.group.ItemId,
                        lastViewed.group.ItemType,
                        lastViewed.Date,
                        lastViewed.group.Username));
                }

                return result;
            }
        }

        public async Task<List<LastViewedResult>> GetLastViewedItemsForUser(string user, string itemTypeName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var dbItems = await _lastViewedRepository.Where(a => a.ItemType == itemTypeName && a.Username == user).ToListAsync();

                var result = new List<LastViewedResult>();
                foreach (var lastViewed in dbItems)
                {
                    result.Add(new LastViewedResult(lastViewed.Id,
                        lastViewed.ItemId,
                        lastViewed.ItemType,
                        lastViewed.Date,
                        lastViewed.Username));
                }

                return result;
            }
        }
    }
}
