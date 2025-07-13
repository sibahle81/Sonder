using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class LegalHandOverFileDetail
    {
        public int LegalHandOverFileDetailId { get; set; }
        public string DebtorNumber { get; set; }
        public string CustomerName { get; set; }
        public string IndustryClass { get; set; }
        public string Agent { get; set; }
        public string OpeningBalance { get; set; }
        public string CurrentBalance { get; set; }
        public string CurrentStatus { get; set; }
        public string AccountAge { get; set; }
        public string OneFollowUpDate { get; set; }
        public string TwoFollowUpDate { get; set; }
        public string AgentStatus { get; set; }
        public string Comment { get; set; }
        public string LastChangedDate { get; set; }
        public string ContactNumber { get; set; }
        public string EmailAddress { get; set; }
        public int LegalHandOverFileId { get; set; }
        public int? PeriodId { get; set; }
        public DebtorStatusEnum DebtorStatus { get; set; }
    }
}
