using System;

namespace RMA.Service.Integrations.Contracts.Entities
{
    public class EuropAssistClaimDetails
    {
        public string ClaimantName { get; set; }
        public string ClaimantSurname { get; set; }
        public string ClaimantContactNumber { get; set; }
        public string ClaimantEmail { get; set; }

        public string PolicyNumber { get; set; }
        public string PolicyHolderName { get; set; }
        public string PolicyHolderSurname { get; set; }
        public string PolicyHolderIdNumber { get; set; }
        public string PolicyHolderContactNumber { get; set; }
        public string PolicyHolderEmail { get; set; }
        public string PolicyStatus { get; set; }

        public string DeceasedName { get; set; }
        public string DeceasedSurname { get; set; }
        public string DeceasedIdNumber { get; set; }
        public DateTime DeceasedDateOfDeath { get; set; }
        public DateTime DeceasedDateOfBirth { get; set; }

        public string ClaimNumber { get; set; }
        public bool IsInterested { get; set; }
        public string ClaimStatus { get; set; }
        public int ClaimStatusId { get; set; }
    }
}