namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorAccountNumberModel
    {
        public int RolePlayerId { get; set; }
        public string FinPayeNumber { get; set; }
        public string RmaBankAccountNumber { get; set; }
        public string DisplayName { get; set; }
    }
}
