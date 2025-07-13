using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimantRecoveryModel
    {
        public RolePlayer RolePlayer { get; set; }
        public ClaimRecoveryReasonEnum RecoveryReason { get; set; }
        public decimal? RecoveryAmount { get; set; }
        public int ClaimId { get; set; }
        public string PaymentPlan { get; set; }
        public int PaymentDay { get; set; }

    }
}