using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionPaymentFrequency
    {
        public int ProductOptionId { get; set; }
        public PaymentFrequencyEnum PaymentFrequency { get; set; }
    }
}
