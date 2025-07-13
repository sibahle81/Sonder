using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class CollectionQueueListener : ServiceBusQueueStatelessService<CollectionMessage>, ICollectionQueueListener
    {
        private readonly ICollectionService _collectionService;
        private readonly IUserService _userService;

        public const string QueueName = "mcc.fin.collections";

        public CollectionQueueListener(StatelessServiceContext serviceContext,
            ICollectionService collectionService,
            IUserService userService)
            : base(serviceContext, QueueName)
        {
            _collectionService = collectionService;
            _userService = userService;
        }

        public override async Task ReceiveMessageAsync(CollectionMessage message, CancellationToken cancellationToken)
        {
            try
            {
                await ImpersonateUser(message?.ImpersonateUser);
                await _collectionService.SubmitCollection(message);
            }
            catch (Exception ex)
            {
                // Do not try to re-submit collection automatically if an error occurs. Rather let re-submission be controlled by field in collection table.
                ex.LogException();
            }
        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                // This process should not affect message processing
                var userInfo = await _userService.GetUserImpersonationInfo(!string.IsNullOrEmpty(username)
                    ? username
                    : SystemSettings.SystemUserAccount);
                userInfo.SetRemotingContext();

                if (string.IsNullOrEmpty(username))
                {
                    // Lets insert the supermagic claim here because we impersonated the system user
                    RemotingContext.SetData($"{RemotingContext.Keys.Count() + 1}_permission", "SuperMagicSecretClaim");
                }
            }
            catch (TechnicalException ex)
            {
                ex.LogException();
            }
        }
    }
}
