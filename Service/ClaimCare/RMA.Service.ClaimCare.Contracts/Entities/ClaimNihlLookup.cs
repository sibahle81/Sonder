namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimNihlLookup
    {
        public int NihlLookupId { get; set; } // NIHLLookupId (Primary key)
        public decimal Frequency { get; set; } // Frequency
        public decimal HlWorse { get; set; } // HLWorse
        public decimal HlBetter { get; set; } // HLBetter
        public decimal PercentageHl { get; set; } // PercentageHL
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
