using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class WorkPool : AuditDetails
    {
        public int RowIndex { get; set; }
        public int? WorkPoolId
        {
            get => (int?)WorkPoolEnum;
            set => WorkPoolEnum = (WorkPoolEnum)value;
        }
        public int? WizardId { get; set; }
        public int? ReferenceId { get; set; }
        public string ReferenceType { get; set; }
        public string ReferenceNumber { get; set; }
        public PreAuthTypeEnum PreAuthType { get; set; }
        public PreAuthStatusEnum PreAuthStatus { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int? AssignedToUserId { get; set; }
        public string AssignedToUser { get; set; }
        public int? AssignedToRoleId { get; set; }
        public string Description { get; set; }
        public WorkPoolEnum? WorkPoolEnum { get; set; }
        public int? UserId { get; set; }
        public string UserEmail { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public TimeSpan? UserSLA { get; set; }
        public TimeSpan? OverAllSLA { get; set; }
        public string UserName { get; set; }
        public DateTime? DateCreated { get; set; }
        public int? NUserSLA { get; set; }
        public int? NOverAllSLA { get; set; }
        public string LastWorkedOn { get; set; }
        public string UserSLAHours { get; set; }
        public string OverAllSLAHours { get; set; }
        public int? WizardUserId { get; set; }
        public string WizardURL { get; set; }
        public int? LastWorkedOnUserId { get; set; }
        public int PersonEventId { get; set; }
        public int? LockedToUserId { get; set; }
        public string LockedToUser { get; set; }
    }
}
