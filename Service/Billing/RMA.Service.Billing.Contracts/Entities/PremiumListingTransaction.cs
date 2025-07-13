using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class PremiumListingTransaction : AuditDetails
    {
        public int RolePlayerId { get; set; } // RolePlayerId
        public int? PolicyId { get; set; } // PolicyId
        public System.DateTime? InvoiceDate { get; set; } // InvoiceDate
        public double? InvoiceAmount { get; set; } // InvoiceAmount
        public System.DateTime? PaymentDate { get; set; } // PaymentDate
        public double PaymentAmount { get; set; } // PaymentAmount
        public InvoiceStatusEnum InvoiceStatus { get; set; } // PaymentStatusId
    }
}