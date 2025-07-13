using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class VopdDash : AuditDetails
    {
        public List<VopdOverview> VopdOverviews { get; set; }
        public int? ProcessingCount { get; set; }
        public int? ProcessedCount { get; set; }
        public int? SuccessfulCount { get; set; }
        public int? UnsuccessfulCount { get; set; }
        public int? Submitted { get; set; }
    }
}