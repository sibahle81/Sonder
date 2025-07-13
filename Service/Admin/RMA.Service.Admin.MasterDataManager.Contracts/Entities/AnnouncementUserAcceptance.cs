using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AnnouncementUserAcceptance : AuditDetails
    {
        public int AnnouncementUserAcceptanceId { get; set; }
        public int AnnouncementId { get; set; }
        public int UserId { get; set; }
        public bool IsAccepted { get; set; }
    }
}
