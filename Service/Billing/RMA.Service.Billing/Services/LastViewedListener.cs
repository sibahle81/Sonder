using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Audit.Database.Entities;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using RMA.Common.Entities;
using RMA.Service.Audit.Contracts.Interfaces;

namespace RMA.Service.Audit.Services
{
    public class LastViewedListener : ServiceBusQueueStatelessService<LastViewedEntry>, ILastViewedListener
    {
        public const string QueueName = "mcc.audit.lastviewed";
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<audit_LastViewed> _lastViewedRepository;

        public LastViewedListener(StatelessServiceContext serviceContext, IDbContextScopeFactory dbContextScopeFactory,
            IRepository<audit_LastViewed> lastViewedRepository)
            : base(serviceContext, QueueName)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _lastViewedRepository = lastViewedRepository;
        }

        public override async Task ReceiveMessageAsync(LastViewedEntry message, CancellationToken cancellationToken)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                _lastViewedRepository.Create(new audit_LastViewed
                {
                    ItemId = message.ItemId,
                    ItemType = message.ItemType,
                    Username = message.Username ?? message.ImpersonateUser,
                    Date = message.Date
                });
                await scope.SaveChangesAsync(cancellationToken);
            }
        }

        protected override Task ImpersonateUser(string username)
        {
            throw new System.NotImplementedException();
        }
    }
}
