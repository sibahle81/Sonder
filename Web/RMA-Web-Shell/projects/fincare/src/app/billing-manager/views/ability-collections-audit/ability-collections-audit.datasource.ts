import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject,merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { AbilityTransactionsAudit } from '../../models/ability-transaction-audit';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { TransactionsService } from '../../services/transactions.service';
import { Injectable } from '@angular/core';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Injectable()
export class AbilityCollectionsAuditDatasource extends Datasource {
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<AbilityTransactionsAudit[]> = new BehaviorSubject<AbilityTransactionsAudit[]>([]);
    rolePlayerBankingDetails: RolePlayerBankingDetail[];
    rolePlayerBankingDetail: RolePlayerBankingDetail;
    filteredData: AbilityTransactionsAudit[] = [];
    renderedData: AbilityTransactionsAudit[] = [];
    postedPayments: AbilityTransactionsAudit[];
    paginator: MatPaginator;
    sort: MatSort;

    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): AbilityTransactionsAudit[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }
    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly invoiceService: InvoiceService,
        private readonly rolePlayerService: RolePlayerService,
        private readonly policyService: PolicyService,
        private readonly transactionsService: TransactionsService,
        private readonly abilityPostingService: AbilityCollectionsService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'product';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(reference: string): void {
        this.startLoading('Loading transaction details...');
        this.getAbilityCollectionsAudits(reference);
    }

    getAbilityCollectionsAudits(reference: string): void {
        this.postedPayments = new Array();
        this.abilityPostingService.getAbilityPostingAuditByRef(reference).subscribe(
            data => {
                let counter = data.length;
                for (let i = 0; i < counter; i++) {
                    let line = data[i];
                    line.paymentTypeDesc = line.item;
                    this.postedPayments.push(line);
                    this.dataChange.next(this.postedPayments);
                }
                this.isLoading = false;
                this.stopLoading();
            },
            error => {
                this.showError(error);
                this.isLoading = false;
            }
        );
    }

    getBanking(rolePlayerId:number){
        this.rolePlayerService.getBankingDetailsByRolePlayerId(rolePlayerId).subscribe(results => {
          const mostRecentDate = new Date(Math.max.apply(null, results.map(e => {
            return new Date(e.effectiveDate);
          })));
          this.rolePlayerBankingDetail = results.filter(e => { const d = new Date(e.effectiveDate); return d.getTime() === mostRecentDate.getTime(); })[0];
        })
      }


    connect(): Observable<AbilityTransactionsAudit[]> {
        const displayDataChanges = [
            this.dataChange,
            // this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: AbilityTransactionsAudit) => {
                const searchStr = (item.itemReference).toLowerCase() + (item.onwerDetails).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }


    disconnect() { }
    /** Returns a sorted copy of the database data. */
    getSortedData(data: AbilityTransactionsAudit[]): AbilityTransactionsAudit[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this.sort.active) {
                case 'product': [propertyA, propertyB] = [a.accountDetails, b.accountDetails]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}
