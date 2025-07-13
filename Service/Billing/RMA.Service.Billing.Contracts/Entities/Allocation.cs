using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Allocation
    {
        public int? UnallocatedPaymentId { get; set; }
        public int? InvoiceId { get; set; }
        public int RolePlayerId { get; set; }
        public decimal Amount { get; set; }
        public TransactionActionType ActionType { get; set; }
        public TransactionTypeEnum TransactionType { get; set; }
        public int? TransactionId { get; set; }
    }
}
