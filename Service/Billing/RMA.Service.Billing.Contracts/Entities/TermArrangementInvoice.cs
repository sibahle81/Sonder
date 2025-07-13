using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermArrangementInvoice
    {
        public int TermArrangementInvoiceId { get; set; } // TermArrangementScheduleId
        public int TermArrangementId { get; set; } // TermArrangementId
        public int InvoiceId { get; set; }
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
