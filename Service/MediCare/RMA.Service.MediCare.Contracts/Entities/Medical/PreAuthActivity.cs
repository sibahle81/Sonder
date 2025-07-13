using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthActivity : Common.Entities.AuditDetails
    {
        public int PreAuthActivityId { get; set; }
        public int PreAuthId { get; set; }
        public PreAuthActivityTypeEnum? PreAuthActivityType { get; set; }
        public PreAuthStatusEnum PreAuthStatus { get; set; }
        public string Comment { get; set; }
    }
}
