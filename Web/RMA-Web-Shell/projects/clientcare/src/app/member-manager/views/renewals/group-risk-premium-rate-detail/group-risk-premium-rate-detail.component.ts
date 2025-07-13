import { Component, ElementRef, ViewChild } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import {
  WizardDetailBaseComponent
} from "../../../../../../../shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component";
import {
  AppEventsManager
} from "../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { AuthService } from "../../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service";
import { ActivatedRoute } from "@angular/router";
import {
  ValidationResult
} from "../../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { GroupRiskPolicyCaseService } from "../../../../policy-manager/shared/Services/group-risk-policy-case.service";
import {
  PolicyPremiumRateDetailModel
} from "../../../../policy-manager/shared/entities/policy-premium-rate-detail-model";
import { PremiumRateComponentModel } from "../../../../policy-manager/shared/entities/premium-rate-component-model";
import {
  GroupRiskEmployerPremiumRateModel
} from "../../../../policy-manager/shared/entities/group-risk-employer-premium-rate--model";
import { PolicyDetail } from "../../../../policy-manager/shared/entities/policy-detail";
import { Benefit } from "../../../../product-manager/models/benefit";
import { PolicyBenefitCategory } from "../../../../policy-manager/shared/entities/policy-benefit-category";
import {
  GroupRiskBillingMethodTypeEnum
} from "../../../../../../../shared-models-lib/src/lib/enums/group-risk-billing-method-type-enum";
import {
  GroupRiskBillingLevelTypeEnum
} from "../../../../../../../shared-models-lib/src/lib/enums/group-risk-billing-level-type-enum";
import { ReinsuranceTreaty } from "../../../../policy-manager/shared/entities/reinsurance-treaty";
import {
  ZeroRatedReassPremiumTypeEnum
} from "../../../../policy-manager/shared/enums/zero-rated-reass-premium-type.enum";
import {
  ConfirmationDialogsService
} from "../../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service";
import {
  BenefitReinsuranceAverageModel
} from "../../../../policy-manager/shared/entities/benefit-reinsurance-average-model";
import { DatePipe } from "@angular/common";

@Component({
  selector: "group-risk-premium-rate-detail",
  templateUrl: "./group-risk-premium-rate-detail.component.html",
  styleUrls: ["./group-risk-premium-rate-detail.component.css"],
})
export class GroupRiskPremiumRateDetailComponent extends WizardDetailBaseComponent<GroupRiskEmployerPremiumRateModel> {
  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute,
    readonly formBuilder: UntypedFormBuilder,
    readonly alertService: AlertService,
    readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    readonly confirmService: ConfirmationDialogsService,
    readonly datePipe: DatePipe
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  displayedColumns = [
    "policyName",
    "benefitName",
    "benefitCategoryName",
    "billingMethodCode",
    "totalRate",
    "effectiveDate",
    "lastUpdateDate",
    "actions",
  ];

  displayedColumnsPremiumRateComponentModelTableData = [
    "componentName",
    "totalRateComponentValue",
  ];

  public dataSource = new MatTableDataSource<PolicyPremiumRateDetailModel>();
  public dataSourcePremiumRateComponentModelTableData =
    new MatTableDataSource<PremiumRateComponentModel>();
  public dataSourceBenefitReinsuranceAverageModelTableData =
    new MatTableDataSource<BenefitReinsuranceAverageModel>();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild("filter", { static: false }) filter: ElementRef;

  isLoadingGroupRiskPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(
    true,
  );
  employerRolePlayerId: number;
  selectedPolicyId: number;
  selectedBenefitId: number;
  selectedEffectiveDate: Date;
  selectedBenefitCategoryId: number;
  selectedReinsuranceTreatyId: number;
  selectedBillingMethodCode: string;
  selectedBillingMethodName: string;
  selectedBillingLevelCode: string;
  isEditMode: boolean = false;

  Policies: PolicyDetail[];
  Benefits: Benefit[];
  BenefitCategories: PolicyBenefitCategory[];
  ReinsuranceTreaties: ReinsuranceTreaty[];
  BillingMethodTypes: string[];
  BillingLevelTypes: string[];

  policyPremiumRateDetailModelTableData: PolicyPremiumRateDetailModel[];
  premiumRateComponentModelTableData: PremiumRateComponentModel[];
  benefitReinsuranceAverageModelTableData: BenefitReinsuranceAverageModel[];
  groupRiskBenefitBillingLevelType = "Benefit";
  groupRiskBillingMethodPercentageOfPayroll = "PercentageOfPayroll";
  groupRiskBillingMethodFixedSum = "FixedSum";


  createForm(id: number): void {
    this.form = this.formBuilder.group({
      policyPremiumRateDetailId: -1,
      policyId: [0, [Validators.required]],
      benefitId: [0, [Validators.required]],
      benefitCategoryId: "",
      billingLevelCode: [{ value:"", disabled: true}, [Validators.required]],
      reinsuranceTreatyId: [0, [Validators.required]],
      billingMethodCode: [0, [Validators.required]],
      reinsuranceTreatyReassPercentage: [0, [Validators.required]],
      reinsuranceTreatyRmlPercentage: [0, [Validators.required]],
      effectiveDate: ["", [Validators.required]],
    });
  }

  onLoadLookups(): void {
    this.loadPremiumRateComponentModelTableData();
    this.loadBillingMethodTypes();
    this.loadBillingLevelTypes();
  }

  populateModel(): void {

    if (this.policyPremiumRateDetailModelTableData && this.policyPremiumRateDetailModelTableData.length > 0) {
      this.model.policyPremiumRateDetailModels = [];
      let policyPremiumDetailId = 0;
      this.policyPremiumRateDetailModelTableData.forEach(x => {
        x.policyPremiumRateDetailId = policyPremiumDetailId;
        this.model.policyPremiumRateDetailModels.push(x);
        policyPremiumDetailId++;
      })
    }
  }

  populateForm() {

    if (this.model) {
      this.employerRolePlayerId = this.model.employerRolePlayerId;
      this.policyPremiumRateDetailModelTableData = [];
      this.benefitReinsuranceAverageModelTableData = [];

      this.loadPolicies();
      if (this.model.policyPremiumRateDetailModels && this.model.policyPremiumRateDetailModels.length > 0) {
        this.model.policyPremiumRateDetailModels.forEach(x => this.policyPremiumRateDetailModelTableData.push(x))
        this.bindPolicyTable();
      }
    }
  }

  loadPolicyReinsuranceTreaty() {

    this.isLoadingGroupRiskPolicies$.next(true);
    if (this.selectedPolicyId && this.selectedPolicyId > 0) {
      this.groupRiskPolicyCaseService
        .getPolicyReinsuranceTreaty(this.selectedPolicyId, this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd'))
        .subscribe((reinsuranceTreaty) => {
          this.ReinsuranceTreaties = reinsuranceTreaty;

          if (reinsuranceTreaty !== null && reinsuranceTreaty.length > 0) {

            if (reinsuranceTreaty.length === 1) {
              this.selectedReinsuranceTreatyId = reinsuranceTreaty[0].treatyId;
              this.form.patchValue({
                reinsuranceTreatyId: this.selectedReinsuranceTreatyId,
              });
            }

          } else {
            this.alertService.error(
              `Reinsurance treaty has not been configured for the policy.`,
            );
            return;
          }
          this.isLoadingGroupRiskPolicies$.next(false);
        });
    }
  }

  loadBillingMethodTypes() {
    this.BillingMethodTypes = Object.keys(GroupRiskBillingMethodTypeEnum);
  }

  loadBillingLevelTypes() {
    this.BillingLevelTypes = Object.keys(GroupRiskBillingLevelTypeEnum);
  }

  loadPolicies() {
    if (!this.employerRolePlayerId || this.employerRolePlayerId === 0) {
      this.alertService.error(
        "Please select company before adding premium rate",
      );
      return;
    }

    if (!this.Policies || this.Policies.length === 0) {
      this.isLoadingGroupRiskPolicies$.next(true);
      this.groupRiskPolicyCaseService
        .getPolicyDetailByEmployerRolePlayerId(this.employerRolePlayerId)
        .subscribe((results) => {
          this.Policies = results;
          this.isLoadingGroupRiskPolicies$.next(false);
        });
    }
  }

  loadPolicyBenefits() {
    if (!this.selectedPolicyId || this.selectedPolicyId === 0) {
      this.alertService.error(
        "Please select policy before adding premium rate",
      );
      return;
    }

    this.isLoadingGroupRiskPolicies$.next(true);
    this.groupRiskPolicyCaseService
      .getPolicyBenefit(this.selectedPolicyId)
      .subscribe((results) => {
        this.Benefits = results;
        this.isLoadingGroupRiskPolicies$.next(false);
      });

    this.loadBillingLevelTypes();
    this.loadBenefitReinsuranceAverage();

  }

  loadBenefitCategories() {
    if (this.selectedPolicyId > 0 && this.selectedBenefitId > 0) {


      if (this.selectedEffectiveDate) {
        this.isLoadingGroupRiskPolicies$.next(true);
        this.groupRiskPolicyCaseService
          .getBenefitCategoriesForPremiumRatesBillingLevel(this.selectedPolicyId, this.selectedBenefitId, this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd'))
          .subscribe((results) => {
            this.BenefitCategories = results;
            if (this.BenefitCategories && this.BenefitCategories.length > 0) {

              if (this.BenefitCategories.length == 1 && this.isCategoryBilling) {
                this.selectedBenefitCategoryId = this.BenefitCategories[0].benefitCategoryId;
                this.form.patchValue({
                  benefitCategoryId: this.selectedBenefitCategoryId
                });
              }

            }
            this.isLoadingGroupRiskPolicies$.next(false);
          });
      }
    }
  }

  loadBenefitReinsuranceAverage() {

    if (this.isEditMode == true) {
      return;
    }

    if (this.selectedPolicyId && this.selectedPolicyId > 0 && this.selectedBenefitId && this.selectedBenefitId > 0 && this.selectedEffectiveDate) {
      this.isLoadingGroupRiskPolicies$.next(true);
      this.groupRiskPolicyCaseService
        .getBenefitReinsuranceAverageByBenefitId(this.selectedPolicyId, this.selectedBenefitId, this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd'))
        .subscribe((benefitReinsuranceAverageModels) => {
          this.benefitReinsuranceAverageModelTableData = [];

          if (benefitReinsuranceAverageModels.length > 0) {
            this.benefitReinsuranceAverageModelTableData.push(...benefitReinsuranceAverageModels);
          }

          this.isLoadingGroupRiskPolicies$.next(false);
        });
    }
  }

  readForm(): PolicyPremiumRateDetailModel {
    return this.form.getRawValue();
  }

  loadPremiumRateComponentModelTableData() {
    if (
      !this.premiumRateComponentModelTableData ||
      this.policyPremiumRateDetailModelTableData.length === 0
    ) {

      this.isLoadingGroupRiskPolicies$.next(true);
      this.groupRiskPolicyCaseService
        .getPremiumRateComponentModel()
        .subscribe((result) => {
          this.premiumRateComponentModelTableData = [];
          this.premiumRateComponentModelTableData.push(...result);
          this.bindRateComponentTable();
          this.isLoadingGroupRiskPolicies$.next(false);

        });
    }
  }

  onSavePremiumRate() {

    let totalAveragePercentage = 0;
    this.benefitReinsuranceAverageModelTableData.forEach(benefitReinsuranceAverage => {

      benefitReinsuranceAverage.reinsAverage = Number(benefitReinsuranceAverage.reinsAverage);
      totalAveragePercentage += Number(benefitReinsuranceAverage.reinsAverage) * 100;
    });

    if (totalAveragePercentage !== 100) {
      this.alertService.error(
        "The total percentage split for treaties should be 1 (100%)",
      );
      return;
    }

    let premiumRateDetailModelFormData = this.readForm();

    if (!this.selectedPolicyId || this.selectedPolicyId === 0) {
      this.alertService.error(
        "Please select policy before adding premium rate",
      );
      return;
    }

    if (!this.selectedEffectiveDate) {
      this.alertService.error(
        "Please select effective before adding premium rate",
      );
      return;
    }

    if (!this.selectedBenefitId || this.selectedBenefitId === 0) {
      this.alertService.error(
        "Please select benefit before adding a premium rate.",
      );
      return;
    }

    if (!this.selectedBillingMethodCode || this.selectedBillingMethodCode == '') {
      this.alertService.error(
        "Please select billing basis before adding a premium rate.",
      );
      return;
    }

    let policyPremiumRateDetailModel = new PolicyPremiumRateDetailModel();
    policyPremiumRateDetailModel.policyId = premiumRateDetailModelFormData?.policyId;
    policyPremiumRateDetailModel.policyName = this.Policies?.find(x => x.policyId == premiumRateDetailModelFormData?.policyId)?.policyName;
    policyPremiumRateDetailModel.benefitId = premiumRateDetailModelFormData?.benefitId;
    policyPremiumRateDetailModel.benefitName = this.Benefits?.find(x => x.id == premiumRateDetailModelFormData?.benefitId)?.name;
    policyPremiumRateDetailModel.benefitCategoryId = premiumRateDetailModelFormData?.benefitCategoryId;
    policyPremiumRateDetailModel.reinsuranceTreatyReassPercentage = premiumRateDetailModelFormData?.reinsuranceTreatyReassPercentage;
    policyPremiumRateDetailModel.reinsuranceTreatyRmlPercentage = premiumRateDetailModelFormData?.reinsuranceTreatyRmlPercentage;
    policyPremiumRateDetailModel.billingLevelCode = premiumRateDetailModelFormData?.billingLevelCode;
    policyPremiumRateDetailModel.billingLevelName = this.BillingLevelTypes?.find(x => x.toString() == premiumRateDetailModelFormData?.billingLevelCode?.toString())?.toString();
    policyPremiumRateDetailModel.benefitCategoryName = this.BenefitCategories?.find(x => x.benefitCategoryId == premiumRateDetailModelFormData?.benefitCategoryId)?.name;

    if (policyPremiumRateDetailModel.billingLevelName != this.groupRiskBenefitBillingLevelType) {
      if (!policyPremiumRateDetailModel.benefitCategoryId || policyPremiumRateDetailModel.benefitCategoryId <= 0) {
        this.alertService.error(
          "Please select benefit category before adding a premium rate.",
        );
        return;
      }
    }

    let effectiveDate = premiumRateDetailModelFormData?.effectiveDate;
    if (effectiveDate) {
      policyPremiumRateDetailModel.effectiveDate = new Date(this.datePipe.transform(effectiveDate, "yyyy-MM-dd")).getCorrectUCTDate();
    }

    policyPremiumRateDetailModel.reinsuranceTreatyId = premiumRateDetailModelFormData?.reinsuranceTreatyId;
    policyPremiumRateDetailModel.reinsuranceTreatyName = this.ReinsuranceTreaties?.find(x => x.treatyId == premiumRateDetailModelFormData?.reinsuranceTreatyId)?.treatyName;
    policyPremiumRateDetailModel.billingMethodCode = GroupRiskBillingMethodTypeEnum[premiumRateDetailModelFormData.billingMethodCode];
    policyPremiumRateDetailModel.billingMethodName = this.BillingMethodTypes?.find(x => x.toString() == premiumRateDetailModelFormData?.billingMethodCode?.toString())?.toString();
    policyPremiumRateDetailModel.premiumRateComponentModels = [];

    if (policyPremiumRateDetailModel.billingLevelName == this.groupRiskBenefitBillingLevelType) {
      policyPremiumRateDetailModel.benefitCategoryId = null;
      policyPremiumRateDetailModel.benefitCategoryName = null;
    }

    let totalRate = 0;
    let componentWithInvalidValues = this.premiumRateComponentModelTableData.filter(component => component.allowNegativeValue === false && Number(component.totalRateComponentValue) < 0);

    if (componentWithInvalidValues.length == 0) {
      this.premiumRateComponentModelTableData?.forEach(component => {

        if (!component.totalRateComponentValue) {
          component.totalRateComponentValue = 0;
        }

        totalRate += Number(component.totalRateComponentValue) * 100;
        policyPremiumRateDetailModel.premiumRateComponentModels?.push({ ...component } );

      });
    } else {
      let componentsThatAllowNegativeValuesArr = this.premiumRateComponentModelTableData.filter(component => component.allowNegativeValue === true);
      let componentCodes = componentsThatAllowNegativeValuesArr.map(y => y.componentCode).join(",");
      this.alertService.error(
        `Only the ${componentCodes}  component(s) can have negative values.`,
      );
      return;
    }

    if (policyPremiumRateDetailModel.billingMethodName == this.groupRiskBillingMethodPercentageOfPayroll && totalRate > 100) {
      this.alertService.error(
        `The sum of the component values cannot be greater than 1 (100%) for billing basis  ${this.formatText(policyPremiumRateDetailModel.billingMethodName)} .`
      );
      return;
    }

    if (policyPremiumRateDetailModel.billingMethodName == this.groupRiskBillingMethodFixedSum && totalRate != 100) {
      this.alertService.error(
        `The sum of the component values should be equal to 1 (100%) for billing basis  ${this.formatText(policyPremiumRateDetailModel.billingMethodName)} .`
      );
      return;
    }


    //adding reinsurance used to do component calculations
    policyPremiumRateDetailModel.benefitReinsuranceAverageModels = [];
    this.benefitReinsuranceAverageModelTableData?.forEach(treatyReinsuranceAverage => {

      if (!treatyReinsuranceAverage.reinsAverage) {
        treatyReinsuranceAverage.reinsAverage = 0;
      }
      treatyReinsuranceAverage.reinsAverage = Number(treatyReinsuranceAverage.reinsAverage);
      policyPremiumRateDetailModel.benefitReinsuranceAverageModels?.push(treatyReinsuranceAverage);
    });

    policyPremiumRateDetailModel.totalRate = totalRate / 100.00;
    if (premiumRateDetailModelFormData.policyPremiumRateDetailId === null) {
      premiumRateDetailModelFormData.policyPremiumRateDetailId = -1;
    }

    if (premiumRateDetailModelFormData.policyPremiumRateDetailId === -1 && this.policyPremiumRateDetailModelTableData.length === 0) {
      policyPremiumRateDetailModel.policyPremiumRateDetailId = 0;
      this.policyPremiumRateDetailModelTableData?.push(policyPremiumRateDetailModel);
    } else if (premiumRateDetailModelFormData.policyPremiumRateDetailId === -1 && this.policyPremiumRateDetailModelTableData.length > 0) {
      policyPremiumRateDetailModel.policyPremiumRateDetailId = this.policyPremiumRateDetailModelTableData.length + 1;
      this.policyPremiumRateDetailModelTableData?.push(policyPremiumRateDetailModel);
    } else {
      policyPremiumRateDetailModel.policyPremiumRateDetailId = premiumRateDetailModelFormData.policyPremiumRateDetailId;
      this.policyPremiumRateDetailModelTableData = this.policyPremiumRateDetailModelTableData?.filter(x => x.policyPremiumRateDetailId !== policyPremiumRateDetailModel.policyPremiumRateDetailId);
      this.policyPremiumRateDetailModelTableData?.push(policyPremiumRateDetailModel);
    }

    //reset form controls
    this.bindPolicyTable();
    this.benefitReinsuranceAverageModelTableData = [];
    this.form.reset();
    this.calculateRateComponentSplit();
    this.alertService.success(`Policy premium rate has been ${this.isEditMode ? 'updated' : 'added'} successfully`);
    this.isEditMode = false;
    this.resetPremiumRateComponentValues();
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
    this.dataSource.data = this.policyPremiumRateDetailModelTableData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  bindRateComponentTable() {
    this.dataSourcePremiumRateComponentModelTableData.data = this.premiumRateComponentModelTableData;
  }

  calculateRateComponentSplit() {

    let reinsuranceTreatyRmlPercentage = 0;
    let reinsuranceTreatyReassPercentage = 0;

    let totalAveragePercentage = 0;
    this.benefitReinsuranceAverageModelTableData.forEach(x => {
      totalAveragePercentage += Number(x.reinsAverage);
    });

    if (totalAveragePercentage !== 1) {
      return;
    }

    let componentWithInvalidValues = this.premiumRateComponentModelTableData.filter(component => component.allowNegativeValue === false && Number(component.totalRateComponentValue) < 0);
    if (componentWithInvalidValues.length > 0) {
      let componentsThatAllowNegativeValuesArr = this.premiumRateComponentModelTableData.filter(component => component.allowNegativeValue === true);
      let componentCodes = componentsThatAllowNegativeValuesArr.map(y => y.componentCode).join(",");
      this.alertService.error(
        `Only the ${componentCodes}  component(s) can have negative values.`,
      );
      return;
    }

    this.premiumRateComponentModelTableData.forEach((premiumRateComponent) => {

      if (Object.values(ZeroRatedReassPremiumTypeEnum).includes(ZeroRatedReassPremiumTypeEnum[premiumRateComponent.componentCode])) {
        premiumRateComponent.reinsuranceTreatyRmlValue = Number(premiumRateComponent.totalRateComponentValue);
        let zeroValue = 0;
        premiumRateComponent.reinsuranceTreatyReassValue = Number(zeroValue);

      } else {
        premiumRateComponent.reinsuranceTreatyReassValue = Number(reinsuranceTreatyReassPercentage) * Number(premiumRateComponent.totalRateComponentValue);
        premiumRateComponent.reinsuranceTreatyRmlValue = Number(reinsuranceTreatyRmlPercentage) * Number(premiumRateComponent.totalRateComponentValue);
      }
    });

    this.bindRateComponentTable();
  }

  totalRateComponentValueChanged($event: any) {
    this.calculateRateComponentSplit();
  }

  reinsAverageValueChanged($event: any) {
    this.calculateRateComponentSplit();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    validationResult.errors = 0;
    validationResult.errorMessages = [];

    if (this.model.employerRolePlayerId == 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Employer is not selected');
    }

    if (this.model.policyPremiumRateDetailModels.length == 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please create premium rates');
    }

    return validationResult;
  }

  calculateTotalRateComponentValueTotal(): number {

    let total = 0;
    if (this.premiumRateComponentModelTableData && this.premiumRateComponentModelTableData.length > 0) {

      let componentWithInvalidValues = this.premiumRateComponentModelTableData.filter(component => component.allowNegativeValue === false && Number(component.totalRateComponentValue) < 0);
      if (componentWithInvalidValues.length > 0) {
        return;
      } else {
        this.premiumRateComponentModelTableData.forEach((component) => {
          total += Number(component.totalRateComponentValue);
        });
      }
    }

    return total;
  }

  selectedPolicyChange($event: any) {

    this.selectedPolicyId = $event.value;

    this.form.patchValue({ "benefitId": "", "reinsuranceTreatyId": "" });
    this.selectedReinsuranceTreatyId = 0;
    this.clearBenefitDependentFields();

    this.loadPolicyBenefits();
    this.loadBenefitReinsuranceAverage();
  }

  selectedBenefitChange($event: any) {
    this.selectedBenefitId = $event.value;
    this.clearBenefitDependentFields();
    this.loadBillingLevelTypes();
    this.loadBenefitReinsuranceAverage();
  }

  selectedbillingMethodChange($event: any) {
    this.selectedBillingMethodCode = $event.value;
  }

  newEffectiveDateChanged($event: any) {
    this.selectedEffectiveDate = new Date($event.value);
    this.loadBenefitReinsuranceAverage();
    this.loadBenefitCategories();
    this.setBillingBasis(this.selectedPolicyId, this.selectedBenefitId, this.selectedEffectiveDate);
    this.loadPolicyReinsuranceTreaty();
  }

  setBillingBasis(selectedPolicyId: number, selectedBenefitId: number, selectedEffectiveDate: Date) {
    this.groupRiskPolicyCaseService.getBenefitOptionItemValue(this.selectedPolicyId, this.selectedBenefitId, "BillingLevel", this.datePipe.transform(this.selectedEffectiveDate, 'yyyy-MM-dd'))
      .subscribe({
        next: result => {
          if (result)
            this.selectedBillingLevelCode = result.optionItemCode;
        }
      })
   }

  onRemove(item: any, rowIndex: number): void {
    this.confirmService
      .confirmWithoutContainer(
        "Remove Policy Premium",
        "Are you sure you want to remove this policy premium rate?",
        "Center",
        "Center",
        "Yes",
        "No",
      )
      .subscribe((result) => {
        if (result === true) {
          this.policyPremiumRateDetailModelTableData = this.policyPremiumRateDetailModelTableData.filter(x => x.policyPremiumRateDetailId !== item.policyPremiumRateDetailId);
          this.bindPolicyTable();
          this.form.reset();

        }
      });
  }

  onEdit(item: any, rowIndex: number): void {
    this.isEditMode = true;
    this.selectedBenefitId = item.benefitId;
    this.selectedBenefitCategoryId = item.benefitCategoryId;
    this.selectedPolicyId = item.policyId;
    this.selectedEffectiveDate = item.effectiveDate;
    this.selectedReinsuranceTreatyId = item.reinsuranceTreatyId;
    this.selectedBillingLevelCode = item.billingLevelCode;
    this.selectedBillingMethodCode = item.billingMethodCode;

    this.loadBillingMethodTypes();
    this.selectedBillingMethodName = this.getBillingMethodName(item.billingMethodCode);
    this.loadBenefitCategories();

    this.form.patchValue({
      policyPremiumRateDetailId: item.policyPremiumRateDetailId,
      policyId: item.policyId,
      benefitId: item.benefitId,
      benefitCategoryId: item.benefitCategoryId,
      billingLevelCode: item.billingLevelCode,
      reinsuranceTreatyId: item.reinsuranceTreatyId,
      billingMethodCode: this.getBillingMethodName(item.billingMethodCode),
      reinsuranceTreatyReassPercentage: item.reinsuranceTreatyReassPercentage,
      reinsuranceTreatyRmlPercentage: item.reinsuranceTreatyRmlPercentage,
      effectiveDate: item.effectiveDate,
    });

    this.premiumRateComponentModelTableData = [];
    item.premiumRateComponentModels.forEach((inputComponent) => {
      this.premiumRateComponentModelTableData.push(inputComponent);
    });

    this.benefitReinsuranceAverageModelTableData = [];
    item.benefitReinsuranceAverageModels.forEach((reinsuranceAverage) => {
      reinsuranceAverage.reinsAverage = Number(reinsuranceAverage.reinsAverage);
      this.benefitReinsuranceAverageModelTableData.push(reinsuranceAverage);
    });

    this.loadPolicyBenefits();
    this.loadPolicyReinsuranceTreaty();
    this.bindRateComponentTable();

  }

  getBillingMethodName(billingMethodCode: string): string {

    let billingMethodName = this.BillingMethodTypes.find(x => x.startsWith(billingMethodCode));
    if (!billingMethodName) {
      billingMethodName = this.BillingMethodTypes.find(x => x.startsWith('AmountPerMember'));
    }
    return billingMethodName;
  }

  clearBenefitDependentFields(): void {
    this.selectedBillingLevelCode = "";
    this.selectedBenefitCategoryId = -1;
    this.BenefitCategories = [];

    this.form.patchValue({ "effectiveDate": "", "benefitCategoryId": "", "billingLevelCode": ""});
  }

  resetPremiumRateComponentValues(): void {
    this.premiumRateComponentModelTableData?.forEach(component => {
      component.totalRateComponentValue = 0;
    });
  }
  get isCategoryBilling() : boolean {
    return this.selectedBillingLevelCode != this.groupRiskBenefitBillingLevelType;
  }
}
