using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageLicenseCategory
    {
        public int Id { get; set; } // Id (Primary key)
        public System.DateTime? AdviceDateActive { get; set; } // AdviceDateActive
        public System.DateTime? IntermediaryDateActive { get; set; } // IntermediaryDateActive
        public int CategoryNo { get; set; }
        public int SubCategoryNo { get; set; }
        public ProductClassEnum ProductClass { get; set; } // ProductClassId
        public string Description { get; set; } // Name (length: 255)
        public string ProductClassText => ProductClass.DisplayAttributeValue();
    }
}