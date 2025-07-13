namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class WidowLumpSumInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public string Description { get; set; } // Description (length: 255)
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public int? PayeeRolePlayerId { get; set; } // PayeeRolePlayerId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public ClaimInvoice ClaimInvoice { get; set; }
        public int ClaimId { get; set; } // ClaimId
    }

}