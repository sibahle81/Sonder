using RMA.Common.Entities;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class RolePlayerSearchResult : AuditDetails
    {
        public int RolePlayerId { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string IdNumber { get; set; }
        public bool IsAlive { get; set; }
        public System.DateTime? DateOfDeath { get; set; }
        public string DeathCertificateNumber { get; set; }
        public bool IsVopdVerified { get; set; }
        public bool IsStudying { get; set; }
        public bool IsDisabled { get; set; }
        public string CellNumber { get; set; }
        public string EmailAddress { get; set; }
        public string PreferredCommunicationType { get; set; }
        public string Relation { get; set; }
        public int PolicyId { get; set; }
        public int? RolePlayerTypeId { get; set; }
        public int CommunicationTypeId { get; set; }
        public string PolicyNumber { get; set; }
        public string IndustryNumber { get; set; }
        public string EmployeeNumber { get; set; }
        public int ClaimId { get; set; }
        public int ClaimantId { get; set; }
        public int InsuredLifeId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public bool HasClaim { get; set; }
        public string HasClaimStr { get; set; }
        public string PolicyCancelReason { get; set; }
        public string PolicyStatus { get; set; }
    }
}
