namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class TravelAuthorisation
    {
        public int TravelAuthorisationId { get; set; } // TravelAuthorisationId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public int TravelAuthorisedPartyId { get; set; } // TravelAuthorisedPartyId
        public System.DateTime DateAuthorisedFrom { get; set; } // DateAuthorisedFrom
        public System.DateTime DateAuthorisedTo { get; set; } // DateAuthorisedTo
        public decimal AuthorisedKm { get; set; } // AuthorisedKm
        public int TravelRateTypeId { get; set; } // TravelRateTypeId
        public decimal AuthorisedRate { get; set; } // AuthorisedRate
        public decimal? AuthorisedAmount { get; set; } // AuthorisedAmount
        public string Description { get; set; } // Description
        public bool IsPreAuthorised { get; set; } // IsPreAuthorised
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
