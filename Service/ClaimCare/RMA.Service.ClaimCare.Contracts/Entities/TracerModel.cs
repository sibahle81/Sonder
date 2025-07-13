using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class TracerModel
    {
        public int ClaimId { get; set; }
        public RolePlayer RolePlayer { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public decimal FuneralTracingMaxAmount { get; set; }
    }
}
