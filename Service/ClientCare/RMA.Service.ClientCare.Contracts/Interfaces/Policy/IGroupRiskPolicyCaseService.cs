using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Threading.Tasks;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using System;
using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IGroupRiskPolicyCaseService : IService
    {
        Task<List<ReinsuranceTreaty>> GetReinsuranceTreaties();
        Task<GroupRiskPolicy> CreatePolicyNumber(int employerRolePlayerId, GroupRiskPolicy groupRiskPolicy);
        Task<bool> CreateSchemePolicies(GroupRiskCaseModel groupRiskCaseModel);
        Task<List<Reinsurer>> GetReinsurers();
        Task<List<PolicyDetail>> GetPolicyDetailByEmployerRolePlayerId(int employerRolePlayerId);
        Task<List<PolicyBenefitDetail>> GetPolicyBenefitDetail(List<int> policyIds);
        Task<List<PolicyBenefitCategory>> GetPolicyBenefitCategoryDetail(int benefitDetailId);
        Task<List<PremiumRateComponentModel>> GetPremiumRateComponentModel();
        Task<List<PolicyPremiumRateDetailModel>> GetEmployerPolicyPremiumRateDetail(int employerRolePlayerId, string query );
        Task<List<Benefit>> GetPolicyBenefit(int policyId);
        Task<List<PolicyBenefitCategory>> GetPolicyBenefitCategory(int policyId, int benefitId);
        Task<List<ReinsuranceTreaty>> GetPolicyReinsuranceTreaty(int policyId, DateTime effectiveDate);
        Task<bool> CreatePremiumRates(GroupRiskEmployerPremiumRateModel groupRiskEmployerPremiumRateModel);
        Task<List<BenefitOptionItemValueResponse>> GetOptionItemValues(string optionLevel, string typeCode, int benefitId);
        Task<List<BenefitOptionItemValueResponse>> GetBenefitOptionItemValues(string optionLevel, int benefitId);
        Task<List<PremiumRateComponentModel>> GetBenefitRateDetailByBenefitRateIds(List<int> benefitRateIds);
        Task<bool> UpdatetBenefitReinsuranceAverage(List<BenefitReinsuranceAverageModel> benefitReinsuranceAverageModels);
        Task<List<BenefitReinsuranceAverageModel>> GetBenefitReinsuranceAverage(int policyId, int benefitDetailId, DateTime effectiveDate);
        Task<List<BenefitReinsuranceAverageModel>> GetBenefitReinsuranceAverageByBenefitId(int policyId, int benefitId, DateTime effectiveDate);
        Task<GroupRiskCaseModel> GetSchemePoliciesByEmployerRolePlayerId(int employerRolePlayerId);
        Task<bool> UpdateSchemePolicies(GroupRiskCaseModel groupRiskCase);
        Task<GroupRiskEmployerPremiumRateModel> GetGroupRiskEmployerPremiumRateModel(int employerRolePlayerId);
        Task<List<ProductOptionItemValuesResponse>> GetProductOptionOptionItemValues(string typeCode, int productOptionId);
        Task<List<ProductOptionItemValuesResponse>> GetProductOptionOptionItems(int productOptionId); 
        Task<List<ProductOptionItemValuesResponse>> GetProductOptionItemsWithOverrideValues(int productOptionId);
        Task<GroupRiskPolicy> GetGroupRiskPolicy(int policyId, DateTime effectiveDate);
        Task<GroupRiskPolicyBenefit> GetGroupRiskPolicyBenefit(int benefitDetailId, DateTime effectiveDate);
        Task<GroupRiskPolicyBenefitCategory> GroupRiskPolicyBenefitCategory(int benefitCategoryId, DateTime effectiveDate);
        Task<List<PolicyBenefitDetail>> GetPolicyBenefitDetailByPolicyId(List<int> policyIds);
        Task<List<PolicyBenefitCategory>> GetBenefitCategoriesForPremiumRatesBillingLevel(int policyId, int benefitId, DateTime effectiveDate);
        Task GroupRiskBenefitPayrollUpsert(BenefitPayroll benefitPayroll);
        Task<bool> CreateEmployeeInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit);
        Task<bool> CreateEmployeeOtherInsuredLife(EmployeeOtherInsuredlifeModel employeeOtherInsuredlife);
        Task<List<EmployeeInsuredCategoryModel>> GetEmployeeInsuredCategories(int employeeRolePlayerId);
        Task<List<EmployeeInsuredCategoryModel>> GetEmployeeInsuredCategoriesByEmployer(int employeeRolePlayerId, int employerRolePlayerId);
        Task<List<BenefitPayroll>> GetBenefitPayrollDetails(int benefitDetailId, int categoryId, DateTime? dateFrom, DateTime? dateTo);
        Task<BenefitPayroll> GetBenefitPayrollById(int benefitPayrollId);
        Task<List<EmployeeOtherInsuredlifeModel>> GetEmployeeOtherInsuredLives(int employeeRolePlayerId, int employerRolePlayerId);
        Task<PolicyBenefitRate> GetPolicyBenefitRate(int benefitDetailId, int? benefitCategoryId, DateTime effectiveDate);
        Task<BenefitOptionItemValueResponse> GetBenefitOptionItemValue(int policyId, int benefitId, string optionTypeCode, DateTime effectiveDate);
        Task<List<Person>> GetEmployeesByEmployerId(int employerRolePlayerId);
        Task<PagedRequestResult<Person>> GetPagedEmployeesByEmployerId(EmployeeSearchRequest employeeSearchRequest);
        Task UpdateEmployeeOtherInsuredLife(EmployeeOtherInsuredlifeModel employeeOtherInsuredlife);
        Task<bool> RollForwardBenefitPayrolls(DateTime? nextPayrollEffectiveDate);
        Task<List<Lookup>> GetFuneralInsuredTypes();
        Task<EmployeeInsuredCategoryModel> GetInsuredCategoryByEffectiveDate(int employeeRolePlayerId, int personEmploymentId, int rolePlayerType, int benefitDetailId, DateTime effectiveDate);
        Task<bool> UpdateEmployeeInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit);
        Task<List<DateTime>> GetInsuredCategoryEffectiveDates(int employeeRolePlayerId, int personEmploymentId, int rolePlayerType, int benefitDetailId);

    }
}
