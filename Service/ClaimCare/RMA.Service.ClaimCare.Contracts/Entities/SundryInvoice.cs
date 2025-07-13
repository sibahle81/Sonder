namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class SundryInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public string Description { get; set; } // Description (length: 255)
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public string SupplierInvoiceNo { get; set; } // SupplierInvoiceNo (length: 100)
        public System.DateTime ServiceDate { get; set; } // ServiceDate
        public int ProviderType { get; set; } // ProviderType
        public string ProviderName { get; set; } // ProviderName (length: 255)
        public int ServiceType { get; set; } // ServiceType
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 10)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public ClaimInvoice ClaimInvoice { get; set; }
        public int PersonEventId { get; set; } // PersonEventId
        public int? PayeeRolePlayerId { get; set; } // PayeeRolePlayerId
    }

}