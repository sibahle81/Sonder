import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

import { UpgradeDowngradePolicyCase } from '../../shared/entities/upgrade-downgrade-policy-case';
import { ProductOption } from '../../../product-manager/models/product-option';
import { BenefitModel } from '../../../product-manager/models/benefit-model';
import { Policy } from '../../shared/entities/policy';

import 'src/app/shared/extensions/string.extensions';

@Injectable()
export class GroupPolicySchemeService {

  private apiPolicy = 'clc/api/Policy/Policy';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPolicyById(id: number): Observable<Policy> {
    return this.commonService.get<Policy>(id, `${this.apiPolicy}`);
  }

  getPolicyByNumber(policyNumber: string): Observable<Policy> {
    const url = `${this.apiPolicy}/GetPolicyByNumber/${policyNumber}`;
    return this.commonService.getAll<Policy>(url);
  }

  getChildPolicies(parentPolicyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, search: string): Observable<PagedRequestResult<Policy>> {
    const parameters = String.isNullOrEmpty(search) ? `${parentPolicyId}` : `${parentPolicyId},${search}`;
    const url = `${this.apiPolicy}/GetChildPolicies/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${parameters}`;
    return this.commonService.getAll<PagedRequestResult<Policy>>(url);
  }

  getChildPolicyIds(parentPolicyId: number): Observable<number[]> {
    const url = `${this.apiPolicy}/GetChildPolicyIds/${parentPolicyId}`;
    return this.commonService.getAll(url);
  }

  getPolicyProductOption(policyId: number): Observable<ProductOption> {
    const url = `${this.apiPolicy}/PolicyProductOption/${policyId}`;
    return this.commonService.getAll(url);
  }

  getBenefitsForSelectedPolicies(policyCase: UpgradeDowngradePolicyCase): Observable<BenefitModel[]> {
    const url = `${this.apiPolicy}/GetBenefitsForSelectedPolicies`;
    return this.commonService.postGeneric<UpgradeDowngradePolicyCase, BenefitModel[]>(url, policyCase);
  }
}
