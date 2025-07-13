using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class TraceDocumentModel : AuditDetails
    {
        public int ClaimId { get; set; }
        public bool DocumentIsUploaded { get; set; }
    }
}