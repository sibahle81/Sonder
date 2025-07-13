namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    public class RepLicenseCategory
    {
        public string FspNumber { get; set; }
        public System.DateTime? AdviceDateActive { get; set; } // AdviceDateActive
        public System.DateTime? IntermediaryDateActive { get; set; } // IntermediaryDateActive
        public System.DateTime? SusDateActive { get; set; } // SusDateActive
        public int CategoryNo { get; set; }
        public int SubCategoryNo { get; set; }
    }
}
