using RMA.Common.Database.Contracts.ContextScope;

using System;
using System.Data;

namespace RMA.Common.Database.ContextScope
{
    public class DbContextReadOnlyScope : IDbContextReadOnlyScope
    {
        private readonly DbContextScope _internalScope;
        private bool _disposed;

        public DbContextReadOnlyScope(IDbContextFactory dbContextFactory = null)
            : this(DbContextScopeOption.JoinExisting, null, dbContextFactory)
        {
        }

        public DbContextReadOnlyScope(IsolationLevel isolationLevel, IDbContextFactory dbContextFactory = null)
            : this(DbContextScopeOption.ForceCreateNew, isolationLevel, dbContextFactory)
        {
        }

        public DbContextReadOnlyScope(DbContextScopeOption joiningOption, IsolationLevel? isolationLevel,
            IDbContextFactory dbContextFactory = null)
        {
            _internalScope = new DbContextScope(joiningOption, true, isolationLevel, dbContextFactory);
        }

        public IDbContextCollection DbContexts => _internalScope.DbContexts;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_disposed) return;
                _internalScope.Dispose();
                _disposed = true;
            }
        }

        ~DbContextReadOnlyScope()
        {
            Dispose(false);
        }
    }
}