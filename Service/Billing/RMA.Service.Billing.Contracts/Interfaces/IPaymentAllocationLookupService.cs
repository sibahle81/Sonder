using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IPaymentAllocationLookupService : IService
    {
        Task<bool> CreateAllocationLookups(List<PaymentAllocationLookup> allocationLookups);
        Task<List<PaymentAllocationLookup>> GetAllocationLookupsByDebtorNumber(string referenceNumber);
        Task<List<PaymentAllocationLookup>> GetAllocationLookups();
        Task<PaymentAllocationLookup> GetAllocationLookup(int allocationLookupId);
        Task<bool> DeleteAllocationLookup(int allocationLookupId);

        /// <summary>
        /// Get unprocessed payment reference lookups, if any, find related bank statement entries and allocate transactions.
        /// Reduce the balance of unallocated payments
        /// </summary>
        /// <returns></returns>
        Task AllocatePaymentsFromReferenceLookups();
    }
}