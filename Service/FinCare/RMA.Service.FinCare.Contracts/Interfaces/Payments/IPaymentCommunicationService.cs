using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentCommunicationService : IService
    {
        Task<int> SendToPaymentResponseListenerQueue(int paymentId, bool uploadDocument, string queueName);
        Task<int> SendSmsNotification(int paymentId, bool uploadDocument);
        Task<int> SendPaymentRejectionNotification(Payment payment, bool updateNotificationDate);
        Task<bool> SendPaymentNotification(Payment payment, bool updateNotificationDate, string emailAddress);
        Task<int> SendBankStatementReportByEmail(int totalFailedRecord);
        Task<int> SendRejectionNotification(int paymentId, bool uploadDocument);
        Task<bool> SendRemittance(int paymentId);
        Task SendRMAFincareCommissionEmailToBroker(List<string> toEmailAddresses, Dictionary<string, string> ssrsReportParameters);
        Task<int> SendRemittanceExceptionReport();
        Task<int> SendRefundsReport();
        Task<bool> SendAnnuityPaymentRemittance(Payment payment, List<RolePlayerContact> rolePlayerContacts);
    }
}
