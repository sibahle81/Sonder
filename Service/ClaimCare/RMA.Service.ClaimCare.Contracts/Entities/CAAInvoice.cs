namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CAAInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public int PayeeId { get; set; } // PayeeId
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public string Description { get; set; } // Description (length: 100)
        public string UnderAssessedReason { get; set; } // UnderAssessedReason (length: 100)
        public string CalcOperands { get; set; } // CalcOperands (length: 250)
        public int EarningsId { get; set; } // EarningsId
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int ClaimId { get; set; } // ClaimId

    }
}
