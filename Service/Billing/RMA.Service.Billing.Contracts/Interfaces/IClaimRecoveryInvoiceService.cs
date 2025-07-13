using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IClaimRecoveryInvoiceService : IService
    {
        Task<ClaimRecoveryInvoice> GetInvoice(int id);
        Task<int> AddInvoice(ClaimRecoveryInvoice invoice);
        Task<List<ClaimRecoveryInvoice>> GetUnsettledInvoices(int rolePlayerId);
        Task<List<InvoicePaymentAllocation>> GetUnPaidInvoices(int roleplayerId);
    }
}