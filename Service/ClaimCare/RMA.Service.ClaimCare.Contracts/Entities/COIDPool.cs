using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class COIDPool
    {
        public EventTypeEnum EventType { get; set; }
        public string AssignedTo { get; set; }
        public ClaimStatusEnum ClaimStatus { get; set; }
        public ClaimLiabilityStatusEnum LiabilityStatus { get; set; }
        public STPExitReasonEnum? STPExitReason { get; set; }
        public string MemberName { get; set; }
        public string DiseaseDescription { get; set; }
        public DateTime? DateCreated { get; set; }
        public string Priority { get; set; }
        public int PersonEventId { get; set; }
        public string InsuredLife { get; set; }
        public string IdentificationNumber { get; set; }
        public int? UserId { get; set; }
        public string PersonEventCreatedBy { get; set; }
        public string UserName { get; set; }
        public string LastModifiedBy { get; set; }
        public int InjuryType { get; set; }
        public string Application { get; set; }
        public string EmployeeNumber { get; set; }
        public string EmployeeIndustryNumber { get; set; }
        public int? LastWorkedOnUserId { get; set; }
    }
}