using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CreditTransaction
    {
        public int TransactionId { get; set; }
        public int RolePlayerId { get; set; }
        public decimal Amount { get; set; }
        public decimal Balance { get; set; }
        public System.DateTime TransactionDate { get; set; }
        public string BankReference { get; set; }
        public TransactionTypeEnum TransactionType { get; set; }
        public string RmaReference { get; set; }
        public int? RmaBankAccountId { get; set; }
    }
}
