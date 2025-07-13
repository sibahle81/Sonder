import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { TransactionSearchDataSource } from './transaction-search.datasource';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { PreDefinedDateFilterEnum } from '../../report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { BehaviorSubject } from 'rxjs';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
    selector: 'transaction-search',
    templateUrl: './transaction-search.component.html',
    styleUrls: ['./transaction-search.component.css']
})

export class TransactionSearchComponent extends UnSubscribe implements OnInit, OnChanges {
    @Input() title = 'Search Transactions';
    @Input() allowMultiple = false; // optional will default to single select
    @Input() rolePlayer: RolePlayer = null; // optional will limit results in the context of this roleplayer

    @Input() triggerReset: boolean; // optional to trigger a reset of the component from external
    @Input() isReadOnly = false; // optional defaults to false, if set to true the component will be readonly

    @Output() transactionsSelectedEmit: EventEmitter<Transaction[]> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    hideRolePlayerSearch: BehaviorSubject<boolean> = new BehaviorSubject(false);
    advancedFiltersExpanded: boolean = false;

    selectedTransactions: Transaction[];
    dataSource: TransactionSearchDataSource;
    form: any;
    searchTerm = '';

    defaultDateRange = PreDefinedDateFilterEnum.Last30Days;

    selectedTransactionType: TransactionTypeEnum;
    selectedStartDate: Date;
    selectedEndDate: Date;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly transactionService: TransactionsService
    ) {
        super();
        this.dataSource = new TransactionSearchDataSource(this.transactionService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.rolePlayer) {
            this.hideRolePlayerSearch.next(true);
        } else {
            this.hideRolePlayerSearch.next(false);
        }

        this.reset();
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });

        this.getData();
    }

    configureSearch() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.paginator.pageIndex = 0;
        this.searchTerm = searchTerm;
        !this.searchTerm || this.searchTerm === '' ? this.getData() : this.searchTerm?.length >= 3 ? this.getData() : null;
    }

    getData() {
        this.dataSource.rolePlayerId = this.rolePlayer?.rolePlayerId;
        this.dataSource.transactionType = this.selectedTransactionType;
        this.dataSource.startDate = this.selectedStartDate;
        this.dataSource.endDate = this.selectedEndDate;

        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    transactionSelected(transaction: Transaction) {
        if (!this.selectedTransactions) { this.selectedTransactions = []; }

        if (this.allowMultiple) {
            let index = this.selectedTransactions.findIndex(a => a.transactionId === transaction.transactionId);
            if (index > -1) {
                this.selectedTransactions.splice(index, 1);
            } else {
                this.selectedTransactions.push(transaction);
            }
        } else {
            if (this.selectedTransactions.length > 0) {
                this.selectedTransactions[0] = transaction;
            } else {
                this.selectedTransactions.push(transaction);
            }
        }

        this.transactionsSelectedEmit.emit(this.selectedTransactions);
    }

    isSelected($event: Transaction): boolean {
        return !this.selectedTransactions ? false : this.selectedTransactions.some(s => s.transactionId == $event.transactionId)
    }

    reset() {
        this.triggerReset = !this.triggerReset;

        if (!this.form) { return; }

        this.searchTerm = '';

        this.form.patchValue({
            searchTerm: this.searchTerm
        });

        this.selectedTransactionType = null;

        this.selectedTransactions = [];
        this.transactionsSelectedEmit.emit(this.selectedTransactions);

        if (this.dataSource.data && this.dataSource.data.data) {
            this.dataSource.data.data = null;
        }

        this.getData();
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'bankReference', show: true },
            { def: 'amount', show: true },
            { def: 'transactionDate', show: true },

            { def: 'selectSingle', show: !this.allowMultiple && !this.isReadOnly },
            { def: 'selectMultiple', show: this.allowMultiple && !this.isReadOnly }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    setTransactionType($event: any[]) {
        this.selectedTransactionType = $event[0].value;

        this.getData();
    }

    setDateRange($event: any[]) {
        this.selectedStartDate = $event.find(s => s.key == 'StartDate').value;
        this.selectedEndDate = $event.find(s => s.key == 'EndDate').value;

        this.getData();
    }

    setDebtor($event: RolePlayer) {
        if ($event) {
            this.rolePlayer = $event;
            this.advancedFiltersExpanded = false;
        } else {
            this.rolePlayer = null;
            this.advancedFiltersExpanded = true;
        }

        this.getData();
    }
}
