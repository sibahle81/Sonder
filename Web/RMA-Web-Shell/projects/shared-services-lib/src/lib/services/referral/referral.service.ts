import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralNatureOfQuery } from 'projects/shared-models-lib/src/lib/referrals/referral-nature-of-query';
import { ReferralSearchRequest } from 'projects/shared-models-lib/src/lib/referrals/referral-search-request';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiUrl = 'mdm/api/referral';

  constructor(
    private readonly commonService: CommonService) {
  }

  createReferral(referral: Referral): Observable<Referral> {
    return this.commonService.postGeneric<Referral, Referral>(`${this.apiUrl}/CreateReferral`, referral);
  }

  getReferral(referralId: number): Observable<Referral> {
    return this.commonService.postGeneric<number, Referral>(`${this.apiUrl}/GetReferral`, referralId);
  }

  updateReferral(referral: Referral): Observable<Referral> {
    return this.commonService.postGeneric<Referral, Referral>(`${this.apiUrl}/UpdateReferral`, referral);
  }

  getPagedReferrals(referralSearchRequest: ReferralSearchRequest): Observable<PagedRequestResult<Referral>> {
    return this.commonService.postGeneric<ReferralSearchRequest, PagedRequestResult<Referral>>(`${this.apiUrl}/GetPagedReferrals/`, referralSearchRequest);
  }

  getReferralNatureOfQuery(): Observable<ReferralNatureOfQuery[]> {
    return this.commonService.getAll<ReferralNatureOfQuery[]>(`${this.apiUrl}/GetReferralNatureOfQuery`);
  }

  getPagedReferralNatureOfQuery(referralSearchRequest: ReferralSearchRequest): Observable<PagedRequestResult<ReferralNatureOfQuery>> {
    return this.commonService.postGeneric<ReferralSearchRequest, PagedRequestResult<ReferralNatureOfQuery>>(`${this.apiUrl}/GetPagedReferralNatureOfQuery/`, referralSearchRequest);
  }

  updateReferralNatureOfQuery(referralNatureOfQuery: ReferralNatureOfQuery): Observable<ReferralNatureOfQuery> {
    return this.commonService.postGeneric<ReferralNatureOfQuery, ReferralNatureOfQuery>(`${this.apiUrl}/UpdateReferralNatureOfQuery/`, referralNatureOfQuery);
  }
}

