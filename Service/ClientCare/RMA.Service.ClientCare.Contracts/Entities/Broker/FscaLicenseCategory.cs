using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class FscaLicenseCategory
    {
        public int Id { get; set; }
        public ProductClassEnum ProductClass { get; set; }
        public int CategoryNo { get; set; }
        public int SubCategoryNo { get; set; }
        public string Description { get; set; }

        public List<BrokerageFscaLicenseCategory> BrokerageFscaLicenseCategories { get; set; }
        public List<RepresentativeFscaLicenseCategory> RepresentativeFscaLicenseCategories { get; set; }
    }
}