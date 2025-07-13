using EntityFramework.DynamicFilters;

using Newtonsoft.Json;

using RMA.Common.Database.Constants;
using RMA.Common.Database.Contracts.Filters;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;

using Serilog;

using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Core.Metadata.Edm;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Infrastructure.Interception;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Database.Repository
{
    public abstract class RmaDbContext : DbContext, IFilteredDbContext
    {
        private bool OverrideMultiTenancyFiltering() => RmaIdentity.UserId == 0 || (RmaIdentity.TenantId == (int)TenantEnum.RMA && RmaIdentity.HasClaim("Multi Tenant Override"));
        private int CurrentUserTenantId() => (RmaIdentity.UserId == 0 || RmaIdentity.TenantId == 0) ? (int)TenantEnum.RMA : RmaIdentity.TenantId;
        private const string _applyDataMasking = "Apply Data Masking";

        public RmaDbContext()
            : base(GetConnectionString())
        {
            InitializeBase();
        }

        private static string GetConnectionString()
        {
            return (RmaIdentity.IsAuthenticated && RmaIdentity.HasClaim(_applyDataMasking))
                ? Environment.GetEnvironmentVariable(CommonDbConstants.DataMaskDBConnectionEnvironmentVariableName)
                : Environment.GetEnvironmentVariable(CommonDbConstants.DBConnectionEnvironmentVariableName);
        }

        public RmaDbContext(string nameOrConnectionString)
            : base(nameOrConnectionString)
        {
            InitializeBase();
        }

        public RmaDbContext(string connectionString, DbCompiledModel model)
            : base(connectionString, model)
        {
        }

        public RmaDbContext(DbConnection existingConnection, bool contextOwnsConnection)
            : base(existingConnection, contextOwnsConnection)
        {
        }

        public RmaDbContext(DbConnection existingConnection, DbCompiledModel model, bool contextOwnsConnection)
            : base(existingConnection, model, contextOwnsConnection)
        {
        }

        public RmaDbContext(ObjectContext objectContext, bool dbContextOwnsObjectContext)
            : base(objectContext, dbContextOwnsObjectContext)
        {
        }

        public void DisableFilters()
        {
            this.DisableAllFilters();
        }

        public void EnableFilters()
        {
            this.DisableAllFilters();
            EnableFilter("SoftDeletes");

            if (OverrideMultiTenancyFiltering()) return;
            EnableFilter("MultiTenancyFilter");
        }

        public void EnableFilter(string filterName)
        {
            DynamicFilterExtensions.EnableFilter(this, filterName);
        }

        public void DisableFilter(string filterName)
        {
            DynamicFilterExtensions.DisableFilter(this, filterName);
        }

        public string ConnectionString =>
            GetConnectionString();

        protected void InitializeBase()
        {
            Database.CommandTimeout = CommonDbConstants.CommandTimeout;
            Configuration.LazyLoadingEnabled = false;
            EnableFilters();
            Database.Log = Log.Debug;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            try
            {
                DbInterception.Add(new DynamicFilterInterceptor());
                modelBuilder.Filter("SoftDeletes", (ISoftDeleteEntity d) => d.IsDeleted, false);
                modelBuilder.Filter("MultiTenancyFilter", (ITenantEntity t, List<int> userTenantMap) => userTenantMap.Contains(t.TenantId), (RmaDbContext ctx) => ctx.UserTenantMap());
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private List<int> UserTenantMap()
        {
            var userTenantMap = new List<int>(CurrentUserTenantId());
            userTenantMap.AddRange(RmaIdentity.UserTenantMap);
            return userTenantMap;
        }

        public override int SaveChanges()
        {
            return PrivateSaveChangesAsync(CancellationToken.None).Result;
        }

        public override Task<int> SaveChangesAsync()
        {
            return PrivateSaveChangesAsync(CancellationToken.None);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            return PrivateSaveChangesAsync(cancellationToken);
        }

        private async Task<int> PrivateSaveChangesAsync(CancellationToken cancellationToken)
        {
            foreach (var entry in ChangeTracker.Entries().Where(c => c.State == EntityState.Added).Select(c => c.Entity).OfType<ITenantEntity>())
            {
                if (entry.TenantId == 0) entry.TenantId = CurrentUserTenantId();
            }

            ObjectContext context = ((IObjectContextAdapter)this).ObjectContext;
            int result = await context.SaveChangesAsync(SaveOptions.DetectChangesBeforeSave, cancellationToken).ConfigureAwait(false);

            foreach (var entry in ChangeTracker.Entries().Where(o => o.State != EntityState.Unchanged && o.State != EntityState.Detached).ToList())
            {
                var changeType = entry.State.ToString();
                var entityType = GetEntityType(entry);

                if (SkipAudit(entityType))
                    return result;

                var auditWriter = CommonServiceLocator.ServiceLocator.Current.GetInstance<IAuditWriter>();
                if (auditWriter == null)
                    return result;

                var oldItem = (entry.State == EntityState.Added ? "{  }" : JsonConvert.SerializeObject(entry.OriginalValues.ToObject()));
                var newItem = (entry.State == EntityState.Deleted ? "{  }" : JsonConvert.SerializeObject(entry.CurrentValues.ToObject()));

                var id = GetIdentity(entry);
                if (id > 0)
                {
                    if (entry.State == EntityState.Added)
                        await auditWriter.AddAudit(id, entityType, changeType, oldItem, newItem);

                    if (entry.State == EntityState.Modified)
                        await auditWriter.AddAudit(id, entityType, changeType, oldItem, newItem);

                    if (entry.State == EntityState.Deleted)
                        await auditWriter.AddAudit(id, entityType, changeType, oldItem, newItem);

                    if (entry.State != EntityState.Deleted)
                        await auditWriter.AddLastViewed(id, entityType);
                }
            }

            return result;
        }

        private static bool SkipAudit(Type entityType)
        {
            return entityType.Name == "bpm_Wizard";
        }

        public int GetIdentity(DbEntityEntry entry)
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            var setBase = ((IObjectContextAdapter)this).ObjectContext.ObjectStateManager.GetObjectStateEntry(entry.Entity).EntitySet;
            string[] keyNames = setBase.ElementType.KeyMembers.Select(k => k.Name).ToArray();
            if (keyNames == null || keyNames.Length > 1) return -1;
            var keyName = keyNames.FirstOrDefault();
            if (entry.State == EntityState.Added)
            {
                var value = entry.CurrentValues[keyName];
                return int.Parse(value.ToString());
            }
            else
            {
                var value = entry.OriginalValues[keyName];
                return int.Parse(value.ToString());
            }
        }

        public Type GetEntityType(DbEntityEntry entry)
        {
            if (entry == null) throw new ArgumentNullException(nameof(entry), "entry is null");
            Type entityType = entry.Entity.GetType();

            if (entityType.BaseType != null && entityType.Namespace == "System.Data.Entity.DynamicProxies")
                entityType = entityType.BaseType;
            return entityType;
        }

        public static string GetTableName(ObjectContext context, Type entityType)
        {
            if (entityType == null) throw new ArgumentNullException(nameof(entityType), "entityType is null");
            if (context == null) throw new ArgumentNullException(nameof(context), "context is null");
            string entityTypeName = entityType.Name;

            var container = context.MetadataWorkspace.GetEntityContainer(context.DefaultContainerName, DataSpace.CSpace);
            return (from meta in container.BaseEntitySets
                                where meta.ElementType.Name == entityTypeName
                                select meta.Name).First();
        }
    }
}