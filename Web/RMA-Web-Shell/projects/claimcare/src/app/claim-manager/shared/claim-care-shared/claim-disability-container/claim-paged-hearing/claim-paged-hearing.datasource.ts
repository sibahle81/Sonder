import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { catchError, finalize, tap } from "rxjs/operators";
import { ClaimHearingAssessment } from "../../../entities/claim-hearing-assessment";
import { ClaimDisabilityService } from "../../../../Services/claim-disability.service";

@Injectable({
  providedIn: 'root'
})
export class ClaimPagedHearingDataSource extends PagedDataSource<ClaimHearingAssessment> {

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  personEventId: number;

  constructor(
    private readonly claimDisabilityService: ClaimDisabilityService) {
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

    this.claimDisabilityService.getPagedClaimHearingAssessment(pageNumber, pageSize, orderBy, sortDirection, query, this.personEventId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ClaimHearingAssessment>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}