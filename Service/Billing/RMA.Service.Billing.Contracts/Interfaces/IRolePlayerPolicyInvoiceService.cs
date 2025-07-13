using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IRolePlayerPolicyInvoiceService : IService
    {
        Task<int> AddInvoiceItem(Invoice invoice);
        Task AssignInvoiceNumbers();
        Task<List<PolicyBilling>> GetDebtorsPolicyBillingInvoice(int rolePlayerId, DateTime billingPeriod);
    }
}