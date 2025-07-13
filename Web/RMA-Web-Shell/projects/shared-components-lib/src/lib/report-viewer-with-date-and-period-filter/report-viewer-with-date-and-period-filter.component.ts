import { ProductCrossRefTranType } from './../../../../fincare/src/app/finance-manager/models/productCrossRefTranType.model';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { BankAccountService } from 'projects/shared-services-lib/src/lib/services/bank-account/bank-account.service';
import { BankAccount } from 'projects/shared-models-lib/src/lib/common/bank-account';
import { ProductCrossRefTranTypeService } from 'projects/fincare/src/app/finance-manager/services/productCrossRefTranType.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { AbilityCollectionsService } from 'projects/fincare/src/app/shared/services/ability-collections.service';
import { AbilityChart } from 'projects/fincare/src/app/billing-manager/models/abilty-chart';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { BillingService } from 'projects/fincare/src/app/billing-manager/services/billing.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'report-viewer-with-date-and-period-filter',
  templateUrl: './report-viewer-with-date-and-period-filter.component.html',
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ReportViewerWithDateAndPeriodFilterComponent implements OnInit, OnChanges {

  constructor(
    private readonly formbuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly periodService: PeriodService,
    private datePipe: DatePipe,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly commissionService: CommissionService,
    private readonly bankAccountService: BankAccountService,
    private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
   private readonly abilityCollecitionsService: AbilityCollectionsService,
   private readonly billingService: BillingService,
  ) { }
  @Input() reportTitle: string;
  @Input() hideTitle: false;
  @Input() reportUrl: string;
  @Input() friendlyReportUrl: string;
  @Input() hideAllFilters: false; // use hideAllFilters to generate reports that require no input

  // ----- the bellow Inputs are built-in available filters ----- //
  // ----- these filters can be extended by the available extentions directly below these inputs ----- //
  // ----- there is a compatablity check that will validate if incompatable filters and extentions have been configured ----- //
  @Input() showDateRangeFilter: false;
  @Input() showPeriodFilter: false;
  @Input() showPeriodEndFilter: false;
  @Input() showEndDateFilter: false;
  @Input() showPaymentTypeFilter: false;
  @Input() showReasonTypeFilter: false;
  @Input() showProductClassFilter: false;
  @Input() showProductFilter: false;
  @Input() showProductOptionFilter: false;
  @Input() showProductOptionIdFilter: false;
  @Input() showBankAccountFilter: false;
  @Input() showInvoiceNumberFilter: false;
  @Input() showInvoiceAmountFilter: false;
  @Input() showMemberNumberFilter: false;
  @Input() showUnderwriterYearFilter: false;
  @Input() showControlNameFilter: false;
  @Input() showAbilityFilter: false;
  @Input() showTransactionTypeFilter: false;
  @Input() exportOnly: false;
  @Input() invoiceSentFilter: false;
  @Input() showPolicyNumberFilter: false;
  @Input() matFormFieldRight: false;
  @Input() showProductFilterwithAll: false;
  @Input() showInterestProvisionedStatusFilter: false;
  @Input() showProductIdFilterwithAll: false;
  @Input() showProductCategoriesFilter: false;
  @Input() showCompanyNoFilter: false;
  @Input() showBranchNoFilter: false;

  // ----- the bellow Inputs are extentions of the available filters and must be used in conjunction with the appropriate filter ----- //
  // ----- e.g. showPeriodFilter & useCommissionPeriods are compatable ----- //
  // ----- there is a compatablity check that will validate if incompatable filters and extentions have been configured ----- //
  @Input() useCommissionPeriods: false;
  @Input() usePeriodIdInsteadOfDateRange: false;
  @Input() isAbilityReport: false;
  @Input() offerFriendlyVersion: false;
  @Input() showBalanceTypeFilter: false;
  @Input() showClientTypeFilter: false;
  @Input() showDebtorStatusFilter: false;
  @Input() showControlNumberFilter: false;  
  @Input() showChildAllocationFilter: false;
  @Input() showIndustryClassFilter: false;
  @Input() showClientParameter: false;
  @Input() showProductFilterwithMultiSelect: false;
  @Input() showIndustryClassMultiFilter: false;
  @Input() showPeriodFilterwithMultiSelect: false;
  @Input() showPaymentTypeFilterwithAll: false;
  @Input() showCompanyFilterwithMultiSelect: false;



  // -----If used, then the bollow must be used together-----  //
  @Input() data: any; // use data to pass in the value of the dataParameterName Input.
  @Input() dataParameterName: string; // use this to identify the name of the parameter that the above data input refers to eg. "FinPayeNumber" or "PaymentId"

  // -----Outputs to externally notify that the below events have been triggered
  @Output() resetClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() componentReady: EventEmitter<boolean> = new EventEmitter();

  // ----- Required directives by the base report control
  ssrsBaseUrl: string;
  reportServer: string;
  showParameters: string;
  parameters: any;
  language: string;
  width: number;
  height: number;
  toolbar: string;
  format = 'pdf';
  displayFormat = 'pdf';
  parametersSelected = false;
  savedParameters = '';
  savedFormat = '';

  // ----- Component variables or all built in filters and functionalities
  currentUrl: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isDownloading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;

  periods: Period[] = [];
  filteredPeriods: Period[] = [];
  allPeriods: Period[] = [];

  years: number[] = [];
  filteredYears: number[] = [];
  numberOfFutureYears = 8;
  baseYear = 2015;

  selectedExportType = 'excel';
  version = 'standard';
  dateFormat = 'yyyy-MM-dd';
  startDate: Date;
  endDate: Date;
  minDate: Date;
  maxDate: Date;

  startDateSelected: boolean;
  endDateSelected: boolean;
  yearSelected: boolean;
  paymentTypeSelected: boolean;
  reasonTypeSelected: boolean;
  productClassSelected: boolean;
  industryClassSelected: boolean;
  productSelected: boolean;
  productOptionSelected: boolean;
  productOptionIdSelected: boolean;
  periodSelected: boolean;
  bankAccountSelected: boolean;
  invoiceNumberSelected: boolean;
  invoiceAmountSelected: boolean;
  memberNumberSelected: boolean;
  underwriterYearSelected: boolean;
  versionSelected: boolean;
  controlNameSelected = true;
  abilityChartSelected = false;
  industryTypeSelected: boolean;
  clientTypeSelected: boolean;
  balanceTypeSelected: boolean;
  debtorStatusSelected: boolean;
  controlNumberSelected: boolean;
  childAllocationStatusSelected: boolean;
  transactionTypeSelected: boolean;
  invoiceSentSelected: boolean;
  policyNumberSelected: boolean;
  invoiceSentParameter = 2;
  startDateParameter: string;
  endDateParameter: string;
  paymentTypeParameter: string;
  reasonTypeParameter: string;
  productClassParameter: string;
  productNameParameter: string;
  productOptionNameParameter: string;
  productOptionIdParameter: number;
  periodParameter: string;
  bankAccountParameter: string;
  invoiceNumberParameter: string;
  invoiceAmountParameter: number;
  memberNumberParameter: string;
  underwriterYearParameter: string;
  controlNameParameter: string;
  abilityChartParameter: string;
  industryClassParameter: number;
  clientTypeParameter: number;
  balanceTypeParameter: number;
  debtorStatusParameter: number;
  controlNumberParameter: number;
  childAllocationStatusParameter: string;
  selectedClientTypeParameter: number;
  transactionTypeParameter: number;
  policyNumberParameter: string;
  interestProvisionedStatusSelected: boolean;
  interestProvisionedStatusIdParameter: number;
  productIdSelected: boolean;
  productIdParameter: number;
  productCategorySelected: boolean;
  productCategoryParameter: number;
  periodIdParameter: number;
  selectedCompanyNumber = -1;
  selectedBranchNumber = -1;
  companyIdParameter: number;
  companies: { id: number, name: string }[] = [];
  branches: { id: number, name: string }[] = [];
  companySelected: boolean = false;
  branchSelected: boolean = false;

  paymentTypes = [
    { name: 'Individual', value: 'Individual' },
    { name: 'Group', value: 'Group' },
    { name: 'Corporate', value: 'Corporate' },
    { name: 'GoldWage', value: 'GoldWage' },
    { name: 'Refunds', value: 'Refunds' },
    { name: 'Commissions', value: 'Commissions' }
  ];

  reasonTypes = [
    { name: 'Adjustment', value: 'Adjustment' },
    { name: 'Cancellation', value: 'Cancellation' }    
  ];

  abilityTypes : { name: string, value: string} [] =[];

  invoiceSentTypes = [
    { name: 'All Invoices Sent', value: 2 },
    { name: 'Successfully Sent', value: 1 },
    { name: 'Unsuccessfully Sent', value: 0 }
  ];

  clientTypes = [
    { name: 'All', value: 0 },
    { name: 'Corporate', value: 3 },
    { name: 'Group', value: 2 },
    { name: 'Individual', value: 1 }
  ];

  debtorStatuses = [
    { name: 'All', value: 0 },
    { name: 'Active', value: 1 },
    { name: 'Inactive', value: 2 }
  ];

  controlNumbers = [
    { name: 'All', value: 0 },
    { name: 'COID PREMIUM - Mining' , value: 1},
    { name: 'COID PREMIUM - Metals' , value: 18},
    { name: 'NON COID - Mining' , value: 14},
    { name: 'NON COID PREMIUM - Metals' , value: 15},
    { name: 'Stated Benefit - Mining' , value: 23},
    //{ name: 'Stated Benefit - Metals' , value: 15},
    { name: 'INDF & Staff' , value: 26},
    { name: 'Group - Class Other' , value: 48}
  ]
  

  balanceTypes = [
    { name: 'All', value: 0 },
    { name: 'All Non-zero', value: 1 },
    { name: 'Greater Than Zero', value: 2 },
    { name: 'Less Than Zero', value: 3 }
  ];

  transactionTypes = [
    { name: 'Invoice', value: 6 },
    { name: 'Payment', value: 3 },
    { name: 'Payment Reversal', value: 1 },
    { name: 'Refund', value: 8 },
    { name: 'Credit Note', value: 4 },
    { name: 'Debit Note', value: 2 },
    { name: 'Inter Debtor Transfer', value: 9 },
    { name: 'Interest', value: 7 },
    { name: 'Invoice Reversal', value: 5 },
    { name: 'Interest Reversal', value: 17 }
  ];

  childAllocationStatuses = [
    { name: 'All', value: 0 },
    { name: 'Allocated', value: 1 },
    { name: 'Error', value: 2 }
  ];

  clientTypeParam: any[] = [];
  productClasses: any[] = []; // any[] because of enum
  products: Product[] = [];
  productOptions: ProductOption[] = [];
  industryClasses: Lookup[] = [];
  bankAccounts: BankAccount[] = [];
  controlNames: ProductCrossRefTranType[] = [];
  interestProvisionedStatuses: Lookup[] = [];
  abilityCharts: AbilityChart[] = [];
  productCategories: Lookup [] = [];

  messages: string[] = [];

  getYears() {
    const date = new Date();
    const currentYear = date.getFullYear();
    const filtered = [];
    const maxFutureYear = currentYear + this.numberOfFutureYears;
    for (let year = this.baseYear; year <= maxFutureYear; year++) {
      filtered.push(year);
    }
    return filtered;
  }

  // converts any enum to array for drop downs
  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  ngOnInit() {
    this.checkSelectedFilterDependancy();
    this.getReportParameters();
    this.getProductClasses();
    this.getIndustryClasses();
    this.getPeriods();
    this.getProducts();
    this.getProductOptions();
    this.getProductCategories();
    this.getClientType();
    this.getBankAccounts();
    this.getInterestProvisionedStatuses();
    this.getControlNames();
    this.getAbilityCharts();
    this.getCompanyNumbers();
    this.createForm();
    this.setDefaultVersion();
    
  }

  checkSelectedFilterDependancy() {
    this.messages = [];
    // cannot use "useCommissionPeriods" @input without having the "showPeriodFilter" selected
    if (this.useCommissionPeriods && !(this.showPeriodFilter)) {
      this.messages.push('The "useCommissionPeriods" input is dependent on "showPeriodFilter" input. i.e. **[showPeriodFilter]="true" [useCommissionPeriods]="true"**');
    }

    // cannot use "usePeriodIdInsteadOfDateRange" @input without having the "showPeriodFilter" selected
    if (this.usePeriodIdInsteadOfDateRange && !(this.showPeriodFilter)) {
      this.messages.push('The "usePeriodIdInsteadOfDateRange" input is dependent on "showPeriodFilter" input. i.e. **[showPeriodFilter]="true" [usePeriodIdInsteadOfDateRange]="true"**');
    }

    // cannot use invoice number in combination with any other filter at this point...
    if (this.showInvoiceNumberFilter && (this.showPeriodFilter || this.showDateRangeFilter || this.showPaymentTypeFilter || this.showProductClassFilter || this.showProductFilter || this.showProductFilterwithMultiSelect || this.showPaymentTypeFilterwithAll) && !this.showInvoiceAmountFilter) {
      this.messages.push('The "showInvoiceNumberFilter" input is independent and will not work with any other filters');
    }
  }

  getReportParameters() {
    this.isLoading$.next(true);
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.componentReady.emit(true);
    });
  }

  getPeriods() {
    if (this.useCommissionPeriods) {
      this.commissionService.getCommissionPeriodsForReports().subscribe(results => {
        results.forEach(commissionPeriod => {
          const mappedPeriod = new Period();
          mappedPeriod.id = commissionPeriod.periodId;
          mappedPeriod.status = 'n/a';
          mappedPeriod.startDate = commissionPeriod.startDate;
          mappedPeriod.endDate = commissionPeriod.endDate;
          this.periods.push(mappedPeriod);
        });
        this.filteredPeriods = this.periods;
        this.allPeriods = this.periods;
        this.years = Array.from((new Set(this.periods.map(event => (new Date(event.endDate).getFullYear())))));
        this.filteredYears = this.years;
      });
    } else {
      this.periodService.getPeriods().subscribe(results => {
        this.periods = results;
        this.filteredPeriods = results;
        this.allPeriods = results;
        this.years = Array.from((new Set(this.periods.map(event => (new Date(event.endDate).getFullYear())))));
        this.filteredYears = this.years;
      });
    }
  }

  getIndustryClasses(): void {
    if (this.showIndustryClassFilter || this.showIndustryClassMultiFilter)
    this.lookupService.getIndustryClasses().subscribe(
      results => {
        this.industryClasses = results;
        if (this.industryClasses.length > 0) {
          if (this.industryClasses[0].id > 0) {
            this.industryClasses.unshift({ id: 0, name: 'All' } as Lookup);
          }
        }
      }
    );
  }

  getProductClasses() {
    this.productClasses = this.ToArray(ProductClassEnum);
  }

  getClientType() {
    this.clientTypeParam = this.ToArray(ClientTypeEnum);
  }

  getProducts() {
    this.productService.getProducts().subscribe(results => {
      this.products = this.sortProducts(results);
    });
  }
  getAbilityCharts() {
    this.abilityCollecitionsService.getAbilityCharts().subscribe(results => {
      this.abilityCharts = [...results];
      if(results.length > 0){
        this.abilityTypes.push({ name: 'All', value: 'All' });
        results.forEach(item => {
          if(item.chart.toLocaleLowerCase() ==='is'){
            this.abilityTypes.push({name: `Income Statement - ${item.chartNumber.toString()}`, value: `${item.chartNumber.toString()}`})
          }
          if(item.chart.toLocaleLowerCase() ==='bs'){
            this.abilityTypes.push({name: `Balance Sheet - ${item.chartNumber.toString()}`, value: `${item.chartNumber.toString()}`})
          }
        });
      }
    });
  }


  sortProducts(products) {
    const sortedProducts = products.sort((a, b) => {
      if (a.name.toUpperCase() < b.name.toUpperCase()) { return -1; }
      if (a.name.toUpperCase() < b.name.toUpperCase()) { return 1; }
      return 0;
    });
    return sortedProducts;
  }

  getProductOptions() {
    this.productOptionService.getProductOptions().subscribe(results => {
      this.productOptions = results;
    });
  }

  getProductCategories() {
    this.lookupService.getProductCategory().subscribe(results => {
      this.productCategories = results;
    })
  }

  getBankAccounts() {
    this.bankAccountService.getBankAccounts().subscribe(results => {
      this.bankAccounts = results;
    });
  }

  getControlNames() {
    this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(controlNames => {
      this.controlNames = this.getUnique(controlNames.filter(x => x.productCodeId === 48).reverse(), 'origin');
      this.isLoading$.next(false);
    });
  }

  getInterestProvisionedStatuses(): void {
    if (!this.showInterestProvisionedStatusFilter) { return; }
    this.lookupService.getInterestProvisionedStatuses().subscribe(
      results => {
        this.interestProvisionedStatuses = results;
      }
    );
  }


  getUnique(array, parameter) {
    const unique = array.map(e => e[parameter])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => array[e]).map(e => array[e]);
    return unique;
  }

  createForm() {
    this.form = this.formbuilder.group({
      paymentTypes: [null],
      reasonTypes: [null],
      productName: [null],
      productOptionName: [null],
      productClasses: [null],
      bankAccount: [null],
      invoiceNumber: [null],
      invoiceAmount: [null],
      memberNumber: [null],
      underwriterYear: [null],
      startDate: [null],
      endDate: [null],
      year: [null],
      period: [null],
      periodEnd: [null],
      controlName: [null],
      abilityTypes: [null],
      industryClassId: [null],
      clientTypes: [null],
      clientTypeParam: [null],
      debtorStatuses: [null],
      controlNumbers:[null],
      childAllocationStatuses: [null],
      balanceTypes: [null],
      transactionTypes: [null],
      invoiceSentTypes: [null],
      policyNumber: [null],
      showInterestProvisionedStatus: [null],
      productCategory: [null],
      productIdMulti: [null],
      companyIdMulti: [null],
      industryClassIdMulti: [null],
      periodIdMulti:[null],
      company : [null],
      branch : [null]
    });
  }

  getCompanyNumbers(){
    this.billingService.getCompanies().subscribe(
      (data: {companyNumber: number, companyName:string}[]) => {
        if (data && data.length > 0) {
          this.companies.push({id: -1, name: 'All'});
         [...data].sort((a,b) => a.companyNumber - b.companyNumber).forEach(item => {
          if(this.companies.findIndex(c=>c.id === item.companyNumber) < 0)
            if(!this.showCompanyFilterwithMultiSelect){
          this.companies.push({id: item.companyNumber, name: item.companyNumber.toString()});
        }
           else{
            this.companies.push({id: item.companyNumber, name: item.companyName.toString()});
           }      
      });
        }
      }
    );
  }

  getBranchesByCompanyNumber(){
    this.billingService.getBrachesByCompany(this.selectedCompanyNumber).subscribe(
      (data: {branchNumber: number, branchName:string}[]) => {
        if (data && data.length > 0) {

          this.branches.push({id: -1, name: 'All'});

         [...data].forEach(item => {
          if(this.branches.findIndex(c=>c.id === item.branchNumber) < 0)
          this.branches.push({id: item.branchNumber, name: item.branchNumber.toString()});
         });

         if(this.branches && this.branches.length > 0)
          {
            this.selectedBranchNumber = this.branches[0].id;
            this.branchSelected = true;
            this.form.get('branch').setValue(this.selectedBranchNumber);
          }
        }
      }
    );
  }

  companyChanged(event: any): void {
    this.selectedCompanyNumber = +event.value;
    this.companySelected = true;
    this.getBranchesByCompanyNumber();
    this.generateReport(!this.exportOnly);
  }

  companyChangedMulti($event) {
    this.companySelected = true;    
    this.selectedCompanyNumber = $event.value;   
    this.generateReport(!this.exportOnly);
  }

  branchChanged(event: any): void {
    this.selectedBranchNumber = +event.value;
    this.branchSelected = true;
    this.generateReport(!this.exportOnly);
  }

  yearChange($event) {
    const year = $event.value as number;
    this.filteredPeriods = this.allPeriods.filter(s => (new Date(s.endDate)).getFullYear() === year);
    this.yearSelected = true;
  }

  periodChange($event) {
    this.startDate = new Date(this.datePipe.transform($event.value.startDate, this.dateFormat));
    if (!this.showPeriodEndFilter) {
      this.endDate = new Date(this.datePipe.transform($event.value.endDate, this.dateFormat));
    }

    this.startDateParameter = this.datePipe.transform(this.startDate, this.dateFormat);
    if (!this.showPeriodEndFilter) {
      this.endDateParameter = this.datePipe.transform(this.endDate, this.dateFormat);
    }

    if (this.usePeriodIdInsteadOfDateRange) {
      this.periodParameter = $event.value.id.toString();
      this.periodSelected = true;
    } else {
      this.form.controls.startDate.reset();
      this.form.controls.endDate.reset();

      this.startDateSelected = true;
      if (!this.showPeriodEndFilter) {
        this.endDateSelected = true;
      }
    }
    this.generateReport(!this.exportOnly);
  }

  periodChangeEnd($event) {
    this.endDate = new Date(this.datePipe.transform($event.value.endDate, this.dateFormat));
    this.endDateParameter = this.datePipe.transform(this.endDate, this.dateFormat);
    this.form.controls.endDate.reset();
    this.endDateSelected = true;
    this.generateReport(!this.exportOnly);
  }

  getYearRangeValues() {
    this.filteredYears = this.years;
    const periods = this.periods.filter(s => new Date(s.startDate).getFullYear() >= this.startDate.getFullYear() && new Date(s.endDate).getFullYear() <= this.endDate.getFullYear());
    this.filteredYears = Array.from((new Set(periods.map(event => (new Date(event.endDate).getFullYear())))));
  }

  getPeriodsWithinSelectedDateRange() {
    this.readForm();

    this.minDate = this.startDate;

    const invalidDate: Date = new Date('1970-01-01');
    if (this.endDate.getUTCFullYear() !== invalidDate.getUTCFullYear()) {
      this.maxDate = this.endDate;
    }

    this.getYearRangeValues();

    this.form.controls.period.reset();

    this.filteredPeriods = this.periods.filter(s => new Date(s.startDate) >= this.startDate && new Date(s.endDate) <= this.endDate);
    this.allPeriods = this.periods.filter(s => new Date(s.startDate) >= this.startDate && new Date(s.endDate) <= this.endDate);
  }

  checkAllRequiredParametersSelected(): boolean {
    let expectedParametersCount = 0;


    if (this.showPaymentTypeFilter) {
      expectedParametersCount += this.paymentTypeSelected ? 0 : 1;
    }

    if (this.showPaymentTypeFilterwithAll) {
      expectedParametersCount += this.paymentTypeSelected ? 0 : 1;
    }


    if (this.showReasonTypeFilter) {
      expectedParametersCount += this.reasonTypeSelected ? 0 : 1;
    }

    if (this.showControlNameFilter) {
      if (this.controlNameParameter !== 'All') {
        expectedParametersCount += this.controlNameSelected ? 0 : 1;
      }
    }

    if (this.showAbilityFilter) {     
        expectedParametersCount += this.abilityChartSelected ? 0 : 1;
    }

    if (this.showTransactionTypeFilter) {
      expectedParametersCount += this.transactionTypeSelected ? 0 : 1;
    }

    if (this.showProductFilterwithMultiSelect) {
      expectedParametersCount += this.productIdSelected ? 0 : 1;
    }
    if (this.showPeriodFilterwithMultiSelect && !this.endDateSelected) {
      expectedParametersCount += this.periodSelected ? 0 : 1;
    }

    if (this.showEndDateFilter  && !this.periodSelected) {
      expectedParametersCount += this.endDateSelected ? 0 : 1;
    }

    if (this.invoiceSentFilter) {
      expectedParametersCount += this.invoiceSentSelected ? 0 : 1;
    }

    if (this.showIndustryClassFilter) {
      expectedParametersCount += this.industryClassSelected ? 0 : 1;
    }

    if (this.showClientTypeFilter) {
      expectedParametersCount += this.clientTypeSelected ? 0 : 1;
    }

    if (this.showBalanceTypeFilter) {
      expectedParametersCount += this.balanceTypeSelected ? 0 : 1;
    }

    if (this.showDebtorStatusFilter) {
      expectedParametersCount += this.debtorStatusSelected ? 0 : 1;
    }

    if (this.showControlNumberFilter) {
      expectedParametersCount += this.controlNumberSelected ? 0 : 1;
    }
    

    if (this.showChildAllocationFilter) {
      expectedParametersCount += this.childAllocationStatusSelected ? 0 : 1;
    }

    if (this.showProductFilter) {
      expectedParametersCount += this.productSelected ? 0 : 1;
    }

    if (this.showProductFilterwithAll) {
      expectedParametersCount += this.productSelected ? 0 : 1;
    }


    if (this.showProductOptionFilter) {
      expectedParametersCount += this.productOptionSelected ? 0 : 1;
    }

    if (this.showProductOptionIdFilter) {
      expectedParametersCount += this.productOptionIdSelected ? 0 : 1;
    }

    if (this.showProductClassFilter) {
      expectedParametersCount += this.productClassSelected ? 0 : 1;
    }

    if (this.showProductIdFilterwithAll) {
      expectedParametersCount += this.productIdSelected ? 0 : 1;
    }

    if (this.showClientParameter) {
      expectedParametersCount += this.clientTypeSelected ? 0 : 1;
    }

    if (this.showPeriodFilter) {
      if (this.usePeriodIdInsteadOfDateRange) {
        expectedParametersCount += this.periodSelected ? 0 : 1;
      } else {
        if (!this.showPeriodEndFilter) {
          expectedParametersCount += this.startDateSelected && this.endDateSelected ? 0 : 1;
        }
        else {
          expectedParametersCount += this.startDateSelected ? 0 : 1;
        }

      }
    }

    if (this.showPeriodEndFilter) {
      expectedParametersCount += this.endDateSelected ? 0 : 1;
    }

    if (this.showDateRangeFilter && !this.usePeriodIdInsteadOfDateRange) {
      if(!this.periodSelected){
        expectedParametersCount += this.startDateSelected && this.endDateSelected ? 0 : 1;
      }    
    }

    if (this.showBankAccountFilter) {
      expectedParametersCount += this.bankAccountSelected ? 0 : 1;
    }

    if (this.offerFriendlyVersion) {
      expectedParametersCount += this.versionSelected ? 0 : 1;
    }

    if (this.showIndustryClassMultiFilter) {
      expectedParametersCount += this.industryClassSelected ? 0 : 1;
    } 

    return expectedParametersCount === 0;
  }

  setStartDateSelected() {
    this.startDateSelected = true;
    this.getPeriodsWithinSelectedDateRange();
    this.startDateParameter = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');

    if (this.endDateSelected) {
      if (this.startDate > this.endDate) {
        this.endDate = this.startDate;
        this.endDateParameter = this.startDateParameter;
      }
    }
    this.generateReport(!this.exportOnly);
  }

  setEndDateSelected() {
    this.endDateSelected = true;
    this.getPeriodsWithinSelectedDateRange();
    this.endDateParameter = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    this.generateReport(!this.exportOnly);
  }

  invoiceSentChanged($event: any) {
    this.invoiceSentSelected = true;
    this.invoiceSentParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  paymentTypeChanged($event: string) {
    this.paymentTypeSelected = true;
    this.paymentTypeParameter = $event;
    this.generateReport(!this.exportOnly);
  }

  reasonTypeChanged($event: string) {
    this.reasonTypeSelected = true;
    this.reasonTypeParameter = $event;
    this.generateReport(!this.exportOnly);
  }

  controlNameChanged($event: string) {
    this.controlNameSelected = true;
    this.controlNameParameter = $event;
    this.generateReport(!this.exportOnly);
  }

  abilityTypeChanged($event: any) {
    this.abilityChartSelected = true;
    this.abilityChartParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  transactionTypeChanged($event: any) {
    this.transactionTypeSelected = true;
    this.transactionTypeParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  industryClassChanaged($event: any) {
    this.industryClassSelected = true;
    this.industryClassParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  clientTypeChanged($event: any) {
    this.clientTypeSelected = true;
    this.clientTypeParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  clientTypeParamChanged($event: any) {
    this.clientTypeSelected = true;
    const selectedType = ClientTypeEnum[$event.value];
    this.selectedClientTypeParameter = Number(selectedType);
    this.generateReport(!this.exportOnly);
  }

  balanceTypeChanged($event: any) {
    this.balanceTypeSelected = true;
    this.balanceTypeParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  debtorStatusChanged($event: any) {
    this.debtorStatusSelected = true;
    this.debtorStatusParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  controlNumberChanged($event: any) {
    this.controlNumberSelected = true;
    this.controlNumberParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }  

  childAllocationStatusChanged($event: any) {
    this.childAllocationStatusSelected = true;
    this.childAllocationStatusParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  productClassChanged($event: string) {
    this.productClassSelected = true;
    this.productClassParameter = $event as string;
    this.generateReport(!this.exportOnly);
  }

  industryClassChanged($event: any) {
    this.industryClassSelected = true;
    this.industryClassParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  productChangedAll($event) {
    this.productSelected = true;
    if ($event.value.name) {
      this.productNameParameter = $event.value.name as string;
    } else {
      if ($event.value) {
        this.productNameParameter = $event.value as string;
      }
    }
    this.generateReport(!this.exportOnly);
  }

  productChanged($event) {
    this.productSelected = true;
    this.productNameParameter = $event.value.name as string;
    this.generateReport(!this.exportOnly);
  }

  productCategoryChange($event) {
    this.productCategorySelected = true;
    this.productCategoryParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  productOptionIdChanged($event) {
    this.productOptionIdSelected = true;
    this.productOptionIdParameter = $event.value.id;
    this.generateReport(!this.exportOnly);
  }

  productOptionChanged($event) {
    this.productOptionSelected = true;
    this.productOptionNameParameter = $event.value.name as string;
    this.generateReport(!this.exportOnly);
  }

  productIdChangedAll($event) {
    this.productIdSelected = true;
    if ($event.value.id) {
      this.productIdParameter = $event.value.id;
    } else {
      if ($event.value) {
        this.productIdParameter = $event.value;
      }
    }
    this.generateReport(!this.exportOnly);
  }


  bankAccountChanged($event) {
    this.bankAccountSelected = true;
    if ($event.value.accountNumber) {
      this.bankAccountParameter = $event.value.accountNumber as string;
    } else {
      if ($event.value) {
        this.bankAccountParameter = $event.value as string;
      }
    }
    this.generateReport(!this.exportOnly);
  }

  invoiceNumberChanged($event) {
    this.invoiceNumberSelected = true;
    this.invoiceNumberParameter = $event.target.value as string;
    this.generateReport(!this.exportOnly);
  }

  memberNumberChanged($event) {
    this.memberNumberSelected = true;
    this.memberNumberParameter = $event.target.value as string;
    this.generateReport(!this.exportOnly);
  }

  policyNumberChanged($event) {
    this.policyNumberSelected = true;
    this.policyNumberParameter = $event.target.value as string;
    this.generateReport(!this.exportOnly);
  }

  invoiceAmountChanged($event) {
    this.invoiceAmountSelected = true;
    this.invoiceAmountParameter = $event.target.value as number;
    this.generateReport(!this.exportOnly);
  }

  underwriterYearChange($event) {
    this.underwriterYearSelected = true;
    this.underwriterYearParameter = $event.value as string;
    this.generateReport(!this.exportOnly);
  }

  interestProvisionedStatusChanged($event) {
    this.interestProvisionedStatusSelected = true;
    this.interestProvisionedStatusIdParameter = $event.value.id;
    this.generateReport(!this.exportOnly);
  }

  productChangedMulti($event) {
    this.productIdSelected = true;    
      this.productIdParameter = $event.value;   
    this.generateReport(!this.exportOnly);
  }

  industryClassMultiChanged($event: any) {
    this.industryClassSelected = true;
    this.industryClassParameter = $event.value;
    this.generateReport(!this.exportOnly);
  }

  periodChangedMulti($event) {
    this.periodSelected = true;    
      this.periodIdParameter = $event.value;   
    this.generateReport(!this.exportOnly);
  }

  readForm() {
    this.startDate = new Date(this.form.value.startDate);
    this.endDate = new Date(this.form.value.endDate);
  }

  resetForm() {
    this.isLoading$.next(true);
    this.form.controls.startDate.reset();
    this.form.controls.endDate.reset();
    this.form.controls.year.reset();
    this.form.controls.period.reset();
    this.form.controls.periodEnd.reset();
    this.form.controls.paymentTypes.reset();
    this.form.controls.reasonTypes.reset();
    this.form.controls.productClasses.reset();
    this.form.controls.clientTypeParam.reset();
    this.form.controls.bankAccount.reset();
    this.form.controls.invoiceNumber.reset();
    this.form.controls.invoiceAmount.reset();
    this.form.controls.memberNumber.reset();
    this.form.controls.underwriterYear.reset();
    this.form.controls.productName.reset();
    this.form.controls.productOptionName.reset();
    this.form.controls.controlName.reset();
    this.form.controls.abilityTypes.reset();
    this.form.controls.industryClassId.reset();
    this.form.controls.clientTypes.reset();
    this.form.controls.balanceTypes.reset();
    this.form.controls.debtorStatuses.reset();
    this.form.controls.controlNumbers.reset();
    this.form.controls.childAllocationStatuses.reset();
    this.form.controls.transactionTypes.reset();
    this.form.controls.invoiceSentTypes.reset();
    this.form.controls.policyNumber.reset();
    this.invoiceSentSelected = false;
    this.parametersSelected = false;
    this.startDateSelected = false;
    this.endDateSelected = false;
    this.yearSelected = false;
    this.paymentTypeSelected = false;
    this.reasonTypeSelected = false;
    this.productClassSelected = false;
    this.productOptionSelected = false;
    this.industryClassSelected = false;
    this.clientTypeSelected = false;
    this.balanceTypeSelected = false;
    this.debtorStatusSelected = false;
    this.controlNumberSelected = false;
    this.childAllocationStatusSelected = false;
    this.periodSelected = false;
    this.bankAccountSelected = false;
    this.invoiceNumberSelected = true;
    this.abilityChartSelected = false;
    this.transactionTypeSelected = false; 
    this.productIdSelected = false;
    this.maxDate = null;
    this.minDate = null;
    this.startDate = null;
    this.endDate = null;

    this.periods = [];
    this.filteredPeriods = [];
    this.allPeriods = [];
    this.form.controls.industryClassIdMulti.reset();
    this.form.controls.productIdMulti.reset();
    this.form.controls.companyIdMulti.reset();    
    this.form.controls.productCategory.reset();
    this.form.controls.company.reset();
    this.form.controls.branch.reset();

    this.setDefaultExportFormat();
    this.getPeriods();
    this.getControlNames();

    this.resetClicked.emit(true);
    this.isLoading$.next(false);
  }

  getParameters(): string {
    let parameters = '';

    if (this.dataParameterName) {
      if (this.data) {
        parameters += '&' + this.dataParameterName + '=' + this.data;
      } else {
        parameters += '&' + this.dataParameterName + '=:isnull=true';
      }
    }

    if (this.showPaymentTypeFilter) {
      if (!this.paymentTypeParameter) {
        parameters += '&PaymentType=:isnull=true';
      } else {
        parameters += '&PaymentType=' + this.paymentTypeParameter;
      }
    }

    if (this.showPaymentTypeFilterwithAll) {
      if (!this.paymentTypeParameter) {
        parameters += '&PaymentType=:isnull=true';
      } else {
        parameters += '&PaymentType=' + this.paymentTypeParameter;
      }
    }

    if (this.showReasonTypeFilter) {
      if (!this.reasonTypeParameter) {
        parameters += '&ReasonType=:isnull=true';
      } else {
        parameters += '&ReasonType=' + this.reasonTypeParameter;
      }
    }

    // tslint:disable-next-line:triple-equals
    if (this.showControlNameFilter && this.controlNameParameter != null || this.controlNameParameter != undefined) {
      if (this.controlNameParameter !== 'All') {
        parameters += '&ControlName=' + this.controlNameParameter;
      } else {
        this.controlNameSelected = false;
      }
    }

    if (this.showClientParameter && this.selectedClientTypeParameter) {
      parameters += '&ClientType=' + this.selectedClientTypeParameter;
    }

    if (this.showTransactionTypeFilter && this.transactionTypeParameter) {
      parameters += '&TransactionType=' + this.transactionTypeParameter;
    }

    // tslint:disable-next-line:triple-equals
    if (this.showAbilityFilter && this.abilityChartParameter != null || this.abilityChartParameter != undefined) {
      if (this.abilityChartParameter !== 'All') {
        parameters += '&chartNumber=' + this.abilityChartParameter;
      } else {
        this.abilityChartSelected = false;
      }
    }

    // tslint:disable-next-line:triple-equals
    if (this.showIndustryClassFilter ) {
      parameters += '&IndustryId=' + this.industryClassParameter;
    }

    // tslint:disable-next-line:triple-equals
    if (this.showProductCategoriesFilter) {
      parameters += '&ProductCategoryId=' + this.productCategoryParameter;
    }

    // tslint:disable-next-line:triple-equals
    if (this.showIndustryClassMultiFilter) {
      if (this.industryClassParameter) {
        parameters += `&IndustryId=${this.industryClassParameter.toString()}`  ;       
      } else {
        parameters += '&IndustryId=:isnull=true';
      }
    }

    // tslint:disable-next-line:triple-equals
    if (this.showClientTypeFilter && this.clientTypeParameter != null || this.clientTypeParameter != undefined) {
      parameters += '&ClientTypeId=' + this.clientTypeParameter;
    }

    // tslint:disable-next-line:triple-equals
    if (this.showBalanceTypeFilter && this.balanceTypeParameter != null || this.balanceTypeParameter != undefined) {
      parameters += '&BalanceTypeId=' + this.balanceTypeParameter;
    }

    // tslint:disable-next-line:triple-equals
    if (this.showDebtorStatusFilter && this.debtorStatusParameter != null || this.debtorStatusParameter != undefined) {
      parameters += '&DebtorStatus=' + this.debtorStatusParameter;
    }

    if (this.showControlNumberFilter && this.controlNumberParameter != null || this.controlNumberParameter != undefined) {
      parameters += '&ControlNumber=' + this.controlNumberParameter;
    }

    if (this.showChildAllocationFilter && this.childAllocationStatusParameter != null || this.childAllocationStatusParameter != undefined) {
      parameters += '&ChildAllocationStatus=' + this.childAllocationStatusParameter;
    }

    if (this.invoiceSentFilter && (this.invoiceSentParameter > -1)) {
      parameters += '&Success=' + this.invoiceSentParameter;
    }

    if (this.showProductClassFilter) {
      if (!this.productClassParameter) {
        parameters += '&ProductClassName=:isnull=true';
      } else {
        parameters += '&ProductClassName=' + this.productClassParameter;
      }
    }

    if (this.showProductFilter) {
      if (!this.productNameParameter) {
        parameters += '&ProductName=:isnull=true';
      } else {
        parameters += '&ProductName=' + this.productNameParameter;
      }
    }

    if (this.showProductFilterwithAll) {
      if (!this.productNameParameter) {
        parameters += '&ProductName=:isnull=true';
      } else {
        parameters += '&ProductName=' + this.productNameParameter;
      }
    }

    if (this.showCompanyFilterwithMultiSelect) {
      if (!this.selectedCompanyNumber) {
        parameters += '&CompanyId=:isnull=true';
      } else {
        parameters += `&CompanyId=${this.selectedCompanyNumber.toString()}`;
      }
    }

    if (this.showProductFilterwithMultiSelect) {
      if (!this.productIdParameter) {
        parameters += '&ProductId=:isnull=true';
      } else {
        parameters += `&ProductId=${this.productIdParameter.toString()}`;
      }
    }


    if (this.showProductOptionFilter) {
      if (!this.productOptionNameParameter) {
        parameters += '&ProductOptionName=:isnull=true';
      } else {
        parameters += '&ProductOptionName=' + this.productOptionNameParameter;
      }
    }

    if (this.showProductIdFilterwithAll) {  
      if (!this.productIdParameter) {
        parameters += '&Product=:isnull=true';
      } else {
        parameters += '&Product=' + this.productIdParameter;
      }

    }

    if (this.showBankAccountFilter) {
      if (!this.bankAccountParameter) {
        parameters += '&BankAccountNumber=:isnull=true';
      } else {
        parameters += '&BankAccountNumber=' + this.bankAccountParameter;
      }
    }

    if (this.showInvoiceNumberFilter) {
      if (!this.invoiceNumberParameter) {
        this.invoiceNumberParameter = '';
      }
      parameters += '&InvoiceNumber=' + this.invoiceNumberParameter;
    }

    if (this.showInvoiceAmountFilter) {
      if (!this.invoiceAmountParameter) {
        this.invoiceAmountParameter = 0;
      }
      parameters += '&Amount=' + this.invoiceAmountParameter;
    }

    if (this.showMemberNumberFilter) {
      if (!this.memberNumberParameter) {
        this.memberNumberParameter = '';
      }
      parameters += '&MemberNumber=' + this.memberNumberParameter;
    }

    if (this.showPolicyNumberFilter) {
      if (!this.policyNumberParameter) {
        this.policyNumberParameter = '';
      }
      parameters += '&PolicyNumber=' + this.policyNumberParameter;
    }

    if (this.showUnderwriterYearFilter) {
      if (!this.underwriterYearParameter) {
        this.underwriterYearParameter = '';
      }
      parameters += '&UnderwritingYear=' + this.underwriterYearParameter;
    }

    if (this.showDateRangeFilter && !this.usePeriodIdInsteadOfDateRange) {
      if (!this.startDateParameter) {
        parameters += '&StartDate=:isnull=true';
      } else {
        parameters += '&StartDate=' + this.startDateParameter;
      }

      if (!this.endDateParameter) {
        parameters += '&EndDate=:isnull=true';
      } else {
        parameters += '&EndDate=' + this.endDateParameter;
      }
    }

    if (this.showEndDateFilter && !this.showPeriodFilter) {
      if (!this.endDateParameter) {
        parameters += '&EndDate=:isnull=true';
      } else {
        parameters += '&EndDate=' + this.endDateParameter;
      }
    }

    if (this.showInterestProvisionedStatusFilter) {
      if (!this.interestProvisionedStatusIdParameter) {
        parameters += '&statusId=:isnull=true';
      } else {
        parameters += '&statusId=' + this.productOptionIdParameter;
      }
    }

    if (this.showPeriodFilter) {
      if (this.usePeriodIdInsteadOfDateRange) {
        if (!this.periodParameter) {
          parameters += '&periodId=:isnull=true';
          if (this.isAbilityReport) {
            parameters += '&periodStart=:isnull=true';
            parameters += '&startDate=:isnull=true';
            parameters += '&periodEnd=:isnull=true';
            parameters += '&endDate=:isnull=true';
          }
        } else {
          parameters += '&periodId=' + this.periodParameter;
          if (this.isAbilityReport) {
            parameters += '&periodStart=' + this.startDateParameter;
            parameters += '&startDate=' + this.startDateParameter;
            parameters += '&periodEnd=' + this.endDateParameter;
            parameters += '&endDate=' + this.endDateParameter;
          }
        }
      } else {
        if (!this.showDateRangeFilter) {
          if (!this.startDateParameter) {
            parameters += '&StartDate=:isnull=true';
          } else {
            parameters += '&StartDate=' + this.startDateParameter;
          }

          if (!this.endDateParameter && !this.showPeriodEndFilter) {
            parameters += '&EndDate=:isnull=true';
          } else {
            parameters += '&EndDate=' + this.endDateParameter;
          }
        }
      }
    }

    // tslint:disable-next-line:triple-equals
    if (this.showPeriodFilterwithMultiSelect) {
      if (this.periodIdParameter) {
        parameters += `&periodId=${this.periodIdParameter.toString()}`  ;       
      } else {
        parameters += '&periodId=-1';
      }
    }


    if (this.showCompanyNoFilter) {
      if (this.selectedCompanyNumber) {
        parameters += `&company=${this.selectedCompanyNumber.toString()}`  ;       
      } else {
        parameters += '&company=-1';
      }
    }

    if (this.showBranchNoFilter) {
      if (this.selectedBranchNumber) {
        parameters += `&branch=${this.selectedBranchNumber.toString()}`  ;       
      } else {
        parameters += '&branch=-1';
      }
    }
   
    return parameters;
  }

  generateReport(refreshNow: boolean): void {
    this.parametersSelected = this.checkAllRequiredParametersSelected();
    const parameters = this.getParameters();
    
    if (this.parametersSelected && refreshNow && (parameters !== this.savedParameters)) {
      this.savedParameters = parameters;      
      this.parameters = parameters;
      this.reportServer = this.ssrsBaseUrl;  
      this.showParameters = 'true';
      this.language = 'en-us';
      this.toolbar = 'true';
      this.height = 100;
      this.width = 150;
    } else {
      this.isDownloading$.next(false);
    }
  }

  setDefaultExportFormat() {
    this.selectedExportType = 'excel';
  }

  setDefaultVersion() {
    this.version = 'standard';
    this.currentUrl = this.reportUrl;
  }

  toggleExport($event) {
    this.selectedExportType = $event;
  }

  toggleVersion($event) {
    this.versionSelected = true;
    this.version = $event;
    this.currentUrl = this.version === 'standard' ? this.reportUrl : this.friendlyReportUrl;
    this.generateReport(!this.exportOnly);

  }

  export() {    
    this.format = this.selectedExportType;  
    this.savedFormat = this.selectedExportType;
    this.isDownloading$.next(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.generateReport(!this.exportOnly);
    }
  }

  downloadComplete() {
    this.isDownloading$.next(false);
    this.format = 'pdf';
  }




}
