using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class ProductCrossRefTranType : AuditDetails
    {
        public int ProductCodeId { get; set; }
        public string Origin { get; set; }
        public int CompanyNo { get; set; }
        public int BranchNo { get; set; }
        public string TransactionType { get; set; }
        public string Level1 { get; set; }
        public string Level2 { get; set; }
        public string Level3 { get; set; }
        public int ChartISNo { get; set; }
        public string ChartIsName { get; set; }
        public int ChartBSNo { get; set; }
        public string ChartBsName { get; set; }
        public int ChartNo { get; set; }
        public string BenefitCode { get; set; }
    }
}