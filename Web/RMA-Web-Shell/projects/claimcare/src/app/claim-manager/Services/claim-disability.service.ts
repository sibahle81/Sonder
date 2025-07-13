import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { ClaimDisabilityPension } from '../shared/entities/claim-disability-pension';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ClaimDisabilityAssessmentResult } from '../shared/entities/claim-disability-assessment-result';
import { ClaimHearingAssessment } from '../shared/entities/claim-hearing-assessment';


@Injectable({
  providedIn: 'root'
})
export class ClaimDisabilityService {
  private apiUrl = 'clm/api/ClaimDisability';

  constructor(
    private readonly commonService: CommonService) {
  }

  addClaimDisabilityPension(claimDisabilityPension: ClaimDisabilityPension): Observable<number> {
    return this.commonService.postGeneric<ClaimDisabilityPension, number>(`${this.apiUrl}/CreateClaimDisabilityPension`, claimDisabilityPension);
  }

  updateClaimDisabilityPension(claimDisabilityPension: ClaimDisabilityPension): Observable<boolean> {
    return this.commonService.postGeneric<ClaimDisabilityPension, boolean>(`${this.apiUrl}/UpdateClaimDisabilityPension`, claimDisabilityPension);
  }

  getClaimDisabilityPensionByPersonEventId(personEventId: number): Observable<ClaimDisabilityPension> {
    return this.commonService.getAll<ClaimDisabilityPension>(`${this.apiUrl}/GetClaimDisabilityPensionByPersonEventId/${personEventId}`);
  }

  getPagedClaimDisabilityAssessmentsHistory(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<ClaimDisabilityAssessmentResult>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimDisabilityAssessmentResult>>(`${this.apiUrl}/GetPagedClaimDisabilityAssessmentsHistory/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedClaimHearingAssessment(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, personEventId: number): Observable<PagedRequestResult<ClaimHearingAssessment>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ClaimHearingAssessment>>(`${this.apiUrl}/GetPagedClaimHearingAssessment/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
}

