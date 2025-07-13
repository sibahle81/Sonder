using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Finance
{
    public interface IProductCrossRefTranTypeService : IService
    {
        Task<List<ProductCrossRefTranType>> GetProductCrossRefTranTypes();
        Task<ProductCrossRefTranType> GetProductCrossRefTranType(int id);
        Task<int> AddProductCrossRefTranType(ProductCrossRefTranType productCrossRefTranType);
        Task EditProductCrossRefTranType(ProductCrossRefTranType productCrossRefTranType);
        Task RemoveProductCrossRefTranType(int id);
    }
}