import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AbilityPostingAudit } from 'projects/fincare/src/app/finance-manager/models/ability-posting-audit.model';
import { ProductCrossRefTranType } from 'projects/fincare/src/app/finance-manager/models/productCrossRefTranType.model';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { AbilityPosting } from 'projects/fincare/src/app/finance-manager/models/ability-posting.model';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { AbilityPostingService } from 'projects/fincare/src/app/finance-manager/services/ability-posting.service';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AbilityPostingDatasource } from './ability-posting-list.datasource';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { UntypedFormBuilder } from '@angular/forms';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatRadioChange } from '@angular/material/radio';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-ability-posting-list',
  templateUrl: './ability-posting-list.component.html',
  styleUrls: ['./ability-posting-list.component.css']
})

export class AbilityPostingListComponent extends BaseSearchComponent implements OnInit, OnDestroy {
  searchText: string;
  allPayments: Payment[];
  claimsPayment: Payment[];
  commissionsPayment: Payment[];
  refundsPayment: Payment[];

  abilityPosting: AbilityPosting;
  ProductCrossRefTranTypes: ProductCrossRefTranType[];
  abilityPostingAudit: AbilityPostingAudit;
  abilityPostingAudits: AbilityPostingAudit[];
  placeHolder = 'Search by Reference, IS Chart No or BS Chart No';


  columns: any[] = [
    { display: 'REFERENCE', def: 'reference', show: true },
    { display: 'Transaction Date', def: 'createdDate', show: true },
    { display: 'NO. OF TRANSACTIONS', def: 'lineCount', show: true },
    { display: 'COMPANY', def: 'companyNo', show: true },
    { display: 'BRANCH', def: 'branchNo', show: true },
    { display: 'PRODUCT', def: 'level1', show: true },
    { display: 'COST CENTRE', def: 'level2', show: true },
    { display: 'IS CHART NO', def: 'chartISNo', show: true },
    { display: 'IS CHART NAME', def: 'ChartISName', show: true },
    { display: 'BS CHART NO', def: 'chartBSNo', show: true },
    { display: 'BS CHART NAME', def: 'ChartBSName', show: true },
    { display: 'PROCESSED', def: 'processed', show: true },
    { display: 'DAILY TOTAL', def: 'dailyTotal', show: true },
    { display: 'Action', def: 'Actions', show: true },
  ];

  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild('filter', { static: false }) filter: ElementRef;
  private postSubscribe: Subscription;
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

  constructor(
    formBuilder: UntypedFormBuilder,
    public readonly dataSource: AbilityPostingDatasource,
    private readonly abilityPostingService: AbilityPostingService,
    public readonly router: Router,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService,
  ) {
    super(dataSource, formBuilder, router,
      '',
      []);
  }

  ngOnInit() {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.ngOnInit();
    this.getAbilityPostings();
    this.getExtraPostings();
    this.setssrsBaseUrl();
  }

  public ngOnDestroy(): void {
    if (this.postSubscribe) {
      this.postSubscribe.unsubscribe();
    }
  }

  getDisplayedColumns(): any[] {
    return this.columns
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
  getAbilityPostings(): void {
    this.router.navigate(['fincare/finance-manager/']);

    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData();
  }

  getExtraPostings(): void {
    this.router.navigate(['fincare/finance-manager/ability-posting-list']);
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData();
  }

  done(statusMesssage: string) {
    this.dataSource.getData();
  }

  searchData(data) {
    this.applyFilter(data);
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

  post() {
    // This task will be executed by scheduler task.
    this.dataSource.startLoading('Posting to Ability...');
    this.postSubscribe = this.abilityPostingService.postToAbility().subscribe(() => {
    }, (error) => {
      this.toastr.errorToastr('Posting To Ability Unsuccessful', 'Unsuccessfully Posted');
      this.dataSource.stopLoading();
    }, () => { // complete
      this.toastr.successToastr('Posting To Ability Successful', 'Successfully Posted');
      this.dataSource.isEnabled = false;
      this.dataSource.getData();
      this.dataSource.stopLoading();
    });
  }

  clear() {
    this.router.navigate(['fincare/finance-manager/']);
  }

  onViewDetails(abilityPosting: AbilityPosting): void {
    this.router.navigate(['fincare/finance-manager/posted-payment-list/', abilityPosting.reference]);
  }

  hasPermissionPostToAbility(): boolean {
    return userUtility.hasPermission('Post To Ability');
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
    if(this.selectedReportFormat === 'PDF'){
      this.downloadPDF();
    }else if(this.selectedReportFormat === 'EXCEL'){
      this.downloadExcel();
    }
  }

  downloadPDF() {
    this.isDownloading$.next(true);
    const doc = new jsPDF('landscape');
    const col = this.getDisplayedColumns();
    const rows = [];
    this.dataSource.data.forEach(element => {
      const temp = [element.reference, element.createdDate, element.lineCount, element.companyNo, element.branchNo,
        element.level1, element.level2, element.level3, element.chartISNo, element.ChartISName, element.chartBSNo,element.ChartBSName,
        element.processed, element.dailyTotal];
      rows.push(temp);
    });
    (doc as any).autoTable(col, rows);
    doc.save('AbilityPostings.pdf');
    this.isDownloading$.next(false);
  }

  downloadExcel(){
    this.isDownloading$.next(true);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'AbilityPostings');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
    this.isDownloading$.next(false);
  }
}
