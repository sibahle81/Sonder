namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class TravelInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public decimal Kilometers { get; set; } // Kilometers
        public decimal KilometersRate { get; set; } // KilometersRate
        public System.DateTime DateTravelledFrom { get; set; } // DateTravelledFrom
        public System.DateTime DateTravelledTo { get; set; } // DateTravelledTo
        public int TravelRateTypeId { get; set; } // TravelRateTypeId
        public int? TebaSwitchBatchId { get; set; } // TebaSwitchBatchId
        public int? TebaSwitchTransactionNo { get; set; } // TebaSwitchTransactionNo
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int ClaimId { get; set; } // ClaimId
        public int? PayeeTypeId { get; set; } // PayeeTypeId
        public int? PayeeRolePlayerId { get; set; } // PayeeRolePlayerId

    }
}
