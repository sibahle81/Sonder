import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EmailNotificationAuditService } from '../../email-notification-audit/email-notification-audit.service';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/EmailAudit';

@Injectable({
  providedIn: 'root'
})
export class EmailAuditSearchDataSource extends PagedDataSource<EmailAudit> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  policyId: number;
  itemId: number;
  itemType: string;

  constructor(
    private readonly emailNotificationAuditService: EmailNotificationAuditService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.isLoading$.next(true);
    this.loadingSubject.next(true);
    if (orderBy.includes('createdDate')) {
      orderBy = 'createdDate';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'createdDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    if (this.itemType === 'Policy' && this.policyId) {
      this.emailNotificationAuditService.getPagedPolicyEmailAudits(this.policyId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.setData(result, pageNumber, pageSize);
      });
    } else {
      this.itemId = this.itemId ? this.itemId : -1;
      this.itemType = this.itemType ? this.itemType : String.Empty;

      this.emailNotificationAuditService.getPagedEmailAudits(this.itemId, this.itemType, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.setData(result, pageNumber, pageSize);
      });
    }
  }

  private setData(result: any[] | PagedRequestResult<EmailAudit>, pageNumber: number, pageSize: number) {
    this.data = result as PagedRequestResult<EmailAudit>;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;
    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.isLoading$.next(false);
  }
}
