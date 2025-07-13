using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class RejectDocument : AuditDetails
    {
        public int PersonEventId { get; set; }
        public string Reason { get; set; }
    }
}