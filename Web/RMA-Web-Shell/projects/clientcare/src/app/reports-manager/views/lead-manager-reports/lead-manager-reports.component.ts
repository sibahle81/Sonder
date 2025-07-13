import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { DatePipe } from '@angular/common';
import { MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { Product } from '../../../product-manager/models/product';
import { ProductService } from '../../../product-manager/services/product.service';
import { PolicyService } from '../../../policy-manager/shared/Services/policy.service';
import { BrokerageService } from '../../../broker-manager/services/brokerage.service';

@Component({
  selector: 'app-lead-manager-reports',
  templateUrl: './lead-manager-reports.component.html',
  styleUrls: ['./lead-manager-reports.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class LeadManagerReportsComponent implements OnInit {
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
  productList: any[];
  productItem: Product;
  groupList: any[];
  brokerageList: any[];
  leadStatusParam: any;
  clientTypeParam: any;
  slaParam: any;
  quoteStatusParam: any;
  periodTypeParam: any;
  productParam: any;

  public leadReportTypes = [
    { name: 'Lead Status Report', value: 'RMALeadStatusReport' },
    { name: 'Lead Age Analysis Report', value: 'RMALeadAgeAnalysisReport' },
    { name: 'Lead Audit Trail Report', value: 'RMALeadAuditTrailReport' },
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

  isLeadStatus = false;
  isLeadClientType = false;
  isLeadFilterDateType = false;
  isLeadFilterSLA = false;
  isLeadFilterProduct = false;
  isLeadID = false;
  isQuoteStatus = false;

  public statusTypes = [
    { name: 'All', value: '0' },
    { name: 'Active', value: '1' },
    { name: 'Cancelled', value: '2' },
    { name: 'Lapsed', value: '5' },
    { name: 'Paused', value: '7' },
    { name: 'Reinstated', value: '15' }
  ];

  public week = [
    { name: 'First', value: '1' },
    { name: 'Second ', value: '2' },
    { name: 'Third', value: '3' },
    { name: 'Fourth', value: '4' },
    { name: 'Fifth', value: '5' }
  ];

  public leadStatus = [
    { name: 'All', value: '5' },
    { name: 'New', value: '1' },
    { name: 'Active ', value: '2' },
    { name: 'Declined', value: '3' },
    { name: 'Followup', value: '4' },

  ]

  public leadClientType = [
    { name: 'All', value: '8' },
    { name: 'Individual', value: '1' },
    { name: 'Affinity', value: '2' },
    { name: 'Company', value: '3' },
    { name: 'Group Individual', value: '4' },
    { name: 'Gold Wage', value: '5' },
    { name: 'Corporate', value: '6' },
    { name: 'Group', value: '7' },

  ];

  public leadFilterDateType = [
    { name: 'All', value: '5' },
    { name: 'Daily', value: '1' },
    { name: 'Weekly', value: '2' },
    { name: 'Monthly', value: '3' },
    { name: 'Yearly', value: '4' },

  ];

  public leadFilterSLA = [
    { name: 'All', value: '4' },
    { name: 'Less Than 30 days', value: '1' },
    { name: '30 days to 60 days', value: '2' },
    { name: 'Above 60 days', value: '3' },
  ];

  public quoteStatus = [
    { name: 'All', value: '8' },
    { name: 'New', value: '1' },
    { name: 'Approved', value: '2' },
    { name: 'Rejected', value: '3' },
    { name: 'Pending Approval', value: '4' },
    { name: 'Accepted', value: '5' },
    { name: 'Declined', value: '6' },
    { name: 'Quoted', value: '7' },

  ];

  public selectedStatusType: any;
  public selectedGroup: any;
  public selectedBrokerage: any;
  public selectedWeek: any
  public selectedLeadStatus: any;
  public selectedLeadClientType: any;
  public selectedLeadFilterDateType: any;
  public selectedLeadFilterSLA: any;
  public selectedQuoteStatus: any;
  public selectedLeadFilterProduct: any;

  public LeadID: any;

  constructor(
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder,
    private productService: ProductService,
    private readonly policyService: PolicyService,
    private readonly brokerageService: BrokerageService,
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
    this.showExport = false;
    this.productItem = new Product();
    this.productService.getProducts().subscribe(products => {
      this.productList = products.sort(this.comparer);
      this.productList.unshift(this.getOperationalProduct());
    });
    this.policyService.getCompaniesWithPolicy().subscribe(groups => {
      this.groupList = groups;
    });
    this.brokerageService.getBrokeragesWithAllOption().subscribe(brokerage => {
      this.brokerageList = brokerage;
    });

    if (this.selectedStatusType === undefined) {
      this.selectedStatusType = this.statusTypes.filter(i => i.value === '1')[0];
    }

    if (this.selectedWeek === undefined) {
      this.selectedWeek = this.week.filter(i => i.value === '1')[0];
    }

    this.leadReportTypes.sort((n, v) => (n.name > v.name) ? 1 : -1);

    if (this.LeadID === undefined) {
      this.LeadID = 1;
    }
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

  createForm() {
    this.form = this.formBuilder.group({
      leadReportTypes: [null],
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

  productChanged($event: any) {
    this.productItem = $event.value;
  }

  leadReportTypeChanged($event: any) {
    this.selectedReportType = this.leadReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extensionAudit = '';
    this.showReportFilters();
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

  showReportFilters(): void {
    switch (this.selectedReportType.value) {
      case 'RMALeadStatusReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isLeadStatus = true;
        this.isLeadClientType = true;
        this.isLeadFilterDateType = true;
        this.isLeadFilterSLA = false;
        this.isLeadFilterProduct = true;
        this.isLeadID = false;
        this.isQuoteStatus = false;
        break;
      case 'RMALeadAgeAnalysisReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isLeadStatus = true;
        this.isLeadClientType = true;
        this.isLeadFilterDateType = false;
        this.isLeadFilterSLA = true;
        this.isLeadFilterProduct = false;
        this.isLeadID = false;
        this.isQuoteStatus = false;
        break;
      case 'RMALeadAuditTrailReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isLeadStatus = false;
        this.isLeadClientType = true;
        this.isLeadFilterDateType = false;
        this.isLeadFilterSLA = false;
        this.isLeadFilterProduct = false;
        this.isLeadID = true;
        this.isQuoteStatus = false;
        break
      case 'RMAQuoteAgeAnalysisReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isLeadStatus = false;
        this.isLeadClientType = true;
        this.isLeadFilterDateType = true;
        this.isLeadFilterSLA = true;
        this.isLeadFilterProduct = false;
        this.isLeadID = false;
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

  filterValues() {
    if (this.selectedLeadStatus != undefined) {
      this.leadStatusParam = this.selectedLeadStatus.value;
    }
    if (this.selectedLeadClientType != undefined) {
      this.clientTypeParam = this.selectedLeadClientType.value;
    }
    if (this.selectedLeadFilterSLA != undefined) {
      this.slaParam = this.selectedLeadFilterSLA.value;
    }
    if (this.selectedQuoteStatus != undefined) {
      this.quoteStatusParam = this.selectedQuoteStatus.value;
    }
    if (this.selectedLeadFilterDateType != undefined) {
      this.periodTypeParam = this.selectedLeadFilterDateType.value;
    }
    if (this.selectedLeadFilterProduct != undefined) {
      this.productParam = this.selectedLeadFilterProduct;
    }
  }

  viewReport() {
    this.isDownload = 'false';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare/' + this.selectedReportType.value;

    this.filterValues();

    if (this.selectedReportType.value == 'RMALeadStatusReport') {
      this.parametersAudit = {
        LeadStatusId: this.leadStatusParam,
        ClientTypeId: this.clientTypeParam,
        FilterDateType: this.periodTypeParam,
        LeadStartDate: this.start,
        LeadEndDate: this.end,
        ProductId: this.productParam
      };
    }

    if (this.selectedReportType.value == 'RMALeadAgeAnalysisReport') {
      this.parametersAudit = {
        LeadStatusId: this.leadStatusParam,
        ClientTypeId: this.clientTypeParam,
        SLA: this.slaParam,
        LeadStartDate: this.start,
        LeadEndDate: this.end
      };
    }

    if (this.selectedReportType.value == 'RMALeadAuditTrailReport') {
      this.parametersAudit = {
        ClientTypeID: this.selectedLeadClientType.value,
        LeadStartDate: this.start,
        LeadEndDate: this.end
      };
    }

    if (this.selectedReportType.value == 'RMAQuoteAgeAnalysisReport') {
      this.reportUrlAudit = 'RMA.Reports.ClientCare.Quote/' + this.selectedReportType.value;
      this.parametersAudit = {
        QuoteStatusId: this.quoteStatusParam,
        ClientTypeId: this.clientTypeParam,
        SLA: this.slaParam,
        QuoteStartDate: this.start,
        QuoteEndDate: this.end,
        PeriodType: this.periodTypeParam
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
    this.isDownload = 'true';
    this.showReport = false;
    this.isDownloading = true;
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare/' + this.selectedReportType.value;

    this.filterValues();

    if (this.selectedReportType.value == 'RMALeadStatusReport') {
      this.parametersAudit = {
        LeadStatusId: this.leadStatusParam,
        ClientTypeId: this.clientTypeParam,
        FilterDateType: this.selectedLeadFilterDateType.value,
        LeadStartDate: this.start,
        LeadEndDate: this.end,
        ProductId: this.productParam
      };
    }

    if (this.selectedReportType.value == 'RMALeadAgeAnalysisReport') {
      this.parametersAudit = {
        LeadStatusId: this.leadStatusParam,
        ClientTypeId: this.clientTypeParam,
        SLA: this.slaParam,
        LeadStartDate: this.start,
        LeadEndDate: this.end
      };
    }

    if (this.selectedReportType.value == 'RMALeadAuditTrailReport') {
      this.parametersAudit = {
        ClientTypeID: this.selectedLeadClientType.value,
        LeadStartDate: this.start,
        LeadEndDate: this.end
      };
    }

    if (this.selectedReportType.value == 'RMAQuoteAgeAnalysisReport') {
      this.reportUrlAudit = 'RMA.Reports.ClientCare.Quote/' + this.selectedReportType.value;
      this.parametersAudit = {
        QuoteStatusId: this.quoteStatusParam,
        ClientTypeId: this.clientTypeParam,
        SLA: this.slaParam,
        QuoteStartDate: this.start,
        QuoteEndDate: this.end,
        PeriodType: this.periodTypeParam
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

  leadStatusChanged(event: any) {
    this.selectedLeadStatus = event.value;
  }

  quoteStatusChanged(event: any) {
    this.selectedQuoteStatus = event.value;
  }

  leadClientTypeChanged(event: any) {
    this.selectedLeadClientType = event.value;
  }

  leadFilterDateientTypeChanged(event: any) {
    this.selectedLeadFilterDateType = event.value;
  }

  leadIdChanged(LeadId: string) {
    this.LeadID = LeadId;
  }

  getCurrentYear() {
    return (new Date()).getFullYear();
  }

  getCurrentMonth() {
    return (new Date()).getMonth();
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

  groupChanged(event: any) {
    this.selectedLeadStatus = event.value;
  }

  selectedBrokerageChanged(event: any) {
    this.selectedBrokerage = event.value;
  }

  selectedStatusChanged($event: any) {
    this.selectedStatusType = this.statusTypes.filter(i => i.value === $event.value.value)[0];
  }

  selectedWeekChanged($event: any) {
    this.selectedWeek = this.week.filter(i => i.value === $event.value.value)[0];
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
    this.endMinDate = this.startDate;
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }

  leadFilterSLAChanged(event: any) {
    this.selectedLeadFilterSLA = event.value;
  }

  leadFilterProductChanged(event: any) {
    this.selectedLeadFilterProduct = event.value;
  }

  leadPeriodTypeChanged(event: any) {
    this.selectedLeadFilterDateType = event.value;
  }
}
