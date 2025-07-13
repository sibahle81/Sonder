using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Verification : AuditDetails
    {
        public int CaseId { get; set; } // CaseId
        public int VerificationTypeId { get; set; } // VerificationTypeId
        public bool? Result { get; set; } // Result
        public string Input { get; set; } // Input
        public string Output { get; set; } // Output
        public string RequestedBy { get; set; } // RequestedBy (length: 50)
        public DateTime RequestedDate { get; set; } // RequestedDate
        public DateTime? CompletedDate { get; set; } // CompletedDate
        public Case Case { get; set; }
    }
}