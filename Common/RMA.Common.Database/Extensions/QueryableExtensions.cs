using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Exceptions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RMA.Common.Database.Extensions
{
    public static class QueryableExtensions
    {
        public static TEntity Single<TEntity>(this IQueryable<TEntity> source, string notFoundMessage)
        {
            var results = source.ToList();
            if (results == null || results.Count != 1) throw new BusinessException(notFoundMessage);
            return results.Single();
        }

        public static TEntity Single<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate, string notFoundMessage)
        {
            var results = source.Where(predicate).ToList();
            if (results == null || results.Count != 1) throw new BusinessException(notFoundMessage);
            return results.Single();
        }

        public static Task<TEntity> SingleAsync<TEntity>(this IQueryable<TEntity> source)
        {
            return System.Data.Entity.QueryableExtensions.SingleAsync(source);
        }

        public static Task<TEntity> SingleAsync<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate)
        {
            return System.Data.Entity.QueryableExtensions.SingleAsync(source, predicate);
        }

        public static Task<TEntity> FirstAsync<TEntity>(this IQueryable<TEntity> source)
        {
            return System.Data.Entity.QueryableExtensions.FirstAsync(source);
        }

        public static Task<TEntity> FirstAsync<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate)
        {
            return System.Data.Entity.QueryableExtensions.FirstAsync(source, predicate);
        }

        public static async Task<TEntity> SingleAsync<TEntity>(this IQueryable<TEntity> source, string notFoundMessage)
        {
            var results = await source.ToListAsync().ConfigureAwait(false);
            if (results == null || results.Count != 1) throw new BusinessException(notFoundMessage);
            return results.Single();
        }

        public static async Task<TEntity> SingleAsync<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate, string notFoundMessage)
        {
            var results = await source.Where(predicate).ToListAsync().ConfigureAwait(false);
            if (results == null || results.Count != 1) throw new BusinessException(notFoundMessage);
            return results.Single();
        }

        public static async Task<List<TEntity>> AtLeastOneAsync<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate, string notFoundMessage)
        {
            var results = await source.Where(predicate).ToListAsync().ConfigureAwait(false);
            if (results == null || results.Count <= 0) throw new BusinessException(notFoundMessage);
            return results;
        }

        public static async Task<List<TEntity>> AtLeastOneAsync<TEntity>(this IQueryable<TEntity> source,
            string notFoundMessage)
        {
            var results = await source.ToListAsync().ConfigureAwait(false);
            if (results == null || results.Count <= 0) throw new BusinessException(notFoundMessage);
            return results;
        }

        public static List<IEnumerable<T>> Batch<T>(this IEnumerable<T> items, int qtyPerBatch)
        {
            var iterations = decimal.Divide(items.Count(), qtyPerBatch);
            var roundedIterations = (int)Math.Ceiling(iterations);
            var batchItems = new List<IEnumerable<T>>();
            for (var i = 0; i < roundedIterations; i++)
                batchItems.Add(items.Skip(i * qtyPerBatch).Take(qtyPerBatch).ToArray());
            return batchItems;
        }

        public static Task<TEntity> SingleOrDefaultAsync<TEntity>(this IQueryable<TEntity> source)
        {
            return System.Data.Entity.QueryableExtensions.SingleOrDefaultAsync(source);
        }

        public static Task<TEntity> SingleOrDefaultAsync<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate)
        {
            return System.Data.Entity.QueryableExtensions.SingleOrDefaultAsync(source.Where(predicate));
        }

        public static Task<TEntity> FirstOrDefaultAsync<TEntity>(this IQueryable<TEntity> source)
        {
            return System.Data.Entity.QueryableExtensions.FirstOrDefaultAsync(source);
        }

        public static Task<TEntity> FirstOrDefaultAsync<TEntity>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, bool>> predicate)
        {
            return System.Data.Entity.QueryableExtensions.FirstOrDefaultAsync(source.Where(predicate));
        }

        public static IQueryable<TEntity> Include<TEntity, TProperty>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, TProperty>> path) where TProperty : ILazyLoadSafeEntity
        {
            return System.Data.Entity.QueryableExtensions.Include(source, path);
        }

        public static IQueryable<TEntity> Include<TEntity, TProperty>(this IQueryable<TEntity> source,
            Expression<Func<TEntity, ICollection<TProperty>>> path) where TProperty : ILazyLoadSafeEntity
        {
            return System.Data.Entity.QueryableExtensions.Include(source, path);
        }

        public static Task<List<TSource>> ToListAsync<TSource>(this IQueryable<TSource> source)
        {
            return System.Data.Entity.QueryableExtensions.ToListAsync(source);
        }

        public static Task<TEntity[]> ToArrayAsync<TEntity>(this IQueryable<TEntity> source)
        {
            return System.Data.Entity.QueryableExtensions.ToArrayAsync(source);
        }

        public static Task<bool> AnyAsync<TEntity>(this IQueryable<TEntity> source)
        {
            return System.Data.Entity.QueryableExtensions.AnyAsync(source);
        }

        public static Task<bool> AnyAsync<TEntity>(this IQueryable<TEntity> source, Expression<Func<TEntity, bool>> predicate)
        {
            return System.Data.Entity.QueryableExtensions.AnyAsync(source, predicate);
        }
    }
}