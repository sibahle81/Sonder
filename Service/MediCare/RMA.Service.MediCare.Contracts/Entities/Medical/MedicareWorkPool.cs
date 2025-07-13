using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicareWorkPool
    {
        public int? PreAuthId { get; set; }
        public int? HealthCareProviderId { get; set; }
        public int? RequestingHealthCareProviderId { get; set; }
        public int PersonEventId { get; set; }
        public int? ClaimId { get; set; }
        public string PreAuthNumber { get; set; }
        public PreAuthTypeEnum? PreAuthType { get; set; }
        public PreAuthStatusEnum? PreAuthStatus { get; set; }
        public int? InvoiceId { get; set; }
        public int? AssignedTo { get; set; }
        public int? LastWorkedOnUserId { get; set; }
        public string Instruction { get; set; }
        public int WorkPoolId { get; set; }
        public int? UserId { get; set; }
        public string UserName { get; set; }
        public string ClaimNumber { get; set; }
        public int? EventId { get; set; }
        public int? ClaimStatus { get; set; }
        public int? LiabilityStatus { get; set; }
        public string PersonEventReference { get; set; }
        public PoolWorkFlowItemTypeEnum PoolWorkFlowItemType { get; set; }
        public DateTime? DateCreated { get; set; }
    }
}
