using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class ClientRateRequest
    {
        public int RolePlayerId { get; set; }
        public int ProductOptionId { get; set; }
        public CategoryInsuredEnum CategoryInsured { get; set; }
        public int RatingYear { get; set; }
    }
}