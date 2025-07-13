using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimInvestigation
    {
        public ClaimInvestigation()
        {
            RolePlayer = new RolePlayer();
        }

        public RolePlayer RolePlayer { get; set; }
        public int ClaimId { get; set; }
        public DocumentSetEnum DocumentSetc { get; set; }
        public int personEventId { get; set; }
        public bool FraudulentCase { get; set; }
        public DocumentSetEnum ClaimDocumentSet { get; set; }
    }
}