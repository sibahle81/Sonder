import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { CommissionWithholdingBalanceDatasource } from '../../datasources/commission-withholding-balance.datasource';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { BrokerageService } from '../../services/brokerage.service';
import { CommissionWithholdingSummary } from '../../models/commission-withholding-summary';
import { Brokerage } from '../../models/brokerage';

@Component({
    templateUrl: './commission-withholding-balance.component.html',
    selector: 'commission-withholding-balance'
})
export class CommissionWithholdingBalanceComponent extends ListFilteredComponent implements OnInit {

    form: UntypedFormGroup;
    brokerage: number;
    brokerages: Brokerage[];
    loadingMessage: string;
    loadingLookups: boolean;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    get isLoading(): boolean { return this.commissionWithholdingBalanceDatasource.isLoading; }
    get isError(): boolean { return this.commissionWithholdingBalanceDatasource.isError; }

    constructor(private readonly commissionWithholdingBalanceDatasource: CommissionWithholdingBalanceDatasource,
                router: Router,
                private readonly brokerageService: BrokerageService) {
        super(router,
            commissionWithholdingBalanceDatasource,
            '',
            'Commission Retention Balance',
            'Commision Retention Balnces');
        this.createForm();
        this.showActionsLink = false;
    }

    ngOnInit() {
        this.loadingMessage = 'Loading brokerages...';
        this.loadingLookups = true;
        this.getBrokerages();
        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'policyNumber', header: 'Policy', cell: (row: CommissionWithholdingSummary) => row.policyNumber },
            { columnDefinition: 'broker', header: 'Broker', cell: (row: CommissionWithholdingSummary) => row.brokerName },
            { columnDefinition: 'client', header: 'Client', cell: (row: CommissionWithholdingSummary) => row.clientName },
            { columnDefinition: 'withholdingBalance', header: 'Retained Balance', cell: (row: CommissionWithholdingSummary) => `R ${row.withholdingBalance.toFixed(2)}` }
        ];
    }

    createForm(): void {
        this.form = new UntypedFormGroup({
            brokerages: new UntypedFormControl(''),
            search: new UntypedFormControl('')
        });
    }
    search(): void {
        this.commissionWithholdingBalanceDatasource.getData(this.brokerage);
    }

    getBrokerages(): void {
        this.brokerageService.getBrokerages().subscribe(brokerages => {
            this.stopLoading();
            this.brokerages = brokerages;
        }, () => {
            this.stopLoading();
        });
    }

    private stopLoading(): void {
        this.commissionWithholdingBalanceDatasource.isLoading = false;
        this.loadingLookups = false;
        this.loadingMessage = '';
    }

    download() {
        const data = this.commissionWithholdingBalanceDatasource.data;
        const fileName = 'commission_retention_balance_' + new Date() + '.csv';
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

    private getHeaderRow(): string {
        let row = ', POLICY, CLIENT, BROKER, RETAINED BALANCE';
        row += '\r\n';
        return row;
    }

    private transformRow(vommissionDetails: CommissionWithholdingSummary): string {
        let row = `${vommissionDetails.policyNumber},${vommissionDetails.clientName},${vommissionDetails.brokerName},${vommissionDetails.withholdingBalance}`;
        row += '\r\n';
        return row;
    }

    clear() {
        this.filter.nativeElement.value = '';
        this.brokerage = 0;
        this.commissionWithholdingBalanceDatasource.clearData();
    }
}
