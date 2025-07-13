using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class VopdOverview
    {

        public int EventTypeId { get; set; }
        public int? ClaimTypeId { get; set; }
        public int? PersonEventBucketClassId { get; set; }
        public int? InsuranceTypeId { get; set; }
        public bool IsStraightThroughProcess { get; set; }
        public int? VopdResponseId { get; set; }
        public int? VopdStatusId { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public string Reason { get; set; }
        public string DeceasedStatus { get; set; }
        public string VopdSurname { get; set; }
        public int VopdRolePlayerId { get; set; }
        public int IsMatch { get; set; }

        public bool Filter { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }


    }
}