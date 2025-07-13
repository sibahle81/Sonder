import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { Claim } from '../../../shared/entities/funeral/claim.model';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { CoverTypeModel } from '../../../shared/entities/cover-type-model';
import { PolicyClaim } from '../../../shared/entities/policy-claim.model';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { CoverTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-type.enum';
import { WeekDaysEnum } from 'projects/shared-models-lib/src/lib/enums/week-days.enum';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions } from 'chart.js';
import { ClaimTableTurnaroundComponent } from '../claim-table-turnaround/claim-table-turnaround.component';

@Component({
  selector: 'claim-turnover',
  templateUrl: './claim-turnaround.component.html',
  styleUrls: ['./claim-turnaround.component.css']
})
export class ClaimTurnaroundComponent implements OnInit {

  @ViewChild(ClaimTableTurnaroundComponent, { static: true }) table: ClaimTableTurnaroundComponent;

  form: UntypedFormGroup;
  isLoading = false;
  policyClaim = new PolicyClaim();
  covertypes: number[] = [];
  fixedTotalClaims = 0;
  fixedTotalPolicyCount = 0;
  noDataHeading = 'No Data Available';
  lessThanDayHeading = 'All Statuses Took Less Than a Day';
  myDictionary: { [index: string]: number; } = {};
  individualLessADay = false;
  groupLessADay = false;

  // List
  differenceInDaysNew: number;

  // INDIVIDUAL
  summaryTotalClaims = 0;
  summaryTotalPolicies = 0;
  hasIndividualData = false;
  individualFilteredClaims: Claim[];
  individualCovertypeId = CoverTypeEnum.IndividualVoluntary;

  // GROUP
  hasGroupData = false;
  summaryGroupTotalClaims = 0;
  summaryGroupTotalPolicies = 0;
  groupFilteredClaims: Claim[];
  groupCovertypeVoluntary = CoverTypeEnum.GroupVoluntary;
  groupCovertypeCompulsory = CoverTypeEnum.GroupCompulsory;
  corporateCovertypeVoluntary = CoverTypeEnum.CorporateVoluntary;
  corporateCovertypeCompulsory = CoverTypeEnum.CorporateCompulsory;

  // Pie chart data
  public chartType = 'bar';
  public individualData: number[] = [];
  public groupData: number[] = [];
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
  public individualChartLabels: Array<any> = [];
  public groupChartLabels: Array<any> = [];
  public chartColors: Array<any> = [
    {
      backgroundColor: ['#E56D99', '#f59d38', '#a68e3f', '#e8e517', '#55bbbd', '#90e86b', '#ed5345', '#ad979c', '#5062eb', '#b1bdbc', '#a054e8', '#4b364d'],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513', '#ab8a92', '#293fe6', '#7e8584', '#7d12e3', '#4e2452'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService) {
    this.loadLookupLists();
  }

  loadLookupLists(): void {
    this.getAllIndividualClaims();
    this.getGroupClaims();
  }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group(
      {
        groupPeriodFilter: new UntypedFormControl(''),
        individualPeriodFilter: new UntypedFormControl('')
      }
    );
  }

  // Loading all the individual claims
  public getAllIndividualClaims() {
    this.isLoading = true;
    const dashboardCoverTypes = this.getDashboardCoverType(false);
    dashboardCoverTypes.brokerageId = 0;

    this.claimService.getSlaClaims(dashboardCoverTypes).subscribe(result => {
      this.individualFilteredClaims = result.claims;
      this.summaryTotalClaims = result.claims.length;
      this.summaryTotalPolicies = result.policyCount;
      this.fixedTotalClaims = result.claims.length;
      this.fixedTotalPolicyCount = result.policyCount;
      this.setPageData(result, false);
      this.isLoading = false;
    });
  }

  // Clearing all the controls for individual
  ClearIndividualData() {
    this.table.hideTable();
    this.clearData(false);
    this.isLoading = false;
    this.form.patchValue({
      individualPeriodFilter: [],
    });
    this.getAllIndividualClaims();
  }

  // ======== GROUP ======== //

  // Loading all the Group claims
  public getGroupClaims() {
    this.isLoading = true;
    const dashboardCoverTypes = this.getDashboardCoverType(true);
    dashboardCoverTypes.brokerageId = 0;

    this.claimService.getSlaClaims(dashboardCoverTypes).subscribe(result => {
      if (result.claims.length > 0) {
        this.groupFilteredClaims = result.claims;
        this.summaryGroupTotalClaims = result.claims.length;
        this.summaryGroupTotalPolicies = result.policyCount;
        this.setPageData(result, true);
      } else {
        this.summaryGroupTotalClaims = 0;
        this.summaryGroupTotalPolicies = 0;
      }
    });
  }

  // Getting all the cover types to pass through in cover type model
  getDashboardCoverType(isGroup: boolean): CoverTypeModel {
    const coverTypeObject = new CoverTypeModel();
    if (!isGroup) {
      this.covertypes = [];
      this.covertypes.push(this.individualCovertypeId);
      coverTypeObject.coverTypeIds = this.covertypes;
    } else {
      this.covertypes = [];
      this.covertypes.push(this.groupCovertypeVoluntary);
      this.covertypes.push(this.groupCovertypeCompulsory);
      this.covertypes.push(this.corporateCovertypeVoluntary);
      this.covertypes.push(this.corporateCovertypeCompulsory);
      coverTypeObject.coverTypeIds = this.covertypes;
    }
    return coverTypeObject;
  }

  // Clearing all the controls for group
  ClearGroupData() {
    this.table.hideTable();
    this.clearData(true);
    this.form.patchValue({
      groupFrequencyFilter: []
    });
    this.getGroupClaims();
  }

  // ======= METHODS THAT ARE BEING USED BY INDIVIDUAL AND GROUP ========== //

  // Setting the pie chart data
  setPieChartData(result: PolicyClaim, isGroup: boolean) {
    const newClaims = this.calculateNewClaims(result);
    const received = this.calculateClaimStatusDates(result, ClaimStatusEnum.Received);
    const pendingRequirements = this.calculateClaimStatusDates(result, ClaimStatusEnum.PendingRequirements);
    const awaitingDecision = this.calculateClaimStatusDates(result, ClaimStatusEnum.AwaitingDecision);
    const pendingPolicyAdmin = this.calculateClaimStatusDates(result, ClaimStatusEnum.PendingPolicyAdmin);
    const closed = this.calculateClaimStatusDates(result, ClaimStatusEnum.Closed);
    const cancelled = this.calculateClaimStatusDates(result, ClaimStatusEnum.Cancelled);
    const awaitingReversalDecision = this.calculateClaimStatusDates(result, ClaimStatusEnum.AwaitingReversalDecision);
    const paid = this.calculateClaimStatusDates(result, ClaimStatusEnum.Paid);
    const declined = this.calculateClaimStatusDates(result, ClaimStatusEnum.Declined);
    const pendingInvestigations = this.calculateClaimStatusDates(result, ClaimStatusEnum.PendingInvestigations);
    const investigationCompleted = this.calculateClaimStatusDates(result, ClaimStatusEnum.InvestigationCompleted);
    const approved = this.calculateClaimStatusDates(result, ClaimStatusEnum.Approved);
    const authorised = this.calculateClaimStatusDates(result, ClaimStatusEnum.Authorised);
    const reopened = this.calculateClaimStatusDates(result, ClaimStatusEnum.Reopened);
    const exGratia = this.calculateClaimStatusDates(result, ClaimStatusEnum.ExGratia);
    const exGratiaApproved = this.calculateClaimStatusDates(result, ClaimStatusEnum.ExGratiaApproved);
    const exGratiaAuthorised = this.calculateClaimStatusDates(result, ClaimStatusEnum.ExGratiaAuthorised);
    const noClaim = this.calculateClaimStatusDates(result, ClaimStatusEnum.NoClaim);
    const unclaimed = this.calculateClaimStatusDates(result, ClaimStatusEnum.Unclaimed);
    const returnToAssessor = this.calculateClaimStatusDates(result, ClaimStatusEnum.ReturnToAssessor);
    const waived = this.calculateClaimStatusDates(result, ClaimStatusEnum.Waived);
    const unpaid = this.calculateClaimStatusDates(result, ClaimStatusEnum.Unpaid);
    const policyAdminCompleted = this.calculateClaimStatusDates(result, ClaimStatusEnum.PolicyAdminCompleted);
    const paymentRecovery = this.calculateClaimStatusDates(result, ClaimStatusEnum.PaymentRecovery);
    const awaitingDeclineDecision = this.calculateClaimStatusDates(result, ClaimStatusEnum.AwaitingDeclineDecision);
    const returnToAssessorAfterDeclined = this.calculateClaimStatusDates(result, ClaimStatusEnum.ReturnToAssessorAfterDeclined);
    const reversed = this.calculateClaimStatusDates(result, ClaimStatusEnum.Reversed);
    const reversalRejected = this.calculateClaimStatusDates(result, ClaimStatusEnum.ReversalRejected);
    const repay = this.calculateClaimStatusDates(result, ClaimStatusEnum.Repay);

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

    if (isGroup) {
      this.populateDataChart(this.myDictionary, true);
      this.hasGroupData = true;
    } else {
      this.populateDataChart(this.myDictionary, false);
      this.hasIndividualData = true;
    }
    this.isLoading = false;
    this.table.hideTable();
  }

  // Calculating the claimStatus dates
  calculateClaimStatusDates(result: PolicyClaim, claimStatusEnum: ClaimStatusEnum): number {
    let newCounter = 0;
    const paidFilter = result.claims.filter(c => c.claimStatus === claimStatusEnum);
    const amountOfClaims = paidFilter.length;

    paidFilter.forEach(a => {
      const dateCreatedClaim = a.createdDate;
      const claimStatusChangeDate = a.claimStatusChangeDate;
      if (claimStatusChangeDate == null) { return; }
      const differenceInTime = new Date(claimStatusChangeDate).getTime() - new Date(dateCreatedClaim).getTime();
      this.differenceInDaysNew = differenceInTime / (1000 * 3600 * 24);

      newCounter += this.differenceInDaysNew;
      newCounter = newCounter / amountOfClaims;
    });
    return parseFloat(newCounter.toFixed(2));
  }

  clearData(isGroup: boolean) {
    if (isGroup) {
      this.groupData = [];
      this.groupChartLabels = [];
    } else {
      this.individualData = [];
      this.individualChartLabels = [];
    }
  }

  populateDataChart(myDictionary: any, isGroup: boolean) {
    let individualTotal = 0;
    let groupTotal = 0;
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      const keyString = key;
      if (value > 0.01) {
        if (isGroup) {
          this.groupData.push(value);
          this.groupChartLabels.push(keyString);
        } else {
          this.individualData.push(value);
          this.individualChartLabels.push(keyString);
        }
      } else {
        if (isGroup) {
          groupTotal += 1;
        } else {
          individualTotal += 1;
        }
      }
      if (groupTotal === 30) { this.groupLessADay = true; }
      if (individualTotal === 30) { this.individualLessADay = true; }
    }
  }

  // Calculating the new claims
  calculateNewClaims(result: PolicyClaim): number {
    let newCounter = 0;
    const newFilter = result.claims.filter(c => c.claimStatus === ClaimStatusEnum.New);
    const amountOfNewClaims = newFilter.length;

    newFilter.forEach(a => {
      const personEventdeathDate = a.personEventDeathDate;
      const dateCreatedClaim = a.createdDate;
      const differenceInTime = new Date(dateCreatedClaim).getTime() - new Date(personEventdeathDate).getTime();
      this.differenceInDaysNew = differenceInTime / (1000 * 3600 * 24);

      newCounter += this.differenceInDaysNew;
      newCounter = newCounter / amountOfNewClaims;
    });
    return parseFloat(newCounter.toFixed(2));
  }

  // The method being called by the period filter
  filterDate(backDate: Date, todayDate: Date, isGroup: boolean) {
    if (isGroup) {
      this.policyClaim.claims = this.groupFilteredClaims.filter(a => new Date(a.createdDate) >= backDate && new Date(a.createdDate) <= todayDate);
      this.summaryGroupTotalClaims = this.policyClaim.claims.length;
    } else {
      this.policyClaim.claims = this.individualFilteredClaims.filter(a => new Date(a.createdDate) >= backDate && new Date(a.createdDate) <= todayDate);
      this.summaryTotalClaims = this.policyClaim.claims.length;
    }
    this.setPageData(this.policyClaim, isGroup);
  }

  // Setting the piechart and deactivating if no data
  setPageData(result: PolicyClaim, isGroup: boolean) {
    if (result.claims.length > 0) {
      this.setPieChartData(result, isGroup);
    } else {
      if (isGroup) {
        this.hasGroupData = false;
        this.summaryGroupTotalClaims = this.fixedTotalClaims;
        this.summaryGroupTotalPolicies = this.fixedTotalPolicyCount;
      } else {
        this.hasIndividualData = false;
        this.summaryTotalClaims = this.fixedTotalClaims;
        this.summaryTotalPolicies = this.fixedTotalPolicyCount;
      }
    }
  }

  // On period filter for both group and individual
  onPeriodFilter($event: any, isGroup: boolean) {
    this.table.hideTable();
    this.clearData(isGroup);
    if ($event.value !== undefined) {
      switch ($event.value) {
        // Daily
        case 1:
          const myDate = new Date();
          if (isGroup) {
            const result = this.groupFilteredClaims.filter(a => a.createdDate === myDate);
            this.policyClaim.claims = result;
          } else {
            const result = this.individualFilteredClaims.filter(a => a.createdDate === myDate);
            this.policyClaim.claims = result;
          }
          this.setPageData(this.policyClaim, isGroup);
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
              this.filterDate(monday, weekToday, isGroup);
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
              this.filterDate(january, thisMonthsDate, isGroup);
            }
          }
          break;
        // YTD
        case 4:
          const yarAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          const yearTomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
          let periodData: Claim[];
          if (isGroup) {
            periodData = this.groupFilteredClaims.filter(a => new Date(a.createdDate) >= yarAgo && new Date(a.createdDate) <= yearTomorrow);
          } else {
            periodData = this.individualFilteredClaims.filter(a => new Date(a.createdDate) >= yarAgo && new Date(a.createdDate) <= yearTomorrow);
          }
          this.policyClaim.claims = periodData;

          this.setPageData(this.policyClaim, isGroup);
          break;
      }
    }
  }

  // This is the method being called when you click on the pie chart
  public chartClicked(e: any, isGroup: boolean): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {

        const clickedElementIndex = activePoints[0]._index;
        const labelName = chart.data.labels[clickedElementIndex];

        switch (labelName) {
          case ClaimStatusEnum[ClaimStatusEnum.Paid]:
            this.setTable(ClaimStatusEnum.Paid, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Declined]:
            this.setTable(ClaimStatusEnum.Declined, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.New]:
            this.setTable(ClaimStatusEnum.New, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Authorised]:
            this.setTable(ClaimStatusEnum.Authorised, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Approved]:
            this.setTable(ClaimStatusEnum.Approved, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Reopened]:
            this.setTable(ClaimStatusEnum.Reopened, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Unpaid]:
            this.setTable(ClaimStatusEnum.Unpaid, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.Closed]:
            this.setTable(ClaimStatusEnum.Closed, isGroup, labelName);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.AwaitingDecision]:
            const awaitingDecision = 'Awaiting Decision';
            this.setTable(ClaimStatusEnum.AwaitingDecision, isGroup, awaitingDecision);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.PendingRequirements]:
            const pendingRequirements = 'Pending Requirements';
            this.setTable(ClaimStatusEnum.PendingRequirements, isGroup, pendingRequirements);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.PendingPolicyAdmin]:
            const pendingAdmin = 'Pending Admin';
            this.setTable(ClaimStatusEnum.PendingPolicyAdmin, isGroup, pendingAdmin);
            break;
          case ClaimStatusEnum[ClaimStatusEnum.PendingInvestigations]:
            const pendingInvestigations = 'Pending Investigations';
            this.setTable(ClaimStatusEnum.PendingInvestigations, isGroup, pendingInvestigations);
            break;
        }
      }
    }
  }

  // this is te method being called to populate the table in claim-table-dashboard
  setTable(claimStatus: ClaimStatusEnum, isGroup: boolean, labelName: string) {
    if (isGroup) {
      const result = this.groupFilteredClaims.filter(a => a.claimStatus === claimStatus);
      this.table.fillData(result, `Group SLA ${result.length} ${labelName} Claims`);
    } else {
      const result = this.individualFilteredClaims.filter(a => a.claimStatus === claimStatus);
      this.table.fillData(result, `Individual SLA ${result.length} ${labelName} Claims`);
    }
  }

  public chartHovered(e: any): void { }
}
