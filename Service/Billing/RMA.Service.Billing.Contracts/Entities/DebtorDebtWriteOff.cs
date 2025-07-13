namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorDebtWriteOff
    {
        public BadDebtWriteOffRequest BadDebtWriteOffRequest { get; set; }
        public string FinpayeNumber { get; set; }
        public int RoleplayerId { get; set; }
    }
}
