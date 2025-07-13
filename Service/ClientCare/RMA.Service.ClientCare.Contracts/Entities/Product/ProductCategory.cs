using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductCategory
    {
        public int Id { get; set; } // Id (Primary key)
        public ProductClassEnum ProductClass { get; set; } // Product class
    }
}
