import { Injectable } from '@angular/core';
import { AuditLogService } from 'projects/shared-components-lib/src/lib/audit/audit-log.service';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeneralAuditDataSource extends PagedDataSource<AuditResult> {


  serviceType: ServiceTypeEnum;
  clientItemType: ClientItemTypeEnum;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private readonly auditService: AuditLogService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Date', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('date')) {
      orderBy = 'DateCreated';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'DateCreated';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.auditService.getPagedAuditLogs(ServiceTypeEnum[ServiceTypeEnum[this.serviceType]], this.clientItemType, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<AuditResult>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.isLoading$.next(false);
    });
  }
}
