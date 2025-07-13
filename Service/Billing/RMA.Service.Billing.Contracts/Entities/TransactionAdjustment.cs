namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionAdjustment
    {
        public int TransactionId { get; set; }
        public decimal AdjustmentAmount { get; set; }
        public int RoleplayerId { get; set; }
        public bool IsUpwardAdjustment { get; set; } = true;
    }
}
