import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ClaimSearchResponse } from '../models/shared/claim-search/claim-search-response';
import { ClaimSearchRequest } from '../models/shared/claim-search/claim-search-request';

@Injectable({
  providedIn: 'root'
})

export class IntegrationService {
  private apiUrlCompCare = 'int/api/compcare/CCClaims';
  private apiUrlClaim = 'clm/api/claim';

  constructor(
    private readonly commonService: CommonService) {
  }

  getClaimSearchResponse(claimSearchRequest: ClaimSearchRequest): Observable<ClaimSearchResponse> {
    if (claimSearchRequest.request.medicalReportSystemSourceId === 1) {
      return this.commonService.postGeneric<ClaimSearchRequest, ClaimSearchResponse>(`${this.apiUrlCompCare}/CCClaimPost`, claimSearchRequest);
    } else {
      return this.commonService.postGeneric<ClaimSearchRequest, ClaimSearchResponse>(`${this.apiUrlClaim}/PostClaimRequest`, claimSearchRequest);
    }
  }
}
