import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { RegisterFuneralModel } from '../shared/entities/funeral/register-funeral.model';
import { FuneralRuleResult } from '../shared/entities/funeral/funeral-rule-result';

@Injectable({
  providedIn: 'root'
})
export class FuneralService {
  private apiUrl = 'clm/api/claim/fatal';

  constructor(
    private readonly commonService: CommonService) {
  }

  executeFuneralClaimRegistrationRules(registerFuneral: RegisterFuneralModel): Observable<RegisterFuneralModel> {
    return this.commonService.postGeneric<RegisterFuneralModel, RegisterFuneralModel>(`${this.apiUrl}/ExecuteFuneralClaimRegistrationRules`, registerFuneral);
  }

  getFuneralClaimRegistrationRules(registerFuneral: FuneralRuleResult): Observable<FuneralRuleResult> {
    return this.commonService.postGeneric<FuneralRuleResult, FuneralRuleResult>(`${this.apiUrl}/ExecuteFuneralClaimRegistrationRules`, registerFuneral);
  }

}
