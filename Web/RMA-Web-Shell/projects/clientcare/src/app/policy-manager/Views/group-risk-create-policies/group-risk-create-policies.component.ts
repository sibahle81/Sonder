import { Component, ElementRef, ViewChild } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";

import { WizardDetailBaseComponent } from "projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { ValidationResult } from "projects/shared-components-lib/src/lib/wizard/shared/models/validation-result";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { GroupRiskPolicyCaseModel } from "../../shared/entities/group-risk-policy-case-model";
import { GroupRiskDealTypeEnum } from "projects/shared-models-lib/src/lib/enums/group-risk-deal-type-enum";
import { BrokerageService } from "../../../broker-manager/services/brokerage.service";
import { ProductOptionService } from "../../../product-manager/services/product-option.service";
import { ProductService } from "../../../product-manager/services/product.service";
import { ProductOption } from "../../../product-manager/models/product-option";
import { Product } from "../../../product-manager/models/product";
import { Brokerage } from "../../../broker-manager/models/brokerage";
import { GroupRiskCommissionTypeEnum } from "projects/shared-models-lib/src/lib/enums/group-risk-commission-type-enum";
import { PaymentFrequencyEnum } from "projects/shared-models-lib/src/lib/enums/payment-frequency.enum";
import { PolicyHolderEnum } from "projects/shared-models-lib/src/lib/enums/policy-holder-enum";
import { MonthEnum } from "projects/shared-models-lib/src/lib/enums/month.enum";
import { GroupRiskPolicy } from "../../shared/entities/group-risk-policy";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { BehaviorSubject, Observable } from "rxjs";
import { ConfirmationDialogsService } from "projects/shared-components-lib/src/lib/confirm-message/confirm-message.service";
import { BrokerageTypeEnum } from "projects/shared-models-lib/src/lib/enums/brokerage-type-enum";
import { GroupRiskPolicyCaseService } from "../../shared/Services/group-risk-policy-case.service";
import { PolicyStatusEnum } from "../../shared/enums/policy-status.enum";
import { User } from "../../../../../../shared-models-lib/src/lib/security/user";
import { UserService } from "../../../../../../shared-services-lib/src/lib/services/security/user/user.service";
import { RolePlayer } from "../../shared/entities/roleplayer";
import { MemberService } from "../../../member-manager/services/member.service";
import {ProductOptionConfiguration} from "../../../broker-manager/models/product-option-configuration";
import {GroupRiskOptionTypeEnum} from "../../../../../../shared-models-lib/src/lib/enums/group-risk-option-type-enum";
import {ReinsuranceTreaty} from "../../shared/entities/reinsurance-treaty";
import { TreatyTypeEnum } from "../../shared/enums/treaty-type.enum";
import { ProductOptionItemValueLookup } from "../../shared/entities/product-option-item-value-lookup";
import { PolicyOption } from "../../shared/entities/policy-option";
import { OptionItemFieldEnum } from "../../shared/enums/option-item-field.enum";
import { DatePipe } from "@angular/common";
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { GroupRiskPolicyBenefit } from "../../shared/entities/group-risk-policy-benefit";
import { GroupRiskReInsuranceTreatyTypeEnum } from "../../../../../../shared-models-lib/src/lib/enums/reinsurance-treaty-type-enum";

@Component({
  selector: "app-group-risk-create-policies",
  templateUrl: "./group-risk-create-policies.component.html",
  styleUrls: ["./group-risk-create-policies.component.css"],
})
export class GroupRiskCreatePoliciesComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  errors: string[] = [];
  isLoading = false;
  showPreExistingWaiver: boolean = false;
  productOptionOptionItemsLookup: ProductOptionItemValueLookup[];
  policyDetailDates: Date[];


  groupRiskDealTypes: GroupRiskDealTypeEnum[];

  productOptionTypes: ProductOption[];
  selectedProductOptionId: any;

  products: Product[];
  selectedProductId: number;
  readonly groupRiskProductName: string = "Group Risk";

  brokerages: Brokerage[];
  selectedBrokerageId: number;

  binderPartners: Brokerage[];
  selectedBinderPartnerId: number;

  commissionTypes: GroupRiskCommissionTypeEnum[];
  commissionOptions: ProductOptionItemValueLookup[];
  selectedCommissionTypeId: number;

  commissionPaymentProcessTypes: PaymentFrequencyEnum[];
  selectedCommissionPaymentProcessTypeId: number;
  commissionPaymentFrequencyOptions: ProductOptionItemValueLookup[];

  policyHolderTypeOptions: ProductOptionItemValueLookup[];

  administrators: User[];
  selectedAdministratorId: number;

  rmaRelationshipManagers: User[];
  selectedRmaRelationshipManagerId: number;

  anniversaryMonths: MonthEnum[];
  selectedAnniversaryMonthId: number;

  contractorCoverOptions: ProductOptionItemValueLookup[];
  firstYearBrokerCommissionOptions: ProductOptionItemValueLookup[];
  partialWaiverPreExistingOptions: ProductOptionItemValueLookup[];
  partialWaiverAtWorkOptions: ProductOptionItemValueLookup[];
  profitShareOptions: ProductOptionItemValueLookup[];


  reinsuranceTreaties: ReinsuranceTreaty[];
  selectedReinsuranceTreatyId: number = -1;

  billingFrequencyTypes: PaymentFrequencyEnum[];
  selectedBillingFrequencyTypeId: number;
  formIsValid: boolean = false;

  policyStatusTypes: PolicyStatusEnum[];
  selectedPolicyStatusTypeId: number = PolicyStatusEnum.Active;

  groupRiskPolicyExtensions: GroupRiskPolicy[] = [];
  displayedColumns = [
    "clientReference",
    "policyNumber",
    "startDate",
    "endDate",
    "administratorId",
    "groupRiskDealTypeId",
    "actions",
  ];
  public dataSource = new MatTableDataSource<GroupRiskPolicy>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild("filter", { static: false }) filter: ElementRef;

  isLoadingGroupRiskPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(
    true,
  );
  selectedItemRowIndex: number;

  fundRolePlayer: RolePlayer = new RolePlayer();
  selectedFundRolePlayerId: number = 0;
  displayFundDetail: boolean = false;


  ProductOptionConfiguration: ProductOptionConfiguration[]=[];
  selectedEffectiveDate  : Date;

  clientType = ClientTypeEnum.RetirementUmbrellaFund

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private readonly brokerageService: BrokerageService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    private readonly privateAlertService: AlertService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
    private readonly datePipe: DatePipe
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
    this.groupRiskDealTypes = this.ToKeyValuePair(GroupRiskDealTypeEnum);
    this.commissionTypes = this.ToKeyValuePair(GroupRiskCommissionTypeEnum);
    this.commissionPaymentProcessTypes = this.ToKeyValuePair(PaymentFrequencyEnum);
    this.billingFrequencyTypes = this.ToKeyValuePair(PaymentFrequencyEnum);
    this.policyStatusTypes = this.ToKeyValuePair(PolicyStatusEnum);
    this.anniversaryMonths = this.ToKeyValuePair(MonthEnum);

    this.getProducts();
    this.getBrokerages();
    this.getPolicyAdministrators();
    this.getRmaRelationshipManagers();
    this.getReinsuranceTreaties();
  }

  getReinsuranceTreaties(): void {
    this.groupRiskPolicyCaseService.getReinsuranceTreaties().subscribe((results) => {
      if (results) {
        this.reinsuranceTreaties = results.filter(x=> x.treatyTypeId === TreatyTypeEnum.PrimaryTreaty);
      }
    });
  }

  getPolicyAdministrators(): void {
    this.getUsersByRoleType("Group Risk Policy Admin").subscribe((results) => {
      if (results) {
        this.administrators = results.filter((a) => a.roleId != 1);
      }
    });
  }

  getRmaRelationshipManagers(): void {
    this.getUsersByRoleType("Group Risk Policy Admin").subscribe((results) => {
      if (results) {
        this.rmaRelationshipManagers = results.filter((a) => a.roleId != 1);
      }
    });
  }

  getUsersByRoleType(roleType: string): Observable<User[]> {
    return this.userService.getUsersByRoleName(roleType);
  }

  getProductOptions(productId: number) {
    if (productId > 0) {
      this.productOptionService
        .getProductOptionByProductId(productId)
        .subscribe((result) => {
          this.productOptionTypes = result;
        });
    }
  }

  getProducts(): void {
    this.productService.getProducts().subscribe((results) => {
      this.products = results.filter((x) =>
        x.name.includes(this.groupRiskProductName),
      );
      if (this.products.length > 0) {
        this.selectedProductId = this.products[0].id;
        this.getProductOptions(this.selectedProductId);
      }
    });
  }

  getBrokerages(): void {
    this.brokerageService.getBrokerages().subscribe((results) => {
      this.brokerages = results.filter(
        (x) =>
          x.brokerageType == BrokerageTypeEnum.Brokerage ||
          x.brokerageType == BrokerageTypeEnum.BinderPartnerAndBrokerage,
      );
      this.binderPartners = results.filter(
        (x) =>
          x.brokerageType == BrokerageTypeEnum.BinderPartner ||
          x.brokerageType == BrokerageTypeEnum.BinderPartnerAndBrokerage,
      );
    });
  }

  createForm() {

    this.form = this.formBuilder.group({
      policyId: 0,
      binderPartnerId: ["", [Validators.required]],
      binderFee: [0, [Validators.required]],
      outsourceServiceFee: [0, [Validators.required]],
      groupRiskDealTypeId: ["", [Validators.required]],
      productOptionId: ["", [Validators.required]],
      productId: ["", [Validators.required]],
      policyNumber: "",
      brokerageId: ["", [Validators.required]],
      commissionTypeId: ["", [Validators.required]],
      commissionPaymentProcessTypeId: ["", [Validators.required]],
      policyHolderTypeId: ["", [Validators.required]],
      newEffectiveDate: [{ disabled: true, value: ""}, [Validators.required]],
      startDate: ["", [Validators.required]],
      endDate: "",
      administratorId: "",
      rmaRelationshipManagerId: "",
      anniversaryMonthTypeId: ["", [Validators.required]],
      profitShare: ["", [Validators.required]],
      schemeStatusId: [ PolicyStatusEnum.Active, [Validators.required]],
      lastRateUpdateDate: [""],
      nextRateReviewDate: [""],
      allowContractor: "",
      firstYearBrokerCommission: ["", [Validators.required]],
      commissionDiscount: [""],
      partialWaiverPreExistingCondition: ["", [Validators.required]],
      partialWaiverActivelyAtWork: ["", [Validators.required]],
      reinsuranceTreatyId: ["", [Validators.required]],
      billingFrequencyTypeId: ["", [Validators.required]],
      previousInsurer: "",
      clientReference: ["", [Validators.required]],
      fundRolePlayerId: "",
      selectedDetailDate:[""]
    });
    this.form.controls['policyNumber'].disable();

  }

  populateForm() {
    this.errors = [];
    if (Array.isArray(this.model) && this.model.length > 0) {
      this.model = this.model[0];
    }

    if (this.model.groupRiskPolicies) {
      this.groupRiskPolicyExtensions = this.model.groupRiskPolicies;
      this.bindPolicyTable();
    }

    if (this.isEditWorkflow) {
      this.setIsEditablePolicyChangingFields(false);
      this.form.controls.newEffectiveDate.enable();
    }
  }

  readForm(): GroupRiskPolicy {
    var groupRiskPolicy = new GroupRiskPolicy();
    var formData = this.form.getRawValue()

    groupRiskPolicy.policyId = formData.policyId;
    groupRiskPolicy.productOptionId = formData.productOptionId;
    groupRiskPolicy.productId = formData.productId;
    groupRiskPolicy.brokerageId = formData.brokerageId;
    groupRiskPolicy.binderPartnerId = formData.binderPartnerId;
    groupRiskPolicy.billingFrequencyTypeId = formData.billingFrequencyTypeId;
    groupRiskPolicy.policyNumber = formData.policyNumber;
    groupRiskPolicy.schemeStatusId = formData.schemeStatusId;
    groupRiskPolicy.clientReference = formData.clientReference;
    groupRiskPolicy.startDate = new Date(this.datePipe.transform(formData.startDate, "yyyy-MM-dd")).getCorrectUCTDate();
    groupRiskPolicy.endDate = (!formData.endDate) ? null : new Date(this.datePipe.transform(formData.endDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    groupRiskPolicy.newEffectiveDate = new Date(this.datePipe.transform(formData.newEffectiveDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    groupRiskPolicy.nextRateReviewDate = (!formData.nextRateReviewDate) ? null : new Date(this.datePipe.transform(formData.nextRateReviewDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    groupRiskPolicy.lastRateUpdateDate = (!formData.lastRateUpdateDate) ? null : new Date(this.datePipe.transform(formData.lastRateUpdateDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    groupRiskPolicy.reinsuranceTreatyId = formData.reinsuranceTreatyId;
    groupRiskPolicy.administratorId = formData.administratorId;
    groupRiskPolicy.rmaRelationshipManagerId = formData.rmaRelationshipManagerId;
    groupRiskPolicy.anniversaryMonthTypeId = formData.anniversaryMonthTypeId;
    groupRiskPolicy.groupRiskDealTypeId = formData.groupRiskDealTypeId;
    groupRiskPolicy.fundRolePlayerId = formData.fundRolePlayerId;
    groupRiskPolicy.selectedDetailDate = formData.selectedDetailDate;
    groupRiskPolicy.policyDetailsEffectiveDates = [];
    groupRiskPolicy.policyDetailsEffectiveDates.push(groupRiskPolicy.newEffectiveDate);

    //add options
    if (!this.isEditWorkflow || groupRiskPolicy.policyId == 0) {
      if (!this.isEditWorkflow)
        groupRiskPolicy.policyOptions = [];

      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.commissionTypeId));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.commissionPaymentProcessTypeId));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.profitShare));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.allowContractor));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.firstYearBrokerCommission));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.partialWaiverActivelyAtWork));
      if (this.form.controls.partialWaiverPreExistingCondition.enabled) groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.partialWaiverPreExistingCondition));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(formData.policyHolderTypeId));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(0, formData.commissionDiscount, "CommissionDiscount"));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(0, formData.binderFee, "BinderFee"));
      groupRiskPolicy.policyOptions.push(this.createPolicyOption(0, formData.outsourceServiceFee, "OutsourceFee"));

      return groupRiskPolicy;
    }

    if (this.selectedItemRowIndex > -1) {
      groupRiskPolicy.policyOptions = this.dataSource.data[this.selectedItemRowIndex].policyOptions
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.CommissionType, formData.commissionTypeId);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.CommissionPaymentProcessType, formData.commissionPaymentProcessTypeId);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.ProfitShareOption, formData.profitShare);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.AllowContractors, formData.allowContractor);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.BrokerCommissionFirstYear, formData.firstYearBrokerCommission);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.PartialWaiverAtWork, formData.partialWaiverActivelyAtWork);
      if (this.form.controls.partialWaiverPreExistingCondition.enabled)
        this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.PartialWaiverPreExisting, formData.partialWaiverPreExistingCondition);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.PolicyHolderType, formData.policyHolderTypeId);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.CommissionDiscount, 0, formData.commissionDiscount);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.BinderFee, 0, formData.binderFee);
      this.updateOptions(groupRiskPolicy.policyOptions, OptionItemFieldEnum.OutSourceFee, 0, formData.outsourceServiceFee);
    }
    


    return groupRiskPolicy;
  }

  updateOptions(policyOptions: PolicyOption[], optionItemField: OptionItemFieldEnum, optionItemValueId: number, overrideValue: number = null) {
    var policyOption = policyOptions.find(x => x.optionItemField == optionItemField);
    if (policyOption) {
      if (optionItemValueId > 0) {
        policyOption.productOptionOptionItemValueId = optionItemValueId;
      }
      else {
        policyOption.overrideValue = overrideValue;
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    validationResult.errors = 0;
    validationResult.errorMessages =  [];

    if (this.model.employerRolePlayerId == 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Employer is not selected');
    }

    if (this.model.groupRiskPolicies.length == 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please create Policies');
    }

    if (this.model.groupRiskPolicies.filter(x=>x.schemeStatusId != PolicyStatusEnum.Active && x.schemeStatusId != PolicyStatusEnum.New  ).length >  0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('There are policies with invalid status');
    }

    if (this.model.groupRiskPolicies) {
      this.model.groupRiskPolicies.forEach(p => {
        if (!this.isFirstDayOfMonth(p.startDate)) { 
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`${p.policyNumber} : The start date should be on the first day of the month`);
        }

        if (!this.isFirstDayOfMonth(p.newEffectiveDate)) {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push(`${p.policyNumber}: The effective date should be on the first day of the month`);
        }

        if (p.newEffectiveDate < p.startDate) {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push(`${p.policyNumber}: The effective date should be on or after the start date`);
        }

      });
    }
    return validationResult;
  }
   
  onSavePolicy() {

    if(this.form.invalid){
      this.privateAlertService.error(
        "Please ensure all fields are captured.",
        "Add Policy",
      );
      return;
    }


    this.formIsValid = true;
    Object.keys(this.form.controls).forEach((field) => {
      const control = this.form.get(field);

      if (( control.value === "" || control.value === undefined ) &&
        control.hasValidator(Validators.required) && control.enabled
      ) {
        control.setErrors({ required: true });
        this.formIsValid = false;
      }
    });

    if (this.formIsValid) {
      const formObject = this.readForm();
      formObject.policyDetailsEffectiveDates = this.getDetailsDatesFromModel(formObject.policyId);
      if (!this.isFundPolicyHolderType(formObject)) {
        formObject.fundRolePlayerId = null;
      }else {
        if(!formObject.fundRolePlayerId || formObject.fundRolePlayerId === 0 ) {
          this.privateAlertService.error(
            "Please select fund.",
            "Add Policy",
          );
          return;
        }
      }
      //reset fund role player
      this.displayFundDetail = false;
      this.fundRolePlayer = null;
      this.createPolicyNumber(formObject);
    } else {
      this.form.updateValueAndValidity();
      this.privateAlertService.error(
        "Please ensure all fields are captured.",
        "Add Policy",
      );
    }
  }

  onStartDateChanged(startDate: Date) {
    if(!this.isEditWorkflow)
      this.form.patchValue({ "newEffectiveDate": startDate });
  }

  getDetailsDatesFromModel(policyId: number): Date[] {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
    if (policy)
      return policy.policyDetailsEffectiveDates;

    return [];
    }

  onRemove(item: any, rowIndex: number): void {
    this.confirmService
      .confirmWithoutContainer(
        "Remove Policy",
        "Are you sure you want to remove this policy?",
        "Center",
        "Center",
        "Yes",
        "No",
      )
      .subscribe((result) => {
        if (result === true) {
          this.groupRiskPolicyExtensions.splice(rowIndex, 1);
          this.bindPolicyTable();
        }
      });
  }

  resetFormControlValues(): void{


    this.form.patchValue({
      policyId: 0,
      binderPartnerId: "",
      binderFee: 0,
      outsourceServiceFee: 0,
      groupRiskDealTypeId: "",
      productOptionId: "",
      productId: "",
      policyNumber:"",
      brokerageId: "",
      commissionTypeId: "",
      commissionPaymentProcessTypeId: "",
      policyHolderTypeId: "",
      newEffectiveDate: "",
      startDate:"",
      endDate: "",
      administratorId: "",
      rmaRelationshipManagerId: "",
      anniversaryMonthTypeId: "",
      profitShare: "",
      schemeStatusId: "",
      lastRateUpdateDate: "",
      nextRateReviewDate: "",
      allowContractor: "",
      firstYearBrokerCommission: "",
      commissionDiscount: "",
      partialWaiverPreExistingCondition: "",
      partialWaiverActivelyAtWork:"",
      reinsuranceTreatyId: "",
      billingFrequencyTypeId: "",
      previousInsurer: "",
      clientReference: "",
      fundRolePlayerId: "",
      selectedDetailDate: ""
    });

    this.form.controls['policyNumber'].disable();
    this.setIsEditablePolicyChangingFields(true);

  }
  patchForm(groupRiskPolicy: GroupRiskPolicy) {
    this.form.patchValue({
      policyId: groupRiskPolicy.policyId,
      binderPartnerId: groupRiskPolicy.binderPartnerId,
      binderFee: this.getOption(OptionItemFieldEnum.BinderFee, groupRiskPolicy.policyOptions).overrideValue,
      outsourceServiceFee: this.getOption(OptionItemFieldEnum.OutSourceFee, groupRiskPolicy.policyOptions).overrideValue,
      groupRiskDealTypeId: groupRiskPolicy.groupRiskDealTypeId,
      productOptionId: groupRiskPolicy.productOptionId,
      productId: groupRiskPolicy.productId,
      policyNumber: groupRiskPolicy.policyNumber,
      brokerageId: groupRiskPolicy.brokerageId,
      commissionTypeId: this.getOption(OptionItemFieldEnum.CommissionType, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      commissionPaymentProcessTypeId: this.getOption(OptionItemFieldEnum.CommissionPaymentProcessType, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      policyHolderTypeId: this.getOption(OptionItemFieldEnum.PolicyHolderType, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      newEffectiveDate: groupRiskPolicy.newEffectiveDate,
      startDate: groupRiskPolicy.startDate,
      endDate: groupRiskPolicy.endDate,
      administratorId: groupRiskPolicy.administratorId,
      rmaRelationshipManagerId: groupRiskPolicy.rmaRelationshipManagerId,
      anniversaryMonthTypeId: groupRiskPolicy.anniversaryMonthTypeId,
      profitShare: this.getOption(OptionItemFieldEnum.ProfitShareOption, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      schemeStatusId: groupRiskPolicy.schemeStatusId,
      lastRateUpdateDate: groupRiskPolicy.lastRateUpdateDate,
      nextRateReviewDate: groupRiskPolicy.nextRateReviewDate,
      allowContractor: this.getOption(OptionItemFieldEnum.AllowContractors, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      firstYearBrokerCommission: this.getOption(OptionItemFieldEnum.BrokerCommissionFirstYear, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      commissionDiscount: this.getOption(OptionItemFieldEnum.CommissionDiscount, groupRiskPolicy.policyOptions).overrideValue,
      partialWaiverActivelyAtWork: this.getOption(OptionItemFieldEnum.PartialWaiverAtWork, groupRiskPolicy.policyOptions).productOptionOptionItemValueId,
      partialWaiverPreExistingCondition: this.showPreExistingWaiver ? this.getOption(OptionItemFieldEnum.PartialWaiverPreExisting, groupRiskPolicy.policyOptions).productOptionOptionItemValueId : "",
      reinsuranceTreatyId: groupRiskPolicy.reinsuranceTreatyId,
      billingFrequencyTypeId: groupRiskPolicy.billingFrequencyTypeId,
      previousInsurer: groupRiskPolicy.previousInsurer,
      clientReference: groupRiskPolicy.clientReference,
      fundRolePlayerId: groupRiskPolicy.fundRolePlayerId,
    });
    this.form.controls['policyNumber'].disable();
    //display fund details
    if (this.isFundPolicyHolderType(groupRiskPolicy)) {
      this.selectedFundRolePlayerId = groupRiskPolicy.fundRolePlayerId;
      this.displayFundDetail = true;
      this.getFundRolePlayer();
    } else {
      this.displayFundDetail = false;
    }

    if(this.isEditWorkflow){
      this.setIsEditablePolicyChangingFields(false);
    }


  }
  setIsEditablePolicyChangingFields(isEditable = false) {

    if (!isEditable) {
      this.form.controls.productOptionId.disable();
      this.form.controls.groupRiskDealTypeId.disable();
      this.form.controls.productId.disable();
    }
    else {
      this.form.controls.productOptionId.enable();
      this.form.controls.groupRiskDealTypeId.enable();
      this.form.controls.productId.enable();
    }
  }
  onEdit(item: GroupRiskPolicy, rowIndex: number): void {
    this.selectedItemRowIndex = rowIndex;
    this.selectedProductOptionId = item.productOptionId;
    
    this.productOptionTypeChanged(this.selectedProductOptionId, item);

    if (item.policyDetailsEffectiveDates.length >= 1) {
      if (item.policyDetailsEffectiveDates.length > 1)
        this.policyDetailDates = item.policyDetailsEffectiveDates.sort((startDate: Date, endDate: Date) => { return new Date(endDate).getTime() - new Date(startDate).getTime(); });
      else
        this.policyDetailDates = item.policyDetailsEffectiveDates;

      this.form.patchValue({ selectedDetailDate: item.policyDetailsEffectiveDates[0] });
    }

    if (this.isDisabled || this.isEditWorkflow)
      this.form.controls.selectedDetailDate.enable();
  }

  loadDetailsForDate(policyId: number, selectedDate: Date) {
    this.loadingStart("Loading policy details...")
    this.groupRiskPolicyCaseService.getGroupRiskPolicy(policyId, selectedDate).subscribe({
      next: (result) => {
        if (result)
          this.patchForm(result);
      },
      complete: () => {
        this.loadingStop();
      }
    });
  }

  onDetailsDateChanged(effectiveDate: Date) {
    var policyId = this.form.controls.policyId.value;
    this.loadDetailsForDate(policyId, effectiveDate);
  }

  selectPolicyHolderType($event: any) {
    if ($event) {
      var optionItemValue = this.policyHolderTypeOptions.find(x => x.productOptionOptionItemValueId == $event.value);
      if (optionItemValue)
        this.displayFundDetail = optionItemValue.optionItemCode == "Fund";
    }
  }

  populateModel() {
    if (!this.groupRiskPolicyExtensions || this.groupRiskPolicyExtensions.length == 0) {
      this.model.groupRiskPolicies = [];
      this.groupRiskPolicyExtensions.forEach((policyExtension) =>
        this.model.groupRiskPolicies.push(policyExtension),
      );
    }

    this.form.reset();
    this.displayFundDetail = false;
    this.fundRolePlayer = null;

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

  formatLookup(lookup: string): string {
    return lookup
      ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2").replace("_", "-")
      : "N/A";
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, " $1").trim();
  }

  bindPolicyTable() {
    this.dataSource.data = this.groupRiskPolicyExtensions;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getGroupRiskDealTypeEnumName(groupRiskDealTypeId: number): string {
    return GroupRiskDealTypeEnum[groupRiskDealTypeId]
      .replace(/([A-Z])/g, " $1")
      .trim();
  }

  getGetRamaAdministratorName(userId: number): string {

   if( this.administrators && this.administrators.length > 0){
     let user = this.administrators.find((x) => x.id == userId);
     if (user) {
       return user.name;
     }
   }

  }

  createPolicyNumber(request: GroupRiskPolicy): void {
    if (
      request.policyId === 0 ||
      request.policyId === undefined ||
      request.policyId === null
    ) {
      request.policyId = 0;
      this.groupRiskPolicyCaseService
        .createPolicyNumber(this.model.employerRolePlayerId, request)
        .subscribe((data) => {
          if (data) {
            if (this.selectedItemRowIndex > -1) {
              this.groupRiskPolicyExtensions[this.selectedItemRowIndex] = data;
              this.privateAlertService.success(
                "Policy has been updated Successfully.",
                "Update Policy",
              );
            } else {
              data.id = this.groupRiskPolicyExtensions.length + 1;
              this.groupRiskPolicyExtensions.push(data);
              this.privateAlertService.success(
                "Policy has been added Successfully.",
                "Add Policy",
              );
            }
            this.selectedItemRowIndex = -1;
            this.form.reset();
            this.form.patchValue({policyId: 0});
            this.resetFormControlValues();
            this.bindPolicyTable();
          }
        });
    } else {
      let selectedProductOption = this.productOptionTypes.find(
        (x) => x.id == request.productOptionId,
      );
      if (selectedProductOption) {
        request.policyNumber = `RMA-${this.model.employerRolePlayerId}-${selectedProductOption.code}-${request.policyId}`;

        request.groupRiskPolicyBenefits = this.getBenefitsFromModel(request.policyId);

        this.groupRiskPolicyExtensions[this.selectedItemRowIndex] = request;
        this.privateAlertService.success(
          "Policy has been updated Successfully.",
          "Update Policy",
        );
        this.selectedItemRowIndex = -1;
        this.form.reset();
        this.form.patchValue({policyId: 0});
        this.resetFormControlValues();
        this.bindPolicyTable();
      }
    }
  }

  setFundRolePlayer({$event}: { $event: any }) {
    this.fundRolePlayer = $event;
    this.selectedFundRolePlayerId = $event.rolePlayerId;
    this.form.patchValue({
      fundRolePlayerId: this.selectedFundRolePlayerId,
    });
  }

  getFundRolePlayer() {
    this.memberService
      .getMember(this.selectedFundRolePlayerId)
      .subscribe((result) => {
        this.fundRolePlayer = result;
      });
  }

  getProductOptionConfigurations(){
    if(this.selectedEffectiveDate && this.selectedProductOptionId > 0 ){
      if(!this.ProductOptionConfiguration || this.ProductOptionConfiguration.length === 0 ){
        this.brokerageService
          .getProductOptionConfigurationsByProductOptionId(this.selectedProductOptionId, this.selectedEffectiveDate)
          .subscribe((productConfigs) => {
            if(productConfigs){
              productConfigs.forEach(productConfig=> this.ProductOptionConfiguration.push(productConfig));
              this.setBinderFeeValues();
            }
          });
      }
    }
  }


  setBinderFeeValues() {
    let binderFeeFormValue = this.form.get('binderFee').value as number;
    let outsourceServiceFeeFormValue =  this.form.get('outsourceServiceFee').value as number;

    let binderFee =  this.ProductOptionConfiguration.find(x=> x.optionTypeCode ==  GroupRiskOptionTypeEnum[GroupRiskOptionTypeEnum.BinderFee].toString() && x.productOptionId ===  this.selectedProductOptionId);
    if(binderFee ) {

      if(binderFeeFormValue === 0  || binderFeeFormValue === null){
        this.form.patchValue({
          binderFee: binderFee?.productOptionOptionValue? binderFee?.productOptionOptionValue : 0,
        });
      }else {
        this.form.patchValue({
          binderFee: binderFeeFormValue,
        });
      }
    }

    let outsourceFee =  this.ProductOptionConfiguration.find(x=> x.optionTypeCode ==  GroupRiskOptionTypeEnum[GroupRiskOptionTypeEnum.OutsourceFee].toString() && x.productOptionId ===  this.selectedProductOptionId);
    if(outsourceFee ) {
      if(outsourceServiceFeeFormValue === 0 || outsourceServiceFeeFormValue === null){
        this.form.patchValue({
          outsourceServiceFee:  outsourceFee?.productOptionOptionValue? outsourceFee?.productOptionOptionValue : 0
        });
      }else {
        this.form.patchValue({
          outsourceServiceFee:outsourceServiceFeeFormValue
        });
      }
    }
  }
  getBinderFees() {

    let binderFeeFormValue = this.form.get('binderFee').value  as number;
    let outsourceServiceFeeFormValue =  this.form.get('outsourceServiceFee').value as number;
    this.selectedProductOptionId = this.form.get('productOptionId').value as number;

    if(binderFeeFormValue !== 0  &&   binderFeeFormValue !== null
      && outsourceServiceFeeFormValue !== 0  && outsourceServiceFeeFormValue !== null){
      return;
    }

    if(!this.ProductOptionConfiguration  ||  this.ProductOptionConfiguration.length === 0 || this.ProductOptionConfiguration.filter(x=> x.productOptionId === this.selectedProductOptionId).length === 0){
      this.getProductOptionConfigurations();
    }else {
      this.setBinderFeeValues();
    }

  }

  selectBinderPartner($event: any) {
    this.selectedFundRolePlayerId = $event.value;
    this.getBinderFees();
  }

  newEffectiveDateChanged($event: any) {
    this.selectedEffectiveDate = new Date($event.value) ;
    this.getBinderFees();
  }

  onProductOptionTypeChange($event: any) {
    this.isLoading = true;
    this.selectedProductOptionId = $event.value;
    this.productOptionTypeChanged(this.selectedProductOptionId);
  }

  productOptionTypeChanged(productOptionId: number, reloadData: GroupRiskPolicy = null): boolean {
    this.isLoading = true;
    this.getBinderFees();
    this.updateLookups(productOptionId);
    this.showHideFields(this.productOptionTypes.find(x => x.id === productOptionId));
    this.groupRiskPolicyCaseService.getProductOptionOptionItems(productOptionId)
      .subscribe(result => {
        this.productOptionOptionItemsLookup = result;
        if (reloadData) this.patchForm(reloadData);
        this.isLoading = false;
      }
    );
    return true;
  }

  showHideFields(productOption: ProductOption) {

    this.form.controls.partialWaiverPreExistingCondition.disable();
    this.showPreExistingWaiver = false;
    if (productOption) {
      if (productOption.code === "CI" || productOption.code === "ULSD" || productOption.code === "TTD" || productOption.code === "DIB") {
        if(!this.inApprovalMode && !this.isDisabled) this.form.controls.partialWaiverPreExistingCondition.enable();
        this.showPreExistingWaiver = true;
      }
    }
  }

  updateLookups(productOptionId: number) {
    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("CommissionType", productOptionId)
      .subscribe(result => {
        this.commissionOptions = result;
      }
    );

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("CommissionPayFrequency", productOptionId)
      .subscribe(result => {
        this.commissionPaymentFrequencyOptions = result;
        }
    ); 

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("ContractorCover", productOptionId)
      .subscribe(result => {
        this.contractorCoverOptions = result;
      }
    );

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("FirstYearBrokerComm", productOptionId)
      .subscribe(result => {
        this.firstYearBrokerCommissionOptions = result;
      }
    ); 

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("PartialWaiverActiveAtWork", productOptionId)
      .subscribe(result => {
        this.partialWaiverAtWorkOptions = result;
      }
    );

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("PartialWaiverPreExisting", productOptionId)
      .subscribe(result => {
        this.partialWaiverPreExistingOptions = result;
      }
    );

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("ProfitShare", productOptionId)
      .subscribe(result => {
        this.profitShareOptions = result;
      }
    ); 

    this.groupRiskPolicyCaseService.getProductOptionOptionItemValues("PolicyHolderType", productOptionId)
      .subscribe(result => {
        this.policyHolderTypeOptions = result;
      }
    );
  }

  createPolicyOption(productOptionOptionItemValueId: number, overrideValue: number = null, optionTypeCode: string = null): PolicyOption {
    if (productOptionOptionItemValueId > 0)
      return new PolicyOption(productOptionOptionItemValueId);

    return new PolicyOption(this.getOptionItemValueId(optionTypeCode), overrideValue);
  }

  getOptionItemValueId(optionTypeCode: string): number {
    var optionItemValue = this.productOptionOptionItemsLookup.find(x => x.optionTypeCode === optionTypeCode);
    if (optionItemValue)
      return optionItemValue.productOptionOptionItemValueId;
    return 0; 
  }

  getOption(optionField: OptionItemFieldEnum, policyOptions: PolicyOption[]): PolicyOption {
    for (var i = 0; i < this.productOptionOptionItemsLookup.length; i++) {
      if (this.productOptionOptionItemsLookup[i].optionItemField == optionField) {
        var selectedOption = policyOptions.find(x => x.productOptionOptionItemValueId == this.productOptionOptionItemsLookup[i].productOptionOptionItemValueId);
        if (selectedOption)
          return selectedOption;
      }
    }
   
    return new PolicyOption(0);
  }

  isFundPolicyHolderType(policy: GroupRiskPolicy): boolean {
      var policyOption = this.getOption(OptionItemFieldEnum.PolicyHolderType, policy.policyOptions);

    if (policyOption) {
      var optionItemValue = this.policyHolderTypeOptions.find(x => x.productOptionOptionItemValueId == policyOption.productOptionOptionItemValueId);
      if (optionItemValue)
        return optionItemValue.optionItemCode == 'Fund';
    }

    return false;
  }

  isFirstDayOfMonth(date: Date) {
    return this.datePipe.transform(date, "d") === "1";
  }

  getBenefitsFromModel(policyId: number): GroupRiskPolicyBenefit[] {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
    if (policy)
      return policy.groupRiskPolicyBenefits;

    return [];
  }

  get isEditWorkflow(): boolean {
    if (!this.context)
      return false;
    return this.context.wizard.linkedItemId > 0;
  }
}
