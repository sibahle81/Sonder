import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { InvoiceSearchResult } from '../../../shared/models/invoice-search-result';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';

@Component({
  selector: 'app-transactional-statement',
  templateUrl: './transactional-statement.component.html',
  styleUrls: ['./transactional-statement.component.css'],
  providers: [{ provide: DateAdapter, useClass: MatDatePickerDateFormat }, { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }]
})
export class TransactionalStatementComponent implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingInceptionDate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  showReport = false;
  reportTitle: string;

  invoiceId: number;
  policyId: number;
  showStatement = false;
  filterStatement = false;
  isGenerate = false;
  invoiceSearchResult: InvoiceSearchResult;
  recipientEmail: string;
  displayName: string;
  policyNumber: string;
  ownerEmail = new UntypedFormControl('');
  searchForm: UntypedFormGroup;
  policy: Policy;

  years: any[];
  year = 0;
  months: any[];
  month = 0;
  start: any;
  end: any;
  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  startDate: Date;

  minDate: Date;
  maxDate: Date;

  formatAudit = 'PDF';
  endDate: Date;
  exportTypeName = 'CSV';
  isExport = false;
  auditResult: AuditResult;
  auditResults: AuditResult[];

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    public datePipe: DatePipe,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager,
    private readonly policyService: PolicyService) {
  }

  ngOnInit(): void {
    this.createForm('');
    this.ownerEmail = new UntypedFormControl('');
    this.showStatement = false;
    this.filterStatement = false;
    this.isGenerate = false;
    this.isLoading$.next(false);
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    });
    this.getYears();
    this.getMonth();
  }

  createForm(id: any) {
    this.searchForm = this.formBuilder.group({
      id: id as number,
      startDt: new UntypedFormControl(''),
      endDt: new UntypedFormControl('', [this.checkEndDate.bind(this)])
    });
  }

  checkEndDate(control: UntypedFormControl): { [s: string]: boolean } {
    if (this.start < this.end) {
      return { endDateValidate: true };
    }
    return null;
  }

  onEmailChange(emailValue: string): void {
    this.ownerEmail.setValue(emailValue);
  }

  getYears() {
    const currentYear = (new Date()).getFullYear();
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    this.years = (range(currentYear, currentYear - 20, -1));
  }

  getMonth() {
    this.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  yearsChanged($event: any) {
    this.year = $event.value;
  }

  monthsChanged($event: any) {
    this.month = $event.value;
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.minDate = this.startDate;
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    this.maxDate = this.endDate;
  }

  policySearchChangeHandler(searchAccountResults: SearchAccountResults): void {
    this.isLoadingInceptionDate$.next(true);
    this.invoiceSearchResult = new InvoiceSearchResult();
    this.invoiceSearchResult.firstName = searchAccountResults.displayName;
    this.invoiceSearchResult.policyNumber = searchAccountResults.policyNumber;
    this.invoiceSearchResult.policyId = searchAccountResults.policyId;
    this.invoiceSearchResult.invoiceId = searchAccountResults.policyId;
    this.displayName = searchAccountResults.displayName;
    this.policyNumber = searchAccountResults.policyNumber;
    this.policyId = searchAccountResults.policyId;
    this.recipientEmail = searchAccountResults.emailAddress;
    this.ownerEmail.setValue(searchAccountResults.emailAddress);

    this.policyService.getPolicy(this.policyId).subscribe(result => {
      this.viewAll(result.policyInceptionDate);
      this.isLoadingInceptionDate$.next(false);
    });

    this.showStatement = true;
    this.getAuditDetails(this.invoiceSearchResult.policyId);
  }

  validEmail(): boolean {
    if (this.ownerEmail.hasError('required') || this.ownerEmail.hasError('email')) {
      return false;
    } else {
      return true;
    }
  }

  showGeneratedStatement() {
    this.isLoading$.next(true);
    this.generateStatementDocument(this.policyId);
  }

  cancel() { this.router.navigateByUrl('fincare/billing-manager'); }

  back() { this.ngOnInit(); }

  sendStatement() {
    this.isSending$.next(true);
    this.invoiceSearchResult.emailAddress = this.ownerEmail.value;
    this.invoiceService.sendTransactional(this.invoiceSearchResult).subscribe(result => {
      this.toastr.successToastr('Email sent successfully');
      this.isSending$.next(false);
      this.auditDetails(this.invoiceSearchResult);
    });
  }

  getAuditDetails(id: number): void {
    this.invoiceService.getStatementAudit(id).subscribe(results => {
      this.auditResults = new Array();
      this.auditResults = results;
    });
  }

  auditDetails(invoiceSearchResult: InvoiceSearchResult) {
    this.auditResult = new AuditResult();
    this.auditResult.itemId = invoiceSearchResult.policyId.toString();
    this.auditResult.itemType = 'Statement';
    this.auditResult.username = this.authService.getUserEmail();
    this.auditResult.action = 'Statement sent via email';
    this.auditResult.oldItem = 'Statement sent via email to ' + invoiceSearchResult.emailAddress;
    this.auditResult.newItem = 'Statement sent via email to ' + invoiceSearchResult.emailAddress;
    this.invoiceService.addAuditLog(this.auditResult).subscribe(res => { });
  }

  generateStatementDocument(invoiceId: number): void {
    this.reportTitle = 'Transactional Statement';
    this.parametersAudit = { invoiceId, startDate: this.start, endDate: this.end, period: this.month, year: this.year };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMATransactionalStatement';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.filterStatement = true;
    this.showReport = true;
    this.isLoading$.next(false);
  }

  ExportTypeChanged($event: any) {
    this.isExport = true;
    switch ($event.value) {
      case 1: {
        this.formatAudit = 'CSV';
        break;
      }
      case 2: {
        this.formatAudit = 'EXCEL';
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }

  exportReport(): void {
    const invoiceId = this.policyId;
    this.reportTitle = 'Transactional Statement';
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMAStatementExport';
    this.parametersAudit = { invoiceId };
    this.showParametersAudit = 'false';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }

  viewAll(startDate: Date) {
    this.startDate = new Date(startDate);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);
    this.minDate = this.startDate;

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');
    this.maxDate = this.endDate;
  }
}
