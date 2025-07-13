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
import { RepresentativeService } from '../../../broker-manager/services/representative.service';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { Company } from '../../../policy-manager/shared/entities/company';

@Component({
  selector: 'app-policy-manager-reports',
  templateUrl: './policy-manager-reports.component.html',
  styleUrls: ['./policy-manager-reports.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class PolicyManagerReportsComponent implements OnInit {
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
  showProductId = false;
  productList: Product[] = [];
  productItem: Product;
  productId: Product;
  groupList: any[];
  brokerageList: any[] = [];
  policyNumber: string;
  juristicRepList: any[] = [];

  public policyReportTypes = [
    { name: 'Active Funeral Lives', value: 'RMAActiveFuneralLivesReport' },
    { name: 'Agent Lapse Ratio', value: 'RMAAgentLapseRatio' },
    { name: 'Broker Scheme Onboarding Report', value: 'RMABrokerSchemeOnboardingReport' },
    { name: 'Broker Performance Report', value: 'RMABrokerPerformanceReport' },
    { name: 'Brokerage Lapse Ratio', value: 'RMABrokerageLapseRatio' },
    { name: 'Business Year to Date', value: 'RMABusinessYeartoDateReport' },
    { name: 'Child Allocation Unmet Report', value: 'RMAChildAllocationUnmetReport' },
    { name: 'Conduct of Business Return', value: 'RMAConductOfBusinessReturnReport' },
    { name: 'Consolidated Funeral Rejection Report', value: 'ConsolidatedFuneralRejectionReport' },
    { name: 'Consolidated Funeral Weekly Summary', value: 'ConsolidatedFuneralSummaryReport' },
    { name: 'My Value Plus Rejection Report', value: 'MyValuePlusRejectionReport' },
    { name: 'My Value Plus Weekly Summary', value: 'MyValuePlusSummaryReport' },
    { name: 'Corporate Groups Unpaid ', value: 'RMACorporateGroupsUnpaidReport' },
    { name: 'Current Group Schemes', value: 'RMACurrentGroupSchemes' },
    { name: 'Group Scheme Lapse Ratio', value: 'RMAGroupSchemeLapseRatio' },
    { name: 'Group Scheme Bank Report', value: 'RMAGroupSchemeBankReport' },
    { name: 'Group Scheme Summary', value: 'RMAGroupSchemeSummary' },
    { name: 'Inception Date Changes', value: 'RMAPolicyInceptionDateChanges' },
    { name: 'Individual Member List', value: 'RMAIndividualMemberList' },
    { name: 'Individual Unmet Report', value: 'RMAIndividualUnmetReport' },
    { name: 'Intermediary Unmet Premiums', value: 'RMAIntermediaryUnmetPremiums' },
    { name: 'Lapse Persistency Ratio', value: 'RMALapsePesistencyRatioReport' },
    { name: 'Main Member Report', value: 'RMAMainMembersReport' },
    { name: 'Monthly Active And Lapsed Policies per Broker', value: 'RMAMonthlyActiveAndLapsedPoliciesperBrokerReport' },
    { name: 'Onboarding Wizards without Policies', value: 'RmaPremiumListingWizardsWithoutPolicies' },
    { name: 'Overage Member Report', value: 'RMAOverAgeReminderReport' },
    { name: 'Payment Schedule Per Broker', value: 'RMAPaymentSchedulePerBrokerReport' },
    { name: 'Policy Acturial Movements Status Report', value: 'RMAPolicyActuarialMovementsReport' },
    { name: 'Policy Audit Report', value: 'RMAPolicyAuditReport' },
    { name: 'Policy Audit Trail Report', value: 'RMAPolicyAuditTrail' },
    { name: 'Policy Cancellation Report', value: 'RMACancellationReport' },
    { name: 'Policy EFT Report', value: 'RMAPolicyEFTReport' },
    { name: 'Policy Maintenance Changes Report', value: 'RMAPolicyMaintenanceChangesReport' },
    { name: 'Policy Notifications Report', value: 'RMANotificationsReport' },
    { name: 'Policy Premium Report', value: 'RMAPremiumReport' },
    { name: 'Policy Process Turnaround Report', value: 'PolicyProcessTurnaroundReport' },
    { name: 'Policy Status Report', value: 'RMAMemberPolicyStatusReport' },
    { name: 'Premium Movement Report', value: 'RMAPremiumMovementReport' },
    { name: 'PremiumListings Unpaid Report', value: 'RMAGroupPremiumListingsUnpaidReport' },
    { name: 'Sales Performance Report', value: 'RMASalesPerfomanceReport' },
    { name: 'Scheme Performance Report', value: 'RMASchemePerformanceReport' },
    { name: 'Threshold Cap Cover Report', value: 'RMAThresholdCapCoverReport' },
    { name: 'Waived Premiums', value: 'RMAWaivedPremiums' },
    { name: 'Wizard Cases Report', value: 'RMAPolicyManagerWizardCasesReport' },
    { name: 'Scheme Master Report', value: 'RMASchemeMasterReport' },
    { name: 'Group Risk Oustanding Premiums Report', value: 'RMAOustandingPremiumsReport' },
    { name: 'Premium Analysis Report', value: 'RMAPremiumAnalysisReport' },
    { name: 'Premium Recon Report', value: 'RMAPremiumReconReport' }
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
  PolicyNo: UntypedFormControl;
  startMaxDate: Date;
  endMinDate: Date;
  hideYearMonthFilter = false;
  isDateFilterVisble = false;
  isStatusTypesVisible = false;
  showPolicyNo = false;
  isGroupVisible = false;
  isHideToMonthVisible = false;
  isBrokerageVisible = false;
  isWeekVisible = false;
  isMemberType = false;
  isPeriodTypeFilter = false;
  isMemberPolicyStatus = false;
  isActive = false;
  isJuristicVisible = false;
  isMovement = false;
  isPeriodFilter = false;
  memberClientTypeParam: any;
  productFilterParam: any;
  periodTypeParam: any;
  memberPolicyStatusParam: any; 
  selectedMonthName: any;

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

  public memberPolicyStatus = [
    { name: 'All', value: '0' },
    { name: 'Active', value: '1' },
    { name: 'Awaiting first premium', value: '8' },
    { name: 'Policy not taken up', value: '13' },
    { name: 'Cancelled', value: '2' },
    { name: 'Lapsed', value: '5' }
  ];

  public memberClietType = [
    { name: 'All', value: '3' },
    { name: 'Individual', value: '1' },
    { name: 'Corporate', value: '0' },
  ];

  public periodTypeFilter = [
    { name: 'All', value: '5' },
    { name: 'Daily', value: '1' },
    { name: 'Weekly', value: '2' },
    { name: 'Monthly', value: '3' },
    { name: 'Yearly', value: '4' }
  ];

  public selectedStatusType: any;
  public selectedGroup: any;
  public selectedBrokerage: any;
  public selectedWeek: any;
  public selectedPeriodTypeFilter: any;
  public selectedMemberClientType: any;
  public selectedMemberPolicyStatusType: any;
  public selectedJuristicRep: any;
  public selectedDateType: any;

  private brokerages: Brokerage[];
  private companies: Company[];
  private selectedBrokerageId: number = 0;
  private selectedGroupId: number = 0;

  constructor(
    private lookupService: LookupService,
    private formBuilder: UntypedFormBuilder,
    private productService: ProductService,
    private readonly policyService: PolicyService,
    private readonly brokerageService: BrokerageService,
    private readonly representativeService: RepresentativeService,
    public datePipe: DatePipe,
  ) {
    this.createForm();
    this.setPastDates();
  }

  ngOnInit() {
    this.isDownload = 'false';
    this.getYears();
    this.getMonthNames();
    this.selectedMonthName = this.months[this.selectedMonth].name;
    this.createForm();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
    this.showExport = false;
    this.productItem = new Product();
    this.productId = new Product();
    this.productService.getProducts().subscribe(products => {
      this.productList = products;
      this.productList.unshift(this.getOperationalProduct());
    });
    this.policyService.getCompaniesWithPolicy().subscribe(groups => {
      this.groupList = groups;
      this.groupList.splice(0, 0, 'ALL');
    });

    this.representativeService.getJuristicRepresentativesActivePolicies().subscribe(juristic => {
      this.juristicRepList = juristic;
    });
   
    this.brokerageService.getBrokeragesWithAllOption().subscribe(brokerage => {
      this.brokerageList = brokerage;
    });

    this.brokerageService.getBrokerages().subscribe(data => {
      this.brokerages = data;
    });

    this.policyService.getFuneralPolicyCompanies().subscribe(data => {
      this.companies = data;
    })

    if (this.selectedStatusType === undefined) {

      this.selectedStatusType = this.statusTypes.filter(i => i.value === '1')[0];
    }
    if (this.selectedWeek === undefined) {
      this.selectedWeek = this.week.filter(i => i.value === '1')[0];
    }

    this.policyReportTypes.sort((n, v) => (n.name > v.name) ? 1 : -1);

    if (this.selectedMemberClientType === undefined) {
      this.selectedMemberClientType = this.memberClietType.filter(i => i.value === '3')[0];
    }

    if (this.productItem === undefined) {
      this.productItem = this.productList.filter(i => i.id === 0)[0];
    }

    if (this.productId === undefined) {
      this.productId = this.productList.filter(i => i.id === 0)[0];
    }

    if (this.selectedPeriodTypeFilter === undefined) {
      this.selectedPeriodTypeFilter = this.periodTypeFilter.filter(i => i.value === '5')[0];
    }

    if (this.selectedMemberPolicyStatusType === undefined) {
      this.selectedMemberPolicyStatusType = this.memberPolicyStatus.filter(i => i.value === '0')[0];
    }

  }

  getOperationalProduct(): Product {
    const product = new Product();
    product.id = 0;
    product.name = 'All';
    return product;
  }

  createForm() {
    this.form = this.formBuilder.group({
      policyReportTypes: [null],
      months: [null],
      toMonths: [null],
      years: [null],
      startDt: new UntypedFormControl(''),
      endDt: new UntypedFormControl(''),
      PolicyNo: new UntypedFormControl('')
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

  productIdChanged($event: any) {
    this.productId = $event.value.id;
  }

  policyReportTypeChanged($event: any) {
    this.selectedReportType = this.policyReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extensionAudit = '';
    if (this.selectedReportType.value === 'RMAOverAgeReminderReport') {
      this.setFutureDates();
      // Set brokerage default value to "All"

    } else {
      this.setPastDates();
    }
    this.showReportFilters();
  }

  private setFutureDates(): void {
    // Set start date to the start of the current month
    this.startDate = new Date();
    this.startDate.setHours(0, 0, 0, 0);
    this.startDate.setDate(1);
    // Set the end date to the end of the current month
    this.endDate = new Date(this.startDate);
    this.endDate.setHours(0, 0, 0, 0);
    this.endDate.setMonth(this.endDate.getMonth() + 1);
    this.endDate.setDate(this.endDate.getDate() - 1);
    // Set the min and max dates
    this.startMaxDate = new Date(this.startDate);
    this.startMaxDate.setMonth(this.startMaxDate.getMonth() + 3);
    this.endMinDate = new Date(this.startDate);
    this.setDateControls();
  }

  private setPastDates(): void {
    this.startDate = new Date();
    this.startDate.setHours(0, 0, 0, 0);
    // Set the endDate to tomorrow
    this.endDate = new Date();
    this.endDate.setHours(0, 0, 0, 0);
    this.endDate.setDate(this.endDate.getDate() + 1);
    // Set the startDate three months back
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    // Set the min and max dates
    this.startMaxDate = new Date();
    this.startMaxDate.setHours(0, 0, 0, 0);
    this.endMinDate = new Date(this.startDate);
    this.setDateControls();
  }

  private setDateControls(): void {
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    this.endDt = new UntypedFormControl(this.endDate);
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
    this.showPolicyNo = false;

    switch (this.selectedReportType.value) {
      case 'RMAIntermediaryUnmetPremiums':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = false;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = true;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.isJuristicVisible = false;
        this.isPeriodFilter = false;
        this.isPeriodTypeFilter = false;
        this.showProductId = false;
        break;
      case 'RMAActiveFuneralLivesReport':
      case 'RMAIndividualUnmetReport':
      case 'RMACorporateGroupsUnpaidReport':
      case 'RMAConductOfBusinessReturnReport':
      case 'RMAPremiumMovementReport':
      case 'RMABrokerSchemeOnboardingReport':
      case 'ConsolidatedFuneralRejectionReport':
      case 'ConsolidatedFuneralSummaryReport':
      case 'MyValuePlusRejectionReport':
      case 'MyValuePlusSummaryReport':
      case 'PolicyProcessTurnaroundReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.isJuristicVisible = false;
        this.isPeriodTypeFilter = false;
        break;
      case 'RMAMonthlyActiveAndLapsedPoliciesperBrokerReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = true;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RMALapsePesistencyRatioReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RMAPaymentSchedulePerBrokerReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = false;
        this.isGroupVisible = true;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showPolicyNo = false;
        this.isPeriodFilter = false;
        this.isJuristicVisible = false;
        this.showProductId = false;
        break;
      case 'RMACorporateGroupsUnpaidReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RMABusinessYeartoDateReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = true;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RmaPremiumListingWizardsWithoutPolicies':
      case 'RMADetailedLivesInsuredReport':
      case 'RMAGroupSchemeBankReport':
      case 'RMAGroupSchemeSummary':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = false;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RMAMemberPolicyStatusReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = true;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = true;
        this.isPeriodTypeFilter = true;
        this.isMemberPolicyStatus = true;
        this.isActive = false;
        break;
      case 'RMAPolicyAuditTrail':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = true;
        this.isPeriodTypeFilter = true;
        this.isMemberPolicyStatus = true;
        this.isActive = true;
        this.isJuristicVisible = false;
        this.showProductId = false;
        this.isPeriodFilter = false;
        break;
      case 'RMAPolicyAuditReport':
      case 'RMANotificationsReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showPolicyNo = true;
        this.showProductId = false;
        this.isJuristicVisible = false;
        this.isPeriodTypeFilter = false;
        break;
      case 'RMASalesPerfomanceReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = true;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = true;
        this.showPolicyNo = false;
        break;
      case 'RMAPolicyEFTReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = true;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showPolicyNo = false;
        this.showProductId = false;
        this.isPeriodTypeFilter = false;
        break;
      case 'RMACancellationReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = true;
        this.isPeriodTypeFilter = true;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showProductId = false;
        this.isPeriodTypeFilter = false;
        this.isJuristicVisible = false;
        break;
      case 'RMAPremiumReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = true;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = true;
        this.isPeriodTypeFilter = true;
        this.isMemberPolicyStatus = false;
        this.isActive = true;
        break;
      case 'RMAMainMembersReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = true;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = true;
        this.isJuristicVisible = false;
        break;
      case 'RMAOverAgeReminderReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = true;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RMAGroupPremiumListingsUnpaidReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = true;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showPolicyNo = false;
        break;
      case 'RMAPolicyActuarialMovementsReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.showPolicyNo = true;
        this.showProducts = false;
        this.showProductId = true;
        this.productNameFilter = false;
        this.isBrokerageVisible = true;
        this.isStatusTypesVisible = false;
        this.isDateFilterVisble = true;
        this.isJuristicVisible = true;
        this.isWeekVisible = false;
        this.isGroupVisible = true;
        this.isActive = false;
        this.isMovement = true;
        break;
      case 'RMAChildAllocationUnmetReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = true;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        break;
      case 'RMAThresholdCapCoverReport':
        this.hideYearMonthFilter = true;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = false;
        this.isGroupVisible = true;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showPolicyNo = false;
        this.isPeriodFilter = false;
        this.isJuristicVisible = false;
        this.showProductId = false;
        break;
      case 'RMAPolicyMaintenanceChangesReport':
      case 'RMAPolicyManagerWizardCasesReport':
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = true;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isWeekVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.isActive = false;
        this.showPolicyNo = false;
        this.isPeriodFilter = false;
        this.isJuristicVisible = false;
        this.showProductId = false;
        break;
      default:
        this.hideYearMonthFilter = false;
        this.isHideToMonthVisible = false;
        this.isDateFilterVisble = false;
        this.isGroupVisible = false;
        this.isBrokerageVisible = false;
        this.showProducts = false;
        this.isStatusTypesVisible = false;
        this.isMemberType = false;
        this.isPeriodTypeFilter = false;
        this.isMemberPolicyStatus = false;
        this.showPolicyNo = false;
        this.isJuristicVisible = false;
        this.isPeriodFilter = false;
        this.showProductId = false;
    }
  }

  viewReport() {
    this.isDownload = 'false';
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.selectedReportType.value;
    if (this.productItem !== null) {
      this.productNameFilter = this.productItem.name;
    } else {
      this.productNameFilter = null;
    }

    if (this.selectedReportType.value === 'RMAIntermediaryUnmetPremiums') {
      this.parametersAudit = {
        month: this.selectedMonth + 1,
        year: this.selectedYear,
        productName: this.productNameFilter
      };
    } else {
      this.parametersAudit = {
        month: this.selectedMonth + 1,
        year: this.selectedYear
      };
    }

    if (this.selectedReportType.value === 'RMAActiveFuneralLivesReport'
      || this.selectedReportType.value === 'RMAIndividualUnmetReport'
      || this.selectedReportType.value === 'RMACorporateGroupsUnpaidReport'
      || this.selectedReportType.value === 'RMAConductOfBusinessReturnReport'
      || this.selectedReportType.value === 'RMAPremiumMovementReport'
      || this.selectedReportType.value === 'RMABrokerSchemeOnboardingReport'
      || this.selectedReportType.value === 'PolicyProcessTurnaroundReport'
      || this.selectedReportType.value === 'ConsolidatedFuneralRejectionReport'
      || this.selectedReportType.value === 'ConsolidatedFuneralSummaryReport'
      || this.selectedReportType.value === 'MyValuePlusRejectionReport'
      || this.selectedReportType.value === 'MyValuePlusSummaryReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMABrokerPerformanceReport') {
      this.parametersAudit = { ReportingMonth: this.selectedMonthName, ReportingYear: this.selectedYear };
    }
    if (this.selectedReportType.value === 'RMAMonthlyActiveAndLapsedPoliciesperBrokerReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end, Status: this.selectedStatusType.value };
    }
    if (this.selectedReportType.value === 'RMALapsePesistencyRatioReport') {
      this.parametersAudit = { Brokerage: this.selectedBrokerage, StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMAOverAgeReminderReport') {
      this.parametersAudit = { Brokerage: this.selectedBrokerage ? this.selectedBrokerage : 'ALL', StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMABusinessYeartoDateReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end, Week: this.selectedWeek.value };
    }
    if (this.selectedReportType.value === 'RMAPolicyAuditReport'
      || this.selectedReportType.value === 'RMANotificationsReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end, PolicyNumber: this.policyNumber };
    }
    if (this.selectedReportType.value === 'RMADetailedLivesInsuredReport' 
      || this.selectedReportType.value === 'RmaPremiumListingWizardsWithoutPolicies'
      || this.selectedReportType.value === 'RMAGroupSchemeBankReport' 
      || this.selectedReportType.value === 'RMAGroupSchemeSummary') {
      this.parametersAudit = {};
    }
    if (this.selectedReportType.value === 'RMAMemberPolicyStatusReport') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        Product: this.productFilterParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end,
        PolicyStatus: this.memberPolicyStatusParam
      };
    }
    if (this.selectedReportType.value === 'RMAPolicyAuditTrail') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end,
        PolicyStatusId: this.memberPolicyStatusParam
      };
    }
    if (this.selectedReportType.value === 'RMACancellationReport') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end
      };
    }
    if (this.selectedReportType.value === 'RMASalesPerfomanceReport') {
      this.filterValues();
      this.parametersAudit = {
        SchemeName: this.selectedGroup,
        BrokerName: this.selectedBrokerage,
        StartDate: this.start,
        EndDate: this.end,
        Status: this.selectedStatusType.value
      };
    }
    if (this.selectedReportType.value === 'RMASchemePerformanceReport'){
      this.parametersAudit = { ReportingMonth: this.selectedMonthName, ReportingYear: this.selectedYear };
    }
    if (this.selectedReportType.value === 'RMAPaymentSchedulePerBrokerReport') {
      this.filterValues();
      this.parametersAudit = {
        Group: this.selectedGroupId,
        Brokerage: this.selectedBrokerageId
      };
    }
    if (this.selectedReportType.value === 'RMAPolicyEFTReport') {
      this.filterValues();
      this.parametersAudit = {
        Group: this.selectedGroup,
        Brokerage: this.selectedBrokerage,
        StartDate: this.start,
        EndDate: this.end
      };
    }
    if (this.selectedReportType.value === 'RMAPremiumReport') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        Product: this.productFilterParam === undefined ? '0' : this.productFilterParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end,
        PolicyStatus: this.memberPolicyStatusParam
      };
    }
    if (this.selectedReportType.value === 'RMAMainMembersReport') {
      this.filterValues();
      this.parametersAudit = {
        Brokerage: this.selectedBrokerage,
        Group: this.selectedGroup,
        Status: this.selectedStatusType.value,
        StartDate: this.start,
        EndDate: this.end
      };
    }
    if (this.selectedReportType.value === 'RMAGroupPremiumListingsUnpaidReport') {
      this.filterValues();
      this.parametersAudit = {
        GroupPolicyNumber: this.policyNumber,
        StartDate: this.start,
        EndDate: this.end
      };
    }
    if (this.selectedReportType.value === 'RMAPolicyActuarialMovementsReport') {
      this.filterValues();
      this.parametersAudit = {
        PolicyNumber: this.PolicyNo,
        Brokerage: this.selectedBrokerage,
        Group: this.selectedGroup,
        StartDate: this.start,
        EndDate: this.end,
        JuristicRep: this.selectedJuristicRep,
        ProductId: this.productId,
        DateType: this.selectedDateType
      };
    }
    if (this.selectedReportType.value === 'RMAChildAllocationUnmetReport') {
      this.filterValues();
      this.parametersAudit = {
        Group: this.selectedGroup,
        StartDate: this.start,
        EndDate: this.end
      };
    }
    if (this.selectedReportType.value === 'RMAThresholdCapCoverReport') {
      this.filterValues();
      this.parametersAudit = {
        Group: this.selectedGroup
      };
    }
    if (this.selectedReportType.value === 'RMAPolicyManagerWizardCasesReport' || this.selectedReportType.value === 'RMAPolicyMaintenanceChangesReport') {
      this.filterValues();
      this.parametersAudit = {
        StartDate: this.start,
        EndDate: this.end
      };
    }
    this.showParametersAudit = 'false';
    this.formatAudit = 'PDF';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }

  filterValues() {
    if (this.selectedMemberClientType !== undefined) {
      this.memberClientTypeParam = this.selectedMemberClientType.value;
    }
    if (this.productItem !== undefined) {
      this.productFilterParam = this.productItem.id;
    }
    if (this.selectedPeriodTypeFilter !== undefined) {
      this.periodTypeParam = this.selectedPeriodTypeFilter.value;
    }
    if (this.selectedMemberPolicyStatusType !== undefined) {
      this.memberPolicyStatusParam = this.selectedMemberPolicyStatusType.value;
    }

    if (this.selectedBrokerage !== undefined) {
      const brokerage = this.brokerages.find(b => b.name.toUpperCase() === this.selectedBrokerage.toUpperCase());
      this.selectedBrokerageId = brokerage ? brokerage.id : 0;
    } else {
      this.selectedBrokerageId = 0;
    }

    if (this.selectedGroup !== undefined) {
      const company = this.companies.find(s => s.name.toUpperCase() === this.selectedGroup.toUpperCase());
      this.selectedGroupId = company ? company.rolePlayerId : 0;
    } else {
      this.selectedGroupId = 0;
    }
  }

  exportReport() {
    this.isDownload = 'true';
    this.showReport = false;
    this.isDownloading = true;
    this.reportTitle = this.selectedReportType.name;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.selectedReportType.value;

    if (this.productItem !== null) {
      this.productNameFilter = this.productItem.name;
    } else {
      this.productNameFilter = null;
    }

    if (this.selectedReportType.value === 'RMAIntermediaryUnmetPremiums') {
      this.parametersAudit = {
        month: this.selectedMonth + 1,
        year: this.selectedYear,
        productName: this.productNameFilter
      };
    } else {
      this.parametersAudit = {
        month: this.selectedMonth + 1,
        year: this.selectedYear
      };
    }
    if (this.selectedReportType.value === 'RMAActiveFuneralLivesReport'
      || this.selectedReportType.value === 'RMAIndividualUnmetReport'
      || this.selectedReportType.value === 'RMABusinessYeartoDateReport'
      || this.selectedReportType.value === 'RMAConductOfBusinessReturnReport'
      || this.selectedReportType.value === 'RMAPremiumMovementReport'
      || this.selectedReportType.value === 'ConsolidatedFuneralRejectionReport'
      || this.selectedReportType.value === 'ConsolidatedFuneralSummaryReport'
      || this.selectedReportType.value === 'MyValuePlusRejectionReport'
      || this.selectedReportType.value === 'MyValuePlusSummaryReport'
      || this.selectedReportType.value === 'PolicyProcessTurnaroundReport'
      || this.selectedReportType.value === 'RMABrokerSchemeOnboardingReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMABrokerPerformanceReport') {
      this.parametersAudit = { ReportingMonth: this.selectedMonthName, ReportingYear: this.selectedYear };
    }
    if (this.selectedReportType.value === 'RMAMonthlyActiveAndLapsedPoliciesperBrokerReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end, Status: this.selectedStatusType.value };
    }
    if (this.selectedReportType.value === 'RMALapsePesistencyRatioReport') {
      this.parametersAudit = { Brokerage: this.selectedBrokerage, StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMAOverAgeReminderReport') {
      this.parametersAudit = { Brokerage: this.selectedBrokerage, StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMAPaymentSchedulePerBrokerReport') {
      this.parametersAudit = { Group: this.selectedGroupId, Brokerage: this.selectedBrokerageId };
    }
    if (this.selectedReportType.value === 'RMAPolicyEFTReport') {
      this.parametersAudit = { Group: this.selectedGroup, Brokerage: this.selectedBrokerage, StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMAChildAllocationUnmetReport') {
      this.parametersAudit = { Group: this.selectedGroup, StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMABusinessYeartoDateReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end, Week: this.selectedWeek.value };
    }
    if (this.selectedReportType.value === 'RMAPolicyAuditReport'
      || this.selectedReportType.value === 'RMANotificationsReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end, PolicyNumber: this.policyNumber };
    }
    if (this.selectedReportType.value === 'RMADetailedLivesInsuredReport' 
      || this.selectedReportType.value === 'RmaPremiumListingWizardsWithoutPolicies'
      || this.selectedReportType.value === 'RMAGroupSchemeBankReport'
      || this.selectedReportType.value === 'RMAGroupSchemeSummary') {
      this.parametersAudit = {};
    }
    if (this.selectedReportType.value === 'RMAThresholdCapCoverReport') {
      this.parametersAudit = { Group: this.selectedGroup };
    }
    if (this.selectedReportType.value === 'RMAPolicyManagerWizardCasesReport' || this.selectedReportType.value === 'RMAPolicyMaintenanceChangesReport') {
      this.parametersAudit = { StartDate: this.start, EndDate: this.end };
    }
    if (this.selectedReportType.value === 'RMAMemberPolicyStatusReport') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        Product: this.productFilterParam === undefined ? '0' : this.productFilterParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end,
        PolicyStatus: this.memberPolicyStatusParam
      };
    }

    if (this.selectedReportType.value === 'RMAPolicyAuditTrail') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end,
        PolicyStatusId: this.memberPolicyStatusParam
      };
    }

    if (this.selectedReportType.value === 'RMACancellationReport') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end
      };
    }

    if (this.selectedReportType.value === 'RMAPremiumReport') {
      this.filterValues();
      this.parametersAudit = {
        ClientTypeId: this.memberClientTypeParam,
        Product: this.productFilterParam === undefined ? '0' : this.productFilterParam,
        PeriodType: this.periodTypeParam,
        StartDate: this.start,
        EndDate: this.end,
        PolicyStatus: this.memberPolicyStatusParam
      };
    }

    if (this.selectedReportType.value === 'RMAPolicyActuarialMovementsReport') {
      this.filterValues();
      this.parametersAudit = {
        PolicyNumber: this.PolicyNo,
        Brokerage: this.selectedBrokerage,
        Group: this.selectedGroup,
        StartDate: this.start,
        EndDate: this.end,
        JuristicRep: this.selectedJuristicRep,
        ProductId: this.productId,
        DateType: this.selectedDateType
      };
    }

    if (this.selectedReportType.value === 'RMASchemePerformanceReport') {
      this.parametersAudit = { ReportingMonth: this.selectedMonthName, ReportingYear: this.selectedYear };
    }

    this.showParametersAudit = 'false';
    this.formatAudit = this.selectedReportFormat;
    this.extensionAudit = this.extensionAudit;
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
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
    this.months = [
      { name: 'January', value: 0 },
      { name: 'February', value: 1 },
      { name: 'March', value: 2 },
      { name: 'April', value: 3 },
      { name: 'May', value: 4 },
      { name: 'June', value: 5 },
      { name: 'July', value: 6 },
      { name: 'August', value: 7 },
      { name: 'September', value: 8 },
      { name: 'October', value: 9 },
      { name: 'November', value: 10 },
      { name: 'December', value: 11 }
    ];
    this.toMonths = [
      { name: 'January', value: 0 },
      { name: 'February', value: 1 },
      { name: 'March', value: 2 },
      { name: 'April', value: 3 },
      { name: 'May', value: 4 },
      { name: 'June', value: 5 },
      { name: 'July', value: 6 },
      { name: 'August', value: 7 },
      { name: 'September', value: 8 },
      { name: 'October', value: 9 },
      { name: 'November', value: 10 },
      { name: 'December', value: 11 }
    ];
  }

  getCurrentYear() {
    return (new Date()).getFullYear();
  }

  getCurrentMonth() {
    return (new Date()).getMonth();
  }

  yearsTypeChanged(event: any) {
    this.selectedYear = event.value;   
    this.setDateRange();
  }

  monthsTypeChanged(event: any) {
    this.selectedMonth = event.value; 
    this.setSelectedMonthName(this.selectedMonth);
    this.setDateRange();
  }

  private setDateRange(): void {
    this.startDate = new Date(this.selectedYear, this.selectedMonth, 1);
    this.endDate = new Date(this.startDate);
    this.endDate.setMonth(this.startDate.getMonth() + 1);
    this.endDate.setDate(0);
    this.setDateControls();
  }

  toMonthsTypeChanged(event: any) {
    this.toSelectedMonth = event.value;
  }

  groupChanged(event: any) {
    this.selectedGroup = event.value;
    if (event.value.name) {
      this.selectedGroup = event.value.name as string;
    } else {
      if (event.value) {
        this.selectedGroup = event.value as string;
      }
    }
  }

  policyNoChanged($event: any) {
    this.policyNumber = $event.target.value;
  }

  selectedBrokerageChanged(event: any) {
    this.selectedBrokerage = event.value;
    const brokerName = event.value as string;
    if (brokerName === 'ALL') {
      this.policyService.getCompaniesWithPolicy().subscribe(groups => {
        this.groupList = groups;
        this.groupList.splice(0, 0, 'ALL');
      });
    } else {
      this.policyService.getCompaniesWithPolicyForBroker(brokerName).subscribe(groups => {
        this.groupList = groups;
        this.groupList.splice(0, 0, 'ALL');
      });
    }
  }

  selectedJuristicRepChanged(event: any) {
    this.selectedJuristicRep = event.value;
  }

  selectedDateTypeChanged(event: any) {
    this.selectedDateType = event.value;
    const dateType = event.value;
    if (dateType === 1) {
      this.isPeriodFilter = true;
    } else {
      this.isPeriodFilter = false;
    }
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

  memberClientTypeChanged(event: any) {
    this.selectedMemberClientType = event.value;
  }

  periodTypeFilterChanged(event: any) {
    this.selectedPeriodTypeFilter = event.value;
  }

  memberPolicyStatusFilterChanged(event: any) {
    this.selectedMemberPolicyStatusType = event.value;
  }

  setSelectedMonthName(monthNumber:number){
     this.selectedMonthName = this.months.find(m => m.value == monthNumber).name;
  }

}
