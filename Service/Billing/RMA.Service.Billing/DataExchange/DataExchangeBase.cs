using CommonServiceLocator;

using Microsoft.ServiceFabric.Data;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Billing.Contracts.Entities.DataExchange;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.DataExchange
{
    /// <summary>
    /// Abstraction for honoring the Liskov Substitution principle, the implementations can happen via interfaces, but then we have to seggregate interfaces which
    /// contain members which do not requirem implementations, hence an abstract class with virtual methods
    /// </summary>
    public abstract class DataExchangeBase
    {
        protected string ConnectionString { get; set; }
        protected Guid ExchangeIdentifier { get; private set; }
#pragma warning disable CA1051
        protected IDbContextScopeFactory _dbContextScopeFactory;
#pragma warning restore CA1051

        protected DataExchangeBase()
        {
            ExchangeIdentifier = Guid.NewGuid();
            _dbContextScopeFactory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
        }

        protected virtual IRepository<TEntity> GetRepository<TEntity>() where TEntity : class
        {
            var repository = ServiceLocator.Current.GetInstance<IRepository<TEntity>>();
            if (repository != null) return repository;

            throw new InvalidOperationException($"Service locator was unable to find registered dependency {typeof(TEntity).Name}, ensure the repository dependency has been registered in the IOC container.");
        }

        public virtual async Task ImportBinaryDataAsync(byte[] fileData)
            => await Task.CompletedTask;

        public virtual async Task ProcessDataAsync<T>(IEnumerable<T> dataExchangeModels)
            where T : DataExchangeModelBase => await Task.CompletedTask;

        public virtual async Task ImportDataAsync<T>(IEnumerable<T> dataExchangeModels)
            where T : DataExchangeModelBase => await Task.CompletedTask;

        public virtual async Task<IEnumerable<T>> ExportDataAsync<T>()
            where T : DataExchangeModelBase => await Task.FromResult(Activator.CreateInstance(typeof(DataExchangeModelBase), new List<DataExchangeModelBase>())) as IEnumerable<T>;

        public virtual async Task<IEnumerable<T>> ExportDataAsync<T>(int id)
            where T : DataExchangeModelBase => await Task.FromResult(Activator.CreateInstance(typeof(DataExchangeModelBase), new List<DataExchangeModelBase>())) as IEnumerable<T>;

        public virtual async Task<IAsyncEnumerable<T>> ValidateDataAsync<T>(IEnumerable<DataExchangeModelBase> dataExhangeModels)
            where T : DataExchangeModelBase => await Task.FromResult(Activator.CreateInstance(typeof(DataExchangeModelBase), new List<DataExchangeModelBase>())) as IAsyncEnumerable<T>;

        //(STRATEGIZE -> OBSERVE -> ADAPT -> PROVIDE): Implement the adapter pattern for service bus, task manager and rules engine.
    }
}