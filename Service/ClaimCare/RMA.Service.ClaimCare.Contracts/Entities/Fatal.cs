using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Fatal : AuditDetails
    {
        public int DeathTypeId { get; set; } // DeathTypeId
        public int CauseOfDeathId { get; set; } // CauseOfDeathId
        public DateTime DateOfDeath { get; set; } // DateOfDeath
        public bool IsInterviewWithFamilyMemberCompleted { get; set; } // IsInterviewWithFamilyMemberCompleted
        public bool IsOpinionOfMedicalPractitionerReceived { get; set; } // IsOpinionOfMedicalPractitionerReceived
        public int ClaimId { get; set; }
        public string DHAReferenceNumber { get; set; }
        public string DeathCertificateReferenceNumber { get; set; }
        public string RegionOfDeath { get; set; }
        public int PlaceOfDeathId { get; set; }
    }
}