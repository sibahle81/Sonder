using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class StmDash : AuditDetails
    {
        public List<StmOverview> StmOverviews { get; set; }
        public int SuspiciousCount { get; set; }
        public int NotSuspiciousCount { get; set; }
    }
}