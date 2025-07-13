using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class SupportingDocument : AuditDetails
    {
        public int LinkedItemId { get; set; }
        public string LinkedItemType { get; set; }
        public string DocumentName { get; set; }
        public System.Guid DocumentToken { get; set; }
    }
}