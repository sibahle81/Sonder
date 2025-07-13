import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { ClaimCareService } from '../../../Services/claimcare.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions } from 'chart.js';
import { CoidTableDashboardComponent } from '../coid-table-dashboard/coid-table-dashboard.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ParentInsuranceType } from '../../../shared/entities/parentInsuranceType';
import { ClaimBucketClassModel } from '../../../shared/entities/personEvent/claimBucketClass.model';
import { StmOverview } from '../../../shared/entities/stm-overview';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { Constants } from '../../../../constants';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StmDashboardFields } from '../../../shared/entities/stm-dashboard-fields';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'stm-overview',
  templateUrl: './stm-overview.component.html',
  styleUrls: ['./stm-overview.component.css']
})
export class StmOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild(CoidTableDashboardComponent, { static: true }) table: CoidTableDashboardComponent;
  @ViewChild('insuranceTypeElement', { static: false }) insuranceTypeElement: ElementRef;
  @ViewChild('claimTypeElement', { static: false }) claimTypeElement: ElementRef;
  @ViewChild('benefitDueElement', { static: false }) benefitDueElement: ElementRef;

  filteredInsuranceTypes: ParentInsuranceType[];
  filteredClaimTypes: Lookup[];
  filteredBenefits: ClaimBucketClassModel[];

  elementKeyUp: Subscription;
  totalStm = 0;
  form: UntypedFormGroup;
  selected = 0;
  maxDate = new Date();
  minDate = new Date();

  // Show Drop downs
  hasData = false;
  isLoading = false;
  dataLoading = false;
  isStatutory = false;

  // Manipulating drop downs
  isEventSelected = false;
  isClaimTypeSelected = false;
  claimsFilteredByAccident: Lookup[];
  benefitsFilteredByClaimTypes: ClaimBucketClassModel[];

  // Drop down list variables
  claimTypes: Lookup[];
  insuranceTypes: ParentInsuranceType[];
  benefits: ClaimBucketClassModel[];

  isClaimTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Stm Data Variables
  totalStmOverview: StmOverview[];
  noDataHeading = 'No Data Available';
  myDictionary: { [index: string]: number; } = {};

  // Bar chart details
  public chartType = 'bar';
  public data: number[] = [];
  public pieChartLegend = false;
  public pieChartPlugins = [pluginDataLabels];
  public pieChartOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    responsive: true,
    legend: {
      position: 'top',
      labels: {
        fontSize: 30,
        fontColor: '#040404'
      }
    },
    plugins: {
      datalabels: {
        color: 'rgb(255,255,255)',
        backgroundColor: ' #040404',
        formatter: (value) => {
          return value;
        },
        anchor: 'end',
        align: 'center',
      }
    },
  };
  public chartLabels: Array<any> = [];
  public chartColors: Array<any> = [
    {
      backgroundColor: ['#ed5345', '#90e86b', '#E56D99'],
      hoverBackgroundColor: ['#ed2513', '#53e815', '#e61c66'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private changeDedectorRef: ChangeDetectorRef,
    public readonly datepipe: DatePipe,
  ) {
    this.loadLookupLists();
  }

  ngAfterViewInit(): void {
    this.generateAutoCompleteSubscriptions();
    this.getClaimTypes();
    this.getInsuranceTypes();
    this.getClaimBucketClassIds();
  }

  loadLookupLists(): void {
    this.getStmDash();
  }

  ngOnInit() {
    this.createForm();
    this.minDate.setFullYear(this.minDate.getFullYear() - 3);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      notificationType: new UntypedFormControl(''),
      claimType: new UntypedFormControl(''),
      insuranceType: new UntypedFormControl(''),
      benefitsDue: new UntypedFormControl(''),
      month: new UntypedFormControl(''),
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
    });

    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      notificationType: this.selected
    })
  }

  // Getting all the STM Results for the current year
  getStmDash() {
    this.clearDataAndLabels();
    this.isLoading = true;
    let stmObject = new StmDashboardFields();
    stmObject.filter = false;
    stmObject.startDate = this.datepipe.transform(new Date(), Constants.dateString);
    stmObject.endDate = this.datepipe.transform(new Date(), Constants.dateString);
    stmObject.claimTypeId = 0;
    stmObject.insuranceTypeId = 0;
    stmObject.eventTypeId = 0;
    stmObject.personEventBucketClassId = 0;

    this.claimService.getStmOverview(stmObject).subscribe(result => {
      if (result.stmOverviews && result.stmOverviews.length > 0) {
        this.totalStmOverview = result.stmOverviews;
        this.setPageData(this.totalStmOverview);
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
  }

  // Populating all the dropdown controls
  getClaimTypes() {
    this.lookupService.getClaimTypes().subscribe(result => {
      this.claimTypes = result;
      this.filteredClaimTypes = result;
      this.form.patchValue({
        claimType: Constants.prePopulateDropdown
      })
      this.prepopulateAutocomplete(
        this.claimTypeElement.nativeElement,
        this.filteredClaimTypes,
        this.form.controls['claimType']
      )
    });
  }

  getInsuranceTypes() {
    this.claimService.getInsuranceTypes().subscribe(result => {
      this.insuranceTypes = result;
      this.filteredInsuranceTypes = result;
      this.form.patchValue({
        insuranceType: Constants.prePopulateDropdown
      })
      this.prepopulateAutocomplete(
        this.insuranceTypeElement.nativeElement,
        this.filteredInsuranceTypes,
        this.form.controls['insuranceType']
      )
    });
  }

  getClaimBucketClassIds() {
    this.claimService.getClaimBucketClasses().subscribe(result => {
      this.benefits = result; this.filteredBenefits = result;
      this.filteredBenefits = result;
      this.form.patchValue({
        benefitsDue: Constants.prePopulateDropdown
      })
      this.prepopulateAutocomplete(
        this.benefitDueElement.nativeElement,
        this.filteredBenefits,
        this.form.controls['benefitsDue']
      )
    });
  }

  applyData() {
    const model = this.form.value;
    let STMFilter = new StmDashboardFields();
    STMFilter.startDate = this.datepipe.transform(model.startDate, Constants.dateString);
    STMFilter.endDate = this.datepipe.transform(model.endDate, Constants.dateString);
    STMFilter.eventTypeId = model.notificationType === 0 ? 0 : model.notificationType;
    STMFilter.claimTypeId = model.claimType === Constants.prePopulateDropdown ? 0 : this.claimTypes.find(a => a.name === model.claimType).id;
    STMFilter.insuranceTypeId = model.insuranceType === Constants.prePopulateDropdown ? 0 : this.insuranceTypes.find(a => a.code === model.insuranceType).parentInsuranceTypeId;
    STMFilter.personEventBucketClassId = model.benefitsDue === Constants.prePopulateDropdown ? 0 : this.benefits.find(a => a.name === model.benefitsDue).claimBucketClassId;;
    STMFilter.filter = true;
    this.dataLoading = true;

    this.claimService.getStmOverview(STMFilter).subscribe(result => {
      if (result.stmOverviews && result.stmOverviews.length > 0) {
        this.totalStmOverview = result.stmOverviews;
        this.setPageData(this.totalStmOverview);
        this.dataLoading = false;
      } else {
        this.totalStmOverview = [];
        this.setPageData(this.totalStmOverview);
        this.dataLoading = false;
      }
    });
  }

  // Setting the bar chart and deactivating if no data
  setPageData(result: StmOverview[]) {
    if (result.length > 0) {
      this.setPieChartData(result);
    } else {
      this.isLoading = false;
      this.hasData = false;
    }
  }

  // Set the pie chart with filtered data
  setPieChartData(stmResult: StmOverview[]) {
    this.data = [];
    this.chartLabels = [];
    this.totalStm = stmResult.length;

    //Getting the values for each bar
    const suspicious = this.GetStatusLength(SuspiciousTransactionStatusEnum.Suspicious, stmResult, true);
    const notSuspicious = this.GetStatusLength(SuspiciousTransactionStatusEnum.NotSuspicious, stmResult, true);
    const notProcessed = this.GetStatusLength(SuspiciousTransactionStatusEnum.NotProcessed, stmResult, false);

    //Populating the Dictionary
    this.myDictionary.Suspicious = suspicious;
    this.myDictionary.NotSuspicious = notSuspicious;
    this.myDictionary.NotProcessed = notProcessed;
    this.populateDataChart(this.myDictionary);
    this.hasData = true;
    this.isLoading = false;
  }

  GetStatusLength(suspiciousStatus: SuspiciousTransactionStatusEnum, stmOverview: StmOverview[], isSuccessful: boolean): number {
    if (isSuccessful) {
      return stmOverview.filter(c => c.suspiciousTransactionStatusId === suspiciousStatus).length;
    } else {
      return stmOverview.filter(c => c.suspiciousTransactionStatusId === suspiciousStatus).length;
    }
  }

  setAutocompleteValue(event, options: any[], controlKey: string) {
    if (event.option.value === Constants.prePopulateDropdown) {
      this.filteredBenefits = this.benefits;
    }
    let updatedValue = event.option.value.replace('-', '')
    if (updatedValue === ClaimTypeEnum[ClaimTypeEnum.IODCOID]) {
      this.isClaimTypeSelected = true;
      this.filteredBenefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
      this.benefitsFilteredByClaimTypes = this.filteredBenefits;
      this.isStatutory = true;
    } else {
      this.filteredBenefits = this.benefits;
      this.isStatutory = false;
    }
    // this.form.controls[controlKey].setValue(options.find((option) => option.name === event.option.value).name);
  }

  insuranceTypeChanged($event: any) {
    const insuranceType = $event.value;
    if (insuranceType === this.selected) {
      this.filteredClaimTypes = this.claimTypes;
    }
    this.getClaimTypesByEventId(insuranceType);
  }

  getClaimTypesByEventId(insuranceType: number) {
    this.isClaimTypeLoading$.next(true);
    this.lookupService.getClaimTypesByEvent(insuranceType).subscribe(claimTypes => {
      this.filteredClaimTypes = claimTypes;
      this.claimsFilteredByAccident = claimTypes;
      this.isEventSelected = true;
      this.isClaimTypeLoading$.next(false);
    }, (error) => {
      this.isClaimTypeLoading$.next(false);
    });
  }

  populateDataChart(myDictionary: any) {
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      let keyString = key;
      if (key === Constants.notSuspicious) {
        keyString = Constants.notSuspiciousLabel;
      }
      if (key === Constants.notProcessed) {
        keyString = Constants.notProcessedLabel;
      }
      this.data.push(value);
      this.chartLabels.push(keyString);
    }
  }

  // This method clears all the controls on expansion panel closed event
  ClearData() {
    this.table.hideTable();
    this.form.controls.notificationType.reset();
    this.form.controls.claimType.reset();
    this.form.controls.insuranceType.reset();
    this.form.controls.benefitsDue.reset();
    this.form.controls.month.reset();
    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      notificationType: this.selected,
      claimType: Constants.prePopulateDropdown,
      insuranceType: Constants.prePopulateDropdown,
      benefitsDue: Constants.prePopulateDropdown,
      Assessor: []
    })
    this.getStmDash();
  }

  clearDataAndLabels() {
    this.data = [];
    this.chartLabels = [];
  }

  // This is the method being called when you click on the pie chart
  public chartClicked(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._index;
        const labelName = chart.data.labels[clickedElementIndex];
      }
    }
  }

  // this is te method being called to populate the table in claim-table-dashboard
  setTable(suspiciousStatus: SuspiciousTransactionStatusEnum, labelName: string) {
    this.table.fillData(this.totalStmOverview.filter(a => a.suspiciousTransactionStatusId === suspiciousStatus), `${name} ${labelName} Claims`);
  }

  public chartHovered(e: any): void { }

  // Tried not to duplicate the code but the code broke therefore duplicating for now
  generateAutoCompleteSubscriptions() {
    // insuranceTypes
    this.elementKeyUp = fromEvent(this.insuranceTypeElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredInsuranceTypes = this.insuranceTypes;
        return;
      }
      this.filteredInsuranceTypes = this.insuranceTypes.filter(option => String.contains(option.code, searchData));
    });

    // claimTypes
    this.elementKeyUp.add(fromEvent(this.claimTypeElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        if (this.isEventSelected) {
          this.filteredClaimTypes = this.claimsFilteredByAccident;
        } else {
          this.filteredClaimTypes = this.claimTypes;
        }
        return;
      }
      this.filteredClaimTypes = this.claimTypes.filter(option => String.contains(option.name, searchData));
    }));

    // benefitsDue
    this.elementKeyUp.add(fromEvent(this.benefitDueElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        if (this.isClaimTypeSelected) {
          this.filteredBenefits = this.benefitsFilteredByClaimTypes;
        } else {
          this.filteredBenefits = this.benefits;
        }
        return;
      }
      this.filteredBenefits = this.benefits.filter(option => String.contains(option.name, searchData));
    }));
  }

  prepopulateAutocomplete(nativeElement, options: any[], control: AbstractControl): void {
    const option = options.find(option => option.id === control.value);
    if (control.disabled) {
      nativeElement.disabled = true;
    }
    nativeElement.value = option ? option.name : '';
    this.changeDedectorRef.detectChanges();
  }
}
