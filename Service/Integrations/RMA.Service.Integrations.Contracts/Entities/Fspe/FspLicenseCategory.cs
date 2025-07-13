using System;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    public class FspLicenseCategory
    {
        public int CategoryNo { get; set; }
        public int SubCategoryNo { get; set; }
        public DateTime? IntermediaryDateActive { get; set; }
        public DateTime? AdviceDateActive { get; set; }
    }
}
