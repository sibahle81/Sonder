using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IAnnouncementService : IService
    {
        Task<int> AddAnnouncement(Announcement announcement);
        Task EditAnnouncement(Announcement announcement);
        Task<List<Announcement>> GetAnnouncements();
        Task<PagedRequestResult<Announcement>> GetPagedAnnouncements(PagedRequest request);
        Task<Announcement> GetAnnouncementById(int announcementId);
        Task<List<Announcement>> GetAnnouncementsByUserId(int userId);
        Task<int> GetAnnouncementCountForUserId(int userId);
    }
}
