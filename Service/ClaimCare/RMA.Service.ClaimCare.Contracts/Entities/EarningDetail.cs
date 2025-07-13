using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class EarningDetail
    {

        public int EarningDetailId { get; set; } // EarningDetailId (Primary key)
        public int EarningId { get; set; } // EarningId
        public int EarningTypeId { get; set; } // EarningTypeId
        public virtual EarningType EarningType { get; set; }
        public string OtherDescription { get; set; } // OtherDescription (length: 30)
        public string Month { get; set; } // Month (length: 30)
        public decimal? Amount { get; set; } // Amount

        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }

    }
}
