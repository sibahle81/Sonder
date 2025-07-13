using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoiceUnderAssessReason : AuditDetails
    {
        public int SwitchBatchInvoiceId { get; set; }
        public SwitchUnderAssessReasonEnum SwitchUnderAssessReason { get; set; }
        public string UnderAssessReason { get; set; }
        public string Comments { get; set; }
    }
}
