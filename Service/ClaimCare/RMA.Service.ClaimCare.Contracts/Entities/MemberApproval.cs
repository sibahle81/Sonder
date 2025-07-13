using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class MemberApproval
    {
        public virtual RolePlayer RolePlayer { get; set; }
        public virtual Event Event { get; set; }
    }
}
