import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class PolicyProcessService {

  private apiUrl = 'clc/api/Policy/Policy';

  constructor(
    private readonly commonService: CommonService) {
  }

  lapsePolicy(policyNumber: string, lapseDate: string): Observable<boolean> {
    const url = `${this.apiUrl}/LapsePolicy/${policyNumber}/${lapseDate}`;
    return this.commonService.postWithNoData(url);
  }

  reinstatePolicy(policyNumber: string, reinstateDate: string): Observable<boolean> {
    const url = `${this.apiUrl}/ReinstatePolicy/${policyNumber}/${reinstateDate}`;
    return this.commonService.postWithNoData(url);
  }

  cancelPolicy(policyNumber: string, cancelDate: string, cancelReason: number): Observable<boolean> {
    const url = `${this.apiUrl}/CancelPolicy/${policyNumber}/${cancelDate}/${cancelReason}`;
    return this.commonService.postWithNoData(url);
  }
}
