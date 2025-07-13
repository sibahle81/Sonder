namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class FatalLumpsumInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public int PayeeId { get; set; } // PayeeId
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public string Description { get; set; } // Description (length: 250)
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int ClaimId { get; set; } // ClaimId
        public ClaimInvoice ClaimInvoice { get; set; }

    }
}
