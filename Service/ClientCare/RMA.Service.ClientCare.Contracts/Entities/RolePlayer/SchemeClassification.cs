using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class SchemeClassification
    {
        public int RolePlayerId { get; set; }
        public UnderwrittenEnum Underwritten { get; set; }
        public PolicyHolderTypeEnum PolicyHolderType { get; set; }
        public bool IsPartnership { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
