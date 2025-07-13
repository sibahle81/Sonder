import { Injectable } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { GetRemittanceTransactionsListDetails } from "projects/fincare/src/app/payment-manager/models/get-remittance-transactions-list-details-model";
import { PaymentService } from "projects/fincare/src/app/payment-manager/services/payment.service";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { Datasource } from "projects/shared-utilities-lib/src/lib/datasource/datasource";
import { BehaviorSubject, Observable, merge } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ClaimRemittancesTransactionsReportDatasource extends Datasource {
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<GetRemittanceTransactionsListDetails[]> = new BehaviorSubject<GetRemittanceTransactionsListDetails[]>([]);

    filteredData: GetRemittanceTransactionsListDetails[] = [];
    renderedData: GetRemittanceTransactionsListDetails[] = [];
    remittedTransactions: GetRemittanceTransactionsListDetails[];
    paginator: MatPaginator;
    sort: MatSort;
    canExport = false;

    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly paymentService: PaymentService
    ) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'payee';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(batchReference: string): void {
        this.startLoading('Loading transaction details...');
        this.getRemittancesTransactionsListDetails(batchReference);
    }

    getRemittancesTransactionsListDetails(batchReference) {
        this.remittedTransactions = new Array();
        this.paymentService.GetRemittanceTransactionsListDetails(batchReference).subscribe(
            result => {
                for (let i = 0; i < result.length; i++) {
                    const line = result[i];
                    this.remittedTransactions.push(line);
                    this.dataChange.next(this.remittedTransactions);
                }
                this.isLoading = false;
                this.paginator.length = this.data.length;
                this.stopLoading();
                this.canExport = (this.data.length > 0);
            }, error => {
                this.showError(error);
                this.isLoading = false;
            }
        );
    }

    connect(): Observable<GetRemittanceTransactionsListDetails[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: GetRemittanceTransactionsListDetails) => {
                const searchStr = (item.batchReference).toLowerCase() + (item.reference).toLowerCase() + (item.payee).toString().toLowerCase();
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