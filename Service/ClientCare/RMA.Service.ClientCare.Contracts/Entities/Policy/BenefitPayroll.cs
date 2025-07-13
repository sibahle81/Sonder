
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BenefitPayroll
    {
        public int BenefitPayrollId { get; set; }
        public int BenefitDetailId { get; set; }
        public int? BenefitCategoryId { get; set; }
        public int PolicyId { get; set; }
        public int RolePlayerId { get; set; }
        public System.DateTime EffectiveDate { get; set; }
        public int? LinkedBenefitPayrollId { get; set; }
        public decimal? MonthlySalary { get; set; }
        public decimal? SumAssured { get; set; }
        public int? NoOfMembers { get; set; }
        public decimal? FixedPremium { get; set; }
        public BenefitPayrollStatusTypeEnum PayrollStatusType { get; set; }
        public string BenefitCategory { get; set; }
        public string BillingLevel { get; set; }
        public string BillingLevelId { get; set; }
        public decimal BillingRate { get; set; }
        public string BillingMethod  { get; set; }
        public string BillingMethodCode  { get; set; }
        public decimal PremiumDue { get; set; }
        public int BenefitId  { get; set; }
        public DateTime LastUpdatedDate { get; set; }
    }
}
