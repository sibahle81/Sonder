using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Quote
{
    public class QuoteV2
    {
        public int QuoteId { get; set; } // QuoteId (Primary key)
        public int TenantId { get; set; } // TenantId
        public int LeadId { get; set; } // LeadId
        public int UnderwriterId { get; set; } // UnderwriterId
        public int ProductId { get; set; } // ProductId
        public string QuotationNumber { get; set; } // QuotationNumber (length: 50)
        public QuoteStatusEnum QuoteStatus { get; set; } // QuoteStatusId
        public string DeclineReason { get; set; } // DeclineReason
        public decimal? TotalPremium { get; set; } // TotalPremium
        public List<QuoteDetailsV2> QuoteDetailsV2 { get; set; } // QuoteDetails_V2.FK_QuoteDetails_V2_Quote_V2

        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
