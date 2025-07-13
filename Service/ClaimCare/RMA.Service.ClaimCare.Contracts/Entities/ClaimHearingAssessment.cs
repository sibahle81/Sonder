using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimHearingAssessment
    {
        public int HearingAssessmentId { get; set; } // HearingAssessmentId (Primary key)
        public int RolePlayerId { get; set; } // RolePlayerId
        public System.DateTime AssessmentDate { get; set; } // AssessmentDate
        public int AssessedByUserId { get; set; } // AssessedByUserId
        public string AssessedByName { get; set; } // AssessedByName (length: 50)
        public string Description { get; set; } // Description (length: 150)
        public int HearingAssessmentTypeId { get; set; } // HearingAssessmentTypeId
        public int? PersonEventId { get; set; } // PersonEventId
        public decimal? PercentageHl { get; set; } // PercentageHL
        public decimal? BaselinePhl { get; set; } // BaselinePHL
        public bool IsActive { get; set; } // IsActive
        public string CalcOperands { get; set; } // CalcOperands (length: 250)
        public decimal? BaselineAudiogram { get; set; } // BaselineAudiogram
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public List<ClaimAudioGramItem> AudioGramItems { get; set; } // AudioGramItem.FK_AudioGramItem_HearingAssessment

        public ClaimHearingAssessmentType HearingAssessmentType { get; set; } // FK_HearingAssessment_HearingAssessmentType
    }
}
