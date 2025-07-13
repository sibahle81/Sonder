import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { GroupRiskPolicy } from "../entities/group-risk-policy";
import { ReinsuranceTreaty } from "../entities/reinsurance-treaty";
import { OptionItemValueLookup } from "../entities/option-item-value-lookup";
import { PolicyDetail } from "../entities/policy-detail";
import { PolicyBenefitDetail } from "../entities/policy-benefit-detail";
import { PolicyBenefitCategory } from "../entities/policy-benefit-category";
import { PremiumRateComponentModel } from "../entities/premium-rate-component-model";
import { BenefitModel } from "../../../product-manager/models/benefit-model";
import { Benefit } from "../../../product-manager/models/benefit";
import { BenefitReinsuranceAverageModel } from "../entities/benefit-reinsurance-average-model";
import { EmployeeInsuredCategoryModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-insured-category-model';
import { EmployeeOtherInsuredlifeModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-other-insured-life-model';
import { GroupRiskPolicyBenefit } from "../entities/group-risk-policy-benefit";
import { GroupRiskPolicyBenefitCategory } from "../entities/group-risk-policy-benefit-category";
import { GroupRiskBenefitPayroll } from "../entities/group-risk-benefit-payroll";
import { BenefitPayroll } from "../entities/benefit-payroll";
import { GroupRiskPolicyCaseModel } from "../entities/group-risk-policy-case-model";
import { GroupRiskEmployerPremiumRateModel } from "../entities/group-risk-employer-premium-rate--model";
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ProductOptionItemValueLookup } from "../entities/product-option-item-value-lookup";
import { PolicyPremiumRateDetailModel } from "../entities/policy-premium-rate-detail-model";
import { EmployeeSearchRequest } from "projects/shared-models-lib/src/lib/member/employee-search-request";
import { Person } from  "projects/clientcare/src/app/policy-manager/shared/entities/person";
import { Lookup } from "../../../../../../shared-models-lib/src/lib/lookup/lookup";

@Injectable({
  providedIn: 'root'
})
export class GroupRiskPolicyCaseService {

    private readonly api = 'clc/api/Policy/GroupRiskPolicyCase';

    constructor(private readonly commonService: CommonService) { }

    createPolicyNumber(employerRolePlayerId: number, request: GroupRiskPolicy): Observable<GroupRiskPolicy> {
        const api = `${this.api}/CreatePolicyNumber/${employerRolePlayerId}`;
        return this.commonService.postGeneric<GroupRiskPolicy, GroupRiskPolicy>(api, request);
    }

    createEmployeeInsuredCategory(employeeInsuredBenefitModel: EmployeeInsuredCategoryModel): Observable<boolean> {
        return this.commonService.postGeneric<EmployeeInsuredCategoryModel, boolean>(`${this.api}/CreateEmployeeInsuredCategory`, employeeInsuredBenefitModel);
    }

    createEmployeeOtherInsuredLife(employeeOtherInsuredlife: EmployeeOtherInsuredlifeModel): Observable<boolean> {
        return this.commonService.postGeneric<EmployeeOtherInsuredlifeModel, boolean>(`${this.api}/CreateEmployeeOtherInsuredLife`, employeeOtherInsuredlife);
    }

    updateEmployeeOtherInsuredLife(employeeOtherInsuredlife: EmployeeOtherInsuredlifeModel): Observable<boolean> {
        return this.commonService.postGeneric<EmployeeOtherInsuredlifeModel, boolean>(`${this.api}/UpdateEmployeeOtherInsuredLife`, employeeOtherInsuredlife);
    }
    
    getReinsuranceTreaties(): Observable<ReinsuranceTreaty[]> {
        const url = `${this.api}/GetReinsuranceTreaties/`;
        return this.commonService.getAll<ReinsuranceTreaty[]>(url);
    }

    getPolicyDetailByEmployerRolePlayerId(employerRolePlayerId: number): Observable<PolicyDetail[]> {
        const url = `${this.api}/GetPolicyDetailByEmployerRolePlayerId/${employerRolePlayerId}`;
        return this.commonService.getAll<PolicyDetail[]>(url);
    }

    getPolicyBenefitDetail(policyId: number): Observable<PolicyBenefitDetail[]> {
        const url = `${this.api}/getPolicyBenefitDetail/${policyId}`;
        return this.commonService.getAll<PolicyBenefitDetail[]>(url);
    }

    getPolicyBenefitDetailByPolicyId(policyId: number): Observable<PolicyBenefitDetail[]> {
        const url = `${this.api}/GetPolicyBenefitDetailByPolicyId/${policyId}`;
        return this.commonService.getAll<PolicyBenefitDetail[]>(url);
    }

    getOptionItems(optionLevel: string, typeCode: string, benefitId: number): Observable<OptionItemValueLookup[]> {
        const url = `${this.api}/GetOptionItemValues/${optionLevel}/${typeCode}/${benefitId}`;
        return this.commonService.getAll<OptionItemValueLookup[]>(url);
    }

    getPolicyBenefitCategoryDetail(benefitDetailId: number): Observable<PolicyBenefitCategory[]> {
        const url = `${this.api}/GetPolicyBenefitCategoryDetail/${benefitDetailId}`;
        return this.commonService.getAll<PolicyBenefitCategory[]>(url);
    }

    getPremiumRateComponentModel(): Observable<PremiumRateComponentModel[]> {
        const url = `${this.api}/GetPremiumRateComponentModel`;
        return this.commonService.getAll<PremiumRateComponentModel[]>(url);
    }

    getPolicyBenefit(policyId: number): Observable<Benefit[]> {
        const url = `${this.api}/GetPolicyBenefit/${policyId}`;
        return this.commonService.getAll<Benefit[]>(url);
    }

    getPolicyBenefitCategory(policyId: number, benefitId: number): Observable<PolicyBenefitCategory[]> {
        const url = `${this.api}/GetPolicyBenefitCategory/${policyId}/${benefitId}`;
        return this.commonService.getAll<PolicyBenefitCategory[]>(url);
    }

    getPolicyReinsuranceTreaty(policyId: number, effectiveDate: string): Observable<ReinsuranceTreaty[]> {
        const url = `${this.api}/GetPolicyReinsuranceTreaty/${policyId}/${effectiveDate}`;
        return this.commonService.getAll<ReinsuranceTreaty[]>(url);
    }

    getBenefitOptionItemValues(benefitId: number, optionLevel: string): Observable<OptionItemValueLookup[]> {
        const url = `${this.api}/GetBenefitOptionItemValues/${optionLevel}/${benefitId}`;
        return this.commonService.getAll<OptionItemValueLookup[]>(url);
    }

    getBenefitReinsuranceAverage(policyId: number, benefitDetailId: number, effectiveDate: string): Observable<BenefitReinsuranceAverageModel[]> {
        const url = `${this.api}/GetBenefitReinsuranceAverage/${policyId}/${benefitDetailId}/${effectiveDate}`;
        return this.commonService.getAll<BenefitReinsuranceAverageModel[]>(url);
    }

    getBenefitReinsuranceAverageByBenefitId(policyId: number, benefitId: number, effectiveDate: string): Observable<BenefitReinsuranceAverageModel[]> {
        const url = `${this.api}/GetBenefitReinsuranceAverageByBenefitId/${policyId}/${benefitId}/${effectiveDate}`;
        return this.commonService.getAll<BenefitReinsuranceAverageModel[]>(url);
    }

    getEmployerPolicyPremiumRateDetail(employerRolePlayerId: number, query: string): Observable<PolicyPremiumRateDetailModel[]> {
        const url = `${this.api}/GetEmployerPolicyPremiumRateDetail/${employerRolePlayerId}/${query}`;
        return this.commonService.getAll<PolicyPremiumRateDetailModel[]>(url);
    }

    getSchemePoliciesByEmployerRolePlayerId(employerRolePlayerId: number): Observable<GroupRiskPolicyCaseModel> {
        const url = `${this.api}/GetSchemePoliciesByEmployerRolePlayerId/${employerRolePlayerId}`;
        return this.commonService.getAll<GroupRiskPolicyCaseModel>(url);
    }

    getGroupRiskEmployerPremiumRateModel(employerRolePlayerId: number): Observable<GroupRiskEmployerPremiumRateModel> {
        const url = `${this.api}/GetGroupRiskEmployerPremiumRateModel/${employerRolePlayerId}`;
        return this.commonService.getAll<GroupRiskEmployerPremiumRateModel>(url);
    }

    getProductOptionOptionItems(productOptionId: number): Observable<ProductOptionItemValueLookup[]> {
        const url = `${this.api}/GetProductOptionItems/${productOptionId}`;
        return this.commonService.getAll<ProductOptionItemValueLookup[]>(url);
    }

    getProductOptionOptionItemValues(optionType: string, productOptionId: number): Observable<ProductOptionItemValueLookup[]> {
        const url = `${this.api}/GetProductOptionOptionItemValues/${optionType}/${productOptionId}`;
        return this.commonService.getAll<ProductOptionItemValueLookup[]>(url);
    }

    getProductOptionOptionItemWithOverrideValues(productOptionId: number): Observable<ProductOptionItemValueLookup[]> {
        const url = `${this.api}/GetProductOptionItemsWithOverrideValues/${productOptionId}`;
        return this.commonService.getAll<ProductOptionItemValueLookup[]>(url);
    }

    getGroupRiskPolicy(policyId: number, effectiveDate: Date): Observable<GroupRiskPolicy> {
        const url = `${this.api}/GetGroupRiskPolicy/${policyId}/${effectiveDate}`;
        return this.commonService.getAll<GroupRiskPolicy>(url);
    }

    getGroupRiskPolicyBenefit(benefitDetailId: number, effectiveDate: Date): Observable<GroupRiskPolicyBenefit> {
        const url = `${this.api}/GetGroupRiskPolicyBenefit/${benefitDetailId}/${effectiveDate}`;
        return this.commonService.getAll<GroupRiskPolicyBenefit>(url);
    }

    getGroupRiskPolicyBenefitCategory(benefitCategoryId: number, effectiveDate: Date): Observable<GroupRiskPolicyBenefitCategory> {
        const url = `${this.api}/GetGroupRiskPolicyBenefitCategory/${benefitCategoryId}/${effectiveDate}`;
        return this.commonService.getAll<GroupRiskPolicyBenefitCategory>(url);
    }

    getBenefitCategoriesForPremiumRatesBillingLevel(policyId: number, benefitId: number, effectiveDate: string): Observable<PolicyBenefitCategory[]> {
        const url = `${this.api}/GetBenefitCategoriesForPremiumRatesBillingLevel/${policyId}/${benefitId}/${effectiveDate}`;
        return this.commonService.getAll<PolicyBenefitCategory[]>(url);
    }

    getPagedEmployeeInsuredCategories(employerRolePlayerId: number, employeeRolePlayerId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<EmployeeInsuredCategoryModel>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<EmployeeInsuredCategoryModel>>(`${this.api}/GetPagedEmployeeInsuredCategories/${employerRolePlayerId}/${employeeRolePlayerId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getEmployeeInsuredCategories(employeeRolePlayerId: number): Observable<EmployeeInsuredCategoryModel[]> {
        const url = `${this.api}/GetEmployeeInsuredCategories/${employeeRolePlayerId}`;
        return this.commonService.getAll<EmployeeInsuredCategoryModel[]>(url);
    }

    getEmployeeInsuredCategoriesByEmployer(employeeRolePlayerId: number, employerRolePlayerId: number): Observable<EmployeeInsuredCategoryModel[]> {
        const url = `${this.api}/GetEmployeeInsuredCategoriesByEmployer/${employeeRolePlayerId}/${employerRolePlayerId}`;
        return this.commonService.getAll<EmployeeInsuredCategoryModel[]>(url);
    }

    getGroupRiskEmployerBillingPayrollModel(employerRolePlayerId: number): Observable<GroupRiskBenefitPayroll> {
        const url = `${this.api}/getGroupRiskEmployerBillingPayrollModel/${employerRolePlayerId}`;
        return this.commonService.getAll<GroupRiskBenefitPayroll>(url);
    }

    getBenefitPayrolls(policyId: number, benefitId: number, fromDate: string, toDate: string): Observable<BenefitPayroll[]> {
        const url = `${this.api}/getBenefitPayrolls/${policyId}/${benefitId}/${fromDate}/${toDate}`;
        return this.commonService.getAll<BenefitPayroll[]>(url);
    }

    getBenefitPayrollDetails(benefitDetailId: number, benefitCategoryId: number, fromDate: string, toDate: string): Observable<BenefitPayroll[]> {
        const url = `${this.api}/GetBenefitPayrollDetails/${benefitDetailId}/${benefitCategoryId}/${fromDate}/${toDate}`;
        return this.commonService.getAll<BenefitPayroll[]>(url);
    }

    getBenefitPayrollById(benefitPayrollId: number): Observable<BenefitPayroll> {
        const url = `${this.api}/GetBenefitPayrollById/${benefitPayrollId}`;
        return this.commonService.getAll<BenefitPayroll>(url);
    }

    getBenefitOptionItemValue(policyId: number, benefitId: number, optionTypeCode: string, effectiveDate: string): Observable<OptionItemValueLookup> {
        const url = `${this.api}/GetBenefitOptionItemValue/${policyId}/${benefitId}/${optionTypeCode}/${effectiveDate}`;
        return this.commonService.getAll<OptionItemValueLookup>(url);
    }

    getEmployeeOtherInsuredLives(employeeRolePlayerId: number, employerRolePlayerId: number): Observable<EmployeeOtherInsuredlifeModel[]> {
        const url = `${this.api}/GetEmployeeOtherInsuredLives/${employeeRolePlayerId}/${employerRolePlayerId}`;
        return this.commonService.getAll<EmployeeOtherInsuredlifeModel[]>(url);
    }

    getPagedEmployeesByEmployerId(employeeSearchRequest: EmployeeSearchRequest): Observable<PagedRequestResult<Person>> {
        return this.commonService.postGeneric<EmployeeSearchRequest, PagedRequestResult<Person>>(`${this.api}/GetPagedEmployeesByEmployerId/`, employeeSearchRequest);
    }

    getFuneralInsuredTypes(): Observable<Lookup[]> {
        const url = `${this.api}/GetFuneralInsuredTypes`;
        return this.commonService.getAll<Lookup[]>(url);
    }

    updateEmployeeInsuredCategory(employeeInsuredBenefitModel: EmployeeInsuredCategoryModel): Observable<boolean> {
        return this.commonService.postGeneric<EmployeeInsuredCategoryModel, boolean>(`${this.api}/UpdateEmployeeInsuredCategory`, employeeInsuredBenefitModel);
    }

    getInsuredCategoryEffectiveDates(employeeRolePlayerId: number, personEmploymentId: number, rolePlayerType: number, benefitDetailId: number ): Observable<Date[]> {
        const url = `${this.api}/GetInsuredCategoryEffectiveDates/${employeeRolePlayerId}/${personEmploymentId}/${rolePlayerType}/${benefitDetailId}`;
        return this.commonService.getAll<Date[]>(url);
    }

    getInsuredCategoryByEffectiveDate(employeeRolePlayerId: number, personEmploymentId: number, rolePlayerType: number, benefitDetailId: number, effectiveDate: string): Observable<EmployeeInsuredCategoryModel>{
        const url = `${this.api}/GetInsuredCategoryByEffectiveDate/${employeeRolePlayerId}/${personEmploymentId}/${rolePlayerType}/${benefitDetailId}/${effectiveDate}`;
        return this.commonService.getAll<EmployeeInsuredCategoryModel>(url);
    }
}
