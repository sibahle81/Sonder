using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IInterBankTransferService : IService
    {
        Task<List<RmaBankAccount>> GetRmaBankAccounts();
        Task<RmaBankAccount> GetRmaBankAccount(int rmaBankAccountId);
        Task<RmaBankAccount> AddRmaBankAccount(RmaBankAccount rmaBankAccount);
        Task<RmaBankAccount> EditRmaBankAccount(RmaBankAccount rmaBankAccount);
        Task<int> InitiateTransferToBank(InterBankTransfer interBankTransfer, int wizardId);
        Task<RmaBankAccountTransaction> GetTransactionByBank(RmaBankAccount rmaBankAccount);
        Task<bool> CompleteTransferToBank(int interBankTransferId);
        Task<List<InterBankTransfer>> GetAllBankTransfers();
        Task<InterBankTransfer> GetTransfer(string statementReference);
        Task MarkTransferAsAllocated(int interBankTransferId);
        Task<List<RmaBankAccount>> GetDebtorBankAccounts(string debtorNumber);
        Task CreateInterBankTransferWizard(InterBankTransfer interBankTransfer);

        Task TransferPremiumPayableFromClaim(int policyId, decimal premiumPayable,
            string claimsBankAccountNumber);
        Task<int> TransferFromBankToBank(Payment payment);
        Task<bool> QueueInterbankOnPaymentPool(InterBankTransfer interBankTransfer, string toRoleplayerReference);
        Task<InterBankTransfer> GetInterbankTransferById(int transferId);
        Task<List<InterBankTransferDetail>> GetTransferDetaislByInterbankId(int transferId);
        Task<List<CompanyBranchBankAccount>> GetCompanyBranchBankAccounts();
    }
}
