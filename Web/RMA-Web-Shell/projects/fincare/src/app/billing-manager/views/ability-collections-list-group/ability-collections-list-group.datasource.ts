import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { AbilityTransactionsAudit } from '../../models/ability-transaction-audit';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { TransactionsService } from '../../services/transactions.service';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable()
export class AbilityCollectionsListGroupDatasource extends Datasource implements OnDestroy {
    private destroy$ = new Subject<void>();
    filterChange = new BehaviorSubject<string>('');
    dataChange = new BehaviorSubject<AbilityTransactionsAudit[]>([]);
    
    filteredData: AbilityTransactionsAudit[] = [];
    renderedData: AbilityTransactionsAudit[] = [];
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

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.dataChange.complete();
        this.filterChange.complete();
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(reference: string): void {
        if (!reference) {
            this.dataChange.next([]);
            return;
        }
        
        this.startLoading('Loading transaction details...');
        this.getAbilityCollectionsAudits(reference);
    }

    getAbilityCollectionsAudits(reference: string): void {
        this.abilityPostingService.getAbilityPostingAuditByRef(reference)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    const processedData = data.map(line => ({
                        ...line,
                        paymentTypeDesc: line.item,
                        reportingGroup: line.accountDetails || line.bank || 'N/A',
                        dailyTotal: line.amount || 0
                    }));

                    const sortedData = processedData.sort((a, b) => {
                        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
                        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
                        return dateB - dateA;
                    });
                    
                    this.dataChange.next(sortedData);
                    this.filteredData = sortedData;
                    this.stopLoading();
                },
                error: (error) => {
                    this.showError(error);
                    this.dataChange.next([]);
                    this.stopLoading();
                }
            });
    }

    connect(): Observable<AbilityTransactionsAudit[]> {
        if (!this.paginator || !this.sort) {
            throw Error('Please set paginator and sort on the data source before connecting.');
        }

        const displayDataChanges = [
            this.dataChange,
            this.filterChange,
            this.paginator.page,
            this.sort.sortChange
        ];

        return merge(...displayDataChanges).pipe(
            takeUntil(this.destroy$),
            map(() => {
                this.filteredData = this.data.filter((item: AbilityTransactionsAudit) => {
                    const searchStr = (item.itemReference + item.onwerDetails || '').toLowerCase();
                    return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
                });

                const sortedData = this.getSortedData(this.filteredData.slice());

                this.paginator.length = sortedData.length;

                const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
                this.renderedData = sortedData.slice(startIndex, startIndex + this.paginator.pageSize);
                
                return this.renderedData;
            })
        );
    }

    disconnect() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getSortedData(data: AbilityTransactionsAudit[]): AbilityTransactionsAudit[] {
        if (!this.sort.active || this.sort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this.sort.active) {
                case 'TransactionDate':
                    [propertyA, propertyB] = [
                        a.createdDate ? new Date(a.createdDate).getTime() : 0,
                        b.createdDate ? new Date(b.createdDate).getTime() : 0
                    ];
                    break;
                case 'ReportingGroup':
                    [propertyA, propertyB] = [a.reportingGroup || '', b.reportingGroup || ''];
                    break;
                case 'DailyTotal':
                    [propertyA, propertyB] = [a.dailyTotal || 0, b.dailyTotal || 0];
                    break;
                default:
                    return 0;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }

    private getPolicyStatus(item: AbilityTransactionsAudit): string {
        if (item.isDeleted) return 'Deleted';
        if (item.isActive) return 'Active';
        return 'Pending';
    }
}
