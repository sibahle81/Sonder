import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { ClaimCareService } from '../../Services/claimcare.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions } from 'chart.js';
import { ClaimBucketClassModel } from '../../shared/entities/personEvent/claimBucketClass.model';
import { Constants } from '../../../constants';
import { ExitReasonDashboardFields } from '../../shared/entities/exit-reason-dashboard-fields';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { fromEvent, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { STPExitReasonEnum } from 'projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum';
import { ExitReasonClaimOverview } from '../../shared/entities/exit-reason-claim-overview';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CoidTableDashboardComponent } from '../dashboards/coid-table-dashboard/coid-table-dashboard.component';

@Component({
  selector: 'exit-reason-dashboard',
  templateUrl: './exit-reason-dashboard.component.html',
  styleUrls: ['./exit-reason-dashboard.component.css']
})
export class ExitReasonDashboardComponent implements OnInit, AfterViewInit {

  @ViewChild(CoidTableDashboardComponent, { static: true }) table: CoidTableDashboardComponent;
  @ViewChild('benefitDueElement', { static: false }) benefitDueElement: ElementRef;
  elementKeyUp: Subscription;
  filteredBenefits: ClaimBucketClassModel[];
  benefits: ClaimBucketClassModel[];
  dataLoading = false;
  maxDate = new Date();
  minDate = new Date();

  totalExitReasonClaims = 0;
  form: UntypedFormGroup;
  hasData = false;
  isLoading = false;
  hasTotalClaimExitReasons = false;
  filteredClaims: ExitReasonClaimOverview[];
  totalStpClaims: ExitReasonClaimOverview[];
  noDataHeading = 'No Data Available';
  myDictionary: { [index: string]: number; } = {};

  // Pie chart details
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
      position: 'bottom',
    },
    plugins: {
      datalabels: {
        color: '#040404',
        formatter: (value) => {
          return value > 0 ? value : '';
        },
        anchor: 'end',
        align: 'center',
      }
    },
  };
  public chartLabels: Array<any> = [];
  public chartColors: Array<any> = [
    {
      backgroundColor: [],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513', '#ab8a92', '#293fe6', '#7e8584', '#ffffff', '#4e2452', '#c44588', '#e61c66', '#f5880c', '#a88613'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private changeDedectorRef: ChangeDetectorRef,
    public readonly datepipe: DatePipe,
    public readonly router: Router,
  ) {
    this.loadLookupLists();
  }

  ngAfterViewInit(): void {
    this.generateAutoCompleteSubscriptions();
    this.getClaimBucketClassIds();
  }

  loadLookupLists(): void {
    this.getExitReasonClaimOverview();
  }

  ngOnInit() {
    this.createForm();
    this.minDate.setFullYear(this.minDate.getFullYear() - 3);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      benefitsDue: new UntypedFormControl(''),
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
    });

    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
    })
  }

  // Getting all the initial list with assessors and claims
  getExitReasonClaimOverview() {
    this.clearDataAndLabels();
    this.isLoading = true;
    let stpObject = new ExitReasonDashboardFields();
    stpObject.filter = false;
    stpObject.startDate = this.datepipe.transform(new Date(), Constants.dateString);
    stpObject.endDate = this.datepipe.transform(new Date(), Constants.dateString);
    stpObject.personEventBucketClassId = 0;
    this.claimService.getExitReasonOverview(stpObject).subscribe(result => {
      this.totalStpClaims = result.stpOverview;
      this.filteredClaims = result.stpOverview;
      this.setPageData(this.filteredClaims);
      this.isLoading = false;
    });
  }

  // Setting the piechart and deactivating if no data
  setPageData(result: ExitReasonClaimOverview[]) {
    if (result.length > 0) {
      this.setPieChartData(result);
    } else {
      this.isLoading = false;
      this.hasData = false;
    }
  }

  // Set the pie chart with filtered data
  setPieChartData(stpOverview: ExitReasonClaimOverview[]) {
    this.data = [];
    this.chartLabels = [];
    this.totalExitReasonClaims = stpOverview.length;
    const NoPolicy = this.GetStatusLength(STPExitReasonEnum.NoPolicy, stpOverview);
    const CheckInjury = this.GetStatusLength(STPExitReasonEnum.CheckInjury, stpOverview);
    const GetPolicy = this.GetStatusLength(STPExitReasonEnum.GetPolicy, stpOverview);
    const Injury = this.GetStatusLength(STPExitReasonEnum.Injury, stpOverview);
    const MedicalReport = this.GetStatusLength(STPExitReasonEnum.MedicalReport, stpOverview);
    const ICD10Modified = this.GetStatusLength(STPExitReasonEnum.ICD10Modified, stpOverview);
    const TeamLead = this.GetStatusLength(STPExitReasonEnum.TeamLead, stpOverview);
    const CheckVOPD = this.GetStatusLength(STPExitReasonEnum.CheckVOPD, stpOverview);
    const CheckSTM = this.GetStatusLength(STPExitReasonEnum.CheckSTM, stpOverview);
    const GetClaimType = this.GetStatusLength(STPExitReasonEnum.GetClaimType, stpOverview);
    const CheckReportDate = this.GetStatusLength(STPExitReasonEnum.CheckReportDate, stpOverview);
    const VopdMismatch = this.GetStatusLength(STPExitReasonEnum.VopdMismatch, stpOverview);
    const NoVOPDResponse = this.GetStatusLength(STPExitReasonEnum.NoVOPDResponse, stpOverview);
    const VopdDeceased = this.GetStatusLength(STPExitReasonEnum.VopdDeceased, stpOverview);

    // Populating the dictionary
    this.myDictionary.NoPolicy = NoPolicy;
    this.myDictionary.CheckInjury = CheckInjury;
    this.myDictionary.GetPolicy = GetPolicy;
    this.myDictionary.Injury = Injury;
    this.myDictionary.NoVOPDResponse = NoVOPDResponse;
    this.myDictionary.MedicalReport = MedicalReport;
    this.myDictionary.ICD10Modified = ICD10Modified;
    this.myDictionary.TeamLead = TeamLead;
    this.myDictionary.CheckVOPD = CheckVOPD;
    this.myDictionary.CheckSTM = CheckSTM;
    this.myDictionary.GetClaimType = GetClaimType;
    this.myDictionary.CheckReportDate = CheckReportDate;
    this.myDictionary.VopdMismatch = VopdMismatch;
    this.myDictionary.VopdDeceased = VopdDeceased;
    this.populateDataChart(this.myDictionary);
    this.hasData = true;
    this.isLoading = false;
  }

  GetStatusLength(stpReason: STPExitReasonEnum, stpOverview: ExitReasonClaimOverview[]): number {
    let percentage = stpOverview.filter(c => c.reasonId === stpReason).length / stpOverview.length * 100;
    return parseFloat(percentage.toFixed(2));
  }

  populateDataChart(myDictionary: any) {
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      let keyString = key;
      if (key === Constants.claimRequirement) {
        keyString = Constants.claimRequirementLabel;
      }
      if (key === Constants.checkInjury) {
        keyString = Constants.checkInjuryLabel;
      }
      if (key === Constants.getPolicy) {
        keyString = Constants.getPolicyLabel;
      }
      if (key === Constants.medicalReport) {
        keyString = Constants.medicalReportLabel;
      }
      if (key === Constants.iCD10Modified) {
        keyString = Constants.iCD10ModifiedLabel;
      }
      if (key === Constants.teamLead) {
        keyString = Constants.teamLeadLabel;
      }
      if (key === Constants.checkVOPD) {
        keyString = Constants.checkVOPDLabel;
      }
      if (key === Constants.getVOPDResults) {
        keyString = Constants.getVOPDResultsLabel;
      }
      if (key === Constants.GetClaimType) {
        keyString = Constants.GetClaimTypeLabel;
      }
      if (key === Constants.checkReportDate) {
        keyString = Constants.checkReportDateLabel;
      }
      if (key === Constants.vopdMismatch) {
        keyString = Constants.vopdMismatchLabel;
      }
      if (key === Constants.noVOPDResponse) {
        keyString = Constants.noVOPDResponseLabel;
      }
      if (key === Constants.vopdDeceased) {
        keyString = Constants.vopdDeceasedLabel;
      }
      this.data.push(value);
      this.chartLabels.push(keyString);
    }
  }

  // This method clears all the controls on expansion panel closed event
  ClearData() {
    // this.table.hideTable();
    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      benefitsDue: Constants.prePopulateDropdown,
    })
    this.getExitReasonClaimOverview();
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
          case STPExitReasonEnum[STPExitReasonEnum.NoPolicy]:
            this.setTable(STPExitReasonEnum.NoPolicy);
            break;
          case Constants.checkInjuryLabel:
            this.setTable(STPExitReasonEnum.CheckInjury);
            break;
          case Constants.getPolicyLabel:
            this.setTable(STPExitReasonEnum.GetPolicy);
            break;
          case STPExitReasonEnum[STPExitReasonEnum.Injury]:
            this.setTable(STPExitReasonEnum.Injury);
            break;
          case Constants.medicalReportLabel:
            this.setTable(STPExitReasonEnum.MedicalReport);
            break;
          case Constants.iCD10ModifiedLabel:
            this.setTable(STPExitReasonEnum.ICD10Modified);
            break;
          case Constants.teamLeadLabel:
            this.setTable(STPExitReasonEnum.TeamLead);
            break;
          case Constants.checkVOPDLabel:
            this.setTable(STPExitReasonEnum.CheckVOPD);
            break;
          case Constants.getVOPDResultsLabel:
            this.setTable(STPExitReasonEnum.GetVOPDResults);
            break;
          case STPExitReasonEnum[STPExitReasonEnum.CheckSTM]:
            this.setTable(STPExitReasonEnum.CheckSTM);
            break;
          case Constants.GetClaimTypeLabel:
            this.setTable(STPExitReasonEnum.GetClaimType);
            break;
          case Constants.checkReportDateLabel:
            this.setTable(STPExitReasonEnum.CheckReportDate);
            break;
          case Constants.vopdMismatchLabel:
            this.setTable(STPExitReasonEnum.VopdMismatch);
            break;
          case Constants.noVOPDResponseLabel:
            this.setTable(STPExitReasonEnum.NoVOPDResponse);
            break;
          case Constants.vopdDeceasedLabel:
            this.setTable(STPExitReasonEnum.VopdDeceased);
            break;
        }
      }
    }
  }

  // this is te method being called to populate the table in claim-table-dashboard
  setTable(exitReasonId: STPExitReasonEnum) {
    this.router.navigate(['/claimcare/claim-manager/exit-reason-description/', exitReasonId]);
  }

  public chartHovered(e: any): void { }

  getClaimBucketClassIds() {
    this.claimService.getClaimBucketClasses().subscribe(result => {
      this.benefits = result; this.filteredBenefits = result;
      this.filteredBenefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
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
    let exitReasonFilter = new ExitReasonDashboardFields();
    exitReasonFilter.startDate = this.datepipe.transform(model.startDate, Constants.dateString);
    exitReasonFilter.endDate = this.datepipe.transform(model.endDate, Constants.dateString);
    exitReasonFilter.personEventBucketClassId = model.benefitsDue === Constants.prePopulateDropdown ? 0 : this.benefits.find(a => a.name === model.benefitsDue).claimBucketClassId;;
    exitReasonFilter.filter = true;

    this.dataLoading = true;
    this.claimService.getExitReasonOverview(exitReasonFilter).subscribe(result => {
      if (result.stpOverview && result.stpOverview.length > 0) {
        this.totalStpClaims = result.stpOverview;
        this.setPageData(this.totalStpClaims);
        this.dataLoading = false;
      } else {
        this.totalStpClaims = [];
        this.setPageData(this.totalStpClaims);
        this.dataLoading = false;
      }
    });
  }

  generateAutoCompleteSubscriptions() {
    // insuranceTypes
    this.elementKeyUp = fromEvent(this.benefitDueElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredBenefits = this.benefits;
        return;
      }
      this.filteredBenefits = this.benefits.filter(option => String.contains(option.name, searchData));
    });
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
