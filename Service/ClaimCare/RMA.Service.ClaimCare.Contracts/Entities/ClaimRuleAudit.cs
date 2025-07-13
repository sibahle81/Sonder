namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRuleAudit
    {
        public int ClaimRuleAuditId { get; set; } // ClaimRuleAuditId (Primary key)
        public int ClaimId { get; set; } // ClaimId
        public string Reason { get; set; } // Reason
        public bool IsResolved { get; set; } // IsResolved
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
