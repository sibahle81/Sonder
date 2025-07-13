import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InsuredLifePolicyProduct } from '../entities/insured-life-policy-product';

@Injectable()
export class InsuredLifePolicyProductService {

  private apiInsuredLifePolicyProduct = 'clc/api/policy/InsuredLifePolicyProduct';

  constructor(
    private readonly commonService: CommonService) {
  }

  getInsuredLifePolicyProducts(): Observable<InsuredLifePolicyProduct[]> {
    const apiUrl = this.commonService.getApiUrl(`${this.apiInsuredLifePolicyProduct}`);
    return this.commonService.getAll(apiUrl)
  }

  getInsuredLifePolicyProductsByPolicy(policyId: number): Observable<InsuredLifePolicyProduct[]> {
    return this.commonService.get(policyId, `${this.apiInsuredLifePolicyProduct}/ByPolicy`);
  }

  getInsuredLifePolicyProductsByInsuredLife(insuredLifeId: number): Observable<InsuredLifePolicyProduct[]> {
    return this.commonService.get(insuredLifeId, `${this.apiInsuredLifePolicyProduct}/ByInsuredLife`);
  }

  addInsuredLifePolicyProducts(insuredLifePolicyProducts: InsuredLifePolicyProduct[]): Observable<number> {
    insuredLifePolicyProducts.forEach((insuredLifePolicyProduct) => {
      insuredLifePolicyProduct.isActive = true;
    });
    return this.commonService.post<InsuredLifePolicyProduct[]>(`${this.apiInsuredLifePolicyProduct}`, insuredLifePolicyProducts);
  }

  editInsuredLifePolicyProducts(insuredLifePolicyProducts: InsuredLifePolicyProduct[]): Observable<boolean> {
    insuredLifePolicyProducts.forEach((insuredLifePolicyProduct) => {
      insuredLifePolicyProduct.isActive = true;
    });
    return this.commonService.edit<InsuredLifePolicyProduct[]>(insuredLifePolicyProducts, `${this.apiInsuredLifePolicyProduct}`);
  }

  removeInsuredLifePolicyProducts(id: number): Observable<number> {
    return this.commonService.remove(id, `${this.apiInsuredLifePolicyProduct}`);
  }
}
