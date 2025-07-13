using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class AbilityPostingAudit : AuditDetails
    {
        public string Reference { get; set; }
        public int? PaymentId { get; set; }
        public int? SysNo { get; set; }
        public int? PaymentHeaderDetailId { get; set; }
        public string PaymentReference { get; set; }
        public string PaymentBatchReference { get; set; }
        public decimal? Amount { get; set; }
        public string PayeeDetails { get; set; }
        public string Bank { get; set; }
        public string BankBranch { get; set; }
        public string AccountDetails { get; set; }
        public PaymentTypeEnum? PaymentType { get; set; }
        public bool? IsProcessed { get; set; }
        public int? BrokerageId { get; set; }
        public int? CompanyNo { get; set; }
        public int? BranchNo { get; set; }
        public string BenefitCode { get; set; }
        public string Origin { get; set; }
        public string RMABankAccount { get; set; }
        public bool? IsCoid { get; set; }
        public int? PayeeRolePlayerIdentificationTypeId { get; set; }

    }
}
