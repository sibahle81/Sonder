using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using System;
using System.Collections.Generic;
using System.Text;


namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class GroupRiskCaseModel
    {
        public string Code { get; set; }
        public int EmployerRolePlayerId { get; set; }
        public List<int> EmployerBranchRolePlayerIds { get; set; }
        public List<GroupRiskPolicy> GroupRiskPolicies { get; set; }
        
        public GroupRiskCaseModel()
        {
            EmployerBranchRolePlayerIds = new List<int>();
            GroupRiskPolicies = new List<GroupRiskPolicy>();
        }
    }

    public class GroupRiskPolicyBenefit
    {
        public int BenefitDetailId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime NewEffectiveDate { get; set; }
        public int BenefitId { get; set; }
        public string GlCode { get; set; }
        public int PolicyId { get; set; }
        public string BenefitName { get; set; }
        public string BenefitCode { get; set; }
        

        public List<PolicyBenefitOption> BenefitOptions { get; set; }   
        public List<GroupRiskPolicyBenefitCategory> BenefitCategories { get; set; } = new List<GroupRiskPolicyBenefitCategory>();
        public BenefitGroupEnum? BenefitGroup { get; set; }
        public List<DateTime> BenefitDetailsEffectiveDates { get; set; }
    }

    public class GroupRiskPolicyBenefitCategory
    {
        public int BenefitCategoryId { get; set; }
        public int BenefitId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime NewEffectiveDate { get; set; }
        public DateTime? EndDate { get; set; }
        //public int BenefitPaymentOption { get; set; }
        public string CategoryDescription { get; set; }
        public string Name { get; set; }
        public Decimal FlatCoverAmount { get; set; }
        public Decimal? EmployerWaiver { get; set; }
        public Decimal? SalaryMultiple { get; set; }
        public FuneralCoverTypeEnum? FuneralCoverTypeId { get; set; }

        public int PolicyId { get; set; }
        public List<PolicyBenefitCategoryOption> CategoryOptions { get; set; }
        public List<DateTime> CategoryDetailsEffectiveDates { get; set; }
        public List<BenefitCategoryFuneral> FuneralScales { get; set; }
    }

    public class GroupRiskPolicy
    {
        public int Id { get; set; }
        public int PolicyId { get; set; }
        public int? FundRolePlayerId { get; set; }
        public int GroupRiskDealTypeId { get; set; }
        public int ProductOptionId { get; set; } 
        public int ProductId { get; set; }
        public string ClientReference { get; set; }
        public string PolicyNumber { get; set; }
        public int BrokerageId { get; set; }
        public int BinderPartnerId { get; set; }
        public int CommissionTypeId { get; set; }
        public int CommissionPaymentProcessTypeId { get; set; }
        public int PolicyHolderTypeId { get; set; }
        public DateTime NewEffectiveDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int AdministratorId { get; set; }
        public int RmaRelationshipManagerId { get; set; }
        public int AnniversaryMonthTypeId { get; set; }
        public bool ProfitShare { get; set; }
        public int SchemeStatusId { get; set; }
        public DateTime? LastRateUpdateDate { get; set; }
        public DateTime? NextRateReviewDate { get; set; }
        public bool AllowContractor { get; set; }
        public bool FirstYearBrokerCommission { get; set; }
        public decimal CommissionDiscount { get; set; }
        public bool PartialWaiverActivelyAtWork { get; set; }
        public bool PartialWaiverPreExistingCondition { get; set; }
        public int ReinsuranceTreatyId { get; set; }

        public int BillingFrequencyTypeId { get; set; }
        public string PreviousInsurer { get; set; }
        public decimal OutsourceServiceFee { get; set; }
        public decimal BinderFee { get; set; }
        public List<PolicyOption> PolicyOptions { get; set; }
        public List<GroupRiskPolicyBenefit> GroupRiskPolicyBenefits { get; set; }
        public List<DateTime> PolicyDetailsEffectiveDates { get; set; }
        public DateTime? SelectedDetailDate { get; set; }

        public GroupRiskPolicy()
        {
            GroupRiskPolicyBenefits = new List<GroupRiskPolicyBenefit>();
        }
    }
}
