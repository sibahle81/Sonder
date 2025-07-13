import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Period } from './period';

@Injectable()
export class PeriodService {

  private apiUrl = 'mdm/api/Period';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPeriod(id: any): Observable<Period> {
    return this.commonService.get<Period>(id, this.apiUrl);
  }

  getCurrentPeriod(): Observable<Period> {
    return this.commonService.getAll<Period>(`${this.apiUrl}/GetCurrentPeriod`);
  }

  getLatestPeriod(): Observable<Period> {
    return this.commonService.getAll<Period>(`${this.apiUrl}/GetLatestPeriod`);
  }

  getPeriods(): Observable<Period[]> {
    return this.commonService.getAll<Period[]>(this.apiUrl);
  }

  addPeriod(period: Period): Observable<number> {
    return this.commonService.postGeneric<Period, number>(this.apiUrl, period);
  }

  editPeriod(period: Period): Observable<boolean> {
    return this.commonService.edit<Period>(period, this.apiUrl);
  }

  deletePeriod(period: Period): Observable<boolean> {
    return this.commonService.remove(period.id, this.apiUrl);
  }

  createBillingPeriods(): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/CreateBillingPeriods`);
  }

  rollBillingPeriods(runPeriodConcurrently: boolean): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/RollBillingPeriod/${runPeriodConcurrently}`);
  }

  getPeriodByYearAndMonth(year: number, month: number): Observable<Period> {
    return this.commonService.getAll<Period>(`${this.apiUrl}/GetPeriodByYearAndMonth/${year}/${month}`);
  }
}
