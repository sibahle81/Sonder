import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { BankAccount } from '../../shared/Entities/bank-account';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BankAccountService } from '../../shared/services/bank-account.service';
import { map } from 'rxjs/operators';

@Injectable()
export class BankAccountApprovalListDataSource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly service: BankAccountService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.startLoading('Loading bank accounts for approval...');

        this.service.getBankAccountsPendingApproval().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            });
    }

    connect(): Observable<BankAccount[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: BankAccount) => {
                const searchStr = '';
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
