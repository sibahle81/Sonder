using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Client
{
    public class LeadUploadMessageQueueListener : ServiceBusQueueStatelessService<LeadUploadServiceBusMessage>, ILeadUploadServiceBusListener
    {
        public const string QueueName = "mcc.clc.createlead";

        private readonly IUserService _userService;
        private readonly ILeadService _leadService;

        public LeadUploadMessageQueueListener(
            StatelessServiceContext serviceContext,
            IUserService userService,
            ILeadService leadService)
            : base(serviceContext, QueueName)
        {
            _userService = userService;
            _leadService = leadService;
        }

        public override async Task ReceiveMessageAsync(LeadUploadServiceBusMessage message, CancellationToken cancellationToken)
        {
            try
            {
                if (message != null)
                {
                    await ImpersonateUser(message.ImpersonateUser);
                    await _leadService.CreateNewLead(message.LeadModel);
                }
            }
            catch (Exception ex)
            {
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

