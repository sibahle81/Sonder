import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { PolicyInsuredLife } from '../models/policy-insured-life';


@Injectable({ providedIn: 'root' })
export class PolicyInsuredLifeService {

  constructor(
    private readonly commonService: CommonService) {
  }

  getPolicyInsuredLives(policyId: number): Observable<PolicyInsuredLife[]> {
    const url = `${ConstantApi.insuredLifeUrl}/GetPolicyInsuredLives/${policyId}`;
    return this.commonService.getAll(url);
  }
}
