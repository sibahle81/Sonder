import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { Transaction } from '../../models/transaction';
import { TransactionsService } from '../../services/transactions.service';

@Injectable({
  providedIn: 'root'
})
export class InterDebtorTransfersCaptureDataSource extends Datasource {
  statusMsg: string;

  transactions: Transaction[] = [];

  constructor(
    appEventsManagerService: AppEventsManager,
    alertService: AlertService,
    private readonly service: TransactionsService
  ) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(debtorNumber: string) {
    this.isLoading = true;
    this.paginator.firstPage();
    this.service
      .getTransactionsForTransfer(debtorNumber)
      .subscribe(data => {
        this.transactions = data;
        this.dataChange.next(this.transactions);
        this.stopLoading();
        this.isLoading = false;
      });
  }

  connect(): Observable<Transaction[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: Transaction) => {
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
