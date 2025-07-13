using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class LiabilityDecision : AuditDetails
    {
        public int CaseId { get; set; } // CaseId
        public int LiabilityDecisionTypeId { get; set; } // LiabilityDecisionTypeId
        public int ReasonTypeId { get; set; } // ReasonTypeId
        public string Approver { get; set; } // Approver (length: 50)
        public DateTime Date { get; set; } // Date
        public Case Case { get; set; }
    }
}