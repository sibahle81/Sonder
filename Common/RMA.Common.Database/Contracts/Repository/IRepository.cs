using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RMA.Common.Database.Contracts.Repository
{
    public interface IRepository<TEntity> : IQueryable<TEntity> where TEntity : class
    {
        string ConnectionString { get; }
        T Attach<T>(T entity);
        void Detatch(object entity);
        TEntity Create(TEntity entity, bool skipAuditing = false);
        List<TEntity> Create(List<TEntity> entity, bool skipAuditing = false);
        void Update(TEntity entity, params Expression<Func<TEntity, object>>[] properties);
        void Update(TEntity entity, bool skipAuditing = false, params Expression<Func<TEntity, object>>[] properties);
        void Update(List<TEntity> entities, params Expression<Func<TEntity, object>>[] properties);
        void Update(List<TEntity> entities, bool skipAuditing = false, params Expression<Func<TEntity, object>>[] properties);
        void Update(TEntity entity, bool skipAuditing = false);
        void Update(List<TEntity> entities, bool skipAuditing = false);
        void Delete(TEntity entity);
        void Delete(List<TEntity> entities);
        void Delete(Expression<Func<TEntity, bool>> predicate);
        bool HasChanges();
        void Validate();
        TEntity FindById(params object[] keyValues);
        TEntity FindByIdIncludeDeleted(params object[] keyValues);
        Task<TEntity> FindByIdAsync(params object[] keyValues);
        void DisableFilters();
        void EnableFilters();
        void DisableLogging();
        void DisableFilter(string filterName);
        void EnableFilter(string filterName);

        /// <summary>
        ///     This method cannot be used unless the entity supports Physical Deletion - The results loaded using this method
        ///     will not be filtered
        /// </summary>
        IQueryable<TEntity> Include<TProperty>(Expression<Func<TEntity, TProperty>> path) where TProperty : ILazyLoadSafeEntity;

        /// <summary>
        ///     This method cannot be used unless the entity supports Physical Deletion - The results loaded using this method
        ///     will not be filtered
        /// </summary>
        IQueryable<TEntity> Include<TProperty>(Expression<Func<TEntity, ICollection<TProperty>>> path) where TProperty : ILazyLoadSafeEntity;

        void Load<TProperty>(TEntity entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class;

        void Load<TElement>(TEntity entry, Expression<Func<TEntity, ICollection<TElement>>> navigationProperty) where TElement : class;

        void Load<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class;

        void Load<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, ICollection<TProperty>>> navigationProperty) where TProperty : class;

        Task LoadAsync<TProperty>(TEntity entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class;

        Task LoadAsync<TElement>(TEntity entry, Expression<Func<TEntity, ICollection<TElement>>> navigationProperty) where TElement : class;

        Task LoadAsync<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class;

        Task LoadAsync<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, ICollection<TProperty>>> navigationProperty) where TProperty : class;

        Task LoadAsyncIncludeDeleted<TProperty>(TEntity entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class;

        Task LoadAsyncIncludeDeleted<TElement>(TEntity entry, Expression<Func<TEntity, ICollection<TElement>>> navigationProperty) where TElement : class;

        Task LoadAsyncIncludeDeleted<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class;

        Task LoadAsyncIncludeDeleted<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, ICollection<TProperty>>> navigationProperty) where TProperty : class;

        void ExecuteSqlCommand(string procedureName, params SqlParameter[] parameters);

        Task ExecuteSqlCommandAsync(string procedureName, params SqlParameter[] parameters);

        List<TEntity> SqlQuery(string procedureName, params SqlParameter[] parameters);

        List<TResult> SqlQuery<TResult>(string procedureName, params SqlParameter[] parameters);

        Task<List<TEntity>> SqlQueryAsync(string procedureName, params SqlParameter[] parameters);

        Task<List<TResult>> SqlQueryAsync<TResult>(string procedureName, params SqlParameter[] parameters);

    }
}