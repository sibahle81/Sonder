namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PdAward
    {
        public int PdAwardId { get; set; } // PDAwardId (Primary key)
        public int ClaimId { get; set; } // ClaimId
        public int PayeeId { get; set; } // PayeeId
        public int MedicalAssessmentId { get; set; } // MedicalAssessmentId
        public int AwardStatusId { get; set; } // AwardStatusId
        public decimal AwardPercentage { get; set; } // AwardPercentage
        public decimal AwardAmount { get; set; } // AwardAmount
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public ClaimInvoice ClaimInvoice { get; set; }

    }
}
