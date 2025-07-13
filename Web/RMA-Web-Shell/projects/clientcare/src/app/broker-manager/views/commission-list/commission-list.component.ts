import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommissionListDataSource } from '../../datasources/commission-list.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { Brokerage } from '../../models/brokerage';
import { CommissionPeriod } from '../../models/commission-period';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BrokerageService } from '../../services/brokerage.service';
import { CommissionDetail } from '../../models/commission-detail';
import { CommissionListSearch } from '../../models/commission-list-search';
import { BrokerPolicyService } from '../../services/broker-policy.service';

@Component({
    templateUrl: './commission-list.component.html',
    selector: 'commission-list'
})
export class CommissionListComponent extends ListComponent implements OnInit {

    form: UntypedFormGroup;
    brokerages: Brokerage[];
    periods: CommissionPeriod[];
    currentQuery: string;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    get isLoading(): boolean { return this.commissionListDatasource.isLoading || this.loadingLookups; }
    get isError(): boolean { return this.commissionListDatasource.isError; }
    get canSearch(): boolean { return (!this.period || this.period.length === 0) || this.brokerage === 0; }

    period: string;
    brokerage: number;
    loadingMessage: string;
    loadingLookups: boolean;

    constructor(private readonly commissionListDatasource: CommissionListDataSource,
                router: Router,
                alertService: AlertService,
                private readonly brokerageService: BrokerageService,
                private readonly commissionListService: BrokerPolicyService) {
        super(alertService, router, commissionListDatasource, '', 'Commission View', 'Commissions', '', true, true, true);
        this.createForm();
    }

    ngOnInit(): void {
        this.loadingLookups = true;
        this.loadingMessage = 'Loading brokerages...';
        this.getBrokerages();
        this.loadingLookups = true;
        this.loadingMessage = 'Loading commission periods...';
        this.getCommissionPeriods();
        this.dataSource.setControls(this.paginator, this.sort);
        super.ngOnInit();
    }

    createForm(): void {
        this.form = new UntypedFormGroup({
            brokerages: new UntypedFormControl(''),
            periods: new UntypedFormControl(''),
            search: new UntypedFormControl('')
        });
    }

    setupDisplayColumns(): void {
        const datePipe = new DatePipe('en-US');
        this.columns = [
            { columnDefinition: 'policyNumber', header: 'POLICY', cell: (row: CommissionDetail) => row.policyNumber },
            { columnDefinition: 'client', header: 'CLIENT', cell: (row: CommissionDetail) => row.clientName },
            { columnDefinition: 'broker', header: 'BROKER', cell: (row: CommissionDetail) => row.brokerName },
            { columnDefinition: 'joinDate', header: 'JOIN DATE', cell: (row: CommissionDetail) => datePipe.transform(row.joinDate, 'yyyy-MM-dd') },
            { columnDefinition: 'paidForMonth', header: 'PAID FOR MONTH', cell: (row: CommissionDetail) => row.paidForMonth },
            { columnDefinition: 'premium', header: 'PREMIUM', cell: (row: CommissionDetail) => `R ${row.premium.toFixed(2)}` },
            { columnDefinition: 'commissionPercentage', header: 'COMMISSION %', cell: (row: CommissionDetail) => `${row.commissionPercentage.toFixed(2)}%` },
            { columnDefinition: 'commissionAmount', header: 'COMMISSION', cell: (row: CommissionDetail) => `R ${row.commissionAmount.toFixed(2)}` },
            { columnDefinition: 'retentionPercentage', header: 'RETAINED %', cell: (row: CommissionDetail) => `${row.retentionPercentage.toFixed(2)}%` },
            { columnDefinition: 'retentionAmount', header: 'RETAINED AMOUNT', cell: (row: CommissionDetail) => `R ${row.retentionAmount.toFixed(2)}` },
            { columnDefinition: 'clawback', header: 'CLAWBACK', cell: (row: CommissionDetail) => `R ${row.clawback.toFixed(2)}` }
        ];
    }

    getBrokerages(): void {
        this.brokerageService.getBrokerages().subscribe(brokerages => {
            this.stopLoading();
            this.brokerages = brokerages;
        }, () => {
            this.stopLoading();
        });
    }

    getCommissionPeriods(): void {
        this.commissionListService.getCommissionPeriods().subscribe(periods => {
            this.periods = periods;
            this.stopLoading();
        }, () => {
            this.stopLoading();
        });
    }


    onSelect(item: CommissionDetail): void {

    }

    search(): void {
        this.loadingMessage = 'Searching...';
        const search = new CommissionListSearch();
        search.period = this.period;
        search.brokerageId = this.brokerage;
        this.commissionListDatasource.getData(search);
    }

    download() {
        const data = this.commissionListDatasource.data;
        const fileName = 'commission_' + this.period + '.csv';
        const csvData = data.map(row => this.transformRow(row));
        csvData.unshift(this.getHeaderRow());
        const blob = new Blob([csvData as unknown as BlobPart], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
    }

    clear(): void {
        this.brokerage = 0;
        this.period = '';
        this.commissionListDatasource.clearData();
    }

    private getHeaderRow(): string {
        let row = ', POLICY NUMBER, CLIENT, BROKER, JOIN DATE, PAID FOR MONTH, PREMIUM, COMMISSION %, COMMISSION, RETAINED %, RETAINED AMOUNT, CLAWBACK';
        row += '\r\n';
        return row;
    }

    private transformRow(vommissionDetails: CommissionDetail): string {
        let row = `${vommissionDetails.policyNumber},${vommissionDetails.clientName},${vommissionDetails.brokerName},${vommissionDetails.joinDate},${vommissionDetails.paidForMonth},${vommissionDetails.premium},${vommissionDetails.commissionPercentage},${vommissionDetails.commissionAmount},${vommissionDetails.retentionPercentage},${vommissionDetails.retentionAmount},${vommissionDetails.clawback}`;
        row += '\r\n';
        return row;
    }

    private stopLoading(): void {
        this.commissionListDatasource.isLoading = false;
        this.loadingLookups = false;
        this.loadingMessage = '';
    }
}
