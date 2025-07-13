import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TreatmentCode } from 'projects/medicare/src/app/medi-manager/models/treatmentCode';
import { TreatmentCodeSearchService } from 'projects/medicare/src/app/medi-manager/services/treatmentCodeSearch.service';

@Injectable()
export class TreatmentCodeSearchDataSource extends PagedDataSource<TreatmentCode> {
    public searchResult : TreatmentCode[];
    
    constructor(private readonly treatmentCodeSearchService: TreatmentCodeSearchService) 
    {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 20, orderBy: string = 'TreatmentCodeId', sortDirection: string = 'desc', query: string = ''): void {
        this.loadingSubject.next(true);

        this.treatmentCodeSearchService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<TreatmentCode>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
