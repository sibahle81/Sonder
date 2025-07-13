using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DaysOffInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public System.DateTime DateReceived { get; set; } // DateReceived
        public int? AuthorisedDaysOff { get; set; } // AuthorisedDaysOff
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public string Description { get; set; } // Description
        public string MemberName { get; set; } // MemberName (length: 50)
        public string OtherEmployer { get; set; } // OtherEmployer (length: 50)
        public System.DateTime? DaysOffFrom { get; set; } // DaysOffFrom
        public System.DateTime? DaysOffTo { get; set; } // DaysOffTo
        public int? TotalDaysOff { get; set; } // TotalDaysOff
        public InvoiceTypeEnum InvoiceType { get; set; } // InvoiceTypeId
        public string FinalInvoice { get; set; } // FinalInvoice (length: 50)
        public ClaimInvoice ClaimInvoice { get; set; } // FK_DaysOffInvoice_ClaimInvoice
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate 
        public int? PayeeRolePlayerId { get; set; } // PayeeRolePlayerId
        public int? FirstMedicalReportFormId { get; set; } // FirstMedicalReportFormId

    }
}
