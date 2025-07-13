import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { SLAService } from 'projects/shared-services-lib/src/lib/services/sla/sla.service';
import { SLAStatusChangeAudit } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-status-change-audit';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { SLAStatusChangeAuditSearchRequest } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-status-change-audit-search-request';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';

@Injectable({
  providedIn: 'root'
})
export class PagedSLAStatusChangeAuditsDataSource extends PagedDataSource<SLAStatusChangeAudit> {

  slaItemType: SLAItemTypeEnum;
  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly slaService: SLAService) {
    super();
  }

  getData(page: number = 1, pageSize: number = 5, orderBy: string = 'SLAStatusChangeAuditId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'createdDate';
    pagedRequest.page = page ? page : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const slaStatusChangeAuditSearchRequest = new SLAStatusChangeAuditSearchRequest
    slaStatusChangeAuditSearchRequest.slaItemType = this.slaItemType;
    slaStatusChangeAuditSearchRequest.pagedRequest = pagedRequest;

    this.slaService.getPagedSLAStatusChangeAudits(slaStatusChangeAuditSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<SLAStatusChangeAudit>;
        this.data.page = page;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoaded$.next(true);
        this.loadingSubject.next(false);
      }
    });
  }
}
