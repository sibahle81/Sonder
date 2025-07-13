using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BadDebtReinstate
    {
        public decimal Amount { get; set; }
        public TransactionTypeEnum TransactionType { get; set; }
        public int TransactionId { get; set; }
        public int? InvoiceId { get; set; }
        public string DocumentNumber { get; set; }
        public string Description { get; set; }
    }
}
