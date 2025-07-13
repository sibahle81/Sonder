using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimPool
    {
        public int? UnderwriterId { get; set; }
        public int? PdPercentage { get; set; }
        public string Instruction { get; set; }
        public int? ClaimId { get; set; }
        public int EventId { get; set; }
        public int PersonEventId { get; set; }
        public string ClaimNumber { get; set; }
        public string PersonEventReference { get; set; }
        public EventTypeEnum EventType { get; set; }
        public int? AssignedTo { get; set; }
        public ClaimStatusEnum? ClaimStatus { get; set; }
        public ClaimLiabilityStatusEnum? LiabilityStatus { get; set; }
        public string DiseaseDescription { get; set; }
        public DateTime? DateCreated { get; set; }
        public string Priority { get; set; }
        public string InsuredLife { get; set; }
        public string IdentificationNumber { get; set; }
        public string PersonEventCreatedBy { get; set; }
        public string LastModifiedBy { get; set; }
        public InjurySeverityTypeEnum InjuryType { get; set; }
        public string EmployeeNumber { get; set; }
        public string EmployeeIndustryNumber { get; set; }
        public int? LastWorkedOnUserId { get; set; }
        public bool IsTopEmployer { get; set; }
        public bool Included { get; set; }
        public string CompanyName { get; set; }
        public string CompanyReferenceNumber { get; set; }
        public int BucketClassId { get; set; }
        public int? STPExitReason { get; set; }
        public string STPExitReasonDescription { get; set; }
        public string UserName { get; set; }
        public int? UserId { get; set; }
        public string Application { get; set; }
        public bool? InvestigationRequired { get; set; }
        public int IsFatal { get; set; }
        public int EmployerRolePlayerId { get; set; }
        public int EmployeeRolePlayerId { get; set; }
}
}