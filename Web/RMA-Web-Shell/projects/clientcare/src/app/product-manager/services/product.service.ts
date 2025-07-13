import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { Product } from '../models/product';
import { LastViewedItem } from '../models/last-viewed-item';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { ProductOptionDependency } from '../models/product-option-dependency';


@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private apiProductUrl = 'clc/api/Product/Product';
  private apiProductBatchUrl = 'clc/api/Product/ProductBatch';
  private apiProductRuleUrl = 'clc/api/product/productRule';

  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService) {
  }

  getNames(): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiProductUrl}/UniqueName`);
  }

  getProduct(id: any): Observable<Product> {
    return this.commonService.get<Product>(id, this.apiProductUrl);
  }

  getProductsByClientTypeId(clientTypeId: number): Observable<Product[]> {
    return this.commonService.get<Product[]>(clientTypeId, `${this.apiProductUrl}/ClientType`);
  }

  getActiveProductsForRepresentative(brokerageId: number): Observable<Product[]> {
    return this.commonService.get<Product[]>(brokerageId, `${this.apiProductUrl}/GetActiveProductsForRepresentative`);
  }

  getProducts(): Observable<Product[]> {
    return this.commonService.getAll<Product[]>(this.apiProductUrl);
  }

  getProductRules(id: number): Observable<RuleItem[]> {
    return this.commonService.get<RuleItem[]>(id, this.apiProductRuleUrl);
  }

  // TODO product batch api is new add to backend
  addProductBatch(product: Product): Observable<number> {
    product.modifiedBy = this.authService.getUserEmail();
    return this.commonService.postGeneric<Product, number>(this.apiProductBatchUrl, product);
  }

  // TODO product batch api is new add to backend
  editProductBatch(product: Product): Observable<boolean> {
    product.modifiedBy = this.authService.getUserEmail();
    return this.commonService.edit<Product>(product, this.apiProductBatchUrl);
  }

  addProductBenefits(productId: number, benefitIds: number[]): Observable<number> {
    const productBenefitRequest: any = {};
    productBenefitRequest.productId = productId;
    productBenefitRequest.benefitIds = benefitIds;
    return this.commonService.postGeneric<Product, number>(`${this.apiProductUrl}/ProductBenefit`, productBenefitRequest);
  }

  editProductBenefits(productId: number, benefitIds: number[]): Observable<boolean> {
    const productBenefitRequest: any = {};
    productBenefitRequest.productId = productId;
    productBenefitRequest.benefitIds = benefitIds;
    return this.commonService.edit<Product>(productBenefitRequest, `${this.apiProductUrl}/ProductBenefit`);
  }

  editProductSkillCategories(productId: number, skillCaregoryIds: number[]): Observable<boolean> {
    const productSkillCategoryRequest: any = {};
    productSkillCategoryRequest.productId = productId;
    productSkillCategoryRequest.skillCategoryIds = skillCaregoryIds;
    return this.commonService.edit<Product>(productSkillCategoryRequest, `${this.apiProductUrl}/ProductSkillCategory`);
  }


  getLastViewedItems(): Observable<LastViewedItem[]> {
    return this.commonService.getAll<LastViewedItem[]>(`${this.apiProductUrl}/LastViewed`);
  }

  addProductSkillCategories(productId: number, skillCategoryIds: number[]): Observable<number> {
    const productSkillCategory: any = {};
    productSkillCategory.productId = productId;
    productSkillCategory.skillCategoryIds = skillCategoryIds;
    return this.commonService.postGeneric<Product, number>(`${this.apiProductUrl}/ProductSkillCategory`, productSkillCategory);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Product>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Product>>(`${this.apiProductUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getProductsByIds(productIds: string): Observable<Product[]> {
    return this.commonService.getAll<Product[]>(`${this.apiProductUrl}/productIds/${productIds}`);
  }

  getProductStatusTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiProductUrl}/GetProductStatusTypes`);
  }

  getProductClassTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${this.apiProductUrl}/GetProductClassTypes`);
  }

  getExistingProductCode(existingProductId: number): Observable<string> {
    return this.commonService.getString(`${this.apiProductUrl}/GetExistingProductCode/${existingProductId}`);
  }

  getProductsWithAllOption(): Observable<string[]> {
    const results = this.commonService.getAll<string[]>(`${this.apiProductUrl}/GetProductsWithAllOption`);
    return results;
  }

  getProductOptionDependencies(): Observable<ProductOptionDependency[]> {
    const result = this.commonService.getAll<ProductOptionDependency[]>(`${this.apiProductUrl}/GetProductOptionDependencies`);
    return result;
  }

  getProductsExcludingCertainClasses(excludedProductClassIds: string): Observable<Product[]> {
    return this.commonService.getAll<Product[]>(`${this.apiProductUrl}/GetProductsExcludingCertainClasses/${excludedProductClassIds}`);
  }
}
