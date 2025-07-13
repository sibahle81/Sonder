using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Referral
    {
        public int ReferralId { get; set; }
        public string ReferralReferenceNumber { get; set; }
        public int SourceModuleTypeId { get; set; }
        public ReferralTypeEnum ReferralType { get; set; }
        public int ReferralNatureOfQueryId { get; set; }
        public ReferralItemTypeEnum? ReferralItemType { get; set; }
        public long? ItemId { get; set; }
        public string LinkUrl { get; set; }
        public string Comment { get; set; }
        public ReferralStatusEnum ReferralStatus { get; set; }
        public bool IsDeleted { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public int? ReferralPerformanceRatingId { get; set; }
        public int? TargetModuleTypeId { get; set; }
        public int? AssignedByUserId { get; set; }
        public int? AssignedToRoleId { get; set; }
        public int? AssignedToUserId { get; set; }
        public string ReferralItemTypeReference { get; set; }

        public ReferralNatureOfQuery ReferralNatureOfQuery { get; set; }
        public ReferralPerformanceRating ReferralPerformanceRating { get; set; }
        public List<ReferralFeedback> ReferralFeedbacks { get; set; }
        public List<ReferralStatusChangeAudit> ReferralStatusChangeAudits { get; set; }

    }
}