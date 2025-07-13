namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PayoutResponse
    {
        public string Message { get; set; }
        public string StatusCode { get; set; }
        public string UserReference { get; set; }
        public BankFacsConfirmation BankFacsConfirmation { get; set; }
    }

    public class BankFacsConfirmation
    {
        public string TransactionType { get; set; }
        public string DocumentType { get; set; }
        public string Reference1 { get; set; }
        public string Reference2 { get; set; }
        public string Amount { get; set; }
        public string ActionDate { get; set; }
        public string RequisitionNumber { get; set; }
        public string DocumentNumber { get; set; }
        public string AgencyPrefix { get; set; }
        public string AgencyNumber { get; set; }
        public string DepositType { get; set; }
        public string ChequeClearanceCode { get; set; }
        public string ChequeNumber { get; set; }
        public string BankAccountNumber { get; set; }
        public string UniqueUserCode { get; set; }
        public string ErrorCode { get; set; }
        public string CheckSum { get; set; }
    }
}