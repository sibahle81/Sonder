using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CadPool : AuditDetails
    {
        public int PersonEventId { get; set; }
        public int? UserId { get; set; }
        public string ClaimNumber { get; set; }
        public string Description { get; set; }
        public string EventNumber { get; set; }
        public DateTime? DateCreated { get; set; }
        public string LifeAssured { get; set; }
        public int PersonEventStatusId { get; set; }
        public string PersonEventStatusName { get; set; }
        public string IdentificationNumber { get; set; }
        public string PersonEventCreatedBy { get; set; }
        public string UserName { get; set; }
        public string NUserSLA { get; set; }
        public string UserSLAHours { get; set; }
        public string OverAllSLAHours { get; set; }
        public string LastModifiedBy { get; set; }
        public string PersonEventAssignedTo { get; set; }
        public string BucketClassName { get; set; }
        public ClaimTypeEnum? ClaimTypeName { get; set; }
        public IndustryClassEnum? IndustryClassName { get; set; }
        public bool IsRoadAccident { get; set; }
        public STPExitReasonEnum? STPExitReason { get; set; }
        public string Priority { get; set; }
        public string Application { get; set; }
        public int? ClaimId { get; set; }
        public int WizardUserId { get; set; }

        public WorkPoolEnum? WorkPoolEnum { get; set; } // WorkPoolId

        public int? WorkPoolId
        {
            get => (int?)WorkPoolEnum;
            set => WorkPoolEnum = (WorkPoolEnum)value;
        }

        public int? WizardId { get; set; }
        public string PersonEventReference { get; set; }

        public string ClaimStatusDisplayName { get; set; }
        public string ClaimStatusDisplayDescription { get; set; }
        public string ClaimStatus { get; set; }
        public int? ClaimStatusId { get; set; } // ClaimStatusId
        public string LastWorkedOn { get; set; }
        public int? LastWorkedOnUserId { get; set; }
        public int? DiseaseTypeID { get; set; }
        public string DiseaseDescription { get; set; }
        public ClaimLiabilityStatusEnum LiabilityStatus { get; set; }
        public EventTypeEnum EventType { get; set; }
        public bool IsTopEmployer { get; set; }
    }
}