using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class UnallocatedBankImport
    {

        public int BankStatementEntryId { get; set; }
        public int UnallocatedPaymentId { get; set; }
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 30)
        public decimal Amount { get; set; } // Amount
        public string BillingReference { get; set; } // BillingReference (length: 100)
        public DateTime? TransactionDate { get; set; } // TransactionDate (length: 30)
        public string StatementReference { get; set; } // BillingReference (length: 100)
    }

}
