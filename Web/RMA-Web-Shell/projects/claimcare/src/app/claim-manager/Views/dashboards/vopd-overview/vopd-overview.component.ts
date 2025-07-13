import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { ClaimCareService } from '../../../Services/claimcare.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions } from 'chart.js';
import { CoidTableDashboardComponent } from '../coid-table-dashboard/coid-table-dashboard.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { VopdOverview } from '../../../shared/entities/vopd-overview';
import { VopdStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/vopd-status.enum';
import { ParentInsuranceType } from '../../../shared/entities/parentInsuranceType';
import { ClaimBucketClassModel } from '../../../shared/entities/personEvent/claimBucketClass.model';
import { Constants } from '../../../../constants';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vopd-overview',
  templateUrl: './vopd-overview.component.html',
  styleUrls: ['./vopd-overview.component.css']
})
export class VopdOverviewComponent implements OnInit, AfterViewInit {

  @ViewChild(CoidTableDashboardComponent, { static: true }) table: CoidTableDashboardComponent;
  @ViewChild('insuranceTypeElement', { static: false }) insuranceTypeElement: ElementRef;
  @ViewChild('claimTypeElement', { static: false }) claimTypeElement: ElementRef;
  @ViewChild('benefitDueElement', { static: false }) benefitDueElement: ElementRef;

  filteredInsuranceTypes: ParentInsuranceType[];
  filteredClaimTypes: Lookup[];
  filteredBenefits: ClaimBucketClassModel[];
  isClaimTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  claimTypes: Lookup[];
  insuranceTypes: ParentInsuranceType[];
  benefits: ClaimBucketClassModel[];
  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  totalVopd = 0;
  selected = 0;
  maxDate = new Date();
  minDate = new Date();

  hasData = false;
  isLoading = false;
  hasTotalVopd = false;
  dataLoading = false;
  isStatutory = false;
  isEventSelected = false;
  isClaimTypeSelected = false;
  claimsFilteredByAccident: Lookup[];
  benefitsFilteredByClaimTypes: ClaimBucketClassModel[];

  // Vopd Data Variables
  totalVopdOverview: VopdOverview[];
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
      backgroundColor: ['#5062eb', '#90e86b', '#f59d38'],
      hoverBackgroundColor: ['#293fe6', '#53e815', '#f5880c'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private changeDedectorRef: ChangeDetectorRef,
    public readonly datepipe: DatePipe
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
    this.getVopdDash();
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
      insuranceTypeAuto: new UntypedFormControl(''),
    });
    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      notificationType: this.selected
    })
  }

  // Getting all the Vopd results for the current year
  getVopdDash() {
    this.clearDataAndLabels();
    this.isLoading = true;

    let vopdObject = new VopdOverview();
    vopdObject.filter = false;
    vopdObject.startDate = this.datepipe.transform(new Date(), Constants.dateString);
    vopdObject.endDate = this.datepipe.transform(new Date(), Constants.dateString);
    vopdObject.claimTypeId = 0;
    vopdObject.insuranceTypeId = 0;
    vopdObject.eventTypeId = 0;
    vopdObject.personEventBucketClassId = 0;

    this.claimService.getVopdOverview(vopdObject).subscribe(result => {
      if (result.vopdOverviews && result.vopdOverviews.length > 0) {
        this.totalVopdOverview = result.vopdOverviews;
        this.setPageData(this.totalVopdOverview);
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
  }

  // Populating all the dropdown controls
  getClaimTypes() {
    this.lookupService.getClaimTypes().subscribe(result => {
      this.filteredClaimTypes = result;
      this.claimTypes = result;
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
      this.benefits = result;
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

  // Setting the bar chart and deactivating if no data
  setPageData(result: VopdOverview[]) {
    if (result.length > 0) {
      this.setPieChartData(result);
    } else {
      this.isLoading = false;
      this.hasData = false;
    }
  }

  // Set the pie chart with filtered data
  setPieChartData(vopdResult: VopdOverview[]) {
    this.data = [];
    this.chartLabels = [];
    this.totalVopd = vopdResult.length;

    //Getting the values for each bar
    const successful = this.GetStatusLength(VopdStatusEnum.Processed, vopdResult, true);
    const unsuccessful = this.GetStatusLength(VopdStatusEnum.Processed, vopdResult, false);
    const processing = vopdResult.filter(x => x.vopdStatusId === VopdStatusEnum.Processing).length;
    const processed = vopdResult.filter(x => x.vopdStatusId === VopdStatusEnum.Processed).length;

    //Populating the Dictionary
    this.myDictionary.Processing = processing;
    this.myDictionary.Processed = processed;
    this.myDictionary.Successful = successful;
    this.myDictionary.Unsuccessful = unsuccessful;
    this.populateDataChart(this.myDictionary);
    this.hasData = true;
    this.isLoading = false;
  }

  GetStatusLength(vopdStatus: VopdStatusEnum, vopdOverview: VopdOverview[], isSuccessful: boolean): number {
    if (isSuccessful) {
      return vopdOverview.filter(c => c.vopdStatusId === vopdStatus && c.reason === Constants.successful
        && c.deceasedStatus === Constants.alive && c.isMatch === 1).length;
    } else {
      let unsuccessfulCount = vopdOverview.filter(c => c.vopdStatusId === vopdStatus && c.reason === Constants.notFound).length;
      unsuccessfulCount += vopdOverview.filter(c => c.vopdStatusId === vopdStatus && c.reason === Constants.RMANoResponse).length;
      unsuccessfulCount += vopdOverview.filter(c => c.vopdStatusId === vopdStatus && c.reason === Constants.successful && c.deceasedStatus === Constants.deceased).length;
      unsuccessfulCount += vopdOverview.filter(c => c.vopdStatusId === vopdStatus && c.reason === Constants.successful && c.isMatch === 0).length;
      return unsuccessfulCount;
    }
  }

  populateDataChart(myDictionary: any) {
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      const keyString = key;
      this.data.push(value);
      this.chartLabels.push(keyString);
    }
  }

  // This method clears all the controls on expansion panel closed event
  ClearData() {
    // this.table.hideTable();
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

    this.getVopdDash();
    this.form.patchValue({
      notificationType: this.selected
    });
  }

  claimTypeChange(item: any): void {
    if (item.option.value === Constants.prePopulateDropdown) {
      this.filteredBenefits = this.benefits;
    }
    let updatedValue = item.option.value.replace('-', '')
    if (updatedValue === ClaimTypeEnum[ClaimTypeEnum.IODCOID]) {
      this.isClaimTypeSelected = true;
      this.filteredBenefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
      this.benefitsFilteredByClaimTypes = this.filteredBenefits;
      this.isStatutory = true;
    } else {
      this.filteredBenefits = this.benefits;
      this.isStatutory = false;
    }
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

  applyData() {
    const model = this.form.value;
    let vopdFilter = new VopdOverview();
    vopdFilter.startDate = this.datepipe.transform(model.startDate, Constants.dateString);
    vopdFilter.endDate = this.datepipe.transform(model.endDate, Constants.dateString);
    vopdFilter.eventTypeId = model.notificationType === 0 ? 0 : model.notificationType;
    vopdFilter.claimTypeId = model.claimType === Constants.prePopulateDropdown ? 0 : this.claimTypes.find(a => a.name === model.claimType).id;
    vopdFilter.insuranceTypeId = model.insuranceType === Constants.prePopulateDropdown ? 0 : this.insuranceTypes.find(a => a.code === model.insuranceType).parentInsuranceTypeId;
    vopdFilter.personEventBucketClassId = model.benefitsDue === Constants.prePopulateDropdown ? 0 : this.benefits.find(a => a.name === model.benefitsDue).claimBucketClassId;;

    vopdFilter.filter = true;
    this.dataLoading = true;
    this.claimService.getVopdOverview(vopdFilter).subscribe(result => {
      if (result.vopdOverviews && result.vopdOverviews.length > 0) {
        this.totalVopdOverview = result.vopdOverviews;
        this.setPageData(this.totalVopdOverview);
        this.dataLoading = false;
      } else {
        this.dataLoading = false;
        this.totalVopdOverview = [];
        this.setPageData(this.totalVopdOverview);
      }
    });
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
        switch (labelName) {
        }
      }
    }
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
