import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators, FormBuilder, FormGroup} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MatDialog } from '@angular/material/dialog';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import {DebtorSearchResult} from "../../../../../../shared-components-lib/src/lib/models/debtor-search-result";
import {BenefitPayroll} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/benefit-payroll";
import {ActivatedRoute, Router} from "@angular/router";
import {
  GroupRiskBillingMethodTypeEnum
} from "../../../../../../shared-models-lib/src/lib/enums/group-risk-billing-method-type-enum";
import {
  GroupRiskPolicyCaseService
} from "../../../../../../clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {PolicyDetail} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/policy-detail";
import {Benefit} from "../../../../../../clientcare/src/app/product-manager/models/benefit";
import {
  PolicyBenefitCategory
} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/policy-benefit-category";
import {DatePipe} from "@angular/common";
import {
  PolicyPremiumRateDetailModel
} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/policy-premium-rate-detail-model";
import { BenefitPayrollStatusTypeEnum } from '../../../../../../shared-models-lib/src/lib/enums/benefit-payroll-status-type-enum';

@Component({
  selector: 'maintain-group-risk-billing',
  templateUrl: './maintain-group-risk-billing.component.html',
  styleUrls: ['./maintain-group-risk-billing.component.css']
})
export class MaintainGroupRiskBillingComponent implements OnInit, OnChanges {
  @Input() rolePlayers: RolePlayer[];
  @Input() isWizard: boolean;
  @Input() isReadOnly: boolean;

  form: UntypedFormGroup;
  industryClasses: any[] = [];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedRolePlayer: DebtorSearchResult;
  selectedCompanyRolePlayerId: number;
  payrollForm: FormGroup;
  policies: PolicyDetail[];
  benefitPayrolls: BenefitPayroll[];
  benefits: Benefit[];
  benefitCategories: PolicyBenefitCategory[];
  selectedPolicyId: number;
  selectedBenefitId: number;
  selectedFromDate: Date;
  selectedBenefitCategoryId: number;
  policyPremiumRateDetails: PolicyPremiumRateDetailModel[];
  selectedPolicyPremiumRateDetail : PolicyPremiumRateDetailModel;
  displayedColumns = [
    'effectiveDate','benefitCategory', 'billingLevel', 'billingMethod', 'billingRate', 'monthlySalary','sumAssured',
    'noOfMembers', 'fixedPremium', 'status', 'lastUpdated', 'premiumDue', 'actions'
  ]
  payrollData:BenefitPayroll [];
  public dataSource = new MatTableDataSource<BenefitPayroll>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  private selectedToDate: Date;
  private currentQuery: string = "";
  payrollStatusActual = "Actual";
  payrollStatusProvisional = "Provisional";

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public declarationService: DeclarationService,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService,
    public dialog: MatDialog,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private fb: FormBuilder,
    private readonly datePipe: DatePipe
) { }

  ngOnInit(): void {
    this.getLookups();

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.payrollData = [];
    this.createForm();
    this.loadBillingMethodTypes();
    this.loadPolicyPremiumRateDetail();
  }
  BillingMethodTypes: string[];

  loadBillingMethodTypes() {
    this.BillingMethodTypes = Object.keys(GroupRiskBillingMethodTypeEnum);
  }

  getBillingMethodName(billingMethodCode: string):string {

    let billingMethodName =  this.BillingMethodTypes.find(x=> x.startsWith(billingMethodCode));
    if(!billingMethodName){
      billingMethodName =  this.BillingMethodTypes.find(x=> x.startsWith('AmountPerMember'));
    }
    return  billingMethodName;
  }

  createForm(): void {
    this.payrollForm = this.fb.group({
      policy: ['', Validators.required],
      benefit: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  initializeDataSource(): void {
    this.dataSource.data = this.payrollData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  refreshDataSource(): void {
    this.dataSource.data = this.payrollData;
  }

  groupRiskPolicyChange($event: any) {
    this.selectedPolicyId = $event.value;
    this.getPolicyBenefits();
  }

  getPolicyBenefits() {
    if (!this.selectedPolicyId || this.selectedPolicyId === 0) {
      this.alertService.error(
        "Please select policy .",
      );
      return;
    }
    this.isLoading$.next(true);
    this.groupRiskPolicyCaseService
      .getPolicyBenefit(this.selectedPolicyId)
      .subscribe((benefits) => {
        this.benefits = benefits;
        this.isLoading$.next(false);
      });

  }

  onBenefitChange($event: any) {
    this.selectedBenefitId = $event.value;
  }

  fromDateChanged($event: any) {
    this.selectedFromDate = new Date($event.value);
  }

  toDateChanged($event: any) {
    this.selectedToDate = new Date($event.value);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  memberSelected($event: DebtorSearchResult) {
    this.selectedRolePlayer = $event;
    this.selectedCompanyRolePlayerId =  this.selectedRolePlayer.roleplayerId;
    this.getPolicies(this.selectedCompanyRolePlayerId);

  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.router.navigate(['/fincare/billing-manager/manage-grouprisk-billing/continue/', result.id]);
      this.alertService.success('Wizard created successfully');
    });
  }

  //route to the benefit payroll component
  onViewBenefitPayroll(row, i) {
    let  benefitPayroll  = row as BenefitPayroll;
    let  benefitPayrollId = benefitPayroll.benefitPayrollId;
    this.router.navigate([`/fincare/billing-manager/groupriskbillingpayroll-details/${this.selectedCompanyRolePlayerId}/${benefitPayrollId}`]);

  }

  searchBillingPayrolls() {
    if (this.selectedPolicyId && this.selectedPolicyId > 0 && this.selectedBenefitId&& this.selectedBenefitId > 0 && this.selectedToDate && this.selectedFromDate) {

     if(!this.policyPremiumRateDetails){
       this.loadPolicyPremiumRateDetail();
     }

      this.selectedPolicyPremiumRateDetail =  this.policyPremiumRateDetails.find(policyPremiumRateDetail=> policyPremiumRateDetail.policyId === this.selectedPolicyId &&
                                               policyPremiumRateDetail.benefitId === this.selectedBenefitId );

      if(this.selectedPolicyPremiumRateDetail){
          this.isLoading$.next(true);
          this.groupRiskPolicyCaseService
            .getBenefitPayrollDetails(this.selectedPolicyPremiumRateDetail.benefitDetailId, -1, this.datePipe.transform(this.selectedFromDate, 'yyyy-MM-dd'), this.datePipe.transform(this.selectedToDate, 'yyyy-MM-dd'))
            .subscribe((results) => {
              this.payrollData = results;
              this.refreshDataSource();
              this.isLoading$.next(false);
            });
      }

    }else{
      if (!this.selectedPolicyId || this.selectedPolicyId === 0) {
        this.alertService.error(
          "Please select policy.",
        );
        return;
      }

      if (!this.selectedFromDate) {
        this.alertService.error(
          "Please select from date.",
        );
        return;
      }

      if (!this.selectedBenefitId || this.selectedBenefitId === 0) {
        this.alertService.error(
          "Please select benefit.",
        );
        return;
      }
      if (!this.selectedToDate) {
        this.alertService.error(
          "Please select to date.",
        );
        return;
      }

      }

  }

  loadPolicyPremiumRateDetail(): void {

    if (this.selectedCompanyRolePlayerId && this.selectedCompanyRolePlayerId > 0) {
      this.isLoading$.next(true);
      this.groupRiskPolicyCaseService
        .getEmployerPolicyPremiumRateDetail(this.selectedCompanyRolePlayerId, this.currentQuery )
        .subscribe((results) => {
          this.policyPremiumRateDetails = results;
          this.isLoading$.next(false);
        });
    }
  }
  getPolicies(rolePlayerId: number): void {
    if (!rolePlayerId || rolePlayerId === 0) {
      this.alertService.error(
        "Please select company before adding benefit billing",
      );
      return;
    }

    if (!this.policies || this.policies.length === 0) {
      this.isLoading$.next(true);
      this.groupRiskPolicyCaseService
        .getPolicyDetailByEmployerRolePlayerId(rolePlayerId)
        .subscribe((policies) => {
          this.policies = policies;
          this.isLoading$.next(false);
        });
    }

    if(!this.policyPremiumRateDetails){
      this.loadPolicyPremiumRateDetail();
    }

  }

  getPayrollStatusName(payrolStatus: BenefitPayrollStatusTypeEnum): string {
    return payrolStatus == BenefitPayrollStatusTypeEnum.Actual ? this.payrollStatusActual : this.payrollStatusProvisional;
  }

}
