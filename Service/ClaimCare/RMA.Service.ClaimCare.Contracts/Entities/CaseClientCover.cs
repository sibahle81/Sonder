using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CaseClientCover : AuditDetails
    {
        public int CaseId { get; set; } // CaseId
        public int ClientCoverId { get; set; } // ClientCoverId
        public Case Case { get; set; }
    }
}