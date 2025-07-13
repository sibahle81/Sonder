import { Injectable } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { GetRemittanceTransactionsList } from "projects/fincare/src/app/payment-manager/models/get-remittance-transactions-list-model";
import { GetRemittanceTransactionsListParams } from "projects/fincare/src/app/payment-manager/models/get-remittance-transactions-list-params";
import { PaymentService } from "projects/fincare/src/app/payment-manager/services/payment.service";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { Datasource } from "projects/shared-utilities-lib/src/lib/datasource/datasource";
import { BehaviorSubject, Observable, merge } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ClaimRemittancesReportDatasource extends Datasource {
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<GetRemittanceTransactionsList[]> = new BehaviorSubject<GetRemittanceTransactionsList[]>([]);

    filteredData: GetRemittanceTransactionsList[] = [];
    renderedData: GetRemittanceTransactionsList[] = [];
    remittanceTransactionsList: GetRemittanceTransactionsList[];
    paginator: MatPaginator;
    sort: MatSort;

    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly paymentService: PaymentService
    ) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'batchReference';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(parametrsList?: GetRemittanceTransactionsListParams): void {
      this.isLoading$.next(true);
        this.getRemittancesTransactionsList(parametrsList);
    }

    getRemittancesTransactionsList(requestParams) {
        this.remittanceTransactionsList = new Array();
        this.paymentService.GetRemittanceTransactionsList(requestParams).subscribe(
          (result) => {
            if (result) {
              for (let i = 0; i < result.length; i++) {
                  const line = result[i];
                  this.remittanceTransactionsList.push(line);
                  this.dataChange.next(this.remittanceTransactionsList);
              }
              this.isLoading$.next(false);
              this.paginator.length = this.data.length;
              this.stopLoading();
            }
          }, error => {
            this.showError(error);
            this.isLoading$.next(false);
        }
        );
    }

    connect(): Observable<GetRemittanceTransactionsList[]> {
        const displayDataChanges = [
          this.dataChange,
          this.sort.sortChange,
          this.filterChange,
          this.paginator.page
        ];
    
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: GetRemittanceTransactionsList) => {
              const searchStr = (item.batchReference).toLowerCase();
              return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
    
          const sortedData = this.getSortedData(this.filteredData.slice());
    
          const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
          this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
          return this.renderedData;
        }));
    }

    disconnect() { }
}