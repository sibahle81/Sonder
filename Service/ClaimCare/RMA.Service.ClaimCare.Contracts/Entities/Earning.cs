using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Earning
    {
        public int EarningId { get; set; } // EarningId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public decimal? VariableSubTotal { get; set; } // VariableSubTotal
        public decimal? NonVariableSubTotal { get; set; } // NonVariableSubTotal
        public decimal? Total { get; set; } // Total
        public bool IsVerified { get; set; } // IsVerified
        public bool IsEstimated { get; set; } // IsEstimated
        public EarningsTypeEnum EarningsType { get; set; } // EarningsTypeId
        public string Sec51EmpNo { get; set; } // Sec51EmpNo (length: 255)
        public System.DateTime? Sec51DateOfQualification { get; set; } // Sec51DateOfQualification
        public System.DateTime? Sec51DateOfEngagement { get; set; } // Sec51DateOfEngagement
        public System.DateTime? Sec51DateOfBirth { get; set; } // Sec51DateOfBirth

        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }

        public List<EarningDetail> EarningDetails { get; set; }
    }
}
