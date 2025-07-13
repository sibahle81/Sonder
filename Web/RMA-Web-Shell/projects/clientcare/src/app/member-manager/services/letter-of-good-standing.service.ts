import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { LetterOfGoodStanding } from '../../policy-manager/shared/entities/letter-of-good-standing';
import { DatePipe } from '@angular/common';
import { Policy } from '../../policy-manager/shared/entities/policy';

@Injectable({
  providedIn: 'root'
})

export class LetterOfGoodStandingService {
  private apiUrl = 'clc/api/Member/LetterOfGoodStanding';
  datePipe = new DatePipe('en-US');

  constructor(
    private readonly commonService: CommonService) {
  }

  getLetterOfGoodStanding(letterOfGoodStandingId: number): Observable<LetterOfGoodStanding> {
    return this.commonService.getAll<LetterOfGoodStanding>(`${this.apiUrl}/GetLetterOfGoodStanding/${letterOfGoodStandingId}`);
  }

  resendLetterOfGoodStanding(policy: Policy): Observable<number> {
    return this.commonService.postGeneric<Policy, number>(this.apiUrl + '/ResendLetterOfGoodStanding', policy);
  }

  getPagedLetterOfGoodStanding(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<LetterOfGoodStanding>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<LetterOfGoodStanding>>(`${this.apiUrl}/GetPagedLetterOfGoodStanding/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  generateLetterOfGoodStanding(expiryDate: Date, rolePlayerId: number, policyId: number): Observable<boolean> {
    const _expiryDate = this.datePipe.transform(expiryDate, 'yyyy-MM-dd HH:mm:ss');
    return this.commonService.getAll<boolean>(`${this.apiUrl}/GenerateLetterOfGoodStanding/${_expiryDate}/${rolePlayerId}/${policyId}`);
  }

  validateLetterOfGoodStanding(certificateNo: string): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/ValidateLetterOfGoodStanding/${certificateNo}`);
  }
}
