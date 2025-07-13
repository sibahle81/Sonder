using RMA.Service.Admin.MasterDataManager.Contracts.Enums;


namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionAllowanceType
    {
        public int ProductOptionAllowanceTypeId { get; set; }
        public int? ProductOptionId { get; set; }
        public AllowanceTypeEnum? AllowanceType { get; set; }
        public IndustryClassEnum? IndustryClass { get; set; }
    }
}