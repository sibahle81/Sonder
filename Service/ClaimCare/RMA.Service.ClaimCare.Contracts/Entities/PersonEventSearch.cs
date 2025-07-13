using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;


namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventSearch
    {
        public int PersonEventNumber { get; set; }
        public string PersonEventReferenceNumber { get; set; }
        public PersonEventStatusEnum PersonEventStatus { get; set; }
        public string ClaimNumber { get; set; }
        public int? ClaimId { get; set; }
        public int EventId { get; set; }
        public EventTypeEnum EventType { get; set; }
        public string MemberNumber { get; set; }
        public string MemberName { get; set; }
        public string IdentificationNumber { get; set; }
        public string InsuredLife { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? MedicalReportForm { get; set; }
        public bool IsStraightThroughProcess { get; set; }
        public SuspiciousTransactionStatusEnum SuspiciousTransactionStatus { get; set; }
        public ClaimStatusEnum? ClaimStatus { get; set; }
        public ClaimLiabilityStatusEnum? ClaimLiabilityStatus { get; set; }
        public STPExitReasonEnum? STPExitReason { get; set; }
        public string STPDescription { get; set; }
        public string EventNumber { get; set; }
        public DateTime Dob { get; set; }
        public string EmployeeNumber { get; set; }
        public string EmployeeIndustryNumber { get; set; }
        public DateTime EventDate { get; set; }
        public int EmployerRolePlayerId { get; set; }
        public int EmployeeRolePlayerId { get; set; }
    }
}
