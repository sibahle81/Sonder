using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IDiscountTypeService : IService
    {
        Task<List<DiscountType>> GetDiscountTypes();
        Task<DiscountType> GetDiscountType(int id);
        Task<int> AddDiscountType(DiscountType discountType);
        Task EditDiscountType(DiscountType discountType);
        Task<List<DiscountType>> SearchDiscountTypes(string query);
    }
}