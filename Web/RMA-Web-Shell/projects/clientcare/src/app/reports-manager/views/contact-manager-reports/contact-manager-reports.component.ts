import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import 'src/app/shared/extensions/date.extensions';

@Component({
  selector: 'app-contact-manager-reports',
  templateUrl: './contact-manager-reports.component.html',
  styleUrls: ['./contact-manager-reports.component.css']
})
export class ContactManagerReportsComponent implements OnInit {

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
  
  contactClientTypeParam: any;
  contactTypeParam: any;
  contactFilterDateParam: any;
  contactStatusParam: any;

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

  isContactStatus = false;
  isContactClientType = false;
  isContactFilterDateType = false;
  isContactType = false;

  public selectedContactClientType: any;
  public selectedContactFilterDateType: any;
  public selectedContactStatus: any;
  public selectedContactType: any;

  public contactFilterDate = [
    {name: 'All', value: '5'},
    {name: 'Daily', value: '1'},
    {name: 'Weekly', value: '2'},
    {name: 'Monthly', value: '3'},
    {name: 'Yearly', value: '4'}
  ];

  public contactClietType = [
    {name: 'All', value: '3'},
    {name: 'Individual', value: '1'},
    {name: 'Corporate', value: '0'},

  ];

  public contactType = [
    {name: 'All', value: '5'},
    {name: 'Email', value: '1'},
    {name: 'Phone', value: '2'},
    {name: 'Post', value: '4'},
    {name: 'SMS', value: '3'}
  ];

  public contactStatus = [
    {name: 'All ', value: 'true'},
    {name: 'Active ', value: 'true'},
    {name: 'NonActive', value: 'false'}
  ];

  public contactReportTypes = [
    { name: 'Contact Details Report', value: 'RMAContactDetailsReport' }
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
    //this.getYears();
    //this.getMonthNames();
    this.createForm();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );

    if (this.selectedContactStatus === undefined) {
      this.selectedContactStatus = this.contactStatus.filter(i => i.value === '1')[0];
    }

    
    if (this.selectedContactFilterDateType === undefined) {
      this.selectedContactFilterDateType = this.contactFilterDate.filter(i => i.value === '1')[0];
    }

    this.contactReportTypes.sort((n,v)=> (n.name >v.name) ? 1 :-1);
  }

  contactReportTypeChanged($event: any) {
    this.selectedReportType = this.contactReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extensionAudit = '';
    this.showReportFilters();
  }

  contactClientTypeChanged(event: any)
  {
    this.selectedContactClientType = event.value;
  }

  contactStatusChanged(event: any )
  {
      this.selectedContactStatus = event.value;
  }

 
  contactFilterDateTypeChanged(event: any)
  {
    this.selectedContactFilterDateType = event.value;
  }

  contactTypeChanged(event: any)
  {
    this.selectedContactType = event.value;
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


  showReportFilters(): void {
    switch (this.selectedReportType.value) {
     
      case 'RMAContactDetailsReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isContactStatus  = true;
        this.isContactClientType  = true;
        this.isContactFilterDateType  = true;
        this.isContactType  = true;
    
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

  createForm() {
    this.form = this.formBuilder.group({
      contactReportTypes: [null],
      months: [null],
      toMonths: [null],
      years: [null],
      startDt: new UntypedFormControl(''),
      endDt: new UntypedFormControl('')
    });
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

 

  filterValues(){
    if(this.selectedContactFilterDateType != undefined){
      this.contactFilterDateParam = this.selectedContactFilterDateType.value;
    }
    if(this.selectedContactClientType != undefined){
      this.contactClientTypeParam = this.selectedContactClientType.value;
    }
    if(this.selectedContactStatus != undefined){
      this.contactStatusParam = this.selectedContactStatus.value;
    }
    if(this.selectedContactType != undefined){
      this.contactTypeParam = this.selectedContactType.value;
    }
  }

  viewReport() {
    this.isDownload = 'false';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.selectedReportType.value;
  
    this.filterValues();

    if(!String.isNullOrEmpty(this.contactClientTypeParam) && !String.isNullOrEmpty(this.contactFilterDateParam) && !String.isNullOrEmpty(this.contactTypeParam) && !String.isNullOrEmpty(this.contactStatusParam) )
    {
      if (this.selectedReportType.value == 'RMAContactDetailsReport') {
        this.parametersAudit = {
          ClientType: this.contactClientTypeParam, 
          StartDate: this.start,
          EndDate: this.end,
          PeriodType: this.contactFilterDateParam,
          ContactType: this.contactTypeParam,
          Status: this.contactStatusParam
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
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.selectedReportType.value;

    this.filterValues();
    
    if (this.selectedReportType.value == 'RMAContactDetailsReport') {
      this.parametersAudit = {
        ClientType: this.contactClientTypeParam, 
        StartDate: this.start,
        EndDate: this.end,
        PeriodType: this.contactFilterDateParam,
        ContactType: this.contactTypeParam,
        Status: this.contactStatusParam
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

  reportFormatChange(event: MatRadioChange) {
    this.reportUrlAudit = null;
    this.selectedReportFormat = event.value;
  }

}
