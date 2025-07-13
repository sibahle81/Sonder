using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchBatchInvoiceQueueListener : ServiceBusQueueStatelessService<SwitchBatchInvoiceMessage>, ISwitchBatchInvoiceQueueListener
    {
        private readonly IInvoiceMedicalSwitchService _invoiceMedicalSwitchService;
        private readonly IUserService _userService;

        public const string QueueName = "mcc.med.switchbatchinvoice";

        public SwitchBatchInvoiceQueueListener(StatelessServiceContext serviceContext,
            IInvoiceMedicalSwitchService invoiceMedicalSwitchService,
            IUserService userService)
            : base(serviceContext, QueueName)
        {
            _invoiceMedicalSwitchService = invoiceMedicalSwitchService;
            _userService = userService;
        }

        public override async Task ReceiveMessageAsync(SwitchBatchInvoiceMessage message, CancellationToken cancellationToken)
        {
            try
            {
                await ImpersonateUser(message?.ImpersonateUser);
                await _invoiceMedicalSwitchService.ValidateSwitchBatchInvoice(message.SwitchBatchInvoiceId);
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
