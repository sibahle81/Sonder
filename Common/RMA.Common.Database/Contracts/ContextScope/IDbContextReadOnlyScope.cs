﻿using System;

namespace RMA.Common.Database.Contracts.ContextScope
{
    /// <summary>
    ///     A read-only DbContextScope. Refer to the comments for IDbContextScope
    ///     for more details.
    /// </summary>
    public interface IDbContextReadOnlyScope : IDisposable
    {
        /// <summary>
        ///     The DbContext instances that this DbContextScope manages.
        /// </summary>
        IDbContextCollection DbContexts { get; }
    }
}