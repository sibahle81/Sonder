using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionCoverType
    {
        public int ProductOptionId { get; set; }
        public CoverTypeEnum CoverType { get; set; }
    }
}
