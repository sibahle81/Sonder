using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class MedicalInvoiceClaim
    {
        public int ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int PersonEventId { get; set; }
        public int EventId { get; set; }
        public string ClaimLiabilityStatus { get; set; }
        public bool IsPensionCase { get; set; }
        public string PensionCaseNumber { get; set; }
        public string PersonName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public string EmployerName { get; set; }
        public string IndustryNumber { get; set; }
        public string ClaimContactNo { get; set; }
        public string PreAuthContactNo { get; set; }
        public int EventTypeId { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public bool IsAlive { get; set; }
        public bool? IsStp { get; set; }
    }
}
