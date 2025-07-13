using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceLineUnderAssessReason : AuditDetails
    {
        public int? InvoiceLineId { get; set; }
        public int? TebaInvoiceLineId { get; set; }
        public int UnderAssessReasonId { get; set; }
        public string UnderAssessReason { get; set; }
        public string Comments { get; set; }
    }
}
