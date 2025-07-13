using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Benefit = RMA.Service.ClientCare.Contracts.Entities.Product.Benefit;
using RMA.Common.Entities;


namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class GroupRiskPolicyCaseController : RmaApiController
    {
        private readonly IGroupRiskPolicyCaseService _groupRiskPolicyCaseService;

        public GroupRiskPolicyCaseController(
            IGroupRiskPolicyCaseService groupRiskPolicyCaseService
        )
        {
            _groupRiskPolicyCaseService = groupRiskPolicyCaseService;
        }

        [HttpPost("CreatePolicyNumber/{employerRolePlayerId}")]
        public async Task<ActionResult<GroupRiskPolicy>> CreatePolicyNumber(int employerRolePlayerId, [FromBody] GroupRiskPolicy groupRiskPolicy)
        {
            var result = await _groupRiskPolicyCaseService.CreatePolicyNumber(employerRolePlayerId, groupRiskPolicy);
            return Ok(result);
        }

        [HttpGet("GetReinsuranceTreaties")]
        public async Task<ActionResult<List<ReinsuranceTreaty>>> GetReinsuranceTreaties()
        {
            var result = await _groupRiskPolicyCaseService.GetReinsuranceTreaties();
            return Ok(result);
        }

        [HttpGet("GetReinsurers")]
        public async Task<ActionResult<List<Reinsurer>>> GetReinsurers()
        {
            var result = await _groupRiskPolicyCaseService.GetReinsurers();
            return Ok(result);
        }


        [HttpGet("GetOptionItemValues/{optionLevel}/{typeCode}/{benefitId}")]
        public async Task<ActionResult<List<BenefitOptionItemValueResponse>>> GetOptionItems(string optionLevel, string typeCode, int benefitId)
        {
            var result = await _groupRiskPolicyCaseService.GetOptionItemValues(optionLevel, typeCode, benefitId);
            return Ok(result);
        }

        [HttpGet("GetProductOptionOptionItemValues/{typeCode}/{productOptionId}")]
        public async Task<ActionResult<List<ProductOptionItemValuesResponse>>> GetProductOptionOptionItemValues(string typeCode, int productOptionId)
        {
            List<ProductOptionItemValuesResponse> result = await _groupRiskPolicyCaseService.GetProductOptionOptionItemValues(typeCode, productOptionId);
            return Ok(result);
        }

        [HttpGet("GetBenefitOptionItemValues/{optionLevel}/{benefitId}")]
        public async Task<ActionResult<List<BenefitOptionItemValueResponse>>> GetBenefitOptionItems(string optionLevel, int benefitId)
        {
            var result = await _groupRiskPolicyCaseService.GetBenefitOptionItemValues(optionLevel, benefitId);
            return Ok(result);
        }

        [HttpGet("GetProductOptionItems/{productOptionId}")]
        public async Task<ActionResult<List<ProductOptionItemValuesResponse>>> GetProductOptionOptionItems(int productOptionId)
        {
            List<ProductOptionItemValuesResponse> result = await _groupRiskPolicyCaseService.GetProductOptionOptionItems(productOptionId);
            return Ok(result);
        }

        [HttpGet("GetProductOptionItemsWithOverrideValues/{productOptionId}")]
        public async Task<ActionResult<List<ProductOptionItemValuesResponse>>> GetProductOptionItemsWithOverrideValues(int productOptionId)
        {
            List<ProductOptionItemValuesResponse> result = await _groupRiskPolicyCaseService.GetProductOptionItemsWithOverrideValues(productOptionId);
            return Ok(result);
        }

        [HttpGet("GetPolicyDetailByEmployerRolePlayerId/{employerRolePlayerId}")]
        public async Task<ActionResult<PolicyDetail>> GetPolicyDetailByEmployerRolePlayerId(int employerRolePlayerId)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyDetailByEmployerRolePlayerId(employerRolePlayerId);
            return Ok(result);
        }

        [HttpGet("GetPolicyBenefitDetail/{policyId}")]
        public async Task<ActionResult<PolicyBenefitDetail>> GetPolicyBenefitDetail(int policyId)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyBenefitDetail(new List<int> { policyId });
            return Ok(result);
        }

        [HttpGet("GetPolicyBenefitDetailByPolicyId/{policyId}")]
        public async Task<ActionResult<PolicyBenefitDetail>> GetPolicyBenefitDetailByPolicyId(int policyId)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyBenefitDetailByPolicyId(new List<int> { policyId });
            return Ok(result);
        }

        [HttpGet("GetPolicyBenefitCategoryDetail/{benefitDetailId}")]
        public async Task<ActionResult<PolicyBenefitCategory>> GetPolicyBenefitCategoryDetail(int benefitDetailId)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyBenefitCategoryDetail(benefitDetailId);
            return Ok(result);
        }

        [HttpGet("GetPolicyReinsuranceTreaty/{policyId}/{effectiveDate}")]
        public async Task<ActionResult<List<ReinsuranceTreaty>>> GetPolicyReinsuranceTreaty(int policyId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyReinsuranceTreaty(policyId, effectiveDate);
            return Ok(result);
        }

        [HttpGet("GetPremiumRateComponentModel")]
        public async Task<ActionResult<List<PremiumRateComponentModel>>> GetPremiumRateComponentModel()
        {
            var result = await _groupRiskPolicyCaseService.GetPremiumRateComponentModel();
            return Ok(result);
        }

        [HttpGet("GetEmployerPolicyPremiumRateDetail/{employerRolePlayerId}/{query?}")]
        public async Task<ActionResult<List<PolicyPremiumRateDetailModel>>> GetEmployerPolicyPremiumRateDetail(int employerRolePlayerId, string query)
        {
            var result = await _groupRiskPolicyCaseService.GetEmployerPolicyPremiumRateDetail(employerRolePlayerId, query);
            return Ok(result);
        }

        [HttpGet("GetPolicyBenefit/{policyId}")]
        public async Task<ActionResult<List<Benefit>>> GetPolicyBenefit(int policyId)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyBenefit(policyId);
            return Ok(result);
        }

        [HttpGet("GetPolicyBenefitCategory/{policyId}/{benefitId}")]
        public async Task<ActionResult<List<PolicyBenefitCategory>>> GetPolicyBenefitCategory(int policyId, int benefitId)
        {
            var result = await _groupRiskPolicyCaseService.GetPolicyBenefitCategory(policyId, benefitId);
            return Ok(result);
        }

        [HttpGet("GetBenefitReinsuranceAverage/{policyId}/{benefitDetailId}/{effectiveDate}")]
        public async Task<ActionResult<List<BenefitReinsuranceAverageModel>>> GetBenefitReinsuranceAverage(int policyId, int benefitDetailId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetBenefitReinsuranceAverage(policyId, benefitDetailId, effectiveDate);
            return Ok(result);
        }

        [HttpPost("UpdatetBenefitReinsuranceAverage")]
        public async Task<ActionResult<bool>> UpdatetBenefitReinsuranceAverage([FromBody] BenefitReinsuranceAverageModel benefitReinsuranceAverageModel)
        {
            var result = await _groupRiskPolicyCaseService.UpdatetBenefitReinsuranceAverage(new List<BenefitReinsuranceAverageModel> { benefitReinsuranceAverageModel });
            return Ok(result);
        }

        [HttpGet("GetBenefitReinsuranceAverageByBenefitId/{policyId}/{benefitId}/{effectiveDate}")]
        public async Task<ActionResult<List<BenefitReinsuranceAverageModel>>> GetBenefitReinsuranceAverageByBenefitId(int policyId, int benefitId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetBenefitReinsuranceAverageByBenefitId(policyId, benefitId, effectiveDate);
            return Ok(result);
        }

        [HttpGet("GetSchemePoliciesByEmployerRolePlayerId/{employerRolePlayerId}")]
        public async Task<ActionResult<GroupRiskCaseModel>> GetSchemePoliciesByEmployerRolePlayerId(int employerRolePlayerId)
        {
            var result = await _groupRiskPolicyCaseService.GetSchemePoliciesByEmployerRolePlayerId(employerRolePlayerId);
            return Ok(result);
        }

        [HttpGet("GetGroupRiskEmployerPremiumRateModel/{employerRolePlayerId}")]
        public async Task<ActionResult<GroupRiskEmployerPremiumRateModel>> GetGroupRiskEmployerPremiumRateModel(int employerRolePlayerId)
        {
            var result = await _groupRiskPolicyCaseService.GetGroupRiskEmployerPremiumRateModel(employerRolePlayerId);
            return Ok(result);
        }

        [HttpGet("GetGroupRiskPolicy/{policyId}/{effectivedate}")]
        public async Task<ActionResult<GroupRiskPolicy>> GetGroupRiskPolicy(int policyId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetGroupRiskPolicy(policyId, effectiveDate);
            return Ok(result);
        }

        [HttpGet("GetGroupRiskPolicyBenefit/{benefitDetailId}/{effectivedate}")]
        public async Task<ActionResult<GroupRiskPolicy>> GetGroupRiskPolicyBenefit(int benefitDetailId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetGroupRiskPolicyBenefit(benefitDetailId, effectiveDate);
            return Ok(result);
        }

        [HttpGet("GetGroupRiskPolicyBenefitCategory/{benefitCategoryId}/{effectivedate}")]
        public async Task<ActionResult<GroupRiskPolicy>> GetGroupRiskPolicyBenefitCategory(int benefitCategoryId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GroupRiskPolicyBenefitCategory(benefitCategoryId, effectiveDate);
            return Ok(result);
        }

        [HttpGet("GetBenefitCategoriesForPremiumRatesBillingLevel/{policyId}/{benefitId}/{effectivedate}")]
        public async Task<ActionResult<List<PolicyBenefitCategory>>> GetBenefitCategoriesForPremiumRatesBillingLevel(int policyId, int benefitId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetBenefitCategoriesForPremiumRatesBillingLevel(policyId, benefitId, effectiveDate);
            return Ok(result);
        }

        [HttpPost("CreateEmployeeInsuredCategory")]
        public async Task<ActionResult<bool>> CreateEmployeeInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            var result = await _groupRiskPolicyCaseService.CreateEmployeeInsuredCategory(employeeInsuredBenefit);
            return Ok(result);
        }

        [HttpPost("CreateEmployeeOtherInsuredLife")]
        public async Task<ActionResult<bool>> CreateEmployeeOtherInsuredLife(EmployeeOtherInsuredlifeModel employeeOtherInsuredlife)
        {
            var result = await _groupRiskPolicyCaseService.CreateEmployeeOtherInsuredLife(employeeOtherInsuredlife);
            return Ok(result);
        }

        [HttpPost("UpdateEmployeeOtherInsuredLife")]
        public async Task<ActionResult> UpdateEmployeeOtherInsuredLife(EmployeeOtherInsuredlifeModel employeeOtherInsuredlife)
        {
            await _groupRiskPolicyCaseService.UpdateEmployeeOtherInsuredLife(employeeOtherInsuredlife);
            return Ok(true);
       
        }

        [HttpGet("GetEmployeeInsuredCategories/{employeeRolePlayerId}")]
        public async Task<ActionResult<List<EmployeeInsuredCategoryModel>>> GetEmployeeInsuredCategories(int employeeRolePlayerId)
        {
            var result = await _groupRiskPolicyCaseService.GetEmployeeInsuredCategories(employeeRolePlayerId);
            return Ok(result);
        }

        [HttpGet("GetEmployeeInsuredCategoriesByEmployer/{employeeRolePlayerId}/{employerRolePlayerId}")]
        public async Task<ActionResult<List<EmployeeInsuredCategoryModel>>> GetEmployeeInsuredCategoriesByEmployer(int employeeRolePlayerId, int employerRolePlayerId)
        {
            var result = await _groupRiskPolicyCaseService.GetEmployeeInsuredCategoriesByEmployer(employeeRolePlayerId, employerRolePlayerId);
            return Ok(result);
        }

        [HttpGet("GetBenefitPayrollDetails/{benefitDetailId}/{benefitCategoryId}/{fromDate}/{toDate}")]
        public async Task<ActionResult<List<BenefitPayroll>>> GetBenefitPayrollDetails(int benefitDetailId, int benefitCategoryId, DateTime? fromDate, DateTime? toDate)
        {
            var benefitPayrolls = await _groupRiskPolicyCaseService.GetBenefitPayrollDetails(benefitDetailId, benefitCategoryId, fromDate, toDate);
            return Ok(benefitPayrolls);
        }

        [HttpGet("GetBenefitPayrollById/{benefitPayrollId}")]
        public async Task<ActionResult<BenefitPayroll>> GetBenefitPayrollDetails(int benefitPayrollId)
        {
            var benefitPayroll = await _groupRiskPolicyCaseService.GetBenefitPayrollById(benefitPayrollId) ;
            return Ok(benefitPayroll);
        }

        [HttpGet("GetBenefitOptionItemValue/{policyId}/{benefitId}/{optionTypeCode}/{effectiveDate}")]
        public async Task<ActionResult<BenefitOptionItemValueResponse>> GetBenefitOptionItemValue(int policyId, int benefitId, string optionTypeCode, DateTime effectiveDate)
        {
            var benefitOptionItem = await _groupRiskPolicyCaseService.GetBenefitOptionItemValue(policyId, benefitId, optionTypeCode, effectiveDate) ;
            return Ok(benefitOptionItem);
        }

        [HttpGet("GetEmployeeOtherInsuredLives/{employeeRolePlayerId}/{employerRolePlayerId}")]
        public async Task<ActionResult<List<EmployeeInsuredCategoryModel>>> GetEmployeeOtherInsuredLives(int employeeRolePlayerId, int employerRolePlayerId)
        {
            var result = await _groupRiskPolicyCaseService.GetEmployeeOtherInsuredLives(employeeRolePlayerId, employerRolePlayerId);
            return Ok(result);
        }

        [HttpGet("GetEmployeesByEmployerId/{employerRolePlayerId}")]
        public async Task<ActionResult<List<Person>>> GetEmployeesByEmployerId(int employerRolePlayerId)
        {
            var results = await _groupRiskPolicyCaseService.GetEmployeesByEmployerId(employerRolePlayerId);
            return Ok(results);
        }

        [HttpPost("GetPagedEmployeesByEmployerId")]
        public async Task<ActionResult<PagedRequestResult<Person>>> GetPagedEmployeesByEmployerId(EmployeeSearchRequest employeeSearchRequest)
        {
            var results = await _groupRiskPolicyCaseService.GetPagedEmployeesByEmployerId(employeeSearchRequest);
            return Ok(results);
        }

        [HttpGet("GetFuneralInsuredTypes")]
        public async Task<ActionResult<List<Lookup>>> GetFuneralInsuredTypes()
        {
            var results = await _groupRiskPolicyCaseService.GetFuneralInsuredTypes();
            return Ok(results);
        }

        [HttpGet("GetInsuredCategoryByEffectiveDate/{employeeRolePlayerId}/{personEmploymentId}/{rolePlayerType}/{benefitDetailId}/{effectiveDate}")]
        public async Task<ActionResult<EmployeeInsuredCategoryModel>> GetInsuredCategoryByEffectiveDate(int employeeRolePlayerId, int personEmploymentId, int rolePlayerType, int benefitDetailId, DateTime effectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.GetInsuredCategoryByEffectiveDate(employeeRolePlayerId, personEmploymentId, rolePlayerType, benefitDetailId, effectiveDate);
            return Ok(result); 
        }

        [HttpPost("UpdateEmployeeInsuredCategory")]
        public async Task<ActionResult<bool>> UpdateEmployeeInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            var result = await _groupRiskPolicyCaseService.UpdateEmployeeInsuredCategory(employeeInsuredBenefit);
            return Ok(result);
        }

        [HttpGet("GetInsuredCategoryEffectiveDates/{employeeRolePlayerId}/{personEmploymentId}/{rolePlayerType}/{benefitDetailId}")]
        public async Task<ActionResult<List<DateTime>>> GetInsuredCategoryEffectiveDates(int employeeRolePlayerId, int personEmploymentId, int rolePlayerType, int benefitDetailId)
        {
            var result = await _groupRiskPolicyCaseService.GetInsuredCategoryEffectiveDates(employeeRolePlayerId, personEmploymentId, rolePlayerType, benefitDetailId);
            return Ok(result);
        }

        [HttpGet("RollForwardBenefitPayrolls/{nextPayrollEffectiveDate?}")]
        public async Task<ActionResult<bool>> RollForwardBenefitPayrolls( DateTime? nextPayrollEffectiveDate)
        {
            var result = await _groupRiskPolicyCaseService.RollForwardBenefitPayrolls(nextPayrollEffectiveDate);
            return Ok(result);
        }
    }
}