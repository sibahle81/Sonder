import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';

@Injectable()
export class WorkItemsDataSource extends PagedDataSource<WorkItem> {

    constructor(
        private readonly digiCareService: DigiCareService
    ) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', createdby: string) {
        this.loadingSubject.next(true);

        this.digiCareService.getPagedWorkItemsByCreatedBy(createdby, pageNumber, pageSize, orderBy, sortDirection).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<WorkItem>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
