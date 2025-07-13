using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IInterDebtorTransferService : IService
    {
        Task<InterDebtorTransfer> InitiateTransferToDebtor(InterDebtorTransfer interDebtorTransfer);
        Task MarkTransferAsAllocated(int interDebtorTransferId);
        Task<bool> CheckDebtorsHaveIdenticalIndustryClass(string fromDebtorNumber, string toDebtorNumber);
        Task<bool> CheckDebtorsHaveIdenticalBankAccounts(string fromAccountNumber, string toAccountNumber);
        Task<List<InterDebtorTransfer>> GetDebtorInterDebtorTransfers(int rolePlayerId);
        Task<DateTime> DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum periodStatus);
        Task<decimal> GetTransactionBalance(int transactionId);
    }
}
