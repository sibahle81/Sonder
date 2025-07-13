using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class UnallocatedBankImportPayment
    {
        public int BankStatementEntryId { get; set; }
        public int UnallocatedPaymentId { get; set; }
        public decimal UnallocatedAmount { get; set; } // UnallocatedAmount
        public string BillingReference { get; set; } // BillingReference (length: 100)
        public DateTime? TransactionDate { get; set; } // TransactionDate (length: 30)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 30)
        public string StatementReference { get; set; } // BillingReference (length: 100)
        public decimal Amount { get; set; }
        public string DocumentType { get; set; }
    }
}
