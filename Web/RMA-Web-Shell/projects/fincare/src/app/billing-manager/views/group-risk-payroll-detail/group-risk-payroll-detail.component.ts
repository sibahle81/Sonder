import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {
  WizardDetailBaseComponent
} from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import {ValidationResult} from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import {AppEventsManager} from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import {AuthService} from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import {AlertService} from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PolicyService} from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import {ProductOptionService} from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import {Benefit} from 'projects/clientcare/src/app/product-manager/models/benefit';
import {BenefitPayroll} from 'projects/clientcare/src/app/policy-manager/shared/entities/benefit-payroll';
import {
  GroupRiskPolicyCaseService
} from 'projects/clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service';
import {PolicyDetail} from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-detail';
import {
  PolicyBenefitCategory
} from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-benefit-category';
import {BehaviorSubject} from 'rxjs';
import {
  GroupRiskBillingMethodTypeEnum
} from '../../../../../../shared-models-lib/src/lib/enums/group-risk-billing-method-type-enum';
import {
  GroupRiskBillingLevelTypeEnum
} from 'projects/shared-models-lib/src/lib/enums/group-risk-billing-level-type-enum';
import {PolicyBenefitDetail} from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-benefit-detail';
import {PolicyBenefitRate} from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-benefit-rate';
import {MatTableDataSource} from '@angular/material/table';
import {
  GroupRiskBenefitPayroll
} from 'projects/clientcare/src/app/policy-manager/shared/entities/group-risk-benefit-payroll';
import {DatePipe} from "@angular/common";
import {
  PolicyPremiumRateDetailModel
} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/policy-premium-rate-detail-model";
import {
  ConfirmationDialogsService
} from "../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service";
import {
  BenefitPayrollStatusTypeEnum
} from "../../../../../../shared-models-lib/src/lib/enums/benefit-payroll-status-type-enum";

@Component({
  selector: 'group-risk-payroll-detail',
  templateUrl: './group-risk-payroll-detail.component.html',
  styleUrls: ['./group-risk-payroll-detail.component.css']
})
export class GroupRiskPayrollDetailComponent extends WizardDetailBaseComponent<GroupRiskBenefitPayroll>  {
  form: FormGroup;
  policies: PolicyDetail[];
  benefitPayrolls: BenefitPayroll[];
  benefits: Benefit[];
  benefitCategories: PolicyBenefitCategory[];
  policyBenefitRates: PolicyBenefitRate[];
  policyBenefitDetail: PolicyBenefitDetail;
  payrolls: any[] = [];
  displayedColumns: string[] = [
    'benefitCategory', 'billingLevel', 'billingMethod', 'billingRate', 'monthlySalary','sumAssured',
    'noOfMembers', 'fixedPremium', 'status', 'lastUpdated', 'premiumDue', 'actions'
  ];

  BillingBasisTypes: string[];
  BillingLevelTypes: string[];

  selectedPolicyId: number;
  selectedBenefitId: number;
  selectedEffectiveDate: Date;
  selectedBenefitCategoryId: number;
  selectedBillingMethodCode: string;
  selectedBillingLevelCode: string;
  billingRate : number;
  benefitDetailId : number;
  policyPremiumRateDetails: PolicyPremiumRateDetailModel[];
  isLoadingGroupRiskPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(
    true,
  );
  isLoadingPolicyBenefitDetail$: BehaviorSubject<boolean> = new BehaviorSubject(true,);
  groupRiskBenefitBillingLevelType = "Benefit";
  payrollStatusActual = "Actual";
  payrollStatusProvisional = "Provisional";
  isEditMode: boolean = false;
  benefitPayrollId : number = 0;
  rowId : number;
  benefitPayrollStatusTypes : BenefitPayrollStatusTypeEnum[]

  payrollData :BenefitPayroll [];
  public dataSource = new MatTableDataSource<BenefitPayroll>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private selectedCompanyRolePlayerId: number;
  private currentQuery: string = '';


  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    authService: AuthService,
    private fb: FormBuilder,
    readonly datePipe: DatePipe,
    readonly confirmService: ConfirmationDialogsService) {
    super(appEventsManager, authService, activatedRoute);

    this.benefitPayrolls = [];
    this.payrollData =  [];
    this.benefitPayrollStatusTypes = this.ToKeyValuePair(BenefitPayrollStatusTypeEnum);
  }

   onLoadLookups() {
    if (Array.isArray(this.model) && this.model.length > 0) {
      this.model = this.model[0];
    }

    if(this.model){
      let rolePlayerId = this.model.rolePlayerId;
      this.getPolicies(rolePlayerId);
    }

     this.loadBillingLevelTypes();
     this.loadBillingBasisTypes();
  }

  initializeDataSource(): void {
    this.dataSource.data = this.payrollData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  createForm(id: number): void {
    this.form = this.fb.group({
      policy: ['', Validators.required],
      benefit: ['', Validators.required],
      benefitCategory: '',
      billingMonth: ['', Validators.required],
      monthlyPayroll: ['', Validators.required],
      sumAssured: ['', Validators.required],
      noOfMembers: ['', Validators.required],
      fixedPremium: ['', Validators.required],
      status: ['', Validators.required],
      lastUpdated: [{ value: new Date(), disabled: true }],
      premiumDue: [{ value: 0, disabled: true }]
    });
   }

  getPolicies(rolePlayerId: number): void {
    if (!rolePlayerId || rolePlayerId === 0) {
      this.alertService.error(
        "Please select company before adding benefit billing",
      );
      return;
    }

    this.policies  =[] ;
    if (!this.policies || this.policies.length === 0) {
      this.isLoadingGroupRiskPolicies$.next(true);
      this.groupRiskPolicyCaseService
        .getPolicyDetailByEmployerRolePlayerId(rolePlayerId)
        .subscribe((policies) => {
          this.policies = policies;
          this.isLoadingGroupRiskPolicies$.next(false);
        });
    }
  }

  loadPolicyPremiumRateDetail(): void {

    if (this.selectedCompanyRolePlayerId && this.selectedCompanyRolePlayerId > 0) {
      this.isLoadingGroupRiskPolicies$.next(true);
      this.groupRiskPolicyCaseService
        .getEmployerPolicyPremiumRateDetail(this.selectedCompanyRolePlayerId, this.currentQuery )
        .subscribe((results) => {
          this.policyPremiumRateDetails = results;
          this.isLoadingGroupRiskPolicies$.next(false);
        });
    }
  }
  getPolicyBenefits() {
    if (!this.selectedPolicyId || this.selectedPolicyId === 0) {
      this.alertService.error(
        "Please select policy before adding premium rate",
      );
      return;
    }
    this.isLoadingGroupRiskPolicies$.next(true);
    this.groupRiskPolicyCaseService
      .getPolicyBenefit(this.selectedPolicyId)
      .subscribe((benefits) => {
        this.benefits = benefits;
        this.isLoadingGroupRiskPolicies$.next(false);
      });

    this.getPolicyBenefitDetails(this.selectedPolicyId);
  }

  getPolicyBenefitDetails(policyId: number){
    this.isLoadingGroupRiskPolicies$.next(true);
    this.isLoadingPolicyBenefitDetail$.next(true);
    this.groupRiskPolicyCaseService
      .getPolicyBenefitDetailByPolicyId(this.selectedPolicyId)
      .subscribe((policyBenefitDetails) => {
        this.policyBenefitDetail = policyBenefitDetails[0];
        this.isLoadingGroupRiskPolicies$.next(false);
        this.isLoadingPolicyBenefitDetail$.next(false);
      });
  }

  readForm(): BenefitPayroll {

    const formDetails = this.form.getRawValue();

    if(this.selectedBenefitCategoryId && this.selectedBenefitCategoryId > 0){
      let selectedPolicyPremiumRateDetail =   this.policyPremiumRateDetails?.find(policyPremiumRateDetail=> policyPremiumRateDetail.policyId== this.selectedPolicyId && policyPremiumRateDetail.benefitId == this.selectedBenefitId  && policyPremiumRateDetail.benefitCategoryId ==  this.selectedBenefitCategoryId);
      if(selectedPolicyPremiumRateDetail){
        this.selectedBillingMethodCode = selectedPolicyPremiumRateDetail.billingMethodCode;
        this.selectedBillingLevelCode =  selectedPolicyPremiumRateDetail.billingLevelCode;
        this.billingRate  = selectedPolicyPremiumRateDetail.totalRate;
        this.benefitDetailId  =  selectedPolicyPremiumRateDetail.benefitDetailId;
      }

    }else {
      let selectedPolicyPremiumRateDetail =   this.policyPremiumRateDetails?.find(policyPremiumRateDetail=> policyPremiumRateDetail.policyId== this.selectedPolicyId && policyPremiumRateDetail.benefitId == this.selectedBenefitId ) ;
      if(selectedPolicyPremiumRateDetail){
        this.selectedBillingMethodCode = selectedPolicyPremiumRateDetail.billingMethodCode;
        this.selectedBillingLevelCode =  selectedPolicyPremiumRateDetail.billingLevelCode;
        this.billingRate  = selectedPolicyPremiumRateDetail.totalRate;
        this.benefitDetailId  =  selectedPolicyPremiumRateDetail.benefitDetailId;
      }
    }

    const benefitPayroll = new BenefitPayroll();
    benefitPayroll.rolePlayerId = this.model.rolePlayerId;
    benefitPayroll.benefitPayrollId =  this.benefitPayrollId
    benefitPayroll.policyId = formDetails.policy;
    benefitPayroll.benefitCategoryId = formDetails.benefitCategory;
    benefitPayroll.benefitId =  formDetails.benefit;
    benefitPayroll.effectiveDate = new Date(this.datePipe.transform(this.selectedEffectiveDate, "yyyy-MM-dd")).getCorrectUCTDate();
    benefitPayroll.lastUpdatedDate = new Date(this.datePipe.transform(new Date(), "yyyy-MM-dd")).getCorrectUCTDate();
    benefitPayroll.benefitDetailId = this.benefitDetailId;
    benefitPayroll.billingMethod =   this.getBillingBasisName(this.selectedBillingMethodCode);
    benefitPayroll.billingMethodCode =  this.selectedBillingMethodCode;
    benefitPayroll.billingLevelCode =  this.selectedBillingLevelCode;
    benefitPayroll.billingLevel  =  this.selectedBillingLevelCode;
    benefitPayroll.fixedPremium = 0;
    benefitPayroll.payrollStatusType = BenefitPayrollStatusTypeEnum.Actual;
    benefitPayroll.billingRate = this.billingRate;
    benefitPayroll.monthlySalary = 0;
    benefitPayroll.sumAssured = 0;
    benefitPayroll.noOfMembers = 0;
    benefitPayroll.fixedSum = 0;
    benefitPayroll.premiumDue = 0;

    if( this.selectedBenefitCategoryId && this.benefitCategories){
      benefitPayroll.benefitCategory = this.benefitCategories.find(benefitCategory => benefitCategory.benefitCategoryId ==  this.selectedBenefitCategoryId)?.name
    }

    return benefitPayroll;
  }

  addPayrollRow() {

    if(this.selectedPolicyId && this.selectedPolicyId > 0   && this.selectedBenefitId &&
      this.selectedBenefitId > 0 && this.selectedEffectiveDate ) {
      let benefitPayroll =  this.readForm();

      if(this.isEditMode == false ){
        benefitPayroll.rowId = this.payrollData.length + 1;
        this.payrollData.push(benefitPayroll);
      }
      else {

        let existingBenefitPayrolls = this.payrollData.filter(x=> x.rowId != this.rowId);
        this.payrollData = [];
        existingBenefitPayrolls.forEach(x=>  this.payrollData.push(x));
        this.payrollData.push(benefitPayroll);
      }

      this.refreshDataSource();
      this.form.reset();
      this.alertService.success(`Billing payroll has been ${this.isEditMode ? 'updated' : 'added'} successfully`);
      this.isEditMode = false;

      this.selectedPolicyId = null;
      this.selectedBenefitId = null;
      this.selectedBenefitCategoryId = null
      this.selectedEffectiveDate = null;

    }else {

       if(!this.selectedPolicyId )
        this.alertService.error(
        "Please select policy.",
      );

      if(!this.selectedBenefitId )
        this.alertService.error(
          "Please select benefit.",
        );

      if(!this.selectedEffectiveDate )
        this.alertService.error(
          "Please select billing month.",
        );
    }
  }

  refreshDataSource(): void {
    this.dataSource.data = this.payrollData;
  }

  formatLookup(lookup: string): string {
    return lookup
      ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2").replace("_", "-")
      : "N/A";
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, " $1").trim();
  }


  groupRiskPolicyChange($event: any) {
    this.selectedPolicyId = $event.value;
    this.selectedBenefitId = null;
    this.selectedBenefitCategoryId = null;
    this.resetBenefitDependentFields();
    this.getPolicyBenefits();
  }

  onBenefitChange($event: any) {
    this.selectedBenefitId = $event.value;
    this.resetBenefitDependentFields();
  }

  newEffectiveDateChanged($event: any) {
    this.selectedEffectiveDate = new Date($event.value);
    this.loadBenefitCategories();
    this.setBillingLevel(this.selectedPolicyId, this.selectedBenefitId, this.selectedEffectiveDate);
  }

  loadBenefitCategories() {
    this.loadBillingLevelTypes();
    this.loadBillingBasisTypes();

    if (this.selectedPolicyId > 0 && this.selectedBenefitId > 0) {
      this.isLoadingGroupRiskPolicies$.next(true);

      if (this.selectedEffectiveDate) {
        this.groupRiskPolicyCaseService
          .getBenefitCategoriesForPremiumRatesBillingLevel(this.selectedPolicyId, this.selectedBenefitId, this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd'))
          .subscribe((results) => {

            this.benefitCategories = results;
          });
      }
      this.isLoadingGroupRiskPolicies$.next(false);

    }
  }

  setBillingLevel(selectedPolicyId: number, selectedBenefitId: number, selectedEffectiveDate: Date) {
    this.groupRiskPolicyCaseService.getBenefitOptionItemValue(this.selectedPolicyId, this.selectedBenefitId, "BillingLevel", this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd'))
      .subscribe({
        next: result => {
          if (result)
            this.selectedBillingLevelCode = result.optionItemCode;
        }
      })
  }

  onBenefitCategoryChange($event: any) {
    this.selectedBenefitCategoryId = $event.value;
  }

  loadBillingBasisTypes() {
    this.BillingBasisTypes = Object.keys(GroupRiskBillingMethodTypeEnum);
  }

  loadBillingLevelTypes() {
    this.BillingLevelTypes = Object.keys(GroupRiskBillingLevelTypeEnum);
  }

  updatePremiumDue(row: any): void {
    row.premiumDue = this.calculatePremiumDue(row);
    this.refreshDataSource();
  }


  calculatePremiumDue(row: any): number {

    let premiumDue = 0;
    row = this.initialiseToDefaultValues(row);

    if (row.billingMethodCode == GroupRiskBillingMethodTypeEnum.PercentageOfPayroll) {
      premiumDue = (Number(row.monthlySalary) * Number(row.billingRate)) + Number(row.fixedPremium);
    } else if (row.billingMethodCode == GroupRiskBillingMethodTypeEnum.AmountPerMember) {
      premiumDue = (Number(row.noOfMembers) * Number(row.billingRate))  + Number(row.fixedPremium);
    } else if (row.billingMethodCode == GroupRiskBillingMethodTypeEnum.UnitRate) {
      premiumDue = ((Number(row.sumAssured) / 1000) * Number(row.billingRate))  + Number(row.fixedPremium) ;
    }else if (row.billingMethodCode == GroupRiskBillingMethodTypeEnum.FixedSum) {
      premiumDue = Number(row.fixedPremium) ;
    }

    return premiumDue;
  }

  initialiseToDefaultValues(benefitPayroll : BenefitPayroll): BenefitPayroll{

    if(!benefitPayroll.premiumDue ){
      benefitPayroll.premiumDue = 0;
    }

    if(!benefitPayroll.fixedPremium ){
      benefitPayroll.fixedPremium = 0;
    }

    if(!benefitPayroll.noOfMembers ){
      benefitPayroll.noOfMembers = 0;
    }

    if(!benefitPayroll.sumAssured ){
      benefitPayroll.sumAssured = 0;
    }

    if(!benefitPayroll.monthlySalary ){
      benefitPayroll.monthlySalary = 0;
    }
    return benefitPayroll;
}

  populateModel(): void {
    this.model.benefitPayrolls =[]
    this.payrollData.forEach(payrollData => {
     payrollData = this.initialiseToDefaultValues(payrollData);
      this.model.benefitPayrolls.push(payrollData);
    })
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    validationResult.errors = 0;
    validationResult.errorMessages = [];
    return validationResult;
  }

  populateForm(): void {

    this.benefitPayrolls = [];
    this.payrollData =  [];

    if (Array.isArray(this.model) && this.model.length > 0) {
      this.model = this.model[0];

    }

    this.initializeDataSource();

    if (this.model) {
      let rolePlayerId = this.model.rolePlayerId;
      this.selectedCompanyRolePlayerId  =  rolePlayerId;
      this.getPolicies(rolePlayerId);
      this.loadPolicyPremiumRateDetail();

      if (this.model.benefitPayrolls.length == 1) {
        this.onEdit(this.model.benefitPayrolls[0], 1);
      }
    }

    this.payrollData = [];
    this.model.benefitPayrolls.forEach((benefitPayroll) => {
      this.payrollData.push(benefitPayroll);
    })

    this.refreshDataSource();
  }


  getBillingBasisName(billingBasisCode: string): string {

    let billingBasisName = this.BillingBasisTypes.find(x => x.startsWith(billingBasisCode));
    if (!billingBasisName) {
      billingBasisName = this.BillingBasisTypes.find(x => x.startsWith('AmountPerMember'));
    }
    return billingBasisName;
  }

  deletePayrollRow(row) {

    this.confirmService
      .confirmWithoutContainer(
        "Remove Benefit Payroll",
        "Are you sure you want to remove this benefit payroll?",
        "Center",
        "Center",
        "Yes",
        "No",
      )
      .subscribe((result) => {
        if (result === true) {
          this.payrollData = this.payrollData.filter(x => x.rowId !== row.rowId);
          this.form.reset();
          this.refreshDataSource();
        }
      });

  }

  onEdit(item, i) {

    if(this.payrollData.length == 0){
      this.model.benefitPayrolls.forEach(payroll =>   this.payrollData.push(payroll));
    }

    this.refreshDataSource();
    this.isEditMode = true;
    this.rowId = item.rowId;
    this.benefitPayrollId =  item.benefitPayrollId;
    this.selectedBenefitId = item.benefitId;
    this.selectedBenefitCategoryId = item.benefitCategoryId;
    this.selectedPolicyId = item.policyId;
    this.selectedEffectiveDate = item.effectiveDate;
    this.selectedBillingLevelCode = item.billingLevelCode;
    this.selectedBillingMethodCode = item.billingBasisCode;
    this.getPolicies(item.rolePlayerId);
    this.getPolicyBenefits();

    if(this.selectedBenefitCategoryId != null &&  this.selectedBenefitCategoryId > 0) {
      this.loadBenefitCategories();
    }else{
      this.benefitCategories = [];
    }

    this.form.patchValue({
      policyPremiumRateDetailId: item.policyPremiumRateDetailId,
      policy: item.policyId,
      benefit: item.benefitId,
      benefitCategory: item.benefitCategoryId,
      billingMonth: item.effectiveDate,
    });

  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  getPayrollStatusName(payrolStatus: BenefitPayrollStatusTypeEnum): string {
    return payrolStatus == BenefitPayrollStatusTypeEnum.Actual ? this.payrollStatusActual : this.payrollStatusProvisional;
  }

  resetBenefitDependentFields() {
    this.form.patchValue(
      {
        "billingMonth": "",
        "benefitCategory": "",
      }
    );

    this.benefitCategories = [];
    this.selectedEffectiveDate = null;
    this.selectedBillingLevelCode = "";
  }

  get isCategoryBilling(): boolean {
    return this.selectedBillingLevelCode != this.groupRiskBenefitBillingLevelType;
  }

  get isEditWizard(): boolean {
    if (!this.context)
      return false;
    return this.context.wizard.linkedItemId > 0;
  }
}
