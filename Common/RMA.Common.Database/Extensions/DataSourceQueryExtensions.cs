using AutoMapper;

using RMA.Common.Entities.DatabaseQuery;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Dynamic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RMA.Common.Database.Extensions
{
    public static class DataSourceQueryExtensions
    {
        const bool UseDynamicOrdering = true; //Feature Flag

        /// <summary>
        ///     Applies data processing (paging, sorting and filtering) over IQueryable using Dynamic Linq.
        /// </summary>
        /// <typeparam name="TSource">The type of the IQueryable.</typeparam>
        /// <param name="queryable">The IQueryable which should be processed.</param>
        /// <param name="request">The DataSourceRequest object containing take, skip, order, and filter data.</param>
        /// <returns>A DataSourceResult object populated from the processed IQueryable.</returns>
        public static async Task<PagedRequestResult<TSource>> ToPagedResult<TSource>(this IQueryable<TSource> queryable,
            PagedRequest request)
        {
            // Calculate the total number of records (needed for paging)
            var total = await queryable.CountAsync();

            // Sort the data
            if (UseDynamicOrdering)
            {
                queryable = Sort(queryable, request.OrderBy, request.IsAscending);
            }
            else
            {
                var orderByPropertyExpression = OrderByPropertyExpression<TSource>(request.OrderBy);
                queryable = request.IsAscending
                    ? queryable.OrderBy(orderByPropertyExpression)
                    : queryable.OrderByDescending(orderByPropertyExpression);
            }

            // Finally page the data
            if (request.PageSize > 0) queryable = Page(queryable, request.PageSize, request.Page);

            var pageCount = (double)total / request.PageSize;

            return new PagedRequestResult<TSource>
            {
                Data = await queryable.ToListAsync(),
                RowCount = total,
                PageCount = (int)Math.Ceiling(pageCount),
                PageSize = request.PageSize,
                Page = request.Page
            };
        }

        /// <summary>
        ///  Applies data processing (paging, sorting and filtering) over IQueryable using Dynamic Linq.
        /// </summary>
        /// <typeparam name="TSource">The type of the IQueryable.</typeparam>
        /// <typeparam name="TResult">The type of the List Response - ProjectedTo with AutoMapper</typeparam>
        /// <param name="queryable">The IQueryable which should be processed.</param>
        /// <param name="request">The DataSourceRequest object containing take, skip, order, and filter data.</param>
        /// <returns>A DataSourceResult object populated from the processed IQueryable.</returns>
        public static async Task<PagedRequestResult<TResult>> ToPagedResult<TSource, TResult>(this IQueryable<TSource> queryable,
            PagedRequest request, IMapper mapper = null) where TResult : class
        {
            // Calculate the total number of records (needed for paging)
            var total = await queryable.CountAsync();

            // Sort the data
            if (UseDynamicOrdering)
            {
                queryable = Sort(queryable, request.OrderBy, request.IsAscending);
            }
            else
            {
                var orderByPropertyExpression = OrderByPropertyExpression<TSource>(request.OrderBy);
                queryable = request.IsAscending
                    ? queryable.OrderBy(orderByPropertyExpression)
                    : queryable.OrderByDescending(orderByPropertyExpression);
            }

            // Finally page the data
            if (request.PageSize > 0) queryable = Page(queryable, request.PageSize, request.Page);

            var pageCount = (double)total / request.PageSize;

            var data = await queryable
                //.ProjectTo<TResult>()
                .ToListAsync();
            var mappedData = mapper == null ? Mapper.Map<List<TResult>>(data) : mapper.Map<List<TResult>>(data);

            return new PagedRequestResult<TResult>
            {
                Data = mappedData,
                RowCount = total,
                PageCount = (int)Math.Ceiling(pageCount),
                PageSize = request.PageSize,
                Page = request.Page
            };
        }

        private static Expression<Func<T, string>> OrderByPropertyExpression<T>(string orderBy)
        {
            if (string.IsNullOrEmpty(orderBy)) orderBy = "Id";

            //This is the Expression Tree, make sure the column name exists
            var parameter = Expression.Parameter(typeof(T), typeof(T).Name);
            var member = Expression.Property(parameter, orderBy);

            return Expression.Lambda<Func<T, string>>(member, new[] { parameter });
        }

        private static IQueryable<T> Sort<T>(IQueryable<T> queryable, string orderBy, bool isAscending)
        {
            if (string.IsNullOrEmpty(orderBy)) orderBy = "Id";

            if (isAscending)
                return queryable.OrderBy($"{orderBy} asc");
            else
                return queryable.OrderBy($"{orderBy} desc");
        }

        private static IQueryable<T> Page<T>(IQueryable<T> queryable, int pageSize, int page)
        {
            var skipVal = (page - 1) * pageSize;
            if (skipVal > 0) queryable = queryable.Skip(skipVal);
            if (pageSize > 0) queryable = queryable.Take(pageSize);
            return queryable;
        }
    }
}