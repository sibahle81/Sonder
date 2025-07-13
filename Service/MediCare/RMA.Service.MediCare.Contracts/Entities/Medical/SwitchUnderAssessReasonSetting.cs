using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    //internal class SwitchUnderAssessReasonSetting
    public class SwitchUnderAssessReasonSetting
    {
        public int Id { get; set; } // Id (Primary key)
        public string Code { get; set; } // Code (length: 200)
        public string Name { get; set; } // Name (length: 2048)
        public InvoiceTypeEnum InvoiceType { get; set; } // InvoiceTypeId
        public InvoiceStatusEnum InvoiceStatus { get; set; } // InvoiceStatusId
        public bool? IsAutoCanReinstate { get; set; } // IsAutoCanReinstate
        public string Action { get; set; } // Action (length: 100)
        public bool? IsLineItemReason { get; set; } // IsLineItemReason
        public bool? IsAutoValidation { get; set; } // IsAutoValidation
    }
}
