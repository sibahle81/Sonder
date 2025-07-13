namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermArrangementSubsidiary
    {
        public string DebtorName { get; set; }
        public int RoleplayerId { get; set; }
        public decimal Balance { get; set; }
        public string FinpayeeNumber { get; set; }
    }
}
