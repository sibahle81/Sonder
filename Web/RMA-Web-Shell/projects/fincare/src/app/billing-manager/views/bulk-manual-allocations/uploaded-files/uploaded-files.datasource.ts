import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { BulkAllocationFile } from '../../../models/bulk-allocation-file';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { AllocatedFilesRequest } from 'projects/fincare/src/app/shared/models/allocation-files-request';
import { CollectionsService } from '../../../services/collections.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class UploadedFilesDatasource   extends PagedDataSource<BulkAllocationFile> {
  statusMsg: string;
  isLoading = false;

  constructor(
    private readonly  collectionService: CollectionsService) {
    super();
  }
 


clearData(): void {
  this.dataSubject.next(new Array());
}

getData(pageNumber: number = 1, pageSize: number = 50, orderBy: string = 'fileId', sortDirection: string = 'asc', searchRequest: AllocatedFilesRequest) {
  this.loadingSubject.next(true);
  this.isLoading = true;
  this.statusMsg = 'Loading files...';
  if(!sortDirection){
    sortDirection = 'asc';
  }
  this.collectionService.getBulkPaymentAllocationFiles(    
    pageNumber, 
    pageSize, 
    orderBy, 
    sortDirection,
    searchRequest.startDate, 
    searchRequest.endDate
).pipe(
    catchError(() => of([])),
    finalize(() => this.loadingSubject.next(false))
).subscribe(result => {
    this.loadingSubject.next(false);
    this.isLoading = false;
    this.data = result as PagedRequestResult<BulkAllocationFile>;
    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
});
}
}

