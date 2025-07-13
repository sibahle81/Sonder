using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IPublicHolidayService : IService
    {
        Task<List<PublicHoliday>> GetPublicHolidays();
        Task<PublicHoliday> GetPublicHoliday(int id);
        Task<int> AddPublicHoliday(PublicHoliday publicHoliday);
        Task EditPublicHoliday(PublicHoliday publicHoliday);
        Task RemovePublicHoliday(int id);
    }
}