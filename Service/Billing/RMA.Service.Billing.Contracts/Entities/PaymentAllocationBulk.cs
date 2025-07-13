namespace RMA.Service.Billing.Contracts.Entities
{
    public class PaymentAllocationBulk
    {

        public int Id { get; set; } // Id (Primary key)
        public string UserReference { get; set; } // UserReference (length: 200)
        public string DebtorName { get; set; } // DebtorName (length: 50)
        public string InvoiceNumber { get; set; } // InvoiceNumber (length: 50)
        public string PolicyNumber { get; set; } // PolicyNumber (length: 50)
        public string TransactionDate { get; set; } // TransactionDate (length: 50)
        public string StatementDate { get; set; } // StatementDate (length: 50)
        public string HyphenDateProcessed { get; set; } // HyphenDateProcessed (length: 50)
        public string HyphenDateReceived { get; set; } // HyphenDateReceived (length: 50)
        public string Amount { get; set; } // Amount (length: 50)
        public string Amount2 { get; set; } // Amount2 (length: 50)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 50)
        public string UserReference1 { get; set; } // UserReference1 (length: 200)
        public string UserReference2 { get; set; } // UserReference2 (length: 200)
        public string TransactionType { get; set; } // TransactionType (length: 50)
        public string SchemeName { get; set; } // SchemeName (length: 50)
        public string BrokerName { get; set; } // BrokerName (length: 50)
        public string PolicyStatus { get; set; } // PolicyStatus (length: 50)
        public string ClientType { get; set; } // ClientType (length: 50)
        public string AllocationDate { get; set; } // AllocationDate (length: 50)
        public string DebtorNumber { get; set; } // DebtorNumber (length: 50)
        public string Comment { get; set; } // Comment (length: 200)
        public string Allocatable { get; set; } // Allocatable (length: 10)
        public string AllocateTo { get; set; } // AllocateTo (length: 200)
        public int? BulkAllocationFileId { get; set; } // BulkAllocationFileId
        public string Error { get; set; } // Error (length: 500)
        public bool IsDeleted { get; set; } // IsDeleted
        public int? LineProcessingStatusId { get; set; } // LineProcessingStatusId
    }
}
