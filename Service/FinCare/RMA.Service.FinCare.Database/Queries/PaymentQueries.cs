using RMA.Service.FinCare.Database.Entities;

using System.Linq;

namespace RMA.Service.FinCare.Database.Queries
{
    public static class PaymentQueries
    {
        public static IQueryable<payment_Payment> SearchByPolicyNumber(this IQueryable<payment_Payment> payments, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return payments;
            }

            return payments.Where(p => p.PolicyReference.ToString().Contains(query));
        }

        public static IQueryable<payment_Payment> SearchByClaimNumber(this IQueryable<payment_Payment> payments, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return payments;
            }

            return payments.Where(p => p.ClaimReference.Contains(query));
        }

        public static IQueryable<payment_Payment> SearchByAccountNumber(this IQueryable<payment_Payment> payments, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return payments;
            }

            return payments.Where(p => p.AccountNo.Contains(query));
        }

        public static IQueryable<payment_Payment> SearchByPayee(this IQueryable<payment_Payment> payments, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return payments;
            }

            return payments.Where(p => p.Payee.Contains(query));
        }

        public static IQueryable<payment_Payment> SearchByIdNumber(this IQueryable<payment_Payment> payments, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return payments;
            }

            return payments.Where(p => p.IdNumber.Contains(query));
        }
    }
}
