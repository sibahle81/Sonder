
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitCoverMemberType
    {
        public int BenefitCoverMemberTypeId { get; set; } // BenefitCoverMemberTypeId (Primary key)
        public DateTime StartDate { get; set; } // StartDate
        public DateTime? EndDate { get; set; } // EndDate
        public int BenefitId { get; set; } // BenefitId
        public CoverMemberTypeEnum CoverMemberType { get; set; } // CoverMemberTypeId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate      
    }
}