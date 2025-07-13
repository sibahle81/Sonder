import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { PensionLedgerService } from '../../services/pension-ledger.service';
import { PensionCaseContextEnum } from '../../../shared-penscare/enums/pensioncase-context-enum';
import { CorrectiveEntry } from 'projects/shared-components-lib/src/lib/models/corrective-entry.model';
import { PensCareService } from '../../services/penscare.service';

@Injectable()
export class CorrectiveEntryListDataSource extends PagedDataSource<CorrectiveEntry> {
    constructor(
      private readonly pensionLedgerService: PensionLedgerService,
      private readonly pensCareService: PensCareService,
      private cdr: ChangeDetectorRef) {
        super();
    }
    isLoading: boolean;
    isError: boolean;
    filteredData: any[] = [];


    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PensionCaseNumber', sortDirection: string = 'asc', query: string = '', pensionCaseContext?: PensionCaseContextEnum, id?: number) {
        this.loadingSubject.next(true);
        const p = new Pagination();
        p.isAscending = sortDirection === 'asc' ? true : false;
        p.pageSize = pageSize;
        p.pageNumber = pageNumber;
        p.orderBy = orderBy;
        this.isLoading = true;
        this.cdr.detectChanges();

        if (pensionCaseContext === PensionCaseContextEnum.LedgerCorrectiveEntries) {
          this.pensionLedgerService.searchLedgerCorrectiveEntriesPagingPagedRequestResult(query, p, id).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
          ).subscribe(result => {
            this.isLoading = false;
            this.data = result as PagedRequestResult<CorrectiveEntry>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
          });
        } else {
          this.pensCareService.searchPensionCaseCorrectiveEntriesPagingPagedRequestResult(query, p, id).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
          ).subscribe(result => {
            this.isLoading = false;
            this.data = result as PagedRequestResult<CorrectiveEntry>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
          });
        }
    }
}
