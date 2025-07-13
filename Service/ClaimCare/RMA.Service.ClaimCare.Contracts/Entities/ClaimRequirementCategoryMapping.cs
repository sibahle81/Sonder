using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRequirementCategoryMapping
    {

        public ClaimRequirementCategoryMapping()
        {
            ClaimRequirementCategory = new ClaimRequirementCategory();
        }

        public int ClaimRequirementCategoryMappingId { get; set; }
        public int ClaimRequirementCategoryId { get; set; }
        public EventTypeEnum EventType { get; set; }
        public int? DiseaseTypeId { get; set; }
        public bool IsFatal { get; set; }
        public bool IsMva { get; set; }
        public bool IsTrainee { get; set; }
        public bool IsAssault { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public bool? IsMinimumRequirement { get; set; }

        public ClaimRequirementCategory ClaimRequirementCategory { get; set; }
    }
}