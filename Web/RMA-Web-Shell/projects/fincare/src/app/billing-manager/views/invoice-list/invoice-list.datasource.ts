import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { Invoice } from '../../../shared/models/invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceListDataSource extends PagedDataSource<Invoice> {
  public isLoading: boolean;
  constructor(
    private readonly invoiceService: InvoiceService) {
    super();
  }

  getData(query: any): void {
    this.isLoading = true;

    query.orderBy = query.orderBy ? query.orderBy : 'InvoiceDate';
    query.sortDirection = query.sortDirection ? query.sortDirection : 'asc';

    this.invoiceService.searchDebtorInvoices(query.rolePlayerId, query.statusId, query.searchString, query.pageNumber as number, query.pageSize as number, query.orderBy as string, query.sortDirection as string)
      .subscribe(invoices => {

        this.data = invoices as PagedRequestResult<Invoice>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);

        this.isLoading = false;
      });
  }
}
