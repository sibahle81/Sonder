
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Billing.Contracts.Entities.DataExchange.Import;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.DataExchange.Factory;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    /// <summary>
    /// This is a true reflection of a facade, it hides the complexities of the underlying operations performed as per the Facade design pattern
    /// </summary>
    public class DataExchangeFacade : RemotingStatelessService, IDataExchangeService
    {
        /// <summary>
        /// Tightly coupled to billing for now should be generic
        /// </summary>
        /// <param name="statelessServiceContext"></param>
        public DataExchangeFacade(StatelessServiceContext statelessServiceContext)
            : base(statelessServiceContext) { }

        public async Task PostDataAsync(List<BillingDataExchangeModel> dataExhangeModels) => await new DataExchangeFactory<BillingDataExchangeModel>().CreateDataExchange().ProcessDataAsync(dataExhangeModels);
        public async Task<List<BillingDataExchangeModel>> GetDataAsync() => (List<BillingDataExchangeModel>)await new DataExchangeFactory<BillingDataExchangeModel>().CreateDataExchange().ExportDataAsync<BillingDataExchangeModel>();
        public async Task PostBinaryDataAsync(byte[] fileData) => await new DataExchangeFactory<BillingDataExchangeModel>().CreateDataExchange().ImportBinaryDataAsync(fileData);
        public async Task<List<BillingDataExchangeModel>> GetDataByIdAsync(int Id) => (List<BillingDataExchangeModel>)await new DataExchangeFactory<BillingDataExchangeModel>().CreateDataExchange().ExportDataAsync<BillingDataExchangeModel>(Id);
    }
}