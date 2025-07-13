
using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ExitReasonOverview
    {
        public int EventTypeId { get; set; }
        public int PersonEventId { get; set; }
        public int? PersonEventBucketClassId { get; set; }
        public bool IsStraightThroughProcess { get; set; }
        public int? VopdResponseId { get; set; }
        public int? VopdStatusId { get; set; }
        public string Reason { get; set; }
        public int ReasonId { get; set; }
        public string IdNumber { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public string Name { get; set; }
        public int? ClaimId { get; set; }
    }
}