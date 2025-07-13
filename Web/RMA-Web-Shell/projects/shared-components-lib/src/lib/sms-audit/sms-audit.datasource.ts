import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SmsAudit } from 'projects/shared-models-lib/src/lib/common/sms-audit';
import { SmsAuditService } from './sms-audit.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class SmsAuditDataSource extends PagedDataSource<SmsAudit> {

  policyId: number;
  itemId: number;
  itemType: string;

  filteredData: SmsAudit[] = [];

  constructor(
    private readonly service: SmsAuditService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: any): void {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'createdDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    if (query.itemType === 'Claim' || query.itemType === 'PersonEvent') {
      this.service.GetClaimSmsAudit(query.itemType, query.itemId, pageNumber, pageSize, orderBy, sortDirection).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.setData(result, pageNumber, pageSize);
      });
    } else if (this.itemType === 'Policy' && this.policyId) {
      this.service.getPagedPolicySmsAudits(this.policyId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.setData(result, pageNumber, pageSize);
      });
    } else {
      this.service.GetSmsAudit(query.itemType, query.itemId, pageNumber, pageSize, orderBy, sortDirection).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.setData(result, pageNumber, pageSize);
      });
    }
  }

  private setData(result: any[] | PagedRequestResult<SmsAudit>, pageNumber: number, pageSize: number) {
    this.data = result as PagedRequestResult<SmsAudit>;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;
    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.loadingSubject.next(false);
  }
}
