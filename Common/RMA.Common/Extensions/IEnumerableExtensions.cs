using RMA.Common.Exceptions;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Common.Extensions
{
    public static class EnumerableExtensions
    {
        public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (action == null) throw new ArgumentNullException(nameof(action));
            foreach (var item in source)
                action(item);
        }

        public static TEntity Single<TEntity>(this IEnumerable<TEntity> source, string notFoundMessage)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            var results = source.ToList();
            if (results.Count <= 0) throw new BusinessException(notFoundMessage);
            return results[0];
        }

        public static TEntity Single<TEntity>(this IEnumerable<TEntity> source,
            Func<TEntity, bool> predicate, string notFoundMessage)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            var results = source.Where(predicate);
            if (results.Count() != 1) throw new BusinessException(notFoundMessage);
            return results.First();
        }
    }
}