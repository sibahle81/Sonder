import { EventEmitter, Injectable, Output } from '@angular/core';
import { Invoice } from 'projects/fincare/src/app/shared/models/invoice';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerInvoiceSearchDataSource extends PagedDataSource<Invoice> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  rolePlayerId: number;
  invoiceStatusFilter: InvoiceStatusEnum;

  constructor(
    private readonly invoiceService: InvoiceService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.isLoading$.next(true)
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'modifiedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    const invoiceStatusId = this.invoiceStatusFilter ? +this.invoiceStatusFilter : 0;

    this.invoiceService.searchRolePlayerInvoices(this.rolePlayerId, invoiceStatusId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Invoice>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.isLoading$.next(false);
    });
  }
}
