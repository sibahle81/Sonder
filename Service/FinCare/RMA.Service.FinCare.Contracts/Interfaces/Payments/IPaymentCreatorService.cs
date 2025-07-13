using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentCreatorService : IService
    {
        Task<int> Create(Payment payment);
        Task<bool> DiscardRejectedPayment(int id);

        Task<bool> ResolveBankingDetailRejection(int paymentId, string accountNo, BankAccountTypeEnum? bankAccountType,
            string bank, string bankBranch);
        Task<List<int>> AddPayments(List<Payment> payments);
        Task<int> CreatePaymentWithAllocations(Payment payment);
    }
}
