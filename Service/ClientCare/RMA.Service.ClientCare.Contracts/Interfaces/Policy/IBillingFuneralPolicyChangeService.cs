using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IBillingFuneralPolicyChangeService : IService
    {
        Task CreateAdjustmentInvoice(InvoiceAdjustmentDetails invoiceAdjustmentDetails);
        Task ProcessBillingPolicyChanges(BillingPolicyChangeMessage policyChangesMessage);
    }
}
