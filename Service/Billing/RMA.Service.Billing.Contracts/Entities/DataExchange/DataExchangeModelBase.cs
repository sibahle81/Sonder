using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities.DataExchange
{
    public abstract class DataExchangeModelBase
    {
        protected Guid ExchangeModelIdentifier { get; set; }

        protected IEnumerable<DataExchangeModelBase> DataExchangeModels { get; set; }
        public DataExchangeModelBase()
        {
            ExchangeModelIdentifier = Guid.NewGuid();
            DataExchangeModels = new List<DataExchangeModelBase>();
        }
        protected DataExchangeModelBase(IEnumerable<DataExchangeModelBase> dataExchangeModels)
        {
            DataExchangeModels = dataExchangeModels;
        }
    }
}