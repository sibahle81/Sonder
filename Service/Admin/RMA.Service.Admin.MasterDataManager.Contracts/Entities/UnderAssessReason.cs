using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class UnderAssessReason : AuditDetails
    {
        public int UnderAssessReasonId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public InvoiceTypeEnum InvoiceType { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
        public int? OverrideAuditObjectTypeId { get; set; }
        public int? ConfirmAuditObjectTypeId { get; set; }
        public bool? CanReinstate { get; set; }
        public string Action { get; set; }
        public string FirstNotification { get; set; }
        public string SecondNotification { get; set; }
        public string ThirdNotification { get; set; }
        public bool IsLineItemReason { get; set; }
        public int? InvoiceId { get; set; }
        public int? TebaInvoiceId { get; set; }
        public string UnderAssessReasonText { get; set; }
        public string Comments { get; set; }
    }
}
