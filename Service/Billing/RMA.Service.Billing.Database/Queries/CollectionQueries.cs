using RMA.Service.Billing.Database.Entities;

using System.Linq;

namespace RMA.Service.Billing.Database.Queries
{
    public static class CollectionQueries
    {
        public static IQueryable<billing_Collection> SearchByPolicyNumber(this IQueryable<billing_Collection> collections, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return collections;
            }

            return collections.Where(p => p.BankReference.ToString().Contains(query));
        }
    }
}
