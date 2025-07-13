using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TravelAuthorisation: Common.Entities.AuditDetails
    {
        public int TravelAuthorisationId { get; set; } // TravelAuthorisationId (Primary key)
        public int PersonEventId { get; set; } // PersonEventId
        public TravelAuthorisedPartyEnum? TravelAuthorisedParty { get; set; } // TravelAuthorisedPartyId
        public System.DateTime DateAuthorisedFrom { get; set; } // DateAuthorisedFrom
        public System.DateTime DateAuthorisedTo { get; set; } // DateAuthorisedTo
        public decimal AuthorisedKm { get; set; } // AuthorisedKm
        public int TravelRateTypeId { get; set; } // TravelRateTypeId
        public decimal AuthorisedRate { get; set; } // AuthorisedRate
        public decimal? AuthorisedAmount { get; set; } // AuthorisedAmount 
        public decimal? AuthorisedAmountInclusive { get; set; } // AuthorisedAmountInclusive
        public string Description { get; set; } // Description
        public bool IsPreAuthorised { get; set; } // IsPreAuthorised
        public int? PayeeId { get; set; } // PayeeId
        public string TravelAuthNumber { get; set; } // TravelAuthNumber (length: 50)
    }
}
