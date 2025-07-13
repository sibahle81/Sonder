import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ClaimNote } from '../../../entities/claim-note';

@Injectable({
  providedIn: 'root'
})
export class HolisticClaimNoteDataSource extends PagedDataSource<ClaimNote> {

  constructor(
    private readonly claimCareService: ClaimCareService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('createdDate')) {
      orderBy = 'createdDate';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'createdDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.claimCareService.getPagedClaimNotes(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ClaimNote>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

  getWizardData(data: ClaimNote[], pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true)
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'createdDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.data = new PagedRequestResult<ClaimNote>();
    this.data.data = data;
    this.data.rowCount = data.length;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;

    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.loadingSubject.next(false)
  }
}
