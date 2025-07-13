import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { OptionItemValueLookup } from '../../../shared/entities/option-item-value-lookup';
import { AlertService } from '../../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import { GroupRiskPolicyCaseService } from '../../../shared/Services/group-risk-policy-case.service';
import { GroupRisk } from '../../../shared/entities/group-risk';
import { GroupRiskOptionTypeLevelEnum } from '../../../shared/enums/option-type-level-enum';
import { ProductOptionItemValueLookup } from '../../../shared/entities/product-option-item-value-lookup';
import { OptionItemFieldEnum } from '../../../shared/enums/option-item-field.enum';

@Component({
  selector: 'create-policy-disability-income-benefit',
  templateUrl: './disability-income-benefit.component.html',
  styleUrls: ['./disability-income-benefit.component.css']
})
export class DisabilityIncomeBenefitComponent extends WizardDetailBaseComponent<GroupRisk> {

  conversionOptions: OptionItemValueLookup[];
  paybackBenefitOptions: OptionItemValueLookup[];
  survivorBenefitOptions: OptionItemValueLookup[];
  recoveryBonusOptions: OptionItemValueLookup[];
  rehabBenefitOptions: OptionItemValueLookup[];
  isLoadingPolicyOptionItems: boolean = false;
  policyLevelOptionItems: ProductOptionItemValueLookup[];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private readonly privateAlertService: AlertService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }

  createForm() {
    this.form = this.formBuilder.group({
      freeCoverLimit: [""],
      previousInsurerFCL: [""],
      conversionOption: ["", Validators.required],
      paybackBenefit: ["", Validators.required],
      maxMedicalPremiumWaiverBenefit: [""],
      maximumSumAssured: [""],
      maximumWaiverBenefit: [""],
      maximumRehabilitationBenefit: [""],
      rehabilitationBenefit: ["", Validators.required],
      recoveryBonus: ["", Validators.required],
      survivorBenefit: ["", Validators.required]
    });
  }

  populateForm() {

  }

  populateModel() { }

  loadLookups(benefitId: number) {
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "RehabBenefit", benefitId).subscribe(
      {
        next: result => {
          this.rehabBenefitOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "RecoveryBonus", benefitId).subscribe(
      {
        next: result => {
          this.recoveryBonusOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "SurvivorBenefit", benefitId).subscribe(
      {
        next: result => {
          this.survivorBenefitOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "PaybackBenefit", benefitId).subscribe(
      {
        next: result => {
          this.paybackBenefitOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "ConversionOption", benefitId).subscribe(
      {
        next: result => {
          this.conversionOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    validationResult.errors = 0;
    validationResult.errorMessages = [];

    if (!this.form.valid) {
      validationResult.errors += 1;
      validationResult.errorMessages.push("Please complete all required fields");
    }

    return validationResult;
  }

  setPolicyLevelOptionsLoading(isLoading: boolean) {
    this.isLoadingPolicyOptionItems = isLoading;
  }

  setPolicyLevelOptions(policyOptions: ProductOptionItemValueLookup[]) {
    this.policyLevelOptionItems = policyOptions;
    if (this.isLoadingPolicyOptionItems)
      this.isLoadingPolicyOptionItems = false;
  }

  getProductOptionItemValue(fieldId: OptionItemFieldEnum): ProductOptionItemValueLookup {
    return this.policyLevelOptionItems ? this.policyLevelOptionItems.find(x => x.optionItemField == fieldId) : null;
  }

  getPolicyLevelOptionItemValue(optionItemField: OptionItemFieldEnum): number {
    if (this.isLoadingPolicyOptionItems)
      return 0;

    var optionItemValue = this.getProductOptionItemValue(optionItemField);
    return optionItemValue ? optionItemValue.overrideValue : 0;
  }

  get maximumWaiverBenefit(): number {
    return this.getPolicyLevelOptionItemValue(OptionItemFieldEnum.MaxWaiverBenefit);
  }

  get maximumMedicalPremiumWaiver(): number {
    return this.getPolicyLevelOptionItemValue(OptionItemFieldEnum.MaxMedicalPremiumWaiver);
  }

  get maximumSumAssured(): number {
    return this.getPolicyLevelOptionItemValue(OptionItemFieldEnum.MaxSumAssured);
  }

  get maximumRehabilitation(): number {
    return this.getPolicyLevelOptionItemValue(OptionItemFieldEnum.MaxRehabilitationBenefit);
  }
}
