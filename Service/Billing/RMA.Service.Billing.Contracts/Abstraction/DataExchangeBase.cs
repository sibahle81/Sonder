using RMA.Service.Billing.Contracts.Entities.DataExchange;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Abstraction
{
    public abstract class DataExchangeBase
    {
        protected DataExchangeBase()
        {

        }

        public virtual async Task ImportDataAsync(IEnumerable<DataExchangeModelBase> dataExchangeModels)
        {
            await Task.CompletedTask;
        }

        public virtual async Task<IEnumerable<DataExchangeModelBase>> ExportDataAsync()
        {
            var dataExhangeModel = await Task.FromResult(Activator.CreateInstance(typeof(DataExchangeModelBase), new List<DataExchangeModelBase>()));
            return dataExhangeModel as IEnumerable<DataExchangeModelBase>;
        }

        public virtual async Task ValidateDataAsync(IEnumerable<DataExchangeModelBase> dataExhangeModels)
        {
            await Task.CompletedTask;
        }
    }
}