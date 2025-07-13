using RMA.Service.Billing.Contracts.Entities.FileExchange;

namespace RMA.Service.Billing.Contracts.Entities.DataExchange.Import
{
    public class BillingDataExchangeModel : FileExchangeModelBase
    {
        public int Id { get; set; } // Id (Primary key)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 50)
        public string UserReference { get; set; } // UserReference (length: 200)
        public string StatementReference { get; set; } // StatementReference (length: 200)
        public string TransactionDate { get; set; } // TransactionDate (length: 50)
        public string Amount { get; set; } // Amount (length: 50)
        public string Status { get; set; } // Status (length: 50)
        public string UserReference2 { get; set; } // UserReference2 (length: 200)
        public string ReferenceType { get; set; } // ReferenceType (length: 100)
        public string Allocatable { get; set; } // Allocatable (length: 10)
        public string AllocateTo { get; set; } // AllocateTo (length: 200)
        public bool IsDeleted { get; set; }
        public int BulkAllocationFileId { get; set; } // BulkAllocationFileId (Primary key)
        public string Error { get; set; }
        public int PeriodId { get; set; }

    }
}