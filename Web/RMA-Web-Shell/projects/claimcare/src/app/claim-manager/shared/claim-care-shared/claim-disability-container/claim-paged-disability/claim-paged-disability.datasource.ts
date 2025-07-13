import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { DisabilityFormService } from '../disability-form.service';
import { ClaimDisabilityService } from '../../../../Services/claim-disability.service';
import { ClaimDisabilityAssessmentResult } from '../../../entities/claim-disability-assessment-result';

@Injectable({
  providedIn: 'root'
})
export class ClaimPagedDisabilityDataSource extends PagedDataSource<ClaimDisabilityAssessmentResult> {

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  personEventId: number;
  isProrataPension = false;

  constructor(
    private readonly claimDisabilityService: ClaimDisabilityService,
    private disabilityFormService: DisabilityFormService,
  ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
 
    orderBy = "createdDate";
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'createdDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.claimDisabilityService.getPagedClaimDisabilityAssessmentsHistory(pageNumber, pageSize, orderBy, sortDirection, query, this.personEventId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ClaimDisabilityAssessmentResult>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.isProrataPension = this.calculateProRataPension(this.data.data);
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

  calculateProRataPension(claimDisabilities: ClaimDisabilityAssessmentResult[]): boolean {
    const totalPercentage = claimDisabilities.reduce((sum, item) => sum + item.nettAssessedPdPercentage, 0);
    const isProrataPension = totalPercentage > 30;
    if (isProrataPension) {
      this.disabilityFormService.activatePensionInterview();
    }
    return isProrataPension;
  }
}
