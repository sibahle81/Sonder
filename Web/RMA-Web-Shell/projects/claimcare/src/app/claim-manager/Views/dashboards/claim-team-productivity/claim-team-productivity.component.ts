import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { Claim } from '../../../shared/entities/funeral/claim.model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { WeekDaysEnum } from 'projects/shared-models-lib/src/lib/enums/week-days.enum';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import { ClaimTableProductivityComponent } from 'projects/claimcare/src/app/claim-manager/views/dashboards/claim-table-productivity/claim-table-productivity.component';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'claim-team-productivity',
  templateUrl: './claim-team-productivity.component.html',
  styleUrls: ['./claim-team-productivity.component.css']
})
export class ClaimTeamProductivityComponent implements OnInit {

  @ViewChild(ClaimTableProductivityComponent, { static: true }) table: ClaimTableProductivityComponent;

  totalClaims = 0;
  form: UntypedFormGroup;
  hasData = false;
  isLoading = false;
  isAssessorSelected = false;
  assessors: User[];
  assessorId: number;
  hideToggle: boolean;
  hasTotalClaims = false;
  filteredClaims: Claim[];
  totalAssessorClaims: Claim[];
  noDataHeading = 'No Data Available';
  myDictionary: { [index: string]: number; } = {};

  // Pie chart details
  public chartType = 'bar';
  public data: number[] = [];
  public pieChartLegend = false;
  public pieChartPlugins = [pluginDataLabels];
  public pieChartOptions: ChartOptions = {
    scales : {
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
        anchor: 'center',
        align: 'center',
        color: 'rgb(255,255,255)',
        backgroundColor: 'rgb(0,0,0)',
        formatter: (value, ctx) => {
          const label = `${ctx.dataset.data[ctx.dataIndex]}`;
          return label;
        },
      },
    }
  };
  public chartLabels: Array<any> = [];
  public chartColors: Array<any> = [
    {
      backgroundColor: ['#E56D99', '#f59d38', '#a68e3f', '#e8e517', '#55bbbd', '#90e86b', '#ed5345', '#ad979c', '#5062eb', '#b1bdbc', '#ffffff', '#4b364d'],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513', '#ab8a92', '#293fe6', '#7e8584', '#ffffff', '#4e2452'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
  ) {
    this.loadLookupLists();
  }

  loadLookupLists(): void {
    this.getAssessorsAndClaims(false);
  }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group(
      {
        Period: new UntypedFormControl(''),
        Assessor: new UntypedFormControl(''),
      }
    );
  }

  // Getting all the initial list with assessors and claims
  getAssessorsAndClaims(hasTotalClaims: boolean) {
    this.clearDataAndLabels();
    this.isLoading = true;
    if (hasTotalClaims) {
      this.filteredClaims = this.totalAssessorClaims;
      this.setPageData(this.filteredClaims);
      this.isLoading = false;
    } else {
      this.claimService.getClaimsAssessors().subscribe(result => {
        this.totalAssessorClaims = result.claims;
        this.filteredClaims = result.claims;
        this.assessors = result.users;
        this.setPageData(this.filteredClaims);
        this.isLoading = false;
      });
    }
  }

  // selects the assessor
  onAssessorSelect($event: any) {
    if ($event.value !== undefined) {
      this.clearDataAndLabels();
      this.isAssessorSelected = true;
      this.isLoading = true;
      this.assessorId = $event.value;
      const result = this.filteredClaims.filter(a => a.assignedToUserId === $event.value);
      this.setPageData(result);
      this.table.hideTable();
    }
  }

  // Setting the piechart and deactivating if no data
  setPageData(result: Claim[]) {
    if (result.length > 0) {
      this.setPieChartData(result);
    } else {
      this.isLoading = false;
      this.hasData = false;
    }
  }

  // Set the pie chart with filtered data
  setPieChartData(claims: Claim[]) {
    this.data = [];
    this.chartLabels = [];
    this.totalClaims = claims.length;
    const newClaims = this.GetStatusLength(ClaimStatusEnum.New, claims);
    const received = this.GetStatusLength(ClaimStatusEnum.Received, claims);
    const pendingRequirements = this.GetStatusLength(ClaimStatusEnum.PendingRequirements, claims);
    const awaitingDecision = this.GetStatusLength(ClaimStatusEnum.AwaitingDecision, claims);
    const pendingPolicyAdmin = this.GetStatusLength(ClaimStatusEnum.PendingPolicyAdmin, claims);
    const closed = this.GetStatusLength(ClaimStatusEnum.Closed, claims);
    const cancelled = this.GetStatusLength(ClaimStatusEnum.Cancelled, claims);
    const awaitingReversalDecision = this.GetStatusLength(ClaimStatusEnum.AwaitingReversalDecision, claims);
    const paid = this.GetStatusLength(ClaimStatusEnum.Paid, claims);
    const declined = this.GetStatusLength(ClaimStatusEnum.Declined, claims);
    const pendingInvestigations = this.GetStatusLength(ClaimStatusEnum.PendingInvestigations, claims);
    const investigationCompleted = this.GetStatusLength(ClaimStatusEnum.InvestigationCompleted, claims);
    const approved = this.GetStatusLength(ClaimStatusEnum.Approved, claims);
    const authorised = this.GetStatusLength(ClaimStatusEnum.Authorised, claims);
    const reopened = this.GetStatusLength(ClaimStatusEnum.Reopened, claims);
    const exGratia = this.GetStatusLength(ClaimStatusEnum.ExGratia, claims);
    const exGratiaApproved = this.GetStatusLength(ClaimStatusEnum.ExGratiaApproved, claims);
    const exGratiaAuthorised = this.GetStatusLength(ClaimStatusEnum.ExGratiaAuthorised, claims);
    const noClaim = this.GetStatusLength(ClaimStatusEnum.NoClaim, claims);
    const unclaimed = this.GetStatusLength(ClaimStatusEnum.Unclaimed, claims);
    const returnToAssessor = this.GetStatusLength(ClaimStatusEnum.ReturnToAssessor, claims);
    const waived = this.GetStatusLength(ClaimStatusEnum.Waived, claims);
    const unpaid = this.GetStatusLength(ClaimStatusEnum.Unpaid, claims);
    const policyAdminCompleted = this.GetStatusLength(ClaimStatusEnum.PolicyAdminCompleted, claims);
    const paymentRecovery = this.GetStatusLength(ClaimStatusEnum.PaymentRecovery, claims);
    const awaitingDeclineDecision = this.GetStatusLength(ClaimStatusEnum.AwaitingDeclineDecision, claims);
    const returnToAssessorAfterDeclined = this.GetStatusLength(ClaimStatusEnum.ReturnToAssessorAfterDeclined, claims);
    const reversed = this.GetStatusLength(ClaimStatusEnum.Reversed, claims);
    const reversalRejected = this.GetStatusLength(ClaimStatusEnum.ReversalRejected, claims);
    const repay = this.GetStatusLength(ClaimStatusEnum.Repay, claims);

    this.myDictionary.NewClaims = newClaims;
    this.myDictionary.Received = received;
    this.myDictionary.PendingRequirements = pendingRequirements;
    this.myDictionary.AwaitingDecision = awaitingDecision;
    this.myDictionary.PendingPolicyAdmin = pendingPolicyAdmin;
    this.myDictionary.Closed = closed;
    this.myDictionary.Cancelled = cancelled;
    this.myDictionary.AwaitingReversalDecision = awaitingReversalDecision;
    this.myDictionary.Paid = paid;
    this.myDictionary.Declined = declined;
    this.myDictionary.PendingInvestigations = pendingInvestigations;
    this.myDictionary.InvestigationCompleted = investigationCompleted;
    this.myDictionary.Approved = approved;
    this.myDictionary.Authorised = authorised;
    this.myDictionary.Reopened = reopened;
    this.myDictionary.ExGratia = exGratia;
    this.myDictionary.ExGratiaApproved = exGratiaApproved;
    this.myDictionary.ExGratiaAuthorised = exGratiaAuthorised;
    this.myDictionary.NoClaim = noClaim;
    this.myDictionary.Unclaimed = unclaimed;
    this.myDictionary.ReturnToAssessor = returnToAssessor;
    this.myDictionary.Waived = waived;
    this.myDictionary.Unpaid = unpaid;
    this.myDictionary.PolicyAdminCompleted = policyAdminCompleted;
    this.myDictionary.PaymentRecovery = paymentRecovery;
    this.myDictionary.AwaitingDeclineDecision = awaitingDeclineDecision;
    this.myDictionary.ReturnToAssessorAfterDeclined = returnToAssessorAfterDeclined;
    this.myDictionary.Reversed = reversed;
    this.myDictionary.ReversalRejected = reversalRejected;
    this.myDictionary.Repay = repay;

    this.populateDataChart(this.myDictionary);
    this.hasData = true;
    this.isLoading = false;
  }

  GetStatusLength(claimStatus: ClaimStatusEnum, claims: Claim[]): number {
    return claims.filter(c => c.claimStatus === claimStatus).length;
  }


  populateDataChart(myDictionary: any) {
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      const keyString = key;
      if (value > 0) {
        this.data.push(value);
        this.chartLabels.push(keyString);
      }
    }
  }

  // On period filter for both group and individual
  onPeriodFilter($event: any) {
    if ($event.value !== undefined) {
      this.table.hideTable();
      this.clearDataAndLabels();

      switch ($event.value) {
        // Daily
        case 1:
          const myDate = new Date();
          const dailyResult = this.filteredClaims.filter(a => a.createdDate === myDate);
          this.setPageData(dailyResult);
          break;
        // Weekly
        case 2:
          let monday: Date;
          const day = new Date().getDay();
          const weekToday = new Date();

          const weekEnumValues = Object.values(WeekDaysEnum);
          for (const value in weekEnumValues) {
            if (value === day.toString()) {
              monday = new Date(Date.now() - day - 1 * 24 * 60 * 60 * 1000);
              this.filterDate(monday, weekToday);
            }
          }
          break;
        // Monthly
        case 3:
          let january: Date;
          const thisMonthsDate = new Date();
          const month = new Date().getMonth();

          const monthEnumValues = Object.values(MonthEnum);
          for (const value in monthEnumValues) {
            if (value === month.toString()) {
              january = new Date(new Date().setMonth(new Date().getMonth() - month));
              this.filterDate(january, thisMonthsDate);
            }
          }
          break;
        // YTD
        case 4:
          const yarAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          const yearTomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
          const periodData = this.filteredClaims.filter(a => new Date(a.createdDate) >= yarAgo && new Date(a.createdDate) <= yearTomorrow);
          this.setPageData(periodData);
          break;
      }
    }
  }

  // The method being called by the period filter
  filterDate(backDate: Date, todayDate: Date) {
    const result = this.filteredClaims.filter(a => new Date(a.createdDate) >= backDate && new Date(a.createdDate) <= todayDate);
    this.setPageData(result);
  }

  // This method clears all the controls on expansion panel closed event
  ClearData() {
    this.table.hideTable();
    this.form.patchValue({
      Assessor: []
    });
    this.assessorId = 0;
    this.getAssessorsAndClaims(true);
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
          case ClaimStatusEnum[ClaimStatusEnum.Paid]:
            this.setTable(ClaimStatusEnum.Paid, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Declined]:
            this.setTable(ClaimStatusEnum.Declined, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.New]:
            this.setTable(ClaimStatusEnum.New, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Authorised]:
            this.setTable(ClaimStatusEnum.Authorised, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Approved]:
            this.setTable(ClaimStatusEnum.Approved, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Reopened]:
            this.setTable(ClaimStatusEnum.Reopened, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Unpaid]:
            this.setTable(ClaimStatusEnum.Unpaid, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Closed]:
            this.setTable(ClaimStatusEnum.Closed, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.AwaitingDecision]:
            const awaitingDecision = 'Awaiting Decision';
            this.setTable(ClaimStatusEnum.AwaitingDecision, awaitingDecision);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.PendingRequirements]:
            const pendingRequirements = 'Pending Requirements';
            this.setTable(ClaimStatusEnum.PendingRequirements, pendingRequirements);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.PendingPolicyAdmin]:
            const pendingAdmin = 'Pending Admin';
            this.setTable(ClaimStatusEnum.PendingPolicyAdmin, pendingAdmin);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.PendingInvestigations]:
            const pendingInvestigations = 'Pending Investigations';
            this.setTable(ClaimStatusEnum.PendingInvestigations, pendingInvestigations);
            break;
        }
      }
    }
  }

  // this is te method being called to populate the table in claim-table-dashboard
  setTable(claimStatus: ClaimStatusEnum, labelName: string) {
    if (this.assessorId > 0) {
      const assessor = this.assessors.find(a => a.id === this.assessorId);
      const name = assessor.name;
      this.table.fillData(this.filteredClaims.filter(a => a.claimStatus === claimStatus && a.assignedToUserId === assessor.id), `${name} ${labelName} Claims`);
    } else {
      this.table.fillData(this.filteredClaims.filter(a => a.claimStatus === claimStatus && a.assignedToUserId), `Productivity ${labelName} Claims`);
    }
  }
  public chartHovered(e: any): void { }
}
