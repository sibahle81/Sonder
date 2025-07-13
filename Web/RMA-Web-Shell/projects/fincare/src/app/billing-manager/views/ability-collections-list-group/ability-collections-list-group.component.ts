import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { AbilityCollectionsListGroupDatasource } from './ability-collections-list-group.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AbilityTransactionsAudit } from '../../models/ability-transaction-audit';
import { AbilityCollections } from 'projects/fincare/src/app/billing-manager/models/ability-collections';
import { AbilityCollectionPostingRequest } from '../../models/ability-collections-posting-request';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-ability-collections-list-group',
    templateUrl: './ability-collections-list-group.component.html',
    styleUrls: ['./abililty-collections-list-group.css'],
})
export class AbilityCollectionsListGroupComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    canExport: number;
    displayedColumns = ['TransactionDate', 'ReportingGroup', 'DailyTotal', 'Actions'];
    id: number;
    amountLabel: string;
    @ViewChild('TABLE', { static: true }) table: ElementRef;
    abilityCollections: AbilityCollections;
    selectedCollectionIds = [];
    selectedCollections = [];
    columns: any[] = [
        { display: 'TRANSACTION DATE', variable: 'TransactionDate' },
        { display: 'REPORTING GROUP', variable: 'ReportingGroup' },
        { display: 'DAILY TOTAL', variable: 'DailyTotal' }
    ];
    isSending = false
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;
    reference = '';
    placeHolder = 'Search by Reference or Client Details';
    constructor(public readonly dataSource: AbilityCollectionsListGroupDatasource,
        private readonly abilityCollectionsService: AbilityCollectionsService,
        private readonly router: Router,
        private readonly datePipe: DatePipe,
        private readonly activatedRoute: ActivatedRoute,
        private readonly alertService: AlertService,
        private readonly toastr: ToastrManager) {

    }

    ngOnInit() {
        this.dataSource.setControls(this.paginator, this.sort);
        this.activatedRoute.params
            .pipe(takeUntil(this.destroy$))
            .subscribe((params: any) => {
                if (params.id) {
                    this.id = params.id;
                    this.getAbilityPosting(this.id);
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getAbilityPosting(id: number) {
        this.abilityCollectionsService.getAbilityCollection(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.reference = data.reference;
                if (this.reference.startsWith('INV') || this.reference.startsWith('CRI')) {
                    this.amountLabel = 'INVOICE AMOUNT';
                } else if (this.reference.startsWith('COL') || this.reference.startsWith('CRP')) {
                    this.amountLabel = 'AMOUNT PAID';
                } else {
                    this.amountLabel = 'AMOUNT';
                }

                this.dataSource.getData(this.reference);
                this.canExport = this.dataSource.data != null ? 1 : 0;
            });
    }

    done(statusMesssage: string) {
        this.toastr.successToastr(statusMesssage, 'Succes');
        this.dataSource.isLoading = true;
        this.dataSource.getData(this.reference);
    }

    searchData(data) {
        this.applyFilter(data);
    }

    applyFilter(filterValue: any) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    exporttoCSV(): void {
        if (!this.dataSource.data.length) {
            this.toastr.warningToastr('No data to export', 'Warning');
            return;
        }

        const exportData = this.dataSource.data.map(item => {
            const { id, isDeleted, isActive, modifiedBy, modifiedDate, ...rest } = item;
            return rest;
        });

        const workSheet = XLSX.utils.json_to_sheet(exportData, { header: [] });
        const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
        XLSX.writeFile(workBook, `${this.reference}_Transactions_Details.xlsx`);
        this.toastr.successToastr('Transactions exported successfully', 'Success');
    }

    clear() {
        this.router.navigate(['fincare/billing-manager/ability-collections-list']);
    }

    trimWord(word: string): string {
        return word?.trim() || '';
    }

    onViewDetails(row: AbilityTransactionsAudit): void {
        if (row?.reference) {
            this.router.navigate(['fincare/billing-manager/posted-collections-list/', row.reference]);
        }
    }

    collectionAllChecked(event: any) {
        if (event.checked) {
            this.selectedCollectionIds = this.dataSource.data
                .filter(item => !this.shouldDisableSelect(item))
                .map(item => item.id);
            this.selectedCollections = this.dataSource.data
                .filter(item => !this.shouldDisableSelect(item));
        } else {
            this.selectedCollectionIds = [];
            this.selectedCollections = [];
        }
    }

    collectionTransactionChecked(event: any, item: AbilityTransactionsAudit) {
        if (event.checked) {
            this.selectedCollectionIds.push(item.id);
            this.selectedCollections.push(item);
        } else {
            const idIndex = this.selectedCollectionIds.indexOf(item.id);
            if (idIndex > -1) {
                this.selectedCollectionIds.splice(idIndex, 1);
            }
            const itemIndex = this.selectedCollections.findIndex(c => c.id === item.id);
            if (itemIndex > -1) {
                this.selectedCollections.splice(itemIndex, 1);
            }
        }
    }

    shouldDisableSelect(row: AbilityTransactionsAudit): boolean {
        return row.isProcessed || row.isDeleted || !row.isActive;
    }

    postCollectionSummariesToAbility() {
        if (!this.selectedCollectionIds.length) {
            this.toastr.warningToastr('Please select collections to post', 'Warning');
            return;
        }

        this.isSending = true;
        const request = new AbilityCollectionPostingRequest();
        request.collectionIds = [...this.selectedCollectionIds];
        
        this.abilityCollectionsService.postCollectionSummaryToAbility(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.done('Posting To Ability Successful');
                    this.isSending = false;
                    this.selectedCollectionIds = [];
                    this.selectedCollections = [];
                },
                error: (error) => {
                    this.toastr.errorToastr('Failed to post collections', 'Error');
                    this.isSending = false;
                }
            });
    }
}

