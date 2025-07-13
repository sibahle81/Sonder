using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class DebtorProductCategoryBalance
    {
        public string BankAccountNumber { get; set; }
        public ProductCategoryTypeEnum ProductCategoryId { get; set; }
        public decimal Balance { get; set; }
        public decimal? ClaimsTotal { get; set; } = 0;
        public int? PolicyId { get; set; }
        public string PolicyNumber { get; set; }
    }
}
