import { Injectable } from "@angular/core";
import { SearchPreAuthCriteria } from "projects/medicare/src/app/preauth-manager/models/search-preauth-criteria";
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Injectable()
export class SearchPreAuthorisationDataSource extends PagedDataSource<PreAuthorisation> {
  statusMsg: string;
  isLoading = false;

  constructor(
    private readonly mediCarePreAuthService: MediCarePreAuthService) {
    super();
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }

  getData(pageNumber: number = 1, pageSize: number = 10, orderBy: string = 'PreAuthId', sortDirection: string = 'asc', searchRequest: SearchPreAuthCriteria) {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Searching ...';
    if (!searchRequest.pageNumber || searchRequest.pageNumber === 0) {
      searchRequest.pageNumber = pageNumber;
    }
    if (!searchRequest.pageSize || searchRequest.pageSize === 0) {
      searchRequest.pageSize = pageSize;
    }
    this.mediCarePreAuthService.searchForPreAuthorisations(searchRequest).pipe(
      catchError(error => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
        this.loadingSubject.next(false);
        this.isLoading = false;
        this.data = result as PagedRequestResult<PreAuthorisation>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
