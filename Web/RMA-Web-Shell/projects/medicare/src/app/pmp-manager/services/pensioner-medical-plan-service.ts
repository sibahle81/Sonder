import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { PmpRegionTransfer } from '../models/pmp-region-transfer';
import { PensionerInterviewForm } from '../models/pensioner-interview-form-detail';

@Injectable({
  providedIn: 'root'
})
export class PensionerMedicalPlanService {
  private apiUrl = 'med/api/PensionMedicalPlan';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPmpRegionTransfer(pmpRegionTransferId: string): Observable<PmpRegionTransfer> {
    return this.commonService.getAll<PmpRegionTransfer>(this.apiUrl + `/GetPmpRegionTransfer/${pmpRegionTransferId}`);
  }

  getPmpRegionTransferByClaimId(claimId: number): Observable<PmpRegionTransfer[]> {
    const url = `${this.apiUrl}/GetPmpRegionTransferByClaimId/${claimId}`;
    return this.commonService.getAll<PmpRegionTransfer[]>(url);
  }

  createPmpRegionTransfer(pmpRegionTransfer: PmpRegionTransfer): Observable<number> {
    return this.commonService.postGeneric<PmpRegionTransfer, number>(this.apiUrl + `/CreatePmpRegionTransfer`, pmpRegionTransfer);
  }

  getPensionerInterviewFormDetailById(pensionerInterviewFormId: number): Observable<PensionerInterviewForm> {
    return this.commonService.getAll<PensionerInterviewForm>(this.apiUrl + `/getPensionerInterviewFormDetailById/${pensionerInterviewFormId}`);
  }

  getPensionerInterviewFormByPensionerId(pensionerId: number): Observable<PensionerInterviewForm[]> {
    const url = `${this.apiUrl}/GetPensionerInterviewFormByPensionerId/${pensionerId}`;
    return this.commonService.getAll<PensionerInterviewForm[]>(url);
  }

  createPensionerInterviewFormDetail(pensionerInterviewFormDetail: PensionerInterviewForm): Observable<number> {
    return this.commonService.postGeneric<PensionerInterviewForm, number>(this.apiUrl + `/CreatePensionerInterviewFormDetail`, pensionerInterviewFormDetail);
  }

  updatePmpRegionTransfer(pmpRegionTransfer: PmpRegionTransfer): Observable<boolean> {
    return this.commonService.edit<PmpRegionTransfer>(pmpRegionTransfer, `${this.apiUrl}/UpdatePmpRegionTransfer`);
  }

  updatePensionerInterviewForm(pensionerInterviewFormDetail: PensionerInterviewForm): Observable<boolean> {
    return this.commonService.edit<PensionerInterviewForm>(pensionerInterviewFormDetail, `${this.apiUrl}/UpdatePensionerInterviewForm`);
  }

}
