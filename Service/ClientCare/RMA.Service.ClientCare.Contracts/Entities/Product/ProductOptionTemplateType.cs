using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionTemplateType
    {
        public int ProductOptionTemplateTypeId { get; set; }
        public int? ProductOptionId { get; set; }
        public TemplateTypeEnum? TemplateType { get; set; }
        public int? TemplateId { get; set; }
    }
}