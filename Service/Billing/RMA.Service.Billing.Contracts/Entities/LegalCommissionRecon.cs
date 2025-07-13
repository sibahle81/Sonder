using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class LegalCommissionRecon
    {
        public decimal CommissionRate { get; set; }
        public string DebtorNumber { get; set; }
        public string DebtorName { get; set; }
        public string AttorneyName { get; set; }
        public int? RoleplayerId { get; set; }
        public int? PeriodId { get; set; }
        public LegalCollectionTypeEnum? CollectionTypeId { get; set; }
        public decimal? UpdatedBalance { get; set; }
    }
}
