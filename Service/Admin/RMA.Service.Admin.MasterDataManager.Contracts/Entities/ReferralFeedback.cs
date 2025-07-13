using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ReferralFeedback
    {
        public int ReferralFeedbackId { get; set; }
        public int ReferralId { get; set; }
        public string Comment { get; set; }
        public bool IsDeleted { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
    }
}