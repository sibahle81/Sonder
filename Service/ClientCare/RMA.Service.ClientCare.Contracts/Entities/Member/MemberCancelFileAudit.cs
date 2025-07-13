using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class MemberCancelFileAudit
    {
        public int Id { get; set; }
        public string FileHash { get; set; }
        public string FileName { get; set; }
        public PremiumListingStatusEnum PremiumListingStatus { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
