import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-finance-report',
  templateUrl: './finance-report.component.html',
  styleUrls: ['./finance-report.component.css']
})
export class FinanceReportComponent implements OnInit {

  reportServer: string;
  reportUrl: string;
  showParametersAudit = 'false';
  parametersAudit: any;
  languageAudit: any;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit = 'PDF';
  reportTitle = '';
  ssrsBaseUrl = '';
  public selectedPaymentType: any;

  startDate: Date;
  startMaxDate: Date;
  endMinDate: Date;

  endDate: Date;
  start: any;
  end: any;
  exportTypeName = 'CSV';
  dateError = '';

  form: UntypedFormGroup;
  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  showReport = false;
  showExport = false;
  showPaymentType = false;

  public paymentTypes = [
    { name: 'Individual', value: 'Individual' },
    { name: 'Group', value: 'Group' },
    { name: 'Corporate', value: 'Corporate' },
    { name: 'GoldWage', value: 'GoldWage' },
    { name: 'Refunds', value: 'Refunds' },
    { name: 'Commissions', value: 'Commissions' }
  ];

  public financeReportTypes = [
    { name: 'Recon', value: 'Recon' },
    { name: 'Payment Audit Trail', value: 'PaymentAuditTrail' },
    { name: 'View Payments', value: 'ViewPaymentsMadePerType' },
    { name: 'Rejection', value: 'RMARejectionReport' },
    { name: 'Recovery', value: 'RMARecoveryReport' }
  ];

  public selectedReportType: any;

  constructor(
    public datePipe: DatePipe,
    private lookupService: LookupService
  ) {
    this.createForm();

    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');
  }

  ngOnInit() {
    const today = new Date();
    this.startMaxDate = today;

    if (this.selectedReportType === undefined) {
      this.selectedReportType = this.financeReportTypes.filter(i => i.value === 'Recon')[0];
    }
    this.reportTitle = this.selectedReportType.name;

    if (this.selectedPaymentType === undefined) {
      this.selectedPaymentType = this.paymentTypes.filter(i => i.value === 'Individual')[0];
    }

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.viewDefaultReport();
      }
    );
    this.showExport = false;
  }

  createForm(): void {
    this.form = new UntypedFormGroup({
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

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }

  financeReportTypeChanged($event: any) {
    this.selectedReportType = this.financeReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;

    if (this.selectedReportType.value === 'ViewPaymentsMadePerType') {
      this.showPaymentType = true;

    } else {
      this.showPaymentType = false;
    }
  }

  paymentTypeChanged($event: any) {
    this.selectedPaymentType = this.paymentTypes.filter(i => i.value === $event.value.value)[0];
  }

  ExportTypeChanged($event: any) {
    console.log($event);

    switch ($event.value) {
      case 1: {
        this.formatAudit = 'PDF';
        break;
      }
      case 2: {
        this.formatAudit = 'CSV';
        break;
      }
      case 3: {
        this.formatAudit = 'EXCEL';
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }

  async viewDefaultReport(): Promise<void> {
    this.showReport = false;
    this.showExport = false;
    this.reportTitle = 'Report Manager';
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  async viewReport(): Promise<void> {
    this.showReport = false;
    if (this.start < this.end) {
      this.showExport = true;
      this.dateError = '';
      this.reportTitle = this.selectedReportType.name;
      this.reportServer = this.ssrsBaseUrl;
      this.reportUrl = 'RMA.Reports.FinCare/' + this.selectedReportType.value;
      if (this.selectedReportType.value === 'ViewPaymentsMadePerType') {
        this.parametersAudit = { DateFrom: this.start, DateTo: this.end, PaymentType: this.selectedPaymentType.value };
      } else {
        this.parametersAudit = { DateFrom: this.start, DateTo: this.end };
      }
      this.showParametersAudit = 'false';
      this.languageAudit = 'en-us';
      this.widthAudit = 100;
      this.heightAudit = 100;
      this.toolbarAudit = 'true';
      this.showReport = true;
      this.showExport = true;
    } else {
      this.dateError = 'From date cannot be greater than To date';
    }
  }

  exportReport() {

    if (this.start < this.end) {
      this.dateError = '';

      this.reportTitle = this.selectedReportType.name;

      this.reportServer = this.ssrsBaseUrl;
      this.reportUrl = 'RMA.Reports.FinCare/' + this.selectedReportType.value;
      if (this.selectedReportType.value === 'ViewPaymentsMadePerType') {
        this.parametersAudit = { DateFrom: this.start, DateTo: this.end, PaymentType: this.selectedPaymentType.value };
      } else {
        this.parametersAudit = { DateFrom: this.start, DateTo: this.end };
      }
      this.showParametersAudit = 'false';
      this.languageAudit = 'en-us';
      this.widthAudit = 100;
      this.heightAudit = 100;
      this.toolbarAudit = 'true';
      this.showReport = true;
    } else {
      this.dateError = 'From date cannot be greater than To date';
    }
  }

}
