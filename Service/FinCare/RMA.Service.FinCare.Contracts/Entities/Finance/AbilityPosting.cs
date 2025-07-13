using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class AbilityPosting : AuditDetails
    {
        public int CompanyNo { get; set; }
        public int BranchNo { get; set; }
        public string TransactionType { get; set; }
        public string Reference { get; set; }
        public System.DateTime TransactionDate { get; set; }
        public string Level1 { get; set; }
        public string Level2 { get; set; }
        public int? Level3 { get; set; }
        public int? ChartISNo { get; set; }
        public int? ChartBSNo { get; set; }

        public string Benefitcode { get; set; }
        public decimal DailyTotal { get; set; }
        public bool IsProcessed { get; set; }
        public int? SysNo { get; set; }
        public string BatchReference { get; set; }
        public string RmaBankAccount { get; set; }
        public string Origin { get; set; }
    }
}