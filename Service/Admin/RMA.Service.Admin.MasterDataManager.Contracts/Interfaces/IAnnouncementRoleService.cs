using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IAnnouncementRoleService : IService
    {
        Task<int> AddAnnouncementRole(AnnouncementRole announcementRole);
        Task EditAnnouncementRole(AnnouncementRole announcementRole);
        Task RemoveAnnouncementRolesByAnnouncementId(int announcementId);
        Task<List<AnnouncementRole>> GetAnnouncementRoles();
        Task<List<AnnouncementRole>> GetAnnouncementRolesByAnnouncementId(int announcementId);
    }
}
