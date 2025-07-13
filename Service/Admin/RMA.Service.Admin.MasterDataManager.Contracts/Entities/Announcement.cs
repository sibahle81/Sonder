using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Announcement : AuditDetails
    {
        public int AnnouncementId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Html { get; set; }
        public bool IsMandatory { get; set; }
        public int PriorityId { get; set; }
        public bool IncludeAllRoles { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
    }
}
