using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class UnpaidInvoice
    {
        public string ControlNumber { get; set; }
        public string ControlName { get; set; }
        public int Year { get; set; }
        public string Period { get; set; }
        public string AccountNumber { get; set; }
        public string DebtorName { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime CollectionDate { get; set; }
        public decimal? TotalInvoiceAmount { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
        public System.DateTime InvoiceDate { get; set; }
        public int UnderwritingYear { get; set; }
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public DateTime? NotificationDate { get; set; }
        public int CollectionDays { get; set; }
        public int DaysSinceInvoice { get; set; }
        public decimal? InvoiceBalance { get; set; }
    }
}
