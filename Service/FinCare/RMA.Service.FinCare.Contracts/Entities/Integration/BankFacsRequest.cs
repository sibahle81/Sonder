using System;

namespace RMA.Service.FinCare.Contracts.Entities.Integration
{
    [Serializable]
    public class BankFACSRequest
    {
        public string transactionType { get; set; }
        public string documentType { get; set; }
        public string reference1 { get; set; }
        public string reference2 { get; set; }
        public string code1 { get; set; }
        public string code2 { get; set; }
        public string amount { get; set; }
        public int processingOption1 { get; set; }
        public int processingOption2 { get; set; }
        public string clientName { get; set; }
        public string clientBankAccountNumber { get; set; }
        public string clientBankAccountType { get; set; }
        public string clientBranchCode { get; set; }
        public string bankAccountNumber { get; set; }
        public string actionDate { get; set; }
        public int fediIndicator { get; set; }
        public string checkSum { get; set; }
    }

    public class PayoutRequest
    {
        public PayoutRequest()
        {
            bankFACSRequest = new BankFACSRequest();
        }

        public BankFACSRequest bankFACSRequest { get; set; }
    }
}