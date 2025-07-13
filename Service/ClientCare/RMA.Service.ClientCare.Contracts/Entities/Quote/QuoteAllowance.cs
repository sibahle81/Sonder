using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Quote
{
    public class QuoteAllowance
    {
        public int QuoteAllowanceId { get; set; }
        public int QuoteId { get; set; }
        public AllowanceTypeEnum AllowanceType { get; set; }
        public decimal? Allowance { get; set; }
    }
}