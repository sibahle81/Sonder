using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionBillingIntegration
    {
        public int ProductOptionBillingIntegrationId { get; set; }
        public int? ProductOptionId { get; set; }
        public IndustryClassEnum? IndustryClass { get; set; }
        public bool? AllowTermsArrangement { get; set; }
        public bool? AccumulatesInterest { get; set; }
    }
}