using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IUserReminderService : IService
    {
        Task<int> CreateUserReminder(UserReminder userReminder);
        Task<int> CreateUserReminders(List<UserReminder> userReminders);
        Task<int> UpdateUserReminder(UserReminder userReminder);
        Task<int> UpdateUserReminders(List<UserReminder> userReminders);
        Task<PagedRequestResult<UserReminder>> GetPagedUserReminders(UserReminderSearchRequest userReminderSearchRequest);
        Task<bool> CheckUserHasAlerts(int userId);
        Task<int> CheckMessageCount(int userId);
    }
}