using RMA.Service.ClaimCare.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PreAuthClaim
    {
        public PreAuthClaim()
        {
            //Resolves the error: Enum value '0' is invalid for type 'RMA.Service.ClaimCare.Contracts.Enums.ClaimStatusEnum' and cannot be serialized
            //when returning new PreAuthClaim();
            ClaimStatus = ClaimStatusEnum.New;
        }
        public int ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int PersonEventId { get; set; }
        public int EventId { get; set; }
        public int? PolicyId { get; set; }
        public string ClaimLiabilityStatus { get; set; }
        public ClaimStatusEnum ClaimStatus { get; set; }
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
