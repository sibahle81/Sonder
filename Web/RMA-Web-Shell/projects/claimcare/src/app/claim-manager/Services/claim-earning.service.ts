import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { Earning } from '../shared/entities/earning-model';
import { EarningType } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-type-model';

@Injectable({
  providedIn: 'root'
})
export class ClaimEarningService {

  private apiUrl = 'clm/api/ClaimEarning';

  constructor(
    private readonly commonService: CommonService) {
  }

  createEarning(earning: Earning): Observable<Earning> {
    return this.commonService.postGeneric<Earning, Earning>(`${this.apiUrl}/CreateEarning`, earning);
  }

  updateEarning(earning: Earning): Observable<Earning> {
    return this.commonService.postGeneric<Earning, Earning>(`${this.apiUrl}/UpdateEarning`, earning);
  }

  getEarning(earningId: number): Observable<Earning> {
    return this.commonService.get<Earning>(earningId, `${this.apiUrl}/GetEarning`);
  }

  getEarningsByPersonEventId(personEventId: number): Observable<Earning[]> {
    return this.commonService.getAll<Earning[]>(`${this.apiUrl}/GetEarningsByPersonEventId/${personEventId}`);
  }

  getClaimEarningTypes(isVariable: boolean): Observable<EarningType[]> {
    return this.commonService.getAll<EarningType[]>(`${this.apiUrl}/GetEarningTypes/${isVariable}`);
  }

  getAllClaimEarningTypes(): Observable<EarningType[]> {
    return this.commonService.getAll<EarningType[]>(`${this.apiUrl}/GetAllEarningTypes`);
  }

  notifyToRecaptureEarning(personEventId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/NotifyToRecaptureEarnings/${personEventId}`);
  }
}
