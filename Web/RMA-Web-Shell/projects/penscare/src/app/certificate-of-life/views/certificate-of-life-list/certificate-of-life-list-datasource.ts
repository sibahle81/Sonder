import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PensionLedgerService } from '../../../pensioncase-manager/services/pension-ledger.service';
import { ChildToAdultPensionLedger } from '../../../shared-penscare/models/child-to-adult-pension-ledger.model';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { CertificateOfLifeDetail } from '../../../shared-penscare/models/certificate-of-life-detail';

@Injectable()
export class CertificateOfLifeListDataSource extends PagedDataSource<CertificateOfLifeDetail> {
  isLoading: boolean;
  isError: boolean;
  filteredData: any[] = [];

  constructor(
    private readonly pensionLedgerService: PensionLedgerService,
    private readonly cdr: ChangeDetectorRef) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
      this.loadingSubject.next(true);
      const p = new Pagination();
      p.isAscending = sortDirection === 'asc' ? true : false;
      p.pageSize = pageSize;
      p.pageNumber = pageNumber;
      p.orderBy = orderBy;
      this.isLoading = true;
      this.cdr.detectChanges();

      this.pensionLedgerService.getProofOfLivesBySearchCriteria(query, p).pipe(
        catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.isLoading = false;
        this.data = result as unknown as PagedRequestResult<CertificateOfLifeDetail>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });
  }
}
