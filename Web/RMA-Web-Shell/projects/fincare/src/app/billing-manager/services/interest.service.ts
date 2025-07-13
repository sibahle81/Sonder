import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InterestSearchRequest } from '../models/interest-search-request';
import { Interest } from '../models/interest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Observable } from 'rxjs';
import { InterestCalculationRequest } from '../models/interest-calculation-request';

@Injectable({
  providedIn: 'root'
})
export class InterestService {

  private apiUrl = 'bill/api/billing/Interest';

  constructor(private readonly commonService: CommonService) { }

  startInterestCalculation(interestCalculationRequest: InterestCalculationRequest): Observable<boolean> {
    return this.commonService.postGeneric<InterestCalculationRequest, boolean>(`${this.apiUrl}/StartInterestCalculation/`, interestCalculationRequest);
  }

  processInterestCalculation(interestCalculationRequest: InterestCalculationRequest): Observable<boolean> {
    return this.commonService.postGeneric<InterestCalculationRequest, boolean>(`${this.apiUrl}/ProcessInterestCalculation/`, interestCalculationRequest);
  }


  getPagedCalculatedInterest(interestSearchRequest: InterestSearchRequest): Observable<PagedRequestResult<Interest>> {
    return this.commonService.postGeneric<InterestSearchRequest, PagedRequestResult<Interest>>(`${this.apiUrl}/GetPagedCalculatedInterest/`, interestSearchRequest);
  }

  updateCalculatedInterest(interests: Interest[]): Observable<boolean> {
    return this.commonService.edit<Interest[]>(interests, `${this.apiUrl}/UpdateCalculatedInterest`);
  }
}