using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class RegenerateInvoiceNonFinancialsBusListener : ServiceBusQueueStatelessService<InvoiceNonFinancialReGenBusMessage>, IRegenerateInvoiceNonFinancialsBusListener
    {
        public const string QueueName = "mcc.bill.regenerateinvoicenonfinancials";
        private readonly IUserService _userService;
        private readonly IInvoiceService _invoiceService;


        public RegenerateInvoiceNonFinancialsBusListener(StatelessServiceContext serviceContext, IUserService userService, IInvoiceService invoiceService) : base(serviceContext, QueueName)
        {
            _userService = userService;
            _invoiceService = invoiceService;
        }

        public override async Task ReceiveMessageAsync(InvoiceNonFinancialReGenBusMessage message, CancellationToken cancellationToken)
        {
            try
            {
                Contract.Requires(message != null);
                if (message != null)
                {
                    await ImpersonateUser(message.ImpersonateUser);
                    await _invoiceService.RegenerateInvoiceNonFinancials(message);
                }

            }
            catch (Exception ex)
            {
                ex.LogException();
                throw;
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
