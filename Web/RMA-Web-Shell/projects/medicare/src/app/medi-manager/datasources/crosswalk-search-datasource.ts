import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CrosswalkSearch } from 'projects/medicare/src/app/medi-manager/models/crosswalk-search';
import { CrosswalkSearchComponentService } from 'projects/medicare/src/app/medi-manager/services/crosswalkSearchService';
import { isNullOrUndefined } from 'util';

@Injectable()
export class CrosswalkSearchDataSource extends PagedDataSource<CrosswalkSearch> {
    public searchResult: CrosswalkSearch[];

    constructor(private readonly crosswalkSearchComponentService: CrosswalkSearchComponentService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 20, orderBy: string = 'tariffId', sortDirection: string = 'desc', query: string = ''): void {
        this.loadingSubject.next(true);

        this.crosswalkSearchComponentService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<CrosswalkSearch>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        },
            () => { },
            () => {
                if (!isNullOrUndefined(this.data.data)) {
                    this.data.data.forEach(element => {
                        if (!isNullOrUndefined(element)) {
                            element.requestedQuantity = 1;
                            element.requestedAmount = element.tariffAmount * 1;
                        }
                    });
                }
            }
        );
    }
}
