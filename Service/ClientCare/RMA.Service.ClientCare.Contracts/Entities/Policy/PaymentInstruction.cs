namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PaymentInstruction
    {
        public int RecordIdentifier { get; set; }
        public string FromBankBranchCode { get; set; }
        public string FromBankAccountNumber { get; set; }
        public string SequenceNumber { get; set; }
        public string ToBankBranchCode { get; set; }
        public string ToBankAccountNumber { get; set; }
        public int AccountType { get; set; }
        public decimal Amount { get; set; }
        public string TransactionReference { get; set; }
        public string BrokerAccountName { get; set; }
        public string NonStandardAccountNumber { get; set; }
        public decimal RetentionAmount { get; set; }

        public PaymentInstruction()
        {
            NonStandardAccountNumber = "00000000000000000000";
        }
    }
}
