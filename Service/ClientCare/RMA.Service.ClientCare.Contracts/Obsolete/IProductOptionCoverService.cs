using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductOptionCoverService : IService
    {
        Task<List<ProductOptionCover>> GetProductOptionCoverByProductId(int productId);
        Task<List<ProductOptionCover>> GetProductOptionCover();
        Task<ProductOptionCover> GetProductOptionCoverByproductOptionId(int productOptionId);
        Task<List<ProductOptionCover>> GetProductsOptionCoversByIds(List<int> productOptionIds);
        Task<List<int>> AddProductOptionCovers(List<ProductOptionCover> productOptionCovers);
        Task EditProductOptionCovers(List<ProductOptionCover> productOptionCovers);
        Task<ProductOptionCover> GetProductOptionCoverById(int Id);
    }
}