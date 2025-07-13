import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { AbilityCollectionsAuditDatasource } from './ability-collections-audit.datasource';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AbilityTransactionsAudit } from '../../models/ability-transaction-audit';


@Component({
    selector: 'app-ability-collections-audit',
    templateUrl: './ability-collections-audit.component.html',
    styleUrls: ['./abililty-collections-audit.css'],
})
export class AbilityCollectionsAuditComponent implements OnInit {
    canExport: number;
    displayedColumns = ['PolicyDetails', 'PaymentType', 'Amount', 'PaymentDate', 'PolicyStatus'];
    id: number;
    amountLabel: string;
    @ViewChild('TABLE', { static: true }) table: ElementRef;
    columns: any[] = [
        { display: 'POLICY DETAILS', variable: 'policyDetails', },
        { display: 'BANK', variable: 'bank', },
        { display: 'PAYMENT TYPE', variable: 'paymentType', },
        { display: 'ACCOUNT DETAILS', variable: 'accountDetails', },
        { display: 'BANK BRANCH', variable: 'bankBranch', },
        { display: 'AMOUNT PAID', variable: 'amount', },
        { display: 'DATE', variable: 'date', },
        { display: 'POLICY STATUS', variable: 'policyStatus' }
    ];
    isSending = false
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;
    reference = '';
    placeHolder = 'Search by Reference or Client Details';
    constructor(public readonly dataSource: AbilityCollectionsAuditDatasource,
        private readonly abilityCollectionsService: AbilityCollectionsService,
        private readonly router: Router,
        private readonly datePipe: DatePipe,
        private readonly activatedRoute: ActivatedRoute,
        private readonly alertService: AlertService,
        private readonly toastr: ToastrManager) {

    }

    ngOnInit() {
        this.id = 0;
        this.amountLabel = 'INVOICE AMOUNT';
        this.dataSource.setControls(this.paginator, this.sort);
         // this.getAbilityPostings();
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                if (isNaN(params.id)) {
                    this.reference = params.id;
                    this.dataSource.getData(this.reference);
                } else {
                    this.id = params.id;
                    this.getAbilityPosting(this.id);
                }
            }
        });
    }

    getAbilityPosting(id: number) {
        this.abilityCollectionsService.getAbilityCollection(id).subscribe(data => {
            // this.dataSource.startLoading('Loading transactions....')

            this.reference = data.reference;
            if (this.reference.startsWith('INV') || this.reference.startsWith('CRI')) {
                this.amountLabel = 'INVOICE AMOUNT';
            } else if (this.reference.startsWith('COL') || this.reference.startsWith('CRP')) {
                this.amountLabel = 'AMOUNT PAID';
            } else {
                this.amountLabel = 'AMOUNT';
            }

            this.dataSource.setControls(this.paginator, this.sort);
            this.dataSource.getData(this.reference);
            // this.dataSource.isLoading = false;

            if (this.dataSource.data != null) {
                this.canExport = 1;
            } else {
                this.canExport = 0;
            }
        })
    }

    getAbilityPostings(): void {
        this.dataSource.filter = '';
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.getData(this.reference);
        this.dataSource.isLoading = false;

        if (this.dataSource.data != null) {
            this.canExport = 1;
        } else {
            this.canExport = 0;
        }
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
        this.paginator.length = this.dataSource.filteredData.length;
        this.dataSource.paginator.firstPage();
    }


    exporttoCSV(): void {
        this.dataSource.data.forEach(element => {
            delete element.id;
            delete element.isDeleted;
            delete element.isActive;
            delete element.modifiedBy;
            delete element.modifiedDate;
        });
        const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, { header: [] });
        const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
        XLSX.writeFile(workBook, this.dataSource.data[0].reference + '_Transactions_Details.xlsx');
        this.toastr.successToastr('Transactions exported successfully', 'Succes');

    }

    clear() {
        this.router.navigate(['fincare/billing-manager/ability-collections-list']);
    }

    trimWord(word: string): string {
        return word.trim();
    }
}

