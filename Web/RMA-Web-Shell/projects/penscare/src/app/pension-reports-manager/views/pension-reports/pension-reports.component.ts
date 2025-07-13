import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import * as moment from 'moment';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidatorService } from '../../../services/validator.service';
import { Subscription } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { PaymentScheduleProductEnum } from '../../../annual-increase/models/payment-schedule-product';

@Component({
  selector: 'app-pension-reports',
  templateUrl: './pension-reports.component.html',
  styleUrls: ['./pension-reports.component.css']
})
export class PensionReportsComponent implements OnInit {
  public reportTypes = [
    { name: '18 Year Old Report', value: 'ChildToAdultLedgerReport' },
    { name: 'Bank Draft Report', value: 'BankDraftsReport' },
    { name: 'Payment Schedule Report', value: 'PaymentScheduleReport' },
    { name: 'PAYE Report', value: 'PayeReport' },
    { name: 'Payment Reject Report', value: 'PaymentRejectReport' },
    { name: 'Malawi Report', value: 'MalawiReport' },
    { name: 'ACB Report', value: 'AcbCoidReport' }
  ]

  paymentScheduleClass: string[] = [];
  paymentScheduleProducts: string[] = [];

  @Output() dateChange: EventEmitter<MatDatepickerInputEvent<any>>;

  form: UntypedFormGroup;
  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  extensionAudit = 'PDF';
  parametersAudit = {};
  languageAudit = 'en-us';
  widthAudit = 100;
  heightAudit = 100;
  toolbarAudit = 'true';
  showReport = false;
  reportFormats: string[] = ['PDF', 'EXCEL'];
  selectedReportFormat = 'PDF';
  isDownload: string;
  min: Date;
  max: Date = new Date();
  subscription: Subscription = new Subscription;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private lookupService: LookupService,
    public validator: ValidatorService,
    public datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.paymentScheduleClass = this.getEnumNames(IndustryClassEnum);
    this.paymentScheduleClass = this.paymentScheduleClass.filter(x => ['Mining', 'Metals'].includes(x))
    this.paymentScheduleProducts = this.getEnumNames(PaymentScheduleProductEnum);
    this.generateReportUrl();
  }

  generateReportUrl(): void {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
      }
    );
  }

  getEnumNames(enumObj: any): string[] {
    return Object.keys(enumObj).filter(key => isNaN(Number(key)));
  }

  createForm() {
    this.form = this.formBuilder.group({
      reportType: new UntypedFormControl('', [Validators.required]),
      startDate: new UntypedFormControl('',
        [
          Validators.required,
          this.validator.maxDateValidator(moment().endOf('day'))
        ]),
      endDate: new UntypedFormControl('',
        [
          Validators.required,
          this.validator.maxDateValidator(moment().endOf('day'))
        ]),
      class: new UntypedFormControl(''),
      product: new UntypedFormControl('')
    });
  }

  addFormSubscription(): void {
    this.subscription = this.form.controls.reportType.valueChanges.subscribe((value) => {
      if (value === 'PaymentScheduleReport') {
        this.form.controls.class.setValidators([Validators.required]);
        this.form.controls.product.setValidators([Validators.required]);
      }
      else {
        this.form.controls.class.clearValidators();
        this.form.controls.product.clearValidators();
      }
      this.form.updateValueAndValidity();
    });
  }

  setConditionalValidation(): void {

    this.form.controls.endDate.setValidators([
      Validators.required,
      this.validator.minDateValidator(moment(this.form.controls.startDate.value).startOf('day')),
      this.validator.maxDateValidator(moment().endOf('day')),
    ]);
    this.min = this.form.controls.startDate.value
    this.form.controls.endDate.updateValueAndValidity();
  }

  viewReport() {
    if(this.form.valid) {
      this.reportServerAudit = this.ssrsBaseUrl;
      this.reportUrlAudit = 'RMA.Reports.PensCare/' + this.form.controls['reportType'].value;
      this.showParametersAudit = 'false';
      switch (this.form.controls['reportType'].value) {
        case 'PaymentScheduleReport':
        case 'AcbCoidReport':
          this.parametersAudit = {
            FromDate:  this.datePipe.transform(this.form.controls['startDate'].value, 'yyyy-MM-dd'),
            ToDate: this.datePipe.transform(this.form.controls['endDate'].value, 'yyyy-MM-dd'),
            Class: this.form.controls.class.value,
            ProductClassId: PaymentScheduleProductEnum[this.form.controls.product.value],
          }
        break;
        case 'MalawiReport':
          this.parametersAudit = {
            FromDate:  this.datePipe.transform(this.form.controls['startDate'].value, 'yyyy-MM-dd'),
            ToDate: this.datePipe.transform(this.form.controls['endDate'].value, 'yyyy-MM-dd'),
            Class: this.form.controls.class.value,
          }
        break;
        case 'BankDraftsReport':
          this.parametersAudit = {
            FromDate:  this.datePipe.transform(this.form.controls['startDate'].value, 'yyyy-MM-dd'),
            ToDate: this.datePipe.transform(this.form.controls['endDate'].value, 'yyyy-MM-dd'),
          }
        break;
        default:
          this.parametersAudit = {
            FromDate:  this.datePipe.transform(this.form.controls['startDate'].value, 'yyyy-MM-dd'),
            ToDate: this.datePipe.transform(this.form.controls['endDate'].value, 'yyyy-MM-dd')
          }
          break;
      }

      this.showReport = true;
    }
  }

  exportReport() {
    this.isDownload = 'true';
    this.showReport = false;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.PensCare/' + this.form.controls['reportType'].value;
    this.showParametersAudit = 'false';
    this.extensionAudit = this.extensionAudit;
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }

  reportFormatChange(event: MatRadioChange) {
    this.selectedReportFormat = event.value;
  }
}
