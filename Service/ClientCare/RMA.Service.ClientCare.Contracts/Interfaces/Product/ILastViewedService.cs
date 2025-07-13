using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface ILastViewedService : IService
    {
        Task<List<LastViewedItem>> GetLastViewedItemsForUserByName(string itemTypeName);
    }
}