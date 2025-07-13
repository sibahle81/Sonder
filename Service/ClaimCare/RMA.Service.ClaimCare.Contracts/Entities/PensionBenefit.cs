using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionBenefit
    {
        public string ProductCode { get; set; }
        public ProductClassEnum ProductClass { get; set; }
        public string ProductOption { get; set; }
        public string BenefitName { get; set; }
        public string BenefitCode { get; set; }
        public int BenefitId { get; set; }
        public int BenefitTypeId { get; set; }
        public decimal BenefitAmount { get; set; }
        public bool IsTaxable { get; set; }
    }
}
