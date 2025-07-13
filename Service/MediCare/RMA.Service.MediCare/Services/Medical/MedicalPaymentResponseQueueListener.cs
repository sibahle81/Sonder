using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class MedicalPaymentResponseQueueListener : ServiceBusQueueStatelessService<PaymentResponseModel>, IMedicalPaymentResponseQueueListener
    {
        private readonly IInvoiceCommonService _invoiceCommonService;
        private readonly IUserService _userService;

        public const string QueueName = "mcc.med.paymentresponse";

        public MedicalPaymentResponseQueueListener(StatelessServiceContext serviceContext,
            IInvoiceCommonService invoiceCommonService,
            IUserService userService
            ) : base(serviceContext, QueueName)
        {
            _invoiceCommonService = invoiceCommonService;
            _userService = userService;
        }

        public override async Task ReceiveMessageAsync(PaymentResponseModel payment, CancellationToken cancellationToken)
        {
            Contract.Requires(payment != null);

            try
            {
                await ImpersonateUser(payment.ImpersonateUser);

                switch (payment.PaymentType)
                {
                    case PaymentTypeEnum.MedicalInvoice:
                        await _invoiceCommonService.UpdateMedicalInvoicePaymentStatus(payment.PaymentStatus, payment.PaymentId);
                        break;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"InvoicePaymentResponseReceiveMessageAsync: PaymentId = {payment.PaymentId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                var userInfo = await _userService.GetUserImpersonationInfo(!string.IsNullOrEmpty(username) ? username : SystemSettings.SystemUserAccount);
                userInfo.SetRemotingContext();

                if (string.IsNullOrEmpty(username))
                {
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