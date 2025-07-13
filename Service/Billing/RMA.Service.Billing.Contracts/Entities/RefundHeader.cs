using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class RefundHeader
    {
        public int RefundHeaderId { get; set; } // RefundHeaderId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public decimal HeaderTotalAmount { get; set; } // HeaderTotalAmount
        public string Reference { get; set; } // Reference (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string Reason { get; set; } // Reason
        public RefundStatusEnum? RefundStatus { get; set; }
        public List<RefundHeaderDetail> RefundHeaderDetails { get; set; }

    }
}
