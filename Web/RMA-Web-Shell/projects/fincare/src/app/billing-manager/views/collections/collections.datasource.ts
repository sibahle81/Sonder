import { CollectionsService } from '../../services/collections.service';
import { FilterCollectionsRequest } from '../../models/filter-collections-request';
import { Collection } from '../../models/collection';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
@Injectable()
export class CollectionsDataSource extends PagedDataSource<Collection> {
  statusMsg: string;
  isLoading = false;

  constructor(
    private readonly service: CollectionsService
  ) {
    super();
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }

  getData(pageNumber: number = 1, pageSize: number = 50, orderBy: string = 'CreatedDate', sortDirection: string = 'asc', filterCollectionsRequest: FilterCollectionsRequest) {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Loading collections...';
    this.service.getCollections(pageNumber, pageSize, orderBy, sortDirection,
      filterCollectionsRequest.collectionType, filterCollectionsRequest.collectionStatus, filterCollectionsRequest.startDate, filterCollectionsRequest.endDate).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
  ).subscribe(result => {
      this.isLoading = false;
      this.data = result as PagedRequestResult<Collection>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
  });
  }

  searchData(pageNumber: number = 1, pageSize: number = 50, orderBy: string = 'CreatedDate', sortDirection: string = 'asc', query: any): void {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Searching...';
    this.service
      .searchCollections(pageNumber, pageSize, orderBy, sortDirection, query.query as string, query.filter as number)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
        this.isLoading = false;
        this.data = result as PagedRequestResult<Collection>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
    });
    }

  submitCollection(collection: Collection): Observable<Collection> {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Submitting collection...';
    return this.service.submitCollection(collection);
  }

  submitAll(startDate: string, endDate: string) {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Submitting pending collections...';
    return this.service.submitPendingCollections(startDate, endDate);
  }
}
