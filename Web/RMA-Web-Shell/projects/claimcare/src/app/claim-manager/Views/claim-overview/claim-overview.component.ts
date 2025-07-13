import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { CoverTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-type.enum';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { PolicyClaim } from '../../shared/entities/policy-claim.model';
import { ClaimCareService } from '../../Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { Claim } from '../../shared/entities/funeral/claim.model';

import { CoverTypeModel } from '../../shared/entities/cover-type-model';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import { WeekDaysEnum } from 'projects/shared-models-lib/src/lib/enums/week-days.enum';
import { ClaimTableDashboardComponent } from '../dashboards/claim-table-dashboard/claim-table-dashboard.component';
import { ChartOptions } from 'chart.js';
import { CorporateResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/corporate-result';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'claim-overview',
  templateUrl: './claim-overview.component.html',
  styleUrls: ['./claim-overview.component.css']
})
export class ClaimOverviewComponent implements OnInit {

  @ViewChild(ClaimTableDashboardComponent, { static: true }) table: ClaimTableDashboardComponent;

  brokerClaimCount = 0;
  fixedTotalClaims = 0;
  brokerPolicyCount = 0;
  fixedTotalPolicyCount = 0;

  form: UntypedFormGroup;
  message: string;
  isGroup = false;
  isLoading = false;
  isPeriodLoading = false;
  covertypes: number[] = [];
  policyClaim = new PolicyClaim();
  noDataHeading = 'No Data Available';
  myDictionary: { [index: string]: number; } = {};

  // INDIVIDUAL
  summaryTotalClaims = 0;
  summaryTotalPolicies = 0;
  hasIndividualData = false;
  isPeriodDropDownActive = false;
  hasIndividualBrokerages = false;
  hasIndividualProductOptions = false;
  allIndividualClaims: Claim[];
  individualFilteredClaims: Claim[];
  individualBrokerages: Lookup[];
  individualProductOptions: ProductOption[];
  individualCovertypeId = CoverTypeEnum.IndividualVoluntary;

  // GROUP
  summaryGroupTotalClaims = 0;
  summaryGroupTotalPolicies = 0;
  groupScheme = false;
  hasGroupData = false;
  hasGroupCorporate = false;
  hasGroupBrokerages = false;
  allGroupClaims: Claim[];
  groupBrokerages: Lookup[];
  groupCorporate: CorporateResult[];
  groupFilteredClaims: Claim[];
  groupProductOptions: ProductOption[];

  groupCovertypeVoluntary = CoverTypeEnum.GroupVoluntary;
  groupCovertypeCompulsory = CoverTypeEnum.GroupCompulsory;
  staffCovertypeVoluntary = CoverTypeEnum.StaffVoluntary;
  staffCovertypeCompulsory = CoverTypeEnum.StaffCompulsory;
  corporateCovertypeVoluntary = CoverTypeEnum.CorporateVoluntary;
  corporateCovertypeCompulsory = CoverTypeEnum.CorporateCompulsory;

  // Chart Details below
  public chartType = 'bar';
  public groupData: number[] = [];
  public individualData: number[] = [];
  public pieChartLegend = false;
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
      backgroundColor: ['#E56D99', '#f59d38', '#a68e3f', '#e8e517', '#55bbbd', '#90e86b', '#ed5345', '#ad979c', '#5062eb', '#b1bdbc', '#2F4F4F', '#4b364d', '#D98880', '#F06292', '#66BB6A'],
      hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513', '#ab8a92', '#293fe6', '#7e8584', '#20B2AA', '#4e2452', '#D98880', '#EC407A', '#43A047'],
      borderWidth: 2,
    }
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly brokerageService: BrokerageService,
    private readonly productOptionService: ProductOptionService,
  ) {
    this.loadLookupLists();
  }

  loadLookupLists(): void {
    this.getAllIndividualClaims();
    this.getIndividualSchemes();
    this.getIndividualBrokerages();

    this.getGroupClaims();
    this.getGroupSchemes();
    this.getGroupBrokerages();
    this.getCorporates();
  }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group(
      {
        individualType: new UntypedFormControl(''),
        individualResult: new UntypedFormControl(''),
        individualBrokerageResult: new UntypedFormControl(''),
        individualPeriodFilter: new UntypedFormControl(''),
        groupType: new UntypedFormControl(''),
        groupBrokeragesResult: new UntypedFormControl(''),
        groupEmployersResult: new UntypedFormControl(''),
        groupSchemeResult: new UntypedFormControl(''),
        groupCorporateResult: new UntypedFormControl(''),
        groupPeriodFilter: new UntypedFormControl('')
      }
    );
  }

  // ======== INDIVIDUAL METHODS ======== //
  // Loading all the individual claims
  public getAllIndividualClaims() {
    this.isLoading = true;
    const dashboardCoverTypes = this.getDashboardCoverType(false);
    dashboardCoverTypes.brokerageId = 0;
    this.claimService.GetClaimsByCoverTypeIds(dashboardCoverTypes).subscribe(result => {
      this.allIndividualClaims = result.claims;
      this.individualFilteredClaims = result.claims;
      this.summaryTotalClaims = result.claims.length;
      this.summaryTotalPolicies = result.policyCount;
      this.fixedTotalPolicyCount = result.policyCount;
      this.fixedTotalClaims = result.claims.length;
      this.setPageData(result, false);
    });
  }

  // Getting all the options if Scheme was selected
  public getIndividualSchemes() {
    this.isLoading = true;
    this.setCoverTypeids();
    this.productOptionService.GetProductOptionsByCoverTypeIds(this.covertypes).subscribe(result => {
      this.individualProductOptions = result;
      this.isLoading = false;
    });
  }

  // Getting all the brokerages
  getIndividualBrokerages() {
    this.setCoverTypeids();
    this.brokerageService.getBrokeragesByCoverTypeIds(this.covertypes).subscribe(brokerages => {
      this.individualBrokerages = brokerages;
    });
  }

  // Clearing the individual dropdown
  clearIndividualPeriodFilter() {
    this.form.patchValue({ individualPeriodFilter: [] });
    this.isPeriodDropDownActive = false;
  }

  // all the Individual dropdown methods below
  onIndividualSelect($event: any) {
    if ($event.value !== undefined) {

      this.table.hideTable();
      this.clearData(false);
      this.clearIndividualPeriodFilter();
      this.SetPieChartWithAllIndividualClaims();

      switch ($event.value) {
        // Brokerage
        case 1:
          this.hasIndividualBrokerages = true;
          this.hasIndividualProductOptions = false;
          if (this.individualBrokerages.length > 0) {
            this.form.patchValue({
              individualBrokerageResult: this.individualBrokerages
            });
          } else {
            this.noDataHeading = 'No Brokerages available';
            this.hasIndividualBrokerages = false;
            this.hasIndividualData = false;
          }
          break;
        // Scheme
        case 2:
          this.hasIndividualBrokerages = false;
          this.hasIndividualProductOptions = true;
          this.form.patchValue({
            individualResult: this.individualProductOptions
          });
          break;
      }
    }
  }

  // Setting the pie chart with all the individual claims
  SetPieChartWithAllIndividualClaims() {
    this.summaryTotalClaims = this.fixedTotalClaims;
    this.policyClaim.claims = this.allIndividualClaims;
    this.policyClaim.policyCount = this.fixedTotalPolicyCount;

    this.setPageData(this.policyClaim, false);
  }

  // Getting all the claims on specific option
  onSchemOptionsSelect($event: any, isGroup: boolean) {
    if ($event.value !== undefined) {
      this.isLoading = true;
      this.table.hideTable();
      this.clearData(isGroup);
      this.clearGroupPeriodFilter();

      this.claimService.getClaimsByProductOptionId($event.value).subscribe(result => {
        if (result.claims.length > 0) {
          this.isPeriodDropDownActive = true;
        }
        if (isGroup) {
          this.groupFilteredClaims = result.claims;
          this.summaryTotalClaims = result.claims.length;
          this.summaryTotalPolicies = result.policyCount;
        } else {
          this.individualFilteredClaims = result.claims;
          this.summaryTotalClaims = result.claims.length;
          this.summaryTotalPolicies = result.policyCount;
        }
        this.brokerClaimCount = result.claims.length;
        this.brokerPolicyCount = result.policyCount;
        this.setPageData(result, isGroup);
      });
    }
  }

  // Clearing all the Individual dropdowns
  closeIndividualDropdowns() {
    this.hasGroupBrokerages = false;
    this.isPeriodDropDownActive = false;
    this.hasIndividualProductOptions = false;
  }

  // Setting cover typeids for individual
  setCoverTypeids() {
    this.covertypes = [];
    this.covertypes.push(this.individualCovertypeId);
  }

  // Clearing all the controls for individual
  ClearIndividualData() {
    this.table.hideTable();
    this.isPeriodDropDownActive = false;
    this.hasIndividualBrokerages = false;
    this.hasIndividualProductOptions = false;
    this.clearData(false);
    this.individualData = [];
    // this.individualChartLabels = [];

    this.form.patchValue({
      individualType: [],
      individualResult: [],
      individualPeriodFilter: [],
      individualBrokerageResult: [],
    });
    this.getAllIndividualClaims();
  }

  // Clearing the pi chart data
  clearPieChart() {
    this.summaryTotalClaims = 0;
    this.summaryTotalPolicies = 0;
    this.hasIndividualData = false;
    this.individualData = [0, 0, 0, 0, 0, 0];
  }


  // ======== GROUP ======== //


  // Loading all the Group claims
  public getGroupClaims() {
    this.isLoading = true;
    const dashboardCoverTypes = this.getDashboardCoverType(true);
    dashboardCoverTypes.brokerageId = 0;
    this.claimService.GetClaimsByCoverTypeIds(dashboardCoverTypes).subscribe(result => {
      this.summaryGroupTotalClaims = result.claims.length;
      this.summaryGroupTotalPolicies = result.policyCount;
      this.fixedTotalPolicyCount = result.policyCount;
      this.groupFilteredClaims = result.claims;
      this.allGroupClaims = result.claims;
      this.setPageData(result, true);
    });
  }

  // Getting all the options if Scheme was selected
  public getGroupSchemes() {
    this.isLoading = true;
    this.setGroupCoverTypeids();
    this.productOptionService.GetProductOptionsByCoverTypeIds(this.covertypes).subscribe(result => {
      this.groupProductOptions = result;
      this.isLoading = false;
    });
  }

  // Setting the pie chart with all the individual claims
  SetPieCartWithallGroupClaims() {
    this.policyClaim.claims = this.allGroupClaims;
    this.policyClaim.policyCount = this.fixedTotalPolicyCount;
    this.summaryGroupTotalClaims = this.allGroupClaims.length;


    this.setPageData(this.policyClaim, true);
  }

  // Clearing the group dropdown
  clearGroupPeriodFilter() {
    this.isPeriodDropDownActive = false;
    this.form.patchValue({ groupPeriodFilter: [] });
  }

  // Getting all the brokerages for group
  getGroupBrokerages() {
    this.setGroupCoverTypeids();
    this.brokerageService.getBrokeragesByCoverTypeIds(this.covertypes).subscribe(brokerages => {
      this.groupBrokerages = brokerages;

    });
  }

  // all the Group Dropdown methods below
  onGroupFilterSelect($event: any) {
    this.table.hideTable();
    this.clearData(true);
    this.clearGroupPeriodFilter();
    this.SetPieCartWithallGroupClaims();

    if ($event.value !== undefined) {
      this.message = '';
      switch ($event.value) {
        // Brokerage
        case 1:
          this.groupScheme = false;
          this.hasGroupCorporate = false;

          if (this.groupBrokerages.length > 0) {
            this.hasGroupBrokerages = true;
            this.form.patchValue({
              groupBrokeragesResult: this.groupBrokerages
            });
          } else {
            this.message = 'No Brokerages available';
            this.hasGroupBrokerages = false;
          }
          break;
        // Corporate
        case 2:
          this.groupScheme = false;

          if (this.groupCorporate.length > 0) {
            this.hasGroupCorporate = true;
            this.form.patchValue({
              groupCorporateResult: this.groupCorporate
            });
          } else {
            this.hasGroupCorporate = false;
            this.message = 'No corporates available'
          }
          this.hasGroupBrokerages = false;

          break;
        // Staff
        case 3:
          this.groupScheme = false;
          this.hasGroupCorporate = false;
          this.hasGroupBrokerages = false;
          this.isPeriodDropDownActive = false;
          this.onGroupStaffResultSelect();
          break;
        // Scheme
        case 4:
          this.groupScheme = true;
          this.hasGroupCorporate = false;
          this.hasGroupBrokerages = false;
          this.form.patchValue({
            groupSchemeResult: this.groupProductOptions
          });
          break;
      }
    }
  }

  // Clearing all the data from group Chart
  clearGroupChart() {
    this.hasGroupData = false;
    this.summaryTotalClaims = 0;
    this.summaryTotalPolicies = 0;
    this.groupData = [0, 0, 0, 0, 0, 0];
  }

  // Clearing all the controls for group
  ClearGroupData() {
    this.table.hideTable();
    this.groupScheme = false;
    this.hasGroupBrokerages = false;
    this.isPeriodDropDownActive = false;
    this.clearData(true);

    this.form.patchValue({
      groupType: [],
      groupBrokeragesResult: [],
      groupStaffResult: [],
      groupSchemeResult: [],
      groupCorporateResult: [],
      groupPeriodFilter: []
    });
    this.getGroupClaims();
  }

  // Setting the cover types for group
  setGroupCoverTypeids() {
    this.covertypes = [];
    this.covertypes.push(this.groupCovertypeVoluntary);
    this.covertypes.push(this.groupCovertypeCompulsory);
    this.covertypes.push(this.corporateCovertypeVoluntary);
    this.covertypes.push(this.corporateCovertypeCompulsory);
  }

  // Getting the staff data
  getStaffCoverTypes(): CoverTypeModel {
    const coverTypeObject = new CoverTypeModel();
    this.covertypes = [];
    this.covertypes.push(this.staffCovertypeVoluntary);
    this.covertypes.push(this.staffCovertypeCompulsory);
    coverTypeObject.coverTypeIds = this.covertypes;

    return coverTypeObject;
  }

  // Methods that needs to be created for corporate and staff
  onGroupStaffResultSelect() {
    this.table.hideTable();
    this.clearData(true);
    this.isLoading = true;
    const dashboardCoverTypes = this.getStaffCoverTypes();
    dashboardCoverTypes.brokerageId = 0;
    this.claimService.GetClaimsByCoverTypeIds(dashboardCoverTypes).subscribe(result => {
      this.isPeriodDropDownActive = true;
      this.summaryGroupTotalClaims = result.claims.length;
      this.summaryGroupTotalPolicies = result.policyCount;
      this.groupFilteredClaims = result.claims;
      this.setPageData(result, true);
    });

  }

  // Getting all the results bease on corporate being selected
  onGroupCorporateResultSelect($event: any, isGroup: boolean) {
    if ($event.value !== undefined) {
      this.isLoading = true;
      this.table.hideTable();
      this.clearData(isGroup);
      this.clearGroupPeriodFilter();

      const dashboardCoverTypes = this.getCoporateCoverTypes();
      dashboardCoverTypes.rolePlayerId = $event.value;
      this.claimService.GetCorporateClaims(dashboardCoverTypes).subscribe(result => {
        this.isPeriodDropDownActive = true;
        this.brokerPolicyCount = result.policyCount;
        this.brokerClaimCount = result.claims.length;
        this.groupFilteredClaims = result.claims;
        this.summaryGroupTotalClaims = result.claims.length;
        this.summaryGroupTotalPolicies = result.policyCount;

        this.setPageData(result, isGroup);
      });
    }
  }

  // Getting a list of all the corporates
  getCorporates() {
    this.setCoverTypeids();
    const types = this.getCoporateCoverTypes();
    this.claimService.getCorporateRoles(types).subscribe(corporates => {
      this.groupCorporate = corporates;
    });
  }


  // ======= METHODS THAT ARE BEING USED BY INDIVIDUAL AND GROUP ========== //

  // Getting all the claims by coverType and brokerage Id
  onBrokeragesResultSelect($event: any, isGroup: boolean) {
    if ($event.value !== undefined) {
      this.isLoading = true;
      this.table.hideTable();
      this.clearData(isGroup);
      this.clearGroupPeriodFilter();

      const dashboardCoverTypes = this.getDashboardCoverType(isGroup);
      dashboardCoverTypes.brokerageId = $event.value;

      this.claimService.GetClaimsByCoverTypeIds(dashboardCoverTypes).subscribe(result => {
        if (result.claims.length > 0) { this.isPeriodDropDownActive = true; }
        this.brokerPolicyCount = result.policyCount;
        this.brokerClaimCount = result.claims.length;
        this.individualFilteredClaims = result.claims;

        if (isGroup) {
          this.summaryGroupTotalClaims = result.claims.length;
          this.summaryGroupTotalPolicies = result.policyCount;
        } else {
          this.summaryTotalClaims = result.claims.length;
          this.summaryTotalPolicies = result.policyCount;
        }
        this.setPageData(result, isGroup);
      });
    }
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

  // Setting the pie chart data
  setPieChartData(result: PolicyClaim, isGroup: boolean) {
    this.table.hideTable();
    this.policyClaim = result;
    const newClaims = this.GetStatusLength(ClaimStatusEnum.New, result);
    const received = this.GetStatusLength(ClaimStatusEnum.Received, result);
    const pendingRequirements = this.GetStatusLength(ClaimStatusEnum.PendingRequirements, result);
    const awaitingDecision = this.GetStatusLength(ClaimStatusEnum.AwaitingDecision, result);
    const pendingPolicyAdmin = this.GetStatusLength(ClaimStatusEnum.PendingPolicyAdmin, result);
    const closed = this.GetStatusLength(ClaimStatusEnum.Closed, result);
    const cancelled = this.GetStatusLength(ClaimStatusEnum.Cancelled, result);
    const awaitingReversalDecision = this.GetStatusLength(ClaimStatusEnum.AwaitingReversalDecision, result);
    const paid = this.GetStatusLength(ClaimStatusEnum.Paid, result);
    const declined = this.GetStatusLength(ClaimStatusEnum.Declined, result);
    const pendingInvestigations = this.GetStatusLength(ClaimStatusEnum.PendingInvestigations, result);
    const investigationCompleted = this.GetStatusLength(ClaimStatusEnum.InvestigationCompleted, result);
    const approved = this.GetStatusLength(ClaimStatusEnum.Approved, result);
    const authorised = this.GetStatusLength(ClaimStatusEnum.Authorised, result);
    const reopened = this.GetStatusLength(ClaimStatusEnum.Reopened, result);
    const exGratia = this.GetStatusLength(ClaimStatusEnum.ExGratia, result);
    const exGratiaApproved = this.GetStatusLength(ClaimStatusEnum.ExGratiaApproved, result);
    const exGratiaAuthorised = this.GetStatusLength(ClaimStatusEnum.ExGratiaAuthorised, result);
    const noClaim = this.GetStatusLength(ClaimStatusEnum.NoClaim, result);
    const unclaimed = this.GetStatusLength(ClaimStatusEnum.Unclaimed, result);
    const returnToAssessor = this.GetStatusLength(ClaimStatusEnum.ReturnToAssessor, result);
    const waived = this.GetStatusLength(ClaimStatusEnum.Waived, result);
    const unpaid = this.GetStatusLength(ClaimStatusEnum.Unpaid, result);
    const policyAdminCompleted = this.GetStatusLength(ClaimStatusEnum.PolicyAdminCompleted, result);
    const paymentRecovery = this.GetStatusLength(ClaimStatusEnum.PaymentRecovery, result);
    const awaitingDeclineDecision = this.GetStatusLength(ClaimStatusEnum.AwaitingDeclineDecision, result);
    const returnToAssessorAfterDeclined = this.GetStatusLength(ClaimStatusEnum.ReturnToAssessorAfterDeclined, result);
    const reversed = this.GetStatusLength(ClaimStatusEnum.Reversed, result);
    const reversalRejected = this.GetStatusLength(ClaimStatusEnum.ReversalRejected, result);
    const repay = this.GetStatusLength(ClaimStatusEnum.Repay, result);

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
  }

  GetStatusLength(claimStatus: ClaimStatusEnum, result: PolicyClaim): number {
    return result.claims.filter(c => c.claimStatus === claimStatus).length;
  }

  populateDataChart(myDictionary: any, isGroup: boolean) {
    // tslint:disable-next-line: forin
    for (const key in myDictionary) {
      const value = myDictionary[key];
      const keyString = key;
      if (value > 0) {
        if (isGroup) {
          this.groupData.push(value);
          this.groupChartLabels.push(keyString);
        } else {
          this.individualData.push(value);
          this.individualChartLabels.push(keyString);
        }
      }
    }
  }

  // Setting the cover types to populate Covertype model
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

  getCoporateCoverTypes(): CoverTypeModel {
    const coverTypeObject = new CoverTypeModel();
    this.covertypes = [];
    this.covertypes.push(this.corporateCovertypeVoluntary);
    this.covertypes.push(this.corporateCovertypeCompulsory);
    coverTypeObject.coverTypeIds = this.covertypes;
    return coverTypeObject;
  }


  // Setting the piechart and deactivating if no data
  setPageData(result: PolicyClaim, isGroup: boolean) {
    if (result.claims.length > 0) {
      this.setPieChartData(result, isGroup);
    } else {
      this.isLoading = false;
      if (isGroup) {
        this.hasGroupData = false;
      } else {
        this.hasIndividualData = false;
      }
    }
  }

  // On period filter for both group and individual
  onPeriodFilter($event: any, isGroup: boolean) {
    this.noDataHeading = 'No Data Available';
    this.isPeriodLoading = true;
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
            this.policyClaim.policyCount = this.brokerPolicyCount;
            this.summaryGroupTotalClaims = this.brokerClaimCount;
          } else {
            const result = this.individualFilteredClaims.filter(a => a.createdDate === myDate);
            this.policyClaim.claims = result;
            this.policyClaim.policyCount = this.brokerPolicyCount;
            this.summaryTotalClaims = this.brokerClaimCount;
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
          if (isGroup) {
            this.policyClaim.claims = this.groupFilteredClaims.filter(a => new Date(a.createdDate) >= yarAgo && new Date(a.createdDate) <= yearTomorrow);
            this.policyClaim.policyCount = this.brokerPolicyCount;
            this.summaryGroupTotalClaims = this.brokerClaimCount;
          } else {
            this.policyClaim.claims = this.individualFilteredClaims.filter(a => new Date(a.createdDate) >= yarAgo && new Date(a.createdDate) <= yearTomorrow);
            this.policyClaim.policyCount = this.brokerPolicyCount;
            this.summaryTotalClaims = this.brokerClaimCount;
          }
          this.setPageData(this.policyClaim, isGroup);
          break;
      }
      this.isPeriodLoading = false;
    }
  }

  // The method being called by the period filter
  filterDate(backDate: Date, todayDate: Date, isGroup: boolean) {
    if (isGroup) {
      this.policyClaim.claims = this.groupFilteredClaims.filter(a => new Date(a.createdDate) >= backDate && new Date(a.createdDate) <= todayDate);
      this.policyClaim.policyCount = this.brokerPolicyCount;
      this.summaryGroupTotalClaims = this.brokerClaimCount;
    } else {
      this.policyClaim.claims = this.individualFilteredClaims.filter(a => new Date(a.createdDate) >= backDate && new Date(a.createdDate) <= todayDate);
      this.summaryTotalClaims = this.policyClaim.claims.length;
      this.policyClaim.policyCount = this.brokerPolicyCount;
      this.summaryTotalClaims = this.brokerClaimCount;
    }
    this.setPageData(this.policyClaim, isGroup);
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
      this.table.fillData(this.groupFilteredClaims.filter(a => a.claimStatus === claimStatus), `Group ${labelName} Claims`);
    } else {
      this.table.fillData(this.individualFilteredClaims.filter(a => a.claimStatus === claimStatus), `Individual ${labelName} Claims`);
    }
  }
  public chartHovered(e: any): void { }
}
