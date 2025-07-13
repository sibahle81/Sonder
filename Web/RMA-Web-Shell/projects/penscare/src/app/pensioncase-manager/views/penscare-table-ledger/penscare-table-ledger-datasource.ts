import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { PensCareService } from '../../services/penscare.service';
import { PensionCaseModel } from '../../../shared-penscare/models/pension-case-model';

@Injectable()
export class PensCareTableLedgerDataSource extends PagedDataSource<PensionCaseModel> {
    constructor(private readonly pensionCaserService: PensCareService,
      private cdr: ChangeDetectorRef) {
        super();
    }
    isLoading: boolean;
    isError: boolean;
    filteredData: any[] = [];


    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PensionCaseNumber', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);
        const p = new Pagination();
        p.isAscending = sortDirection === 'asc' ? true : false;
        p.pageSize = pageSize;
        p.pageNumber = pageNumber;
        p.orderBy = orderBy;
        this.isLoading = true;
        this.cdr.detectChanges();

        this.pensionCaserService.searchPensionCases(query, p).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
          this.isLoading = false;
          this.data = result as PagedRequestResult<PensionCaseModel>;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
