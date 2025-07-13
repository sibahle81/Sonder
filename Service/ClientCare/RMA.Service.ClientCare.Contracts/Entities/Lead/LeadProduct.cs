using RMA.Common.Entities;

using QuoteModel = RMA.Service.ClientCare.Contracts.Entities.Quote.Quote;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadProduct : AuditDetails
    {
        public int LeadProductId { get; set; } // LeadProductId (Primary key)
        public int LeadId { get; set; } // LeadId
        public int ProductId { get; set; } // ProductId
        public int? ProductOptionId { get; set; }
        public int? QuoteId { get; set; } // QuoteId
        public QuoteModel Quote { get; set; }
    }
}