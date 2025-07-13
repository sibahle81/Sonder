using RMA.Common.Exceptions;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Common.Extensions
{
    public static class ListExtensions
    {
        public static TEntity Single<TEntity>(this List<TEntity> source, string notFoundMessage)
        {
            if (source == null) throw new ArgumentNullException(nameof(source)); // Explicit null check
            if (source.Count != 1) throw new BusinessException(notFoundMessage); // Remove redundant null check

            return source[0];
        }

        public static TEntity Single<TEntity>(this List<TEntity> source,
            Func<TEntity, bool> predicate, string notFoundMessage)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            var results = source.Where(predicate);
            if (!results.Any() || results.Skip(1).Any())
                throw new BusinessException(notFoundMessage);
            return results.First();
        }

        public static IEnumerable<TSource> DistinctBy<TSource, TKey>
            (this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (keySelector == null) throw new ArgumentNullException(nameof(keySelector));
            return DistinctByIterator(source, keySelector);
        }

        private static IEnumerable<TSource> DistinctByIterator<TSource, TKey>(IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            var seenKeys = new HashSet<TKey>();
            foreach (var element in source.Where(e => seenKeys.Add(keySelector(e))))
            {
                yield return element;
            }
        }
    }
}