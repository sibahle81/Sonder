import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { GroupRisk } from '../../../shared/entities/group-risk';
import { InsuredLivesSummary, InsuredLivesSummaryTable } from '../../../shared/entities/insured-lives-summary';
import { GroupRiskPolicyCaseService } from '../../../shared/Services/group-risk-policy-case.service';
import { GroupRiskOptionTypeLevelEnum } from '../../../shared/enums/option-type-level-enum';
import { OptionItemValueLookup } from '../../../shared/entities/option-item-value-lookup';
import { GroupRiskPolicyCaseModel } from '../../../shared/entities/group-risk-policy-case-model';
import { AlertService } from '../../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import { ProductOptionItemValueLookup } from '../../../shared/entities/product-option-item-value-lookup';
import { OptionItemFieldEnum } from '../../../shared/enums/option-item-field.enum';


@Component({
  selector: 'create-policy-disabilitylumpsum-benefit',
  templateUrl: './disability-lumpsum-benefit.component.html',
  styleUrls: ['./disability-lumpsum-benefit.component.css']
})
export class DisabilityLumpsumBenefitComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {

  benefitBasisOptions: OptionItemValueLookup[];
  continuedCoverOptions: OptionItemValueLookup[];
  taxReplacementOptions: OptionItemValueLookup[];
  extendedBenefitOptions: OptionItemValueLookup[];
  bodyRepatriationOptions: OptionItemValueLookup[];
  lessShareOfFundOptions: OptionItemValueLookup[];
  conversionOptions: OptionItemValueLookup[];
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
      benefitBasis: ["", Validators.required],
      freeCoverLimit: [""],
      previousInsurerFCL: [""],
      continuedCover: ["", Validators.required],
      conversionOption: ["", Validators.required],
      taxReplacement: ["", Validators.required],
      shareOfFund: ["", Validators.required],
      maximumBenefitMultiple: ["", Validators.required],
      maximumSumAssured: ["", Validators.required]
    });
  }

  populateForm() {

  }

  populateModel() { }

  loadLookups(benefitId: number) {
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "BenefitAccelerator", benefitId).subscribe(
      {
        next: result => {
          this.benefitBasisOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "ContinuedCover", benefitId).subscribe(
      {
        next: result => {
          this.continuedCoverOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "TaxReplacementCover", benefitId).subscribe(
      {
        next: result => {
          this.taxReplacementOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );
    
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "LessShareOfFund", benefitId).subscribe(
      {
        next: result => {
          this.lessShareOfFundOptions = result;
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

  get maximumBenefitMultiple(): number {
    return this.getPolicyLevelOptionItemValue(OptionItemFieldEnum.MaxBenefitMultiple);
  }

  get maximumSumAssured(): number {
    return this.getPolicyLevelOptionItemValue(OptionItemFieldEnum.MaxSumAssured);
  }
}
