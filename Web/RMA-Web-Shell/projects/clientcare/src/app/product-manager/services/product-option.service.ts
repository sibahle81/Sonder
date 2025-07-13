import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ProductOption } from '../models/product-option';
import { LastViewedItem } from '../models/last-viewed-item';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { Benefit } from '../models/benefit';
import { ProductOptionDependency } from '../models/product-option-dependency';
import { Template } from '../models/Template';
import { BenefitModel } from '../models/benefit-model';
import { ProductOptionOptionItemValue } from '../../broker-manager/models/product-option-option-item-value';

@Injectable()
export class ProductOptionService {

  private apiProductOption = 'clc/api/Product/ProductOption';
  private apiProductOptionRule = 'clc/api/Product/ProductOptionRule';

  constructor(
    private readonly commonService: CommonService) {
  }

  getProductOption(id: number): Observable<ProductOption> {
    return this.commonService.get<ProductOption>(id, `${this.apiProductOption}`);
  }

  getProductOptions(): Observable<ProductOption[]> {
    return this.commonService.getAll<ProductOption[]>(`${this.apiProductOption}`);
  }

  getProductOptionsIncludeDeleted(): Observable<ProductOption[]> {
    return this.commonService.getAll<ProductOption[]>(`${this.apiProductOption}/GetProductOptionsIncludeDeleted`);
  }

  getProductOptionNamesByProductId(productId: number): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(productId, `${this.apiProductOption}/NamesByProductId`);
  }

  GetProductOptionsByCoverTypeIds(coverTypes: number[]): Observable<ProductOption[]> {
    return this.commonService.postGeneric<number[], ProductOption[]>(`${this.apiProductOption}/GetProductOptionsByCoverTypeIds`, coverTypes);
  }

  getProductOptionByProductId(productId: number): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(productId, `${this.apiProductOption}/ByProductId`);
  }

  removeProductOption(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${this.apiProductOption}`);
  }

  getProductOptionRules(id: number): Observable<RuleItem[]> {
    return this.commonService.get<RuleItem[]>(id, `${this.apiProductOptionRule}`);
  }

  getProductOptionRuleByCode(productOptionId: number, ruleCode: string): Observable<RuleItem> {
    const url = `${this.apiProductOptionRule}/GetProductOptionRuleByCode/${productOptionId}/${ruleCode}`;
    return this.commonService.getAll<RuleItem>(url);
  }

  searchProductOption(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<ProductOption>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ProductOption>>(`${this.apiProductOption}/SearchProductOptions/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getLastViewedItems(): Observable<LastViewedItem[]> {
    return this.commonService.getAll<LastViewedItem[]>(`${this.apiProductOption}/LastViewed`);
  }

  getBenefitsForOption(productOptionId: number): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(`${this.apiProductOption}/GetBenefitsForOption/${productOptionId}`);
  }

  getBenefitsForOptionAndBenefits(productOptionId: number, benefitIds: number[]): Observable<Benefit[]> {
    const url = `${this.apiProductOption}/GetBenefitsForOptionAndBenefits/${productOptionId}`;
    return this.commonService.postGeneric<number[], Benefit[]>(url, benefitIds);
  }

  getBenefitsForProductOption(productOptionId: number): Observable<BenefitModel[]> {
    return this.commonService.getAll<BenefitModel[]>(`${this.apiProductOption}/GetBenefitsForProductOption/${productOptionId}`);
  }

  getBenefitsForProductOptionAndCoverType(productOptionId: number, coverMemberTypeId: number): Observable<BenefitModel[]> {
    const url = `${this.apiProductOption}/GetBenefitsForProductOptionAndCoverType/${productOptionId}/${coverMemberTypeId}`;
    return this.commonService.getAll<BenefitModel[]>(url);
  }

  getCoverMemberTypeBenefitsForOption(productOptionId: number, coverMemberTypeId: number): Observable<Benefit[]> {
    const url = `${this.apiProductOption}/GetCoverMemberTypeBenefits/${productOptionId}/${coverMemberTypeId}`;
    return this.commonService.getAll<Benefit[]>(url);
  }

  getBrokerProductOptionsPaged(pageNumber: number, pageSize: number = 5, orderBy: string = 'Id', sortDirection: string = 'asc', query: string = ''): Observable<PagedRequestResult<ProductOption>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ProductOption>>(`${this.apiProductOption}/GetBrokerProductOptions/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getBrokerProductOptionsByProductIdPaged(pageNumber: number, pageSize: number = 5, orderBy: string = 'Id', sortDirection: string = 'asc', query: string = ''): Observable<PagedRequestResult<ProductOption>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ProductOption>>(`${this.apiProductOption}/GetBrokerProductOptionsByProductId/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getBenefitsForExtendedMembers(mainMemberOptionId: number): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(`${this.apiProductOption}/GetBenefitsForExtendedMembers/${mainMemberOptionId}`);
  }

  getProductOptionWithAllOption(): Observable<string[]> {
    const results = this.commonService.getAll<string[]>(`${this.apiProductOption}/GetProductOptionWithAllOption`);
    return results;
  }

  getProductOptionDependency(parentId: number): Observable<ProductOptionDependency[]> {
    const results = this.commonService.getAll<ProductOptionDependency[]>(`${this.apiProductOption}/GetProductOptionDependency/${parentId}`);
    return results;
  }

  getTemplates(): Observable<Template[]> {
    const results = this.commonService.getAll<Template[]>(`${this.apiProductOption}/GetTemplates`);
    return results;
  }

  getTemplate(templateId: number): Observable<Template> {
    const results = this.commonService.getAll<Template>(`${this.apiProductOption}/GetTemplate/${templateId}`);
    return results;
  }

  getProductOptionsByProductIds(productIds: string): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(productIds, `${this.apiProductOption}/getProductOptionsByProductIds`);
  }

  getProductOptionsByIds(ids: number[]): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(ids, `${this.apiProductOption}/getProductOptionsByIds`);
  }

  getProductOptionsByIdsForDeclarations(ids: number[]): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(ids, `${this.apiProductOption}/GetProductOptionsByIdsForDeclarations`);
  }

  getProductOptionsWithAllowanceTypes(): Observable<ProductOption[]> {
    return this.commonService.getAll<ProductOption[]>(`${this.apiProductOption}/GetProductOptionsWithAllowanceTypes`);
  }

  getProductOptionsWithDependencies(): Observable<ProductOption[]> {
    return this.commonService.getAll<ProductOption[]>(`${this.apiProductOption}/GetProductOptionsWithDependencies`);
  }

  getProductOptionOptionItemValues(): Observable<ProductOptionOptionItemValue[]> {
    return this.commonService.getAll<ProductOptionOptionItemValue[]>(`${this.apiProductOption}/GetProductOptionOptionItemValues`);
  }

  getBenefitsByProductOptionId(productOptionId: number): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(`${this.apiProductOption}/GetBenefitsByProductOptionId/${productOptionId}`);
  }

  getProductOptionsThatAllowTermArrangements(): Observable<ProductOption[]> {
    return this.commonService.getAll<ProductOption[]>(`${this.apiProductOption}/GetProductOptionsThatAllowTermArrangements`);
  }
}
