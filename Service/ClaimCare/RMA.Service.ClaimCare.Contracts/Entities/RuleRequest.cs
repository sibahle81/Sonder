using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class RuleRequest : AuditDetails
    {
        public int PolicyId { get; set; }
        public int DeceasedId { get; set; }
        public int DeathTypeId { get; set; }
        public DateTime DeathDate { get; set; }
    }
}