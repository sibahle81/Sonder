import { Component, OnInit} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatRadioChange } from '@angular/material/radio';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

import { DatePipe } from '@angular/common';
import 'src/app/shared/extensions/string.extensions';

@Component({
  selector: 'app-quote-reports',
  templateUrl: './quote-manager-reports.component.html',
  styleUrls: ['./quote-manager-reports.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class QuoteManagerReportsComponent implements OnInit {
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
  selectedReportFormat = 'PDF';
  reportFormats: string[] = ['PDF', 'EXCEL'];
  searchableStart: Date;
  searchableEnd: Date;
  formIsValid = false;
  showProducts = false;
  
  quoteStatusParam: any;
  quoteclientTypeParam: any;
  quoteFilterDate: any;
  slaParam: any
  

  public quoteReportTypes = [
    { name: 'Quote Audit Trail Report', value: 'RMAQuoteAuditReport' },
    { name: 'Quote Status Report', value: 'RMAQuoteStatusReport' },
    { name: 'Quote Age Analysis Report', value: 'RMAQuoteAgeAnalysisReport' },

  ];

  public selectedReportType: any;
  isDownload: string;
  isDownloading = false;
  reportUseStartAndEndDates = false;
  years: { name: string, value: number }[] = [];
  months: { name: string, value: number }[] = [];
  toMonths: { name: string, value: number }[] = [];
  selectedYear = 0;
  selectedMonth = 0;
  toSelectedMonth = 0;
  productNameFilter = null;
  startDate: Date;
  endDate: Date;
  start: any;
  end: any;
  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  startMaxDate: Date;
  endMinDate: Date;
  hideYearMonthFilter = false;
  isDateFilterVisble = false;
  isStatusTypesVisible = false;
  isGroupVisible = false;
  isHideToMonthVisible = false;
  isBrokerageVisible = false;
  isWeekVisible = false;

  isQuoteStatus = false;
  isQuoteClientType = false;
  isQuoteFilterDateType = false;
  isQuoteFilterSLA = false;


  
  public selectedQuoteClientType: any;
  public selectedQuoteFilterDateType: any;
  public selectedQuoteStatus: any;
  public selectedQuoteFilterSLA: any;

  public quoteFilterDateType = [
    {name: 'All', value: '5'},
    {name: 'Daily', value: '1'},
    {name: 'Weekly', value: '2'},
    {name: 'Monthly', value: '3'},
    {name: 'Yearly', value: '4'}
  ];

  public quoteStatus = [
    {name: 'All', value: '8'},
    {name: 'New', value: '1'},
    {name: 'Approved', value: '2'},
    {name: 'Rejected', value: '3'},
    {name: 'Pending Approval', value: '4'},
    {name: 'Accepted', value: '5'},
    {name: 'Declined', value: '6'},
    {name: 'Quoted', value: '7'}
  ];

  public quoteClientType = [
    {name: 'All', value: '8'},
    {name: 'Individual', value: '1'},
    {name: 'Affinity', value: '2'},
    {name: 'Company', value: '3'},
    {name: 'Group Individual', value: '4'},
    {name: 'Gold Wage', value: '5'},
    {name: 'Corporate', value: '6'},
    {name: 'Group', value: '7'}
  ];

  public quoteFilterSLA = [
    {name: 'All', value: '4'},
    {name: 'Less Than 30 days', value: '1'},
    {name: '30 days to 60 days', value: '2'},
    {name: 'Above 60 days', value: '3'},
   
  ];

  
  constructor(
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder,
    public datePipe: DatePipe,
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
    this.isDownload = 'false';
    const today = new Date();
    this.startMaxDate = today;
    this.endMinDate = this.startDate;
    this.getYears();
    this.getMonthNames();
    this.createForm();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );

    if (this.selectedQuoteStatus === undefined) {
      this.selectedQuoteStatus = this.quoteStatus.filter(i => i.value === '1')[0];
    }

    
    if (this.selectedQuoteFilterDateType === undefined) {
      this.selectedQuoteFilterDateType = this.quoteFilterDateType.filter(i => i.value === '1')[0];
    }

    this.quoteReportTypes.sort((n,v)=> (n.name >v.name) ? 1 :-1);
  
  }

  quoteReportTypeChanged($event: any) {
    this.selectedReportType = this.quoteReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extensionAudit = '';
    this.showReportFilters();
  }
  
   
  showReportFilters(): void {
    switch (this.selectedReportType.value) {
     
      case 'RMAQuoteAuditReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isQuoteStatus = true;
        this.isQuoteClientType = true;
        this.isQuoteFilterDateType = true;
        this.isQuoteStatus = true;
        this.isQuoteFilterSLA = false;
        break;
      case 'RMAQuoteStatusReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isQuoteStatus = true;
        this.isQuoteClientType = true;
        this.isQuoteFilterDateType = true;
        this.isQuoteStatus = true;
        this.isQuoteFilterSLA = false;
        break;
        case 'RMAQuoteAgeAnalysisReport':
          this.hideYearMonthFilter = false;
          this.isHideToMonthVisible = false;
          this.isDateFilterVisble = true;
          this.isGroupVisible = false;
          this.isBrokerageVisible = false;
          this.showProducts = false;
          this.isStatusTypesVisible = false;
          this.isWeekVisible = false;
          this.isQuoteClientType = true;
          this.isQuoteFilterDateType = true;
          this.isQuoteFilterSLA = true;
          this.isQuoteStatus = true;
         
          break;
      
      default:
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = false;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
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

  reportFormatChange(event: MatRadioChange) {
    this.reportUrlAudit = null;
    this.selectedReportFormat = event.value;
  }
  
  getYears() {
    const currentYear = this.getCurrentYear();
    this.selectedYear = currentYear;
    this.selectedMonth = this.getCurrentMonth();
    this.toSelectedMonth = this.getCurrentMonth();
    for (let i = 0; i < 5; i++) {
      this.years.push({ name: (currentYear - i).toString(), value: (currentYear - i) });
    }
    this.years.push({ name: (currentYear + 1).toString(), value: (currentYear + 1) });
  }

  getMonthNames() {
    this.months = [{ name: 'Jan', value: 0 }, { name: 'Feb', value: 1 }, { name: 'Mar', value: 2 }, { name: 'Apr', value: 3 }, { name: 'May', value: 4 }, { name: 'Jun', value: 5 },
    { name: 'Jul', value: 6 }, { name: 'Aug', value: 7 }, { name: 'Sep', value: 8 }, { name: 'Oct', value: 9 }, { name: 'Nov', value: 10 }, { name: 'Dec', value: 11 }];
    this.toMonths = [{ name: 'Jan', value: 0 }, { name: 'Feb', value: 1 }, { name: 'Mar', value: 2 }, { name: 'Apr', value: 3 }, { name: 'May', value: 4 }, { name: 'Jun', value: 5 },
    { name: 'Jul', value: 6 }, { name: 'Aug', value: 7 }, { name: 'Sep', value: 8 }, { name: 'Oct', value: 9 }, { name: 'Nov', value: 10 }, { name: 'Dec', value: 11 }];
  }

  getCurrentYear() {
    return (new Date()).getFullYear();
  }

  getCurrentMonth() {
    return (new Date()).getMonth();
  }
  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.endMinDate = this.startDate;
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }

  quoteFilterSLAChanged(event: any)
  {
    this.selectedQuoteFilterSLA = event.value;
  }

  createForm() {
    this.form = this.formBuilder.group({
      quoteReportTypes: [null],
      months: [null],
      toMonths: [null],
      years: [null],
      startDt: new UntypedFormControl(''),
      endDt: new UntypedFormControl('')
    });

    this.form.patchValue({
      months: this.getCurrentMonth(),
      toMonths: this.getCurrentMonth(),
      years: this.getCurrentYear()
    });
  }
  yearsTypeChanged(event: any) {
    this.selectedYear = event.value;
  }

  monthsTypeChanged(event: any) {
    this.selectedMonth = event.value;
  }

  toMonthsTypeChanged(event: any) {
    this.toSelectedMonth = event.value;
  }

  quoteClientTypeChanged(event: any)
  {
    this.selectedQuoteClientType = event.value;
  }

  quoteStatusChanged(event: any )
  {
      this.selectedQuoteStatus = event.value;
  }

 
  quoteFilterDateientTypeChanged(event: any)
  {
    this.selectedQuoteFilterDateType = event.value;
  }

  filterValues(){
    if(this.selectedQuoteFilterDateType != undefined){
      this.quoteFilterDate = this.selectedQuoteFilterDateType.value;
    }
    if(this.selectedQuoteClientType != undefined){
      this.quoteclientTypeParam = this.selectedQuoteClientType.value;
    }
    if(this.selectedQuoteStatus != undefined){
      this.quoteStatusParam = this.selectedQuoteStatus.value;
    }
    if(this.selectedQuoteFilterSLA != undefined){
      this.slaParam = this.selectedQuoteFilterSLA.value;
    }
  }

  viewReport() {
    this.isDownload = 'false';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Quote/' + this.selectedReportType.value;
  
    this.filterValues();

    if(!String.isNullOrEmpty(this.quoteFilterDate) && !String.isNullOrEmpty(this.quoteclientTypeParam) && !String.isNullOrEmpty(this.quoteStatusParam))
    {
      if (this.selectedReportType.value == 'RMAQuoteAuditReport') {
          this.parametersAudit = {
            ClientType: this.quoteclientTypeParam, 
            StartDate: this.start,
            EndDate: this.end,
            PeriodType: this.quoteFilterDate,
            QuoteStatusId: this.quoteStatusParam
          };
        }

        if (this.selectedReportType.value == 'RMAQuoteStatusReport') {
          this.parametersAudit = {
            ClientTypeId: this.quoteclientTypeParam, 
            StartDate: this.start,
            EndDate: this.end,
            FilterDateType: this.quoteFilterDate,
            QuoteStatusId: this.quoteStatusParam
          };
        }

        if (this.selectedReportType.value == 'RMAQuoteAgeAnalysisReport') {
          this.parametersAudit = {
              QuoteStatusId: this.quoteStatusParam, 
              ClientTypeId: this.quoteclientTypeParam,
              SLA: this.slaParam,
              QuoteStartDate: this.start,
              QuoteEndDate: this.end,
              PeriodType: this.quoteFilterDate
            };
          }
  
  
   
  
      this.showParametersAudit = 'false';
      this.formatAudit = 'PDF';
      this.widthAudit = 100;
      this.heightAudit = 100;
      this.toolbarAudit = 'true';
      this.showReport = true;
    }
  }

  exportReport() {
    this.isDownload = 'true';
    this.showReport = false;
    this.isDownloading = true;
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Quote/' + this.selectedReportType.value;

    this.filterValues();

    if (this.selectedReportType.value == 'RMAQuoteAuditReport') {
      this.parametersAudit = {
          ClientType: this.quoteclientTypeParam, 
          StartDate: this.start,
          EndDate: this.end,
          PeriodType: this.quoteFilterDate,
          QuoteStatusId: this.quoteStatusParam
        };
      }

      if (this.selectedReportType.value == 'RMAQuoteStatusReport') {
        this.parametersAudit = {
          ClientTypeId: this.quoteclientTypeParam, 
          StartDate: this.start,
          EndDate: this.end,
          FilterDateType: this.quoteFilterDate,
          QuoteStatusId: this.quoteStatusParam
        };
      }

      if (this.selectedReportType.value == 'RMAQuoteAgeAnalysisReport') {
        this.parametersAudit = {
            QuoteStatusId: this.quoteStatusParam, 
            ClientTypeId: this.quoteclientTypeParam,
            SLA: this.slaParam,
            QuoteStartDate: this.start,
            QuoteEndDate: this.end,
            PeriodType: this.quoteFilterDate
          };
        }

    

    this.showParametersAudit = 'true';
    this.formatAudit = this.selectedReportFormat;
    this.extensionAudit = this.extensionAudit;
    this.languageAudit = 'en-us';
    this.widthAudit = 10;
    this.heightAudit = 10;
    this.toolbarAudit = 'true';
    this.showReport = true;
    this.isDownloading = false;
  }

}
