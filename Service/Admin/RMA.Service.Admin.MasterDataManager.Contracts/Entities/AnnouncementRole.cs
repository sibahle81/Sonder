using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AnnouncementRole : AuditDetails
    {
        public int AnnouncementRoleId { get; set; }
        public int AnnouncementId { get; set; }
        public int RoleId { get; set; }
    }
}
