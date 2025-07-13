namespace RMA.Service.Billing.Contracts.Entities
{
    public class CreditNoteSearchResult
    {
        public int RolePlayerId { get; set; }
        public string CellNumber { get; set; }
        public string EmailAddress { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string IndustryNumber { get; set; }
        public int TransactionId { get; set; }
        public string DocumentReference { get; set; }
        public decimal Amount { get; set; }
        public int? SourceModuleId { get; set; }
        public int? SourceProcessId { get; set; }
        public string FinPayeNumber { get; set; }
    }
}
