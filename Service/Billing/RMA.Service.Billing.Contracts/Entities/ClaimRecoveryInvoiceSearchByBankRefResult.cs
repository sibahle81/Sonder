namespace RMA.Service.Billing.Contracts.Entities
{
    public class ClaimRecoveryInvoiceSearchByBankRefResult
    {
        public int ClaimRecoveryInvoiceId { get; set; }
        public int ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string FinPayeNumber { get; set; }
        public int RolePlayerId { get; set; }
    }
}
