import { Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvoiceService } from '../../shared/services/invoice.service';
import { InvoicePaymentAllocation } from '../models/invoicePaymentAllocation';

@Injectable({
  providedIn: 'root'
})

export class InvoiceDatasource extends Datasource {
    isLoading = false;

    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly invoiceService: InvoiceService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'invoiceDate';
    }

  getData(rolePlayerId: number): void {
        this.isLoading = true;
        this.invoiceService.getUnpaidInvoicesByRolePlayer(rolePlayerId, false).subscribe(invoices => {
                this.paginator.length = invoices.length;
                this.paginator.firstPage();
                this.dataChange.next(invoices);
                this.isLoading = false;
        });
    }

    connect(): Observable<InvoicePaymentAllocation[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(
            map(() => {
              this.filteredData = this.data.slice().filter((item: InvoicePaymentAllocation) => {
                const searchStr = '';
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
              });

              const sortedData = this.getSortedData(this.filteredData.slice());

              const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
              this.renderedData = sortedData.splice(
                startIndex,
                this.paginator.pageSize
              );
              return this.renderedData;
            })
          );
    }
}
