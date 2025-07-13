using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IPeriodService : IService
    {
        Task<Period> GetCurrentPeriod();
        Task<Period> GetPeriod(DateTime transactionDate);
        Task<List<Period>> GetPeriods();
        Task<Period> GetPeriodById(int id);
        Task<int> AddPeriod(Period period);
        Task<Period> GetPeriodByDate(DateTime transactionDate);
        Task EditPeriod(Period period);
        Task RemovePeriod(int id);
        Task<Period> GetLatestPeriod();
        Task<int> GenerateBillingPeriods();
        Task<int> RollBillingPeriods(bool runPeriodConcurrently);
        Task<bool> CanAutoRollBillingPeriods();
        Task<Period> GetPeriodByYearAndMonth(int year, int month);
    }
}