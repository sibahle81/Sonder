import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { LastViewedItem } from '../components/rules-engine/shared/models/last-viewed-item';
import { ConstantApi } from '../constants/constant';
import { Benefit } from '../models/benefit';
import { ProductOption } from '../models/product-option';
import { RuleItem } from '../models/ruleItem';

@Injectable()
export class ProductOptionService {

  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService) {
  }

  getProductOption(id: number): Observable<ProductOption> {
    return this.commonService.get<ProductOption>(id, `${ConstantApi.ProductOptionApi}`);
  }

  getProductOptions(): Observable<ProductOption[]> {
    return this.commonService.getAll<ProductOption[]>(`${ConstantApi.ProductOptionApi}`);
  }

  getProductOptionNamesByProductId(productId: number): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(productId, `${ConstantApi.ProductOptionApi}/NamesByProductId`);
  }
  GetProductOptionsByCoverTypeIds(coverTypes: number[]): Observable<ProductOption[]> {
    return this.commonService.postList<ProductOption[]>(`${ConstantApi.ProductOptionApi}/GetProductOptionsByCoverTypeIds`, coverTypes);
  }

  getProductOptionByProductId(productId: number): Observable<ProductOption[]> {
    return this.commonService.get<ProductOption[]>(productId, `${ConstantApi.ProductOptionApi}/ByProductId`);
  }

  addProductOption(productOption: ProductOption): Observable<number> {
    return this.commonService.add<ProductOption>(productOption, `${ConstantApi.ProductOptionApi}`);
  }

  editProductOption(productOption: ProductOption): Observable<boolean> {
    return this.commonService.edit<ProductOption>(productOption, `${ConstantApi.ProductOptionApi}`);
  }

  removeProductOption(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${ConstantApi.ProductOptionApi}`);
  }

  getProductOptionRules(id: number): Observable<RuleItem[]> {
    return this.commonService.get<RuleItem[]>(id, `${ConstantApi.ProductOptionRuleApi}`);
  }

  searchProductOption(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<ProductOption>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ProductOption>>(`${ConstantApi.ProductOptionApi}/SearchProductOptions/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getLastViewedItems(): Observable<LastViewedItem[]> {
    return this.commonService.getAll<LastViewedItem[]>(`${ConstantApi.ProductOptionApi}/LastViewed`);
  }

  getBenefitsForOption(productOptionId: number): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(`${ConstantApi.ProductOptionApi}/GetBenefitsForOption/${productOptionId}`);
  }

  getBrokerProductOptionsPaged(pageNumber: number, pageSize: number = 5, orderBy: string = 'Id', sortDirection: string = 'asc', query: string = ''): Observable<PagedRequestResult<ProductOption>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ProductOption>>(`${ConstantApi.ProductOptionApi}/GetBrokerProductOptions/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getBenefitsForExtendedMembers(mainMemberOptionId: number): Observable<Benefit[]> {
    return this.commonService.getAll<Benefit[]>(`${ConstantApi.ProductOptionApi}/GetBenefitsForExtendedMembers/${mainMemberOptionId}`);
  }
}

