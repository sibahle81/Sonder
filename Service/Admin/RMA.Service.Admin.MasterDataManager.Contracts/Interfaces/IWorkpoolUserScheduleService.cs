using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IWorkpoolUserScheduleService : IService
    {
        Task<bool> AddMonthlyScheduleWorkpoolUser(List<MonthlyScheduledWorkPoolUser> monthlyScheduledWorkPoolUsers);
        Task<PagedRequestResult<MonthlyScheduledWorkPoolUser>> GetMonthlyScheduleWorkpoolUser(PagedRequest request);
    }
}
