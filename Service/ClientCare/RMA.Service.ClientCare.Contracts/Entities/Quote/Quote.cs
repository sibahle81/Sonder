using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Quote
{
    public class Quote : AuditDetails
    {
        public int QuoteId { get; set; }
        public string QuoteNumber { get; set; }
        public QuoteStatusEnum QuoteStatus { get; set; }
        public int ProductId { get; set; }
        public int ProductOptionId { get; set; }
        public int TenantId { get; set; }
        public string DeclineReason { get; set; }
        public decimal? Rate { get; set; }
        public CategoryInsuredEnum? CategoryInsured { get; set; }
        public int? AverageEmployeeCount { get; set; }
        public decimal? AverageEarnings { get; set; }
        public decimal? Premium { get; set; }
        public List<QuoteAllowance> QuoteAllowances { get; set; }
        public CaseTypeEnum? CaseType { get; set; }
        public ProductClassEnum ProductClass { get; set; }
        public int? ParentQuoteId { get; set; }
        public int QuoteStatusId
        {
            get => (int)QuoteStatus;
            set => QuoteStatus = (QuoteStatusEnum)value;
        }
        public List<DependentQuote> DependentQuotes { get; set; }
    }
}
