using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceUnderAssessReason : AuditDetails
    {
        public int? InvoiceId { get; set; }
        public int? TebaInvoiceId { get; set; }
        public int UnderAssessReasonId { get; set; }
        public string UnderAssessReason { get; set; }
        public string Comments { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
    }
}
