import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import 'src/app/shared/extensions/date.extensions';
import { ReportsManagerConstants } from '../../reports-manager-constants';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';

@Component({
  selector: 'app-member-manager-reports',
  templateUrl: './member-manager-reports.component.html',
  styleUrls: ['./member-manager-reports.component.css']
})
export class MemberManagerReportsComponent implements OnInit {

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit = ReportsManagerConstants.formatPDF;
  extensionAudit = String.Empty;
  reportTitle: string;
  ssrsBaseUrl: string;
  dateError = String.Empty;

  form: UntypedFormGroup;
  showReport = false;
  showExport = false;
  exportTypeId = '1';
  selectedReportFormat = ReportsManagerConstants.formatPDF;
  reportFormats: string[] = [ReportsManagerConstants.formatPDF, ReportsManagerConstants.formatExcel];
  searchableStart: Date;
  searchableEnd: Date;
  formIsValid = false;
  showProducts = false;

  memberClientTypeParam: any;
  memberTypeParam: any;
  memberFilterDateParam: any;
  memberStatusParam: any;
  contactStatusParam: any;
  contactTypeParam: any;
  memberProductTypeParam: any;
  declarationStatusParam: any;

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

  isContactType = false;
  isContactStatus = false;
  isMemberStatus = false;
  isMemberClientType = false;
  isMemberFilterDateType = false;
  isMemberType = false;
  isDeclarationStatus = false;
  products: Product[];

  public selectedMemberClientType: any;
  public selectedMemberFilterDateType: any;
  public selectedMemberStatus: any;
  public selectedMemberType: any;
  public selectedContactStatus: any;
  public selectedContactType: any;
  public selecteDeclarationStatus: any;

  public memberFilterDate = [
    { name: 'All', value: '5' },
    { name: 'Daily', value: '1' },
    { name: 'Weekly', value: '2' },
    { name: 'Monthly', value: '3' },
    { name: 'Yearly', value: '4' }
  ];

  public memberClietType = [
    { name: 'All', value: '3' },
    { name: 'Individual', value: '1' },
    { name: 'Corporate', value: '0' },

  ];

  public productType = [];

  public memberStatus = [
    { name: 'All ', value: '0' },
    { name: 'Active ', value: '1' },
    { name: 'NonActive', value: '2' }
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

  public declarationStatus = [
    {name: 'All ', value: '0'},
    {name: 'Declared ', value: '1'},
    {name: 'Not Declared', value: '2'}
  ];

  public memberReportTypes = [
    { name: 'Member Status Report', value: 'RMAMemberStatusReport' },
    { name: 'Member Audit Trail Report', value: 'RMAMemberAuditTrail' },
    { name: 'Contact Details Report', value: 'RMAContactDetailsReport' },
    { name: 'Member Compliance Report', value: 'RMAMemberComplianceReport' }
  ];


  constructor(
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder,
    public datePipe: DatePipe,
    private readonly productService: ProductService
  ) {
    this.createForm();

    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    this.start = this.datePipe.transform(this.startDate, ReportsManagerConstants.dateStringFormat);
    this.startDt = new UntypedFormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    this.end = this.datePipe.transform(tempEndDate, ReportsManagerConstants.dateStringFormat);
  }

  ngOnInit() {
    this.isDownload = 'false';
    const today = new Date();
    this.startMaxDate = today;
    this.endMinDate = this.startDate;
    // this.getYears();
    // this.getMonthNames();
    this.createForm();
    this.lookupService.getItemByKey(ReportsManagerConstants.baseURL).subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );

    if (this.selectedContactStatus === undefined) {
      this.selectedContactStatus = this.contactStatus.filter(i => i.value === '1')[0];
    }

    if (this.selectedMemberStatus === undefined) {
      this.selectedMemberStatus = this.memberStatus.filter(i => i.value === '1')[0];
    }

    this.memberReportTypes.sort((n, v) => (n.name > v.name) ? 1 : -1);

    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      data => {
        this.products = data.sort(this.comparer);
        this.products.unshift(this.getOperationalProduct());
        this.productType = this.products;
      }
    );
  }

  comparer(a: any, b: any): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  getOperationalProduct(): Product {
    const product = new Product();
    product.id = 0;
    product.name = 'All';
    return product;
  }

  memberReportTypeChanged($event: any) {
    this.selectedReportType = this.memberReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extensionAudit = String.Empty;
    this.showReportFilters();
  }

  contactStatusChanged(event: any ){
      this.selectedContactStatus = event.value;
  }

  contactTypeChanged(event: any){
    this.selectedContactType = event.value;
  }

  memberClientTypeChanged(event: any) {
    this.selectedMemberClientType = event.value;
  }

  memberStatusChanged(event: any) {
    this.selectedMemberStatus = event.value;
  }

  memberFilterDateTypeChanged(event: any) {
    this.selectedMemberFilterDateType = event.value;
  }

  memberTypeChanged(event: any) {
    this.selectedMemberType = event.value;
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, ReportsManagerConstants.dateStringFormat);
    this.endMinDate = this.startDate;
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.end = this.datePipe.transform(this.endDate, ReportsManagerConstants.dateStringFormat);
  }

  declarationStatusChanged(event: any) {
    this.selecteDeclarationStatus = event.value;
  }

  showReportFilters(): void {
    switch (this.selectedReportType.value) {
      case ReportsManagerConstants.contactDetailsReportName:
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isContactStatus  = true;
        this.isMemberClientType  = true;
        this.isMemberFilterDateType  = true;
        this.isContactType  = true;
        this.isMemberStatus  = false;
        this.isMemberType  = false;
        this.isDeclarationStatus  = false;
        break;

      case ReportsManagerConstants.memberStatusReportName:
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberStatus = true;
        this.isMemberClientType = true;
        this.isMemberFilterDateType = true;
        this.isMemberType = true;
        this.isContactStatus = false;
        this.isContactType  = false;
        this.isDeclarationStatus  = false;
        break;
      case ReportsManagerConstants.memberAuditTrailName:
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberStatus = true;
        this.isMemberClientType = true;
        this.isMemberFilterDateType = true;
        this.isMemberType = false;
        this.isContactStatus = false;
        this.isContactType  = false;
        this.isDeclarationStatus  = false;
        break;
      case ReportsManagerConstants.memberComplianceReportName:
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberStatus = false;
        this.isMemberClientType = false;
        this.isMemberFilterDateType = false;
        this.isMemberType = false;
        this.isContactStatus = false;
        this.isContactType  = false;
        this.isDeclarationStatus  = true;
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
        this.isDeclarationStatus  = false;
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      memberReportTypes: [null],
      months: [null],
      toMonths: [null],
      years: [null],
      startDt: new UntypedFormControl(String.Empty),
      endDt: new UntypedFormControl(String.Empty)
    });
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.showExport = false;
    this.reportTitle = String.Empty;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = ReportsManagerConstants.defaultReportUrlAudit;
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = ReportsManagerConstants.defaultLanguageAudit;
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  filterValues() {
    if (this.selectedMemberFilterDateType !== undefined) {
      this.memberFilterDateParam = this.selectedMemberFilterDateType.value;
    }
    if (this.selectedMemberClientType !== undefined) {
      this.memberClientTypeParam = this.selectedMemberClientType.value;
    }
    if (this.selectedMemberStatus !== undefined) {
      this.memberStatusParam = this.selectedMemberStatus.value;
    }
    if (this.selectedMemberType !== undefined) {
      this.memberTypeParam = this.selectedMemberType.id;
    }
    if(this.selectedContactStatus != undefined){
      this.contactStatusParam = this.selectedContactStatus.value;
    }
    if(this.selectedContactType != undefined){
      this.contactTypeParam = this.selectedContactType.value;
    }
    if(this.selecteDeclarationStatus != undefined){
      this.declarationStatusParam = this.selecteDeclarationStatus.value;
    }
  }

  viewReport() {
    this.isDownload = 'false';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = ReportsManagerConstants.reportUrlAudit + this.selectedReportType.value;
    this.filterValues();
    
    if (!String.isNullOrEmpty(this.memberClientTypeParam) && !String.isNullOrEmpty(this.memberFilterDateParam)) {
      if (this.selectedReportType.value === ReportsManagerConstants.memberStatusReportName) {
        this.parametersAudit = {
          ClientTypeId: this.memberClientTypeParam,
          Product: this.memberTypeParam,
          PeriodType: this.memberFilterDateParam,
          StartDate: this.start,
          EndDate: this.end,
          MemberStatus: this.memberStatusParam
        };
      } else if (this.selectedReportType.value === ReportsManagerConstants.contactDetailsReportName) {
        this.parametersAudit = {
          ClientType: this.memberClientTypeParam, 
          StartDate: this.start,
          EndDate: this.end,
          PeriodType: this.memberFilterDateParam,
          ContactType: this.contactTypeParam,
          Status: this.contactStatusParam
        };
      } else if (this.selectedReportType.value === ReportsManagerConstants.memberAuditTrailName) {
        this.parametersAudit = {
          ClientTypeId: this.memberClientTypeParam,
          StartDate: this.start,
          EndDate: this.end,
          PeriodType: this.memberFilterDateParam,
          MemberStatusId: this.memberStatusParam
        };
      }
    } 
    
    if (this.selectedReportType.value === ReportsManagerConstants.memberComplianceReportName) {
      this.reportUrlAudit = 'RMA.Reports.ClientCare.Renewal/' + this.selectedReportType.value;
      this.parametersAudit = {
        StartDate: this.start,
        EndDate: this.end,
        DeclarationStatus: this.declarationStatusParam
      };
    }

    this.showParametersAudit = 'false';
    this.formatAudit = ReportsManagerConstants.formatPDF;
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }

  exportReport() {
    this.isDownload = 'true';
    this.showReport = false;
    this.isDownloading = true;
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = ReportsManagerConstants.reportUrlAudit + this.selectedReportType.value;

    this.filterValues();
    if (this.selectedReportType.value === ReportsManagerConstants.memberAuditTrailName) {
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam, 
        StartDate: this.start,
        EndDate: this.end,
        PeriodType: this.memberFilterDateParam,
        MemberStatusId: this.memberStatusParam
      };
    }
    if (this.selectedReportType.value === ReportsManagerConstants.memberStatusReportName) {
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        Product: this.memberTypeParam,
        PeriodType: this.memberFilterDateParam,
        StartDate: this.start,
        EndDate: this.end,
        MemberStatus: this.memberStatusParam
      };
    }

    if (this.selectedReportType.value == ReportsManagerConstants.contactDetailsReportName) {
      this.parametersAudit = {
        ClientType: this.memberClientTypeParam, 
        StartDate: this.start,
        EndDate: this.end,
        PeriodType: this.memberFilterDateParam,
        ContactType: this.contactTypeParam,
        Status: this.contactStatusParam
      };
    }

    if (this.selectedReportType.value === ReportsManagerConstants.memberComplianceReportName) {
      this.reportUrlAudit = 'RMA.Reports.ClientCare.Renewal/' + this.selectedReportType.value;
      this.parametersAudit = {
        StartDate: this.start,
        EndDate: this.end,
        DeclarationStatus: this.declarationStatusParam
      };
    }

    this.showParametersAudit = 'true';
    this.formatAudit = this.selectedReportFormat;
    this.extensionAudit = this.extensionAudit;
    this.languageAudit = ReportsManagerConstants.defaultLanguageAudit;
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
