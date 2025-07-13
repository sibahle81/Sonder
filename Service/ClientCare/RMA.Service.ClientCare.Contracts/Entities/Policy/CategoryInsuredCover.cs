using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CategoryInsuredCover
    {
        public int CategoryInsuredCoverId { get; set; } // CategoryInsuredCoverId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public CategoryInsuredEnum CategoryInsured { get; set; } // CategoryInsuredId
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
