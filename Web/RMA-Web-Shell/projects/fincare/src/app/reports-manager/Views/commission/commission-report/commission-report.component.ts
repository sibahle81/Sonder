import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { CommissionPeriod } from 'projects/fincare/src/app/payment-manager/models/commission-period';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { DatePipe } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';
import { map } from 'rxjs/operators';

@Component({
  selector: 'commission-report',
  templateUrl: './commission-report.component.html'
})
export class CommissionReportComponent implements OnInit {

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit = 'PDF';
  extensionAudit = '';
  reportTitle: string;
  ssrsBaseUrl: string;
  dateError = '';

  form: UntypedFormGroup;
  showReport = false;
  showExport = false;
  exportTypeId = '1';
  isProductFilterVisble = false;
  periodId: number;
  periods: CommissionPeriod[];
  isLoadingPeriods: boolean;
  selectedReportFormat = 'PDF';
  reportFormats: string[] = ['PDF', 'EXCEL'];
  periodStart: Date;
  periodEnd: Date;
  searchableStart: Date;
  searchableEnd: Date;
  formIsValid = false;

  public commissionReportTypes = [
    { name: 'Withheld Commission', value: 'WithheldCommission' },
    { name: 'Paid Commission', value: 'PaidCommission' },
    { name: 'Rejected Commission', value: 'RejectedCommission' },
    { name: 'Premium vs Commisssion', value: 'PremiumVersusCommisssion' },
    { name: 'Commissions Ability Posting', value: 'CommissionAbilityPosting' },
    { name: 'All Broker Commission Accounts Report', value: 'AllBrokerCommissionAccountsReport' },
  ];
  public selectedReportType: any;
  isDownload: string;
  isDownloading = false;
  reportUseStartAndEndDates = false;

  constructor(
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder,
    private readonly commissionService: CommissionService,
    public datePipe: DatePipe) {
  }

  ngOnInit() {
    this.createForm();
    if (!this.selectedReportType) {
      this.selectedReportType = this.commissionReportTypes.filter(i => i.value === 'PaidCommission')[0];
    }
    this.reportTitle = this.selectedReportType.name;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
    this.getPeriods();
    this.showExport = false;
  }

  createForm() {
    this.form = this.formBuilder.group({
      period: [null],
      commissionReportTypes: [null],
      startDate: [null],
      endDate: [this.getToday()],
    });
  }

  commissionReportTypeChanged($event: any) {
    this.selectedReportType = this.commissionReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extensionAudit = '';
    if (this.selectedReportType.name === 'Commissions Ability Posting') {
      this.reportUseStartAndEndDates = true;
    } else {
      this.reportUseStartAndEndDates = false;
    }
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.showExport = false;
    this.reportTitle = '';
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  viewReport() {
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/' + this.selectedReportType.value;

    if (this.reportUseStartAndEndDates) {
      this.parametersAudit = {
        periodStart: this.periodStart ? this.periodStart : null,
        periodEnd: this.periodEnd ? this.periodEnd : null,
        startDate: this.form.get('startDate').value ? this.form.get('startDate').value : null,
        endDate: this.form.get('endDate').value ? this.form.get('endDate').value : null
      };
    } else {
      this.parametersAudit = {
        periodId: this.periodId
      };
    }

    this.showParametersAudit = 'false';
    this.formatAudit = 'PDF';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }

  exportReport() {
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/' + this.selectedReportType.value;

    this.parametersAudit = {
      periodId: this.periodId
    };
    this.showParametersAudit = 'false';
    this.formatAudit = this.selectedReportFormat;
    this.extensionAudit = this.extensionAudit;
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
  }

  getPeriods() {
    this.isLoadingPeriods = true;
    this.commissionService.getCommissionPeriodsForReports()
      .pipe(map(data => {
        this.periods = data;
        this.isLoadingPeriods = false;
      }))
      .subscribe();
  }

  reportFormatChange(event: MatRadioChange) {
    this.reportUrlAudit = null;
    this.selectedReportFormat = event.value;
  }

  getMonthName(value: string) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(value) - 1];
  }

  onPeriodSelect(event: any) {
    this.periodId = event.value;
    const selectedPeriod = this.periods.find((c: CommissionPeriod) => c.periodId === event.value);
    this.getPeriodDetails(selectedPeriod);
  }

  getPeriodDetails(commissionPeriod: CommissionPeriod) {
    this.periodStart = commissionPeriod.startDate;
    this.periodEnd = commissionPeriod.endDate;
    if (this.periodStart) {
      this.searchableStart = this.periodStart;
      this.form.patchValue({ startDate: this.periodStart });
    }
    if (this.periodEnd) {
      this.searchableEnd = this.periodEnd;
      this.form.patchValue({ endDate: this.periodEnd });
    }
  }

  getToday(): Date {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm);
    return today;
  }

  validateDates(): void {
    this.form.get('endDate').setErrors(null);
    this.form.get('startDate').setErrors(null);
    this.formIsValid = true;
    if (!this.form.get('startDate').value) {
      this.form.get('startDate').markAsTouched();
      this.form.get('startDate').setErrors({ required: true });
      this.formIsValid = false;
      return;
    }

    const startDate = new Date(this.form.get('startDate').value);
    const endDate = new Date(this.form.get('endDate').value);

    if (this.form.get('startDate').value && this.form.get('endDate').value && endDate < startDate) {
      this.form.get('endDate').setErrors({ min: true });
      this.form.get('startDate').setErrors({ min: true });
      this.formIsValid = false;
    }
  }

}
