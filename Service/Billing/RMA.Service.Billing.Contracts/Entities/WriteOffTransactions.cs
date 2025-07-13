namespace RMA.Service.Billing.Contracts.Entities
{
    public class WriteOffTransactions
    {
        public int TransactionId { get; set; }
        public int WriteOffAmount { get; set; }
        public int RoleplayerId { get; set; }

    }
}
