using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class RepresentativeLicenseCategory
    {
        public int Id { get; set; } // Id (Primary key)
        public string FspNumber { get; set; }
        public System.DateTime? AdviceDateActive { get; set; } // AdviceDateActive
        public System.DateTime? IntermediaryDateActive { get; set; } // IntermediaryDateActive
        public System.DateTime? SusDateActive { get; set; } // SusDateActive
        public int CategoryNo { get; set; }
        public int SubCategoryNo { get; set; }
        public ProductClassEnum ProductClass { get; set; } // ProductClassId
        public string Description { get; set; } // Name (length: 255)
    }
}
