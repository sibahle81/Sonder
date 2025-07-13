using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Invoice
    {
        public int InvoiceId { get; set; } // InvoiceId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public System.DateTime CollectionDate { get; set; } // CollectionDate
        public decimal TotalInvoiceAmount { get; set; } // TotalInvoiceAmount
        public InvoiceStatusEnum InvoiceStatus { get; set; } // InvoiceStatusId
        public string InvoiceNumber { get; set; } // InvoiceNumber (length: 50)
        public System.DateTime InvoiceDate { get; set; } // InvoiceDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public DateTime? NotificationDate { get; set; }
        public SourceModuleEnum? SourceModule { get; set; } // SourceModuleId
        public SourceProcessEnum? SourceProcess { get; set; } // SourceProcessId

        public List<InvoiceLineItem> InvoiceLineItems { get; set; } // InvoiceLineItems.FK_InvoiceLineItems_Invoice
        public List<Transaction> Transactions { get; set; } // Transactions.FK_Transactions_Invoice

        public decimal Balance { get; set; }

        public string Reason { get; set; }

        public int ? LinkedInvoiceId { get; set; }
    }
}
