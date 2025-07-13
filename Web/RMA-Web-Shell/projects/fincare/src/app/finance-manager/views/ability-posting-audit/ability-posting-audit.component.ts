import { AbilityPostingAuditDatasource } from './ability-posting-audit.datasource';
import { Format } from '../../../../../../shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { AbilityPostingService } from '../../services/ability-posting.service';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DatePipe } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';
import { BehaviorSubject } from 'rxjs';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
    selector: 'app-ability-posting-audit',
    templateUrl: './ability-posting-audit.component.html',
    styleUrls: ['./ability-posting-audit.component.css']
})
export class AbilityPostingAuditComponent implements OnInit {
    canExport: number;
    searchText: string;
    displayedColumns = ['PayeeDetails', 'Bank', 'PaymentType', 'AccountDetails', 'BankBranch', 'Amount', 'PaymentDate', 'time', 'Reference'];
    id: number;
    placeHolder = 'Search by Reference or Payee Details';
    public reference: string;
    columns: any[] = [
        { display: 'PAYEE DETAILS', variable: 'payeeDetails', },
        { display: 'BANK', variable: 'bank', },
        { display: 'PAYMENT TYPE', variable: 'paymentType', },
        { display: 'ACCOUNT DETAILS', variable: 'accountDetails', },
        { display: 'BANK BRANCH', variable: 'bankBranch', },
        { display: 'AMOUNT PAID', variable: 'amount', }, { display: 'DATE', variable: 'date', },
        { display: 'TIME', variable: 'time', },
        { display: 'REFERENCE', variable: 'reference', }
    ];
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;

    showReport = false;
    isDownloading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    ssrsBaseUrl: string;
    reportServerAudit: string;
    reportUrlAudit: string;
    showParametersAudit: string;
    parametersAudit: any;
    languageAudit: string;
    widthAudit: number;
    heightAudit: number;
    toolbarAudit: string;
    formatAudit: string;
    isDownload = 'true';
    errors: string[] = []

    reportFormats: string[] = ['PDF', 'EXCEL', 'CSV'];
    selectedreportFormat: string;
    selectedReportFormat: string;
    
    constructor(public readonly dataSource: AbilityPostingAuditDatasource,
                private readonly abilityPostingService: AbilityPostingService,
                private readonly router: Router,
                private readonly datePipe: DatePipe,
                private readonly activatedRoute: ActivatedRoute,
                private readonly alertService: AlertService,
                private readonly lookupService: LookupService,
                private readonly toastr: ToastrManager,) {

    }

    ngOnInit() {
        this.id = 0;
        this.dataSource.setControls(this.paginator, this.sort);
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.reference) {
                this.reference = params.reference;
            }
        });
        if (this.reference) {
            this.dataSource.setControls(this.paginator, this.sort);
            this.dataSource.getData(this.reference);

            if (this.dataSource.data != null) {
                this.canExport = 1;
            } else {
                this.canExport = 0;
            }
        }
        this.setssrsBaseUrl();
    }

    getAbilityPosting(id: number) {
        this.abilityPostingService.getAbilityPosting(id).subscribe(data => {
            this.reference = data.reference;
            this.dataSource.setControls(this.paginator, this.sort);
            this.dataSource.getData(this.reference);

            if (this.dataSource.data != null) {
                this.canExport = 1;
            } else {
                this.canExport = 0;
            }
        });
    }

    done(statusMesssage: string) {
        this.alertService.success(statusMesssage, 'Success', true);
        this.dataSource.isLoading = true;
        this.dataSource.getData(this.reference);
    }

    searchData(searchFilter) {
        this.applyFilter(searchFilter);
    }

    applyFilter(filterValue: any) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
        this.paginator.length = this.dataSource.filteredData.length;
        this.dataSource.paginator.firstPage();
    }

      clearInput() {
        this.searchText = '';
        this.applyFilter(this.searchText);
    }

    clear() {
        this.router.navigate(['fincare/finance-manager/ability-posting-list']);
    }

    setssrsBaseUrl() {
      this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
        (value: any) => {
          this.ssrsBaseUrl = value;
        },
        (error) => {
          this.toastr.errorToastr(error.message);
        }
      );
    }

    reportFormatChange(event: MatRadioChange) {
        this.selectedReportFormat = event.value;
    }
  
    downloadReport(): void {
        this.selectedreportFormat = this.selectedReportFormat;
      this.errors = [];
      this.isDownloading$.next(true);
  
      this.parametersAudit = {
        reference: this.reference
      }
  
      this.reportServerAudit = this.ssrsBaseUrl;
      this.reportUrlAudit = 'RMA.Reports.FinCare/RMAAbilityPostingAuditTransactionList';
      this.showParametersAudit = 'true';
      this.languageAudit = 'en-us';
      this.widthAudit = 10;
      this.heightAudit = 10;
      this.toolbarAudit = 'false';
      this.showReport = false;
      this.isDownloading$.next(false);
    }

}
