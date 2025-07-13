using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities.DataExchange.Import;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IDataExchangeService : IService
    {
        Task PostBinaryDataAsync(byte[] blob);
        Task PostDataAsync(List<BillingDataExchangeModel> dataExhangeModels);
        Task<List<BillingDataExchangeModel>> GetDataAsync();
        Task<List<BillingDataExchangeModel>> GetDataByIdAsync(int Id);
    }
}