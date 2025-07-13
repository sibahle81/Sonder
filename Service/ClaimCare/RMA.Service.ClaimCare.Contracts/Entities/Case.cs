using RMA.Common.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Case : AuditDetails
    {
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 50)
        public int EventId { get; set; } // EventId
        public int AllocatedUserId { get; set; } // AllocatedUserId (length: 10)
        public int InsuredLifeId { get; set; } // InsuredLifeId
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public string PassportNumber { get; set; } // PassportNumber (length: 50)
        public string Nationality { get; set; } // Nationality (length: 50)
        public string FirstName { get; set; } // FirstName (length: 50)
        public string LastName { get; set; } // LastName (length: 50)
        public DateTime DateOfBirth { get; set; }
        public Event Event { get; set; }
        public List<CaseClientCover> CaseClientCovers { get; set; }
        public List<LiabilityDecision> LiabilityDecisions { get; set; }
        public Verification Verifications { get; set; }
    }
}