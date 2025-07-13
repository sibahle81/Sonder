using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitOptionItemValueResponse
    {
        public int BenefitOptionItemValueId { get; set; }
        public int BenefitId { get; set; }
        public string OptionItemName { get; set; }
        public string OptionItemCode { get; set; }
        public string OptionTypeCode { get; set; }
        public decimal? OverrideValue { get; set; }

        public OptionItemFieldEnum? OptionItemField { get; set; }
    }
}
