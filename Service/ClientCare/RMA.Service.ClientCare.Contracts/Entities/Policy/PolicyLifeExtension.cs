using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyLifeExtension
    {
        public int PolicyLifeExtensionId { get; set; }
        public int PolicyId { get; set; }
        public AnnualIncreaseTypeEnum AnnualIncreaseType { get; set; }
        public int? AnnualIncreaseMonth { get; set; }
        public bool AffordabilityCheckPassed { get; set; }
        public string AffordabilityCheckFailReason { get; set; }
        public bool IsEuropAssistExtended { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
