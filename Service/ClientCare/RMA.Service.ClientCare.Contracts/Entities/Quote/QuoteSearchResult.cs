using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class QuoteSearchResult
    {
        public int QuoteId { get; set; }
        public string LeadCode { get; set; }
        public string QuoteNumber { get; set; }
        public QuoteStatusEnum QuoteStatus { get; set; }
        public DateTime QuoteCreatedDate { get; set; }
        public string QuoteCreatedBy { get; set; }
        public string CompanyName { get; set; }
        public string CompensationFundReferenceNumber { get; set; }
        public string CompensationFundRegistrationNumber { get; set; }
        public string CompanyRegistrationNumber { get; set; }
        public string ProductOptionName { get; set; }
    }
}
