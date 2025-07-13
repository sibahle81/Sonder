using RMA.Common.Entities;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class QLinkMonthlyPremiumReferenceMessage : ServiceBusMessageBase
    {
        public QlinkMonthlyStatementReference QlinkMonthlyStatementReference { get; set; }
    }

    public class QlinkMonthlyStatementReference
    {
        public string ClaimCheckReference { get; set; }
    }
}
