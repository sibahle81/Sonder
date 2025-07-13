using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IPaymentMethodService : IService
    {
        Task<List<Lookup>> GetPaymentMethods();
        Task<List<Lookup>> GetPaymentFrequencyByIds(List<int> ids);
    }
}