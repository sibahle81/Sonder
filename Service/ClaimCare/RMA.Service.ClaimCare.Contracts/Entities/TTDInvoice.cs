using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class TtdInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public System.DateTime DateReceived { get; set; } // DateReceived
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public string Payee { get; set; } // Payee (length: 50)
        public string Description { get; set; } // Description
        public string MemberName { get; set; } // MemberName (length: 50)
        public string OtherEmployer { get; set; } // OtherEmployer (length: 50)
        public System.DateTime DateOffFrom { get; set; } // DateOffFrom
        public System.DateTime DateOffTo { get; set; } // DateOffTo
        public InvoiceTypeEnum InvoiceType { get; set; } // InvoiceTypeId
        public string FinalInvoice { get; set; } // FinalInvoice (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

    }
}
