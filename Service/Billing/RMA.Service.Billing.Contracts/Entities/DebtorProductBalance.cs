namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorProductBalance
    {
        public string ProductOptionName { get; set; }
        public int ProductOptionId { get; set; }
        public decimal Balance { get; set; }
        public int PolicyId { get; set; }
    }
}
