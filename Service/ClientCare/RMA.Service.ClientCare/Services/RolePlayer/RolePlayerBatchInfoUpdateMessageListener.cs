using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class RolePlayerBatchInfoUpdateMessageListener : ServiceBusQueueStatelessService<RolePlayerBatchInfoUpdate>, IRolePlayerBatchInfoUpdateMessageListener
    {
        private readonly IRolePlayerService _rolePlayerService;
        public const string QueueName = "mcc.cda.idnumbervalidation";

        public RolePlayerBatchInfoUpdateMessageListener(StatelessServiceContext serviceContext,
            IRolePlayerService rolePlayerService) : base(serviceContext, QueueName)
        {
            _rolePlayerService = rolePlayerService;
        }

        public override async Task ReceiveMessageAsync(RolePlayerBatchInfoUpdate rolePlayerBatchInfoUpdate, CancellationToken cancellationToken)
        {
            Contract.Requires(rolePlayerBatchInfoUpdate != null);
            await _rolePlayerService.ProcessRolePlayerBatchInfoUpdate(rolePlayerBatchInfoUpdate);
        }

        protected override Task ImpersonateUser(string username)
        {
            throw new NotImplementedException();
        }
    }
}
