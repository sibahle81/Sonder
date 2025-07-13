using RMA.Common.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BundleRaise
    {
        public int BundleRaiseId { get; set; } // BundleRaiseId (Primary key)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public decimal Premium { get; set; } // Premium
        public int PolicyId { get; set; } // PolicyId
        public int InitialInvoiceId { get; set; } // InitialInvoiceId
        public DateTime ApprovalDate { get; set; } // ApprovalDate
        public string ApprovedBy { get; set; } // ApprovedBy (length: 50)
        public List<Note> BundleRaiseNotes { get; set; }
        public List<Policy> Policies { get; set; }
    }
}
