using RMA.Common.Extensions;
using RMA.Service.Billing.Contracts.Entities.DataExchange;
using RMA.Service.Billing.Contracts.Entities.DataExchange.Import;
using RMA.Service.Billing.Contracts.Entities.FileExchange;
using RMA.Service.Billing.DataExchange.Data;

using System;

namespace RMA.Service.Billing.DataExchange.Factory
{
    /// <summary>
    /// Design pattern: Generic factory pattern
    /// Honor the open-closed principle with the factory and OOP
    /// </summary>
    /// <typeparam name="TExchangeModel"></typeparam>
    public class DataExchangeFactory<TExchangeModel>
        where TExchangeModel : DataExchangeModelBase
    {
        public DataExchangeBase CreateDataExchange()
        {
            if (typeof(TExchangeModel).IsAssignableTo(typeof(FileExchangeModelBase)))
            {
                //Return Excel or CSV etc...
                if (typeof(TExchangeModel) == typeof(BillingDataExchangeModel))
                    return new BillingDataExchange();
            }

            throw new InvalidOperationException();
        }
    }
}