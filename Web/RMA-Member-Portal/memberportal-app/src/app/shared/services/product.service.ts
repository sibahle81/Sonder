import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { LastViewedItem } from '../components/rules-engine/shared/models/last-viewed-item';
import { ConstantApi } from '../constants/constant';
import { Lookup } from '../models/lookup.model';



import { Product } from '../models/product';
import { ProductOptionDependency } from '../models/product-option-dependency';
import { RuleItem } from '../models/ruleItem';


@Injectable({
  providedIn: 'root'
})
export class ProductService {


  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService) {
  }

  getNames(): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${ConstantApi.ProductApi}/UniqueName`);
  }

  getProduct(id: any): Observable<Product> {
    return this.commonService.get<Product>(id, ConstantApi.ProductApi);
  }

  getProductsByClientTypeId(clientTypeId: number): Observable<Product[]> {
    return this.commonService.get<Product[]>(clientTypeId, `${ConstantApi.ProductApi}/ClientType`);
  }

  getActiveProductsForRepresentative(brokerageId: number): Observable<Product[]> {
    return this.commonService.get<Product[]>(brokerageId, `${ConstantApi.ProductApi}/GetActiveProductsForRepresentative`);
  }

  GetActiveProductsForBroker(brokerageId: number): Observable<Product[]> {
    return this.commonService.get<Product[]>(brokerageId, `${ConstantApi.ProductApi}/GetActiveProductsForBroker`);
  }

  getProducts(): Observable<Product[]> {
    return this.commonService.getAll<Product[]>(ConstantApi.ProductApi);
  }

  getProductRules(id: number): Observable<RuleItem[]> {
    return this.commonService.get<RuleItem[]>(id, ConstantApi.ProductRuleApi);
  }

  addProduct(product: Product): Observable<number> {
    return this.commonService.add<Product>(product, ConstantApi.ProductApi);
  }

  editProduct(product: Product): Observable<boolean> {
    return this.commonService.edit<Product>(product, ConstantApi.ProductApi);
  }

  // TODO product batch api is new add to backend
  addProductBatch(product: Product): Observable<number> {
    product.modifiedBy = this.authService.getUserEmail();
    return this.commonService.add<Product>(product, ConstantApi.ProductBatchApi);
  }

  // TODO product batch api is new add to backend
  editProductBatch(product: Product): Observable<boolean> {
    product.modifiedBy = this.authService.getUserEmail();
    return this.commonService.edit<Product>(product, ConstantApi.ProductBatchApi);
  }

  addProductBenefits(productId: number, benefitIds: number[]): Observable<number> {
    const productBenefitRequest: any = {};
    productBenefitRequest.productId = productId;
    productBenefitRequest.benefitIds = benefitIds;
    return this.commonService.add<Product>(productBenefitRequest, `${ConstantApi.ProductApi}/ProductBenefit`);
  }

  editProductBenefits(productId: number, benefitIds: number[]): Observable<boolean> {
    const productBenefitRequest: any = {};
    productBenefitRequest.productId = productId;
    productBenefitRequest.benefitIds = benefitIds;
    return this.commonService.edit<Product>(productBenefitRequest, `${ConstantApi.ProductApi}/ProductBenefit`);
  }

  editProductSkillCategories(productId: number, skillCaregoryIds: number[]): Observable<boolean> {
    const productSkillCategoryRequest: any = {};
    productSkillCategoryRequest.productId = productId;
    productSkillCategoryRequest.skillCategoryIds = skillCaregoryIds;
    return this.commonService.edit<Product>(productSkillCategoryRequest, `${ConstantApi.ProductApi}/ProductSkillCategory`);
  }


  getLastViewedItems(): Observable<LastViewedItem[]> {
    return this.commonService.getAll<LastViewedItem[]>(`${ConstantApi.ProductApi}/LastViewed`);
  }

  addProductSkillCategories(productId: number, skillCategoryIds: number[]): Observable<number> {
    const productSkillCategory: any = {};
    productSkillCategory.productId = productId;
    productSkillCategory.skillCategoryIds = skillCategoryIds;
    return this.commonService.add<Product>(productSkillCategory, `${ConstantApi.ProductApi}/ProductSkillCategory`);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Product>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Product>>(`${ConstantApi.ProductApi}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getProductsByIds(productIds: string): Observable<Product[]> {
    return this.commonService.getAll<Product[]>(`${ConstantApi.ProductApi}/productIds/${productIds}`);
  }

  getProductStatusTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${ConstantApi.ProductApi}/GetProductStatusTypes`);
  }

  getProductClassTypes(): Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(`${ConstantApi.ProductApi}/GetProductClassTypes`);
  }

  getExistingProductCode(existingProductId: number): Observable<string> {
    return this.commonService.getString(`${ConstantApi.ProductApi}/GetExistingProductCode/${existingProductId}`);
  }

  getProductOptionDependencies(): Observable<ProductOptionDependency[]> {
    const result = this.commonService.getAll<ProductOptionDependency[]>(`${ConstantApi.ProductApi}/GetProductOptionDependenciesAnon`);
    return result;
  }
}
