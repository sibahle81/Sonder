using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Collections.Generic;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentsAllocationService : IService
    {
        Task<Payment> GetPaymentByAllocationId(int allocationId);
        Task<List<Payment>> GetPaymentsByAllocationId(int allocationId);
        Task<int> CreatePaymentAllocation(Allocation paymentAllocation);
        Task<Allocation> GetAllocationsByMedicalInvoiceId(int medicalInvoiceId, PaymentTypeEnum paymentTypeEnum);
        Task<int> UpdateAllocation(Allocation allocation);
        Task<Allocation> GetAllocationByAllocationId(int allocationId);
        Task<List<Allocation>> GetAllocationsByPaymentId(int paymentId);
        Task<Allocation> GetAllocationsByInvoiceAllocationId(int invoiceAllocationId);
    }
}

