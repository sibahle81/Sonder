import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { PagedDataSource } from 'src/app/shared-utilities/datasource/pagedDataSource';
import { ClientItemTypeEnum } from 'src/app/shared/enums/client-item-type-enum';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditResult } from '../../audit/audit-models';
import { ServiceType } from 'src/app/shared/enums/service-type.enum';

@Injectable({
  providedIn: 'root'
})
export class GeneralAuditDataSource extends PagedDataSource<AuditResult> {


  serviceType: ServiceType;
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

    this.auditService.getPagedAuditLogs(ServiceType[ServiceType[this.serviceType]], this.clientItemType, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
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
