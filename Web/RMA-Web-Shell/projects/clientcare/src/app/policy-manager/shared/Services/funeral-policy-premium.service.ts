import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { FuneralPolicyPremium } from '../entities/funeral-policy-premium';

@Injectable({
  providedIn: 'root'
})
export class FuneralPolicyPremiumService {

  private api = 'clc/api/Policy/FuneralPolicyPremium';

  constructor(private readonly commonService: CommonService) {}

  getRoundedGroupPolicyPremium(baseRate: number, adminPercentage: number, binderPercentage: number, commissionPercentage: number, premiumAdjustmentPercentage: number): Observable<FuneralPolicyPremium> {
    const url = `${this.api}/GroupPolicyPremium/${baseRate}/${adminPercentage}/${commissionPercentage}/${binderPercentage}/${premiumAdjustmentPercentage}`;
    return this.commonService.getAll<FuneralPolicyPremium>(`${url}`);
  }

  getUnRoundedGroupPolicyPremium(baseRate: number, adminPercentage: number, binderPercentage: number, commissionPercentage: number, premiumAdjustmentPercentage: number): Observable<FuneralPolicyPremium> {
    const url = `${this.api}/GroupSchemePolicyPremium/${baseRate}/${adminPercentage}/${commissionPercentage}/${binderPercentage}/${premiumAdjustmentPercentage}`;
    return this.commonService.getAll<FuneralPolicyPremium>(`${url}`);
  }

  getIndividualPolicyPremium(baseRate: number, adminPercentage: number, binderPercentage: number, commissionPercentage: number, premiumAdjustmentPercentage: number): Observable<FuneralPolicyPremium> {
    const url = `${this.api}/IndividualPolicyPremium/${baseRate}/${adminPercentage}/${commissionPercentage}/${binderPercentage}/${premiumAdjustmentPercentage}`;
    return this.commonService.getAll<FuneralPolicyPremium>(`${url}`);
  }
}
