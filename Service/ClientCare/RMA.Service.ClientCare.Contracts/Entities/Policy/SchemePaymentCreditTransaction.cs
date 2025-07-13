namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class SchemePaymentCreditTransaction
    {
        public int TransactionId { get; set; }
        public decimal Amount { get; set; }
        public System.DateTime TransactionDate { get; set; }
        public string RmaReference { get; set; }
        public decimal RunningBalance { get; set; }

        public string BankReference { get; set; }
    }
}
