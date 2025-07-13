using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRolePlayerBankingModel
    {
        public ClaimRolePlayerBankingModel()
        {
            RolePlayer = new RolePlayer();
            RolePlayerBankingDetail = new RolePlayerBankingDetail();
        }

        public RolePlayer RolePlayer { get; set; }
        public RolePlayerBankingDetail RolePlayerBankingDetail { get; set; }
        public bool IsVerified { get; set; }
    }
}