using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoicePaymentAllocation
    {
        public int InvoiceId { get; set; }
        public string PolicyNumber { get; set; }
        public System.DateTime CollectionDate { get; set; }
        public System.DateTime InvoiceDate { get; set; }
        public decimal TotalInvoiceAmount { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
        public string InvoiceNumber { get; set; }
        public string DisplayName { get; set; }
        public decimal AmountOutstanding { get; set; }
        public bool IsClaimRecoveryInvoice { get; set; }
    }
}
