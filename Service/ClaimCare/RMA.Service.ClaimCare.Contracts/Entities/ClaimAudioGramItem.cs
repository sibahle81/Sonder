namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimAudioGramItem
    {
        public int AudioGramItemId { get; set; } // AudioGramItemId (Primary key)
        public int HearingAssessmentId { get; set; } // HearingAssessmentId
        public decimal? Frequency { get; set; } // Frequency
        public decimal? DbLossLeftEar { get; set; } // DBLossLeftEar
        public decimal? DbLossRightEar { get; set; } // DBLossRightEar
        public decimal? PercentageHl { get; set; } // PercentageHL
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

    }
}
