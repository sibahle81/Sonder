using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.Qlink
{
    public class QlinkPolicyModel : QlinkTransactionModel
    {
        public decimal? PolicyPremium { get; set; }
        public string PolicyNumber { get; set; }
        public PolicyStatusEnum PolicyStatus { get; set; }
    }
}
