using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentMessage : ServiceBusMessageBase
    {
        public int PaymentId { get; set; }
        public string BatchReference { get; set; }
        public bool SentRemittance { get; set; }

    }
}
