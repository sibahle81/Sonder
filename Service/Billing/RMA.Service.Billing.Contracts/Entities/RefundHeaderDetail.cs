using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class RefundHeaderDetail
    {
        public int RefundHeaderDetailId { get; set; } // RefundHeaderDetailId (Primary key)
        public int RefundHeaderId { get; set; } // RefundHeaderId
        public int? TransactionId { get; set; } // TransactionId
        public decimal TotalAmount { get; set; } // TotalAmount
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? PolicyId { get; set; } 
        public string FromAccountNumber { get; set; } 
        public string ToAccountNumber { get; set; } 
        public int? ProductId { get; set; } 
        public ProductCategoryTypeEnum? ProductCategoryType { get; set; } 
        public int? CompanyNumber { get; set; }
        public int? BranchNumber { get; set; } 

    }
}
