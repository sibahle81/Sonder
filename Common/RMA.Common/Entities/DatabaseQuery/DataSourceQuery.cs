using RMA.Common.Extensions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace RMA.Common.Entities.DatabaseQuery
{
    /// <summary>
    ///     the below classes are intended to be used when paging the database
    /// </summary>
    [DataContract]
    public class PagedRequest
    {
        private string _searchCriteria;

        public PagedRequest()
        {
            Page = 1;
            PageSize = 10;
            IsAscending = true;
        }

        public PagedRequest(string searchCriteria, int page, int pageSize)
        {
            SearchCriteria = searchCriteria;
            Page = page;
            PageSize = pageSize;
            IsAscending = true;
        }

        public PagedRequest(string searchCriteria, int page, int pageSize, string orderBy, bool isAscending)
        {
            SearchCriteria = searchCriteria;
            Page = page;
            PageSize = pageSize;
            OrderBy = orderBy;
            IsAscending = isAscending;
        }

        [DataMember]
        public string SearchCriteria
        {
            get
            {
                return _searchCriteria.Decode();
            }
            set => _searchCriteria = value;
        }

        [DataMember]
        public int Page { get; set; }

        [DataMember]
        public int PageSize { get; set; }

        [DataMember]
        public string OrderBy { get; set; }

        [DataMember]
        public bool IsAscending { get; set; }
    }

    [DataContract]
    public class PagedRequest<TQueryParam> : PagedRequest
    {
        public PagedRequest()
        {
            Page = 1;
            PageSize = 10;
            IsAscending = true;
        }

        public PagedRequest(int page, int pageSize)
        {
            Page = page;
            PageSize = pageSize;
            IsAscending = true;
        }

        public PagedRequest(PagedRequest search, TQueryParam searchParams)
        {
            if (search == null) throw new ArgumentNullException(nameof(search), "search is null");
            Page = search.Page;
            PageSize = search.PageSize;
            OrderBy = search.OrderBy;
            SearchCriteria = searchParams;
            IsAscending = true;
        }

        [DataMember] public new TQueryParam SearchCriteria { get; set; }
    }

    [KnownType("GetKnownTypes")]
    [DataContract]
    public class PagedRequestResult<TResult>
    {
        /// <summary>
        ///     Represents a single page of processed data.
        /// </summary>
        [DataMember]
        public List<TResult> Data { get; set; }

        /// <summary>
        ///     The total number of records available.
        /// </summary>
        [DataMember]
        public int RowCount { get; set; }

        /// <summary>
        /// Current page number
        /// </summary>
        [DataMember]
        public int Page { get; set; }

        /// <summary>
        /// number of records per page
        /// </summary>
        [DataMember]
        public int PageSize { get; set; }

        /// <summary>
        /// Number of pages at the current page size
        /// </summary>
        [DataMember]
        public int PageCount { get; set; }

        /// <summary>
        ///     Used by the KnownType attribute which is required for WCF serialization support
        /// </summary>
        /// <returns></returns>
#pragma warning disable S1144 // Unused private types or members should be removed
        private static Type[] GetKnownTypes()
        {
            var assembly = AppDomain.CurrentDomain
                .GetAssemblies()
                .FirstOrDefault(a => a.FullName.StartsWith("DynamicClasses"));

            if (assembly == null) return new Type[0];

            return assembly.GetTypes()
                .Where(t => t.Name.StartsWith("DynamicClass"))
                .ToArray();
        }
#pragma warning restore S1144 // Unused private types or members should be removed
    }

}