using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRequirementCategory
    {
        public int ClaimRequirementCategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsManuallyAdded { get; set; }
        public bool IsManuallyClosed { get; set; }
        public bool IsBlockClaimChangeMacroStatus { get; set; }
        public bool IsBlockClaimChangeStatus { get; set; }
        public bool IsBlockClaimChangeLiabilityStatus { get; set; }
        public bool IsMemberVisible { get; set; }
        public bool IsOutstandingReason { get; set; }
        public bool IsPersonEventRequirement { get; set; }
        public bool IsAssurerVisible { get; set; }
        public bool IsBlockCloseClaim { get; set; }
        public string Code { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public DocumentTypeEnum? DocumentType { get; set; }
        public DocumentSetEnum? DocumentSet { get; set; }
    }
}