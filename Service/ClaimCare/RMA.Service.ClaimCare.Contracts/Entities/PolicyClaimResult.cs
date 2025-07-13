using RMA.Common.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PolicyClaimResult : AuditDetails
    {
        public int ClaimId { get; set; } // ClaimId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public string ClaimReferenceNumber { get; set; } // ClaimReferenceNumber (length: 50)
        public ClaimStatusEnum ClaimStatus { get; set; } // ClaimStatusId
        public System.DateTime? ClaimStatusChangeDate { get; set; }
        public int PolicyId { get; set; } // PolicyId
        public new string CreatedBy { get; set; } // CreatedBy (length: 50)
        public new System.DateTime CreatedDate { get; set; } // CreatedDate
        public new string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public new System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public DateTime PersonEventDeathDate { get; set; } // ModifiedDate
        public int policyCount { get; set; }

        //ENUM => ID Conversions
        public int ClaimStatusId
        {
            get => (int)ClaimStatus;
            set => ClaimStatus = (ClaimStatusEnum)value;
        }

    }
}