import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ReportViewedAudit } from 'projects/shared-models-lib/src/lib/common/audits/report-viewed-audit';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuditLogService } from '../../audit/audit-log.service';
import { ReportViewedAuditPagedRequest } from 'projects/shared-models-lib/src/lib/common/audits/report-viewed-audit-paged-request';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';

@Injectable({
  providedIn: 'root'
})
export class ReportViewedAuditSearchDataSource extends PagedDataSource<ReportViewedAudit> {

  reportUrl: string;
  itemType: string;
  itemId: number;

  constructor(
    private readonly auditLogService: AuditLogService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'reportViewedAuditId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('reportViewedAuditId')) {
      orderBy = 'reportViewedAuditId';
    }

    const reportViewedAuditPagedRequest = new ReportViewedAuditPagedRequest();
    reportViewedAuditPagedRequest.pagedRequest = new PagedRequest();
    reportViewedAuditPagedRequest.pagedRequest.page = pageNumber ? pageNumber : 1;
    reportViewedAuditPagedRequest.pagedRequest.pageSize = pageSize ? pageSize : 5;
    reportViewedAuditPagedRequest.pagedRequest.orderBy = orderBy ? orderBy : 'reportViewedAuditId';
    reportViewedAuditPagedRequest.pagedRequest.isAscending = sortDirection == 'asc';
    reportViewedAuditPagedRequest.pagedRequest.searchCriteria = query ? query : '';

    reportViewedAuditPagedRequest.reportUrl = this.reportUrl;
    reportViewedAuditPagedRequest.itemId = this.itemId;
    reportViewedAuditPagedRequest.itemType = this.itemType;

    this.auditLogService.getPagedReportViewedAudit(reportViewedAuditPagedRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ReportViewedAudit>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
