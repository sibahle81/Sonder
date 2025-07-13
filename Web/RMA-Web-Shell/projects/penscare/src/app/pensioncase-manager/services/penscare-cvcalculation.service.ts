import { Injectable } from '@angular/core';
import { VerifyCVCalculationResponse } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { Observable } from 'rxjs';
import { InitiatePensionCaseData } from '../../shared-penscare/models/initiate-pensioncase-data.model';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable({
  providedIn: 'root'
})
export class PensCareCvCalculationService {
  private apiUrl = 'pen/api/PensionCvCalculation';

  constructor(
    private readonly commonService: CommonService) {
  }

  public verifyFatalEstimatedCV(verifyCalculationsRequest: InitiatePensionCaseData): Observable<VerifyCVCalculationResponse> {
    return this.commonService.postGeneric<InitiatePensionCaseData, VerifyCVCalculationResponse>(`${this.apiUrl}/VerifyFatalityEstimatedCV`, verifyCalculationsRequest);
  }

  public verifyDisabilityEstimatedCV(verifyCalculationsRequest: InitiatePensionCaseData): Observable<VerifyCVCalculationResponse> {
    return this.commonService.postGeneric<InitiatePensionCaseData, VerifyCVCalculationResponse>(`${this.apiUrl}/VerifyDisabilityEstimated`, verifyCalculationsRequest);
  }
}
