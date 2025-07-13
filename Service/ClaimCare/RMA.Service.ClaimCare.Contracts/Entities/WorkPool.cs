using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class WorkPool : AuditDetails
    {
        public int CaseId { get; set; } // CaseId
        public string ClaimUniqueReference { get; set; } // ClaimNumber (length: 50)
        public int ClaimTypeId { get; set; } // ClaimTypeId
        public int? ClaimStatusId { get; set; } // ClaimStatusId
        public int? PolicyId { get; set; } // PolicyId
        public int? PaymentId { get; set; } // PaymentId
        public decimal? TotalBenefitAmount { get; set; } // TotalBenefitAmount
        public int? AssignedToUserId { get; set; } // AssignedToUserId
        public WorkPoolEnum? WorkPoolEnum { get; set; } // WorkPoolId
        public int? UserId { get; set; } // UserId
        public string UserEmail { get; set; } // UserId
        //public int WorkItemId { get; set; } // WorkItemId / ClaimId
        public DateTime? StartDateAndTime { get; set; } // StartDateAndTime
        public DateTime? EndDateAndTime { get; set; } // EndDateAndTime
        public TimeSpan? UserSLA { get; set; }
        public TimeSpan? OverAllSLA { get; set; }
        public int? ClaimId { get; set; }
        public string UserName { get; set; }
        public string LifeAssured { get; set; }
        public DateTime? DateCreated { get; set; }
        public string ClaimStatus { get; set; }
        public int NUserSLA { get; set; }
        public int NOverAllSLA { get; set; }
        public string LastWorkedOn { get; set; }
        public string UserSLAHours { get; set; }
        public string OverAllSLAHours { get; set; }
        public int WizardUserId { get; set; }
        public string WizardURL { get; set; }
        public string PolicyNumber { get; set; }
        public PolicyStatusEnum? PolicyStatus { get; set; }
        public int PolicyBrokerId { get; set; }

        public string ClaimStatusDisplayName { get; set; }
        public string ClaimStatusDisplayDescription { get; set; }
        public int? LastWorkedOnUserId { get; set; }
        public int InsuredLifeId { get; set; }

        //ENUM => ID Conversions
        public int? PolicyStatusId
        {
            get => (int?)PolicyStatus;
            set => PolicyStatus = (PolicyStatusEnum?)value;
        }

        public int? WorkPoolId
        {
            get => (int?)WorkPoolEnum;
            set => WorkPoolEnum = (WorkPoolEnum?)value;
        }

        public int? WizardId { get; set; }
        public string PersonEventReference { get; set; }
        public string EventCreatedBy { get; set; }
        public int PersonEventId { get; set; }
        public int EventCreatedById { get; set; }
        public int? PersonEventAssignedTo { get; set; }

        public string CancelledReason { get; set; }
    }

}