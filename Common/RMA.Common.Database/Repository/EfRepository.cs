using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Filters;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

using QueryableExtensions = RMA.Common.Database.Extensions.QueryableExtensions;

namespace RMA.Common.Database.Repository
{
    public class EfRepository<TEntity, TContext> : IRepository<TEntity>, IDbAsyncEnumerable<TEntity>
        where TEntity : class
        where TContext : RmaDbContext, IFilteredDbContext
    {
        private readonly IAmbientDbContextLocator _ambientDbContextLocator;

        public EfRepository(IAmbientDbContextLocator ambientDbContextLocator)
        {
            _ambientDbContextLocator = ambientDbContextLocator;
        }

        public DbSet<TEntity> Set => Context.Set<TEntity>();

        private RmaDbContext Context
        {
            get
            {
                var dbContext = _ambientDbContextLocator.Get<TContext>();
                if (dbContext == null)
                {
                    throw new InvalidOperationException(
                       $"No ambient DbContext of type {typeof(TContext).Name} found. This means that this repository method has been called outside of the scope of a DbContextScope. A repository must only be accessed within the scope of a DbContextScope, which takes care of creating the DbContext instances that the repositories need and making them available as ambient contexts. This is what ensures that, for any given DbContext-derived type, the same instance is used throughout the duration of a business transaction. To fix this issue, use IDbContextScopeFactory in your top-level business logic service method to create a DbContextScope that wraps the entire business transaction that your service method implements. Then access this repository within that scope. Refer to the comments in the IDbContextScope.cs file for more details.");
                }

                return dbContext;
            }
        }

        public virtual string ConnectionString
        {
            get
            {
                var dbContext = _ambientDbContextLocator.Get<TContext>() as IFilteredDbContext;
                return dbContext.ConnectionString;
            }
        }

        public void DisableLogging()
        {
            Context.Database.Log = null;
        }

        private void UpdatePrivate(TEntity entity, bool skipAuditing, params Expression<Func<TEntity, object>>[] properties)
        {
            var entry = Context.Entry(entity);
            if (entry.State == EntityState.Detached) Context.Set<TEntity>().Attach(entity);
            var hasChanges = false;
            foreach (var selector in properties)
            {
                hasChanges = true;
                entry.Property(selector).IsModified = true;
            }

            if (hasChanges && !skipAuditing) SetAuditableValues(entity);
            SetRowVersion(entity);
            Validate();
        }

        private void UpdatePrivate(TEntity entity, bool skipAuditing)
        {
            // Ensure only modified fields are updated.
            var entry = Context.Entry(entity);
            if (entry.State == EntityState.Detached) Context.Set<TEntity>().Attach(entity);
            if (!skipAuditing) ResetAuditableValues(entity);
            if (!skipAuditing) SetAuditableValues(entity);
            SetRowVersion(entity);
            Validate();
        }

        private static void SetRowVersion(TEntity entity)
        {
            if (entity is IVersionedEntity value)
            {
                if (value.RowVersion == 0) value.RowVersion = 1;
                else value.RowVersion++;
            }
        }

        protected void ResetAuditableValues(object entity, List<object> auditedItems = null)
        {
            var auditList = new List<object>();
            if (auditedItems != null) auditList.AddRange(auditedItems);
            auditList.Add(entity);

            //NOTE: this method could be recursive 
            if (entity is IAuditableEntity value)
            {
                ResetEntityAuditValues(value);
            }

            if (entity != null)
            {
                foreach (var propertyInfo in entity.GetType().GetProperties())
                {
                    var refType = propertyInfo.GetValue(entity);
                    if (refType is IAuditableEntity refProperty && !auditList.Contains(refProperty))
                    {
                        ResetAuditableValues(refProperty, auditList);
                    }
                    if (refType is IEnumerable<IAuditableEntity> listValue)
                    {
                        foreach (var listItem in listValue)
                        {
                            if (!auditList.Contains(listItem))
                            {
                                ResetAuditableValues(listItem, auditList);
                            }
                        }
                    }
                }
            }
        }

        private void ResetEntityAuditValues(IAuditableEntity auditableEntity)
        {
            var entry = Context.Entry(auditableEntity);
            if (entry.State == EntityState.Modified)
            {
                entry.Property("CreatedBy").IsModified = false;
                entry.Property("CreatedDate").IsModified = false;
                entry.Property("ModifiedDate").IsModified = false;

                entry.Property("CreatedBy").CurrentValue = entry.Property("CreatedBy").OriginalValue;
                entry.Property("CreatedDate").CurrentValue = entry.Property("CreatedDate").OriginalValue;
                entry.Property("ModifiedDate").CurrentValue = entry.Property("ModifiedDate").OriginalValue;
            }
        }

        protected void SetAuditableValues(object entity, List<object> auditedItems = null)
        {
            var auditList = new List<object>();
            if (auditedItems != null) auditList.AddRange(auditedItems);
            auditList.Add(entity);

            if (entity is IAuditableEntity value)
            {
                SetEntityAuditValues(value);
            }

            if (entity != null)
            {
                foreach (var propertyInfo in entity.GetType().GetProperties())
                {
                    var refType = propertyInfo.GetValue(entity);
                    if (refType is IAuditableEntity refProperty && !auditList.Contains(refProperty))
                    {
                        SetAuditableValues(refProperty, auditList);
                    }

                    if (refType is IEnumerable<IAuditableEntity> listValue)
                    {
                        foreach (var listItem in listValue)
                        {
                            if (!auditList.Contains(listItem))
                            {
                                SetAuditableValues(listItem, auditList);
                            }
                        }
                    }
                }
            }
        }

        private void SetEntityAuditValues(IAuditableEntity auditableEntity)
        {
            var entry = Context.Entry(auditableEntity);
            if (entry.State == EntityState.Added)
            {
                auditableEntity.CreatedBy = string.IsNullOrEmpty(auditableEntity.CreatedBy) ? RmaIdentity.UsernameOrBlank : auditableEntity.CreatedBy;
                auditableEntity.CreatedDate = DateTimeHelper.SaNow;
                auditableEntity.ModifiedBy = string.IsNullOrEmpty(auditableEntity.ModifiedBy) ? RmaIdentity.UsernameOrBlank : auditableEntity.ModifiedBy;
                auditableEntity.ModifiedDate = DateTimeHelper.SaNow;
            }
            else if (entry.State != EntityState.Unchanged)
            {
                if (EntityHasChanges(entry))
                {
                    auditableEntity.ModifiedBy = SetModifiedBy(auditableEntity);
                    auditableEntity.ModifiedDate = DateTimeHelper.SaNow;
                    entry.Property("ModifiedBy").IsModified = true;
                    entry.Property("ModifiedDate").IsModified = true;
                }
            }
        }

        private static string SetModifiedBy(IAuditableEntity auditableEntity)
        {
            var modifiedBy = string.IsNullOrEmpty(auditableEntity.ModifiedBy) ? RmaIdentity.UsernameOrBlank : auditableEntity.ModifiedBy; ;

            if (RmaIdentity.IsBackendService && !string.IsNullOrEmpty(auditableEntity.ModifiedBy) && !auditableEntity.ModifiedBy.Contains("BackendProcess"))
                modifiedBy = auditableEntity.ModifiedBy;

            return modifiedBy;
        }

        private static bool EntityHasChanges(DbEntityEntry<IAuditableEntity> entry)
        {
            foreach (var property in entry.OriginalValues.PropertyNames)
            {
                var original = entry.OriginalValues.GetValue<object>(property);
                var current = entry.CurrentValues.GetValue<object>(property);

                if (original != null && !original.Equals(current) || (original == null && current != null))
                {
                    return true;
                }
            }

            return false;
        }

        #region IRepository<TEntity> Members

        public virtual Expression Expression => ((IQueryable)Set).Expression;

        public virtual Type ElementType => ((IQueryable)Set).ElementType;

        public virtual IQueryProvider Provider => ((IQueryable)Set).Provider;

        public IEnumerator<TEntity> GetEnumerator()
        {
            return ((IEnumerable<TEntity>)Set).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return ((IEnumerable)Set).GetEnumerator();
        }

        public virtual TEntity FindAll()
        {
            return Set.Find();
        }

        public virtual TEntity FindById(params object[] keyValues)
        {
            return InternalFindById(keyValues).Result;
        }

        public virtual TEntity FindByIdIncludeDeleted(params object[] keyValues)
        {
            return InternalFindByIdIncludeDeleted(keyValues).Result;
        }

        public virtual async Task<TEntity> FindByIdAsync(params object[] keyValues)
        {
            return await InternalFindById(keyValues);
        }

        private async Task<TEntity> InternalFindById(params object[] keyValues)
        {
            var result = await Set.FindAsync(keyValues);
            return result;
        }

        private async Task<TEntity> InternalFindByIdIncludeDeleted(params object[] keyValues)
        {
            DisableFilter("SoftDeletes");
            var result = await Set.FindAsync(keyValues);
            EnableFilter("SoftDeletes");
            return result;
        }

        public void DisableFilters()
        {
            ((IFilteredDbContext)Context).DisableFilters();
        }

        public void EnableFilters()
        {
            ((IFilteredDbContext)Context).EnableFilters();
        }

        public void DisableFilter(string filterName)
        {
            ((IFilteredDbContext)Context).DisableFilter(filterName);
        }

        public void EnableFilter(string filterName)
        {
            ((IFilteredDbContext)Context).EnableFilter(filterName);
        }

        public IEnumerable<DbEntityEntry> ChangedEntries()
        {
            return Context.ChangeTracker.Entries();
        }

        public virtual TEntity Create(TEntity entity, bool skipAuditing = false)
        {
            var entry = Set.Add(entity);
            if (!skipAuditing) SetAuditableValues(entity);
            SetRowVersion(entity);
            Validate();
            return entry;
        }

        public List<TEntity> Create(List<TEntity> entity, bool skipAuditing = false)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity), "entity is null");
            var retunValues = new List<TEntity>();
            foreach (var item in entity)
            {
                var entry = Set.Add(item);
                if (!skipAuditing) SetAuditableValues(item);
                SetRowVersion(item);
                retunValues.Add(entry);
            }

            return retunValues;
        }

        public virtual void Delete(TEntity entity)
        {
            Set.Remove(entity);
        }

        public virtual void Delete(List<TEntity> entities)
        {
            Set.RemoveRange(entities);
        }

        public virtual void Delete(Expression<Func<TEntity, bool>> predicate)
        {
            Set.RemoveRange(Set.Where(predicate));
        }

        public T Attach<T>(T entity)
        {
            return (T)Context.Set(typeof(T)).Attach(entity);
        }

        public void Detatch(object entity)
        {
            Context.Entry(entity).State = EntityState.Detached;
        }

        public bool HasChanges()
        {
            return Context.ChangeTracker.HasChanges();
        }

        public void Update(TEntity entity, params Expression<Func<TEntity, object>>[] properties)
        {
            if (properties == null) throw new ArgumentNullException(nameof(properties), "properties is null");
            UpdatePrivate(entity, false, properties);
        }

        public void Update(TEntity entity, bool skipAuditing = false, params Expression<Func<TEntity, object>>[] properties)
        {
            if (properties == null) throw new ArgumentNullException(nameof(properties), "properties is null");
            UpdatePrivate(entity, skipAuditing, properties);
        }

        public void Update(List<TEntity> entities, params Expression<Func<TEntity, object>>[] properties)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities), "entities is null");
            if (properties == null) throw new ArgumentNullException(nameof(properties), "properties is null");
            foreach (var entity in entities) UpdatePrivate(entity, false, properties);
        }

        public void Update(List<TEntity> entities, bool skipAuditing = false, params Expression<Func<TEntity, object>>[] properties)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities), "entities is null");
            if (properties == null) throw new ArgumentNullException(nameof(properties), "properties is null");
            foreach (var entity in entities) UpdatePrivate(entity, skipAuditing, properties);
        }

        public void Update(TEntity entity, bool skipAuditing = false)
        {
            UpdatePrivate(entity, skipAuditing);
        }

        public void Update(List<TEntity> entities, bool skipAuditing = false)
        {
            if (entities == null) throw new ArgumentNullException(nameof(entities), "entities is null");
            foreach (var entity in entities) UpdatePrivate(entity, skipAuditing);
        }

        public IQueryable<TEntity> Include<TProperty>(Expression<Func<TEntity, TProperty>> path)
            where TProperty : ILazyLoadSafeEntity
        {
            return QueryableExtensions.Include(Set, path);
        }

        public IQueryable<TEntity> Include<TProperty>(Expression<Func<TEntity, ICollection<TProperty>>> path)
            where TProperty : ILazyLoadSafeEntity
        {
            return Set.Include(path);
        }

        public void Load<TElement>(TEntity entry, Expression<Func<TEntity, ICollection<TElement>>> navigationProperty)
            where TElement : class
        {
            Context.Entry(entry).Collection(navigationProperty).Load();
        }

        public void Load<TProperty>(TEntity entry, Expression<Func<TEntity, TProperty>> navigationProperty)
           where TProperty : class
        {
            Context.Entry(entry).Reference(navigationProperty).Load();
        }

        public void Load<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, TProperty>> navigationProperty)
           where TProperty : class
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            foreach (var entity in entry) Load(entity, navigationProperty);
        }

        public void Load<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, ICollection<TProperty>>> navigationProperty) where TProperty : class
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            foreach (var entity in entry) Load(entity, navigationProperty);
        }

        public Task LoadAsync<TProperty>(TEntity entry, Expression<Func<TEntity, TProperty>> navigationProperty)
           where TProperty : class
        {
            return Context.Entry(entry).Reference(navigationProperty).LoadAsync();
        }

        public Task LoadAsync<TElement>(TEntity entry, Expression<Func<TEntity, ICollection<TElement>>> navigationProperty) where TElement : class
        {
            return Context.Entry(entry).Collection(navigationProperty).LoadAsync();
        }

        public async Task LoadAsync<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            foreach (var entity in entry) await LoadAsync(entity, navigationProperty);
        }

        public async Task LoadAsync<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, ICollection<TProperty>>> navigationProperty) where TProperty : class
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            foreach (var entity in entry) await LoadAsync(entity, navigationProperty);
        }

        public Task LoadAsyncIncludeDeleted<TElement>(TEntity entry, Expression<Func<TEntity, ICollection<TElement>>> navigationProperty) where TElement : class
        {
            DisableFilter("SoftDeletes");
            var results = Context.Entry(entry).Collection(navigationProperty).LoadAsync();
            EnableFilter("SoftDeletes");
            return results;
        }

        public Task LoadAsyncIncludeDeleted<TProperty>(TEntity entry, Expression<Func<TEntity, TProperty>> navigationProperty)
            where TProperty : class
        {
            DisableFilter("SoftDeletes");
            var results = Context.Entry(entry).Reference(navigationProperty).LoadAsync();
            EnableFilter("SoftDeletes");
            return results;
        }

        public async Task LoadAsyncIncludeDeleted<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, TProperty>> navigationProperty) where TProperty : class
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            foreach (var entity in entry) await LoadAsyncIncludeDeleted(entity, navigationProperty);
        }

        public async Task LoadAsyncIncludeDeleted<TProperty>(IEnumerable<TEntity> entry, Expression<Func<TEntity, ICollection<TProperty>>> navigationProperty) where TProperty : class
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            foreach (var entity in entry) await LoadAsyncIncludeDeleted(entity, navigationProperty);
        }

        public void Validate()
        {
            var errors = Context.GetValidationErrors().ToList();
            if (errors.Count > 0)
            {
                var error = DbContextExtensions.HandleDbValidationErrors(errors);
                if (error != null) throw error;
            }
        }

        public void ExecuteSqlCommand(string procedureName, params SqlParameter[] parameters)
        {
            Context.Database.ExecuteSqlCommand(procedureName, parameters);
        }

        public Task ExecuteSqlCommandAsync(string procedureName, params SqlParameter[] parameters)
        {
            return Context.Database.ExecuteSqlCommandAsync(procedureName, parameters);
        }

        public List<TEntity> SqlQuery(string procedureName, params SqlParameter[] parameters)
        {
            return Context.Database.SqlQuery<TEntity>(procedureName, parameters).ToList();
        }

        public List<TResult> SqlQuery<TResult>(string procedureName, params SqlParameter[] parameters)
        {
            return Context.Database.SqlQuery<TResult>(procedureName, parameters).ToList();
        }

        public Task<List<TEntity>> SqlQueryAsync(string procedureName, params SqlParameter[] parameters)
        {
            return Context.Database.SqlQuery<TEntity>(procedureName, parameters).ToListAsync();
        }

        public Task<List<TResult>> SqlQueryAsync<TResult>(string procedureName, params SqlParameter[] parameters)
        {
            return Context.Database.SqlQuery<TResult>(procedureName, parameters).ToListAsync();
        }

        #endregion

        #region IDbAsyncEnumerable<TEntity> Members

        IDbAsyncEnumerator<TEntity> IDbAsyncEnumerable<TEntity>.GetAsyncEnumerator()
        {
            return ((IDbAsyncEnumerable<TEntity>)Set).GetAsyncEnumerator();
        }

        public IDbAsyncEnumerator GetAsyncEnumerator()
        {
            return ((IDbAsyncEnumerable)Set).GetAsyncEnumerator();
        }

        #endregion

        public async Task AuditChanges(bool auditAdds = true, bool auditEdits = true, bool auditDeletes = true, bool auditViews = true)
        {
            foreach (var entry in this.Context.ChangeTracker.Entries().Where(o => o.State != EntityState.Unchanged && o.State != EntityState.Detached).ToList())
            {
                var changeType = entry.State.ToString();
                var entityType = typeof(TEntity);
                var dbType = this.Context.GetEntityType(entry);

                if (dbType != entityType) continue; //only audit specified type

                var oldItem = (entry.State == EntityState.Added ? "{  }" : JsonConvert.SerializeObject(entry.OriginalValues.ToObject()));
                var newItem = (entry.State == EntityState.Deleted ? "{  }" : JsonConvert.SerializeObject(entry.CurrentValues.ToObject()));

#if DEBUG
                if (oldItem == newItem)
                {
                    throw new Exception($"Something went wrong because this {changeType} Audit shows no changes!");
                }
#endif

                var id = this.Context.GetIdentity(entry);

                var auditWriter = CommonServiceLocator.ServiceLocator.Current.GetInstance<IAuditWriter>();
                if (auditWriter == null)
                    return;

                if (id > 0)
                {
                    if (auditAdds && entry.State == EntityState.Added)
                        await auditWriter.AddAudit(id, entityType, changeType, oldItem, newItem);

                    if (auditEdits && entry.State == EntityState.Modified)
                        await auditWriter.AddAudit(id, entityType, changeType, oldItem, newItem);

                    if (auditDeletes && entry.State == EntityState.Deleted)
                        await auditWriter.AddAudit(id, entityType, changeType, oldItem, newItem);

                    if (auditViews && entry.State != EntityState.Deleted)
                        await auditWriter.AddLastViewed(id, entityType);
                }
            }
        }

        public async Task AuditView(int id)
        {
            var auditWriter = CommonServiceLocator.ServiceLocator.Current.GetInstance<IAuditWriter>();
            if (auditWriter == null)
                return;
            await auditWriter.AddLastViewed<TEntity>(id);
        }
    }
}