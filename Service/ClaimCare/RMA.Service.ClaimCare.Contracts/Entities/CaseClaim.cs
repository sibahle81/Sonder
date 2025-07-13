using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CaseClaim : AuditDetails
    {
        public int ClaimId { get; set; }
        public int FuneralId { get; set; }
    }
}