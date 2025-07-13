import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from '../../../../../../../shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { GroupRiskPolicyCaseModel } from '../../../shared/entities/group-risk-policy-case-model';
import { ValidationResult } from '../../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from '../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { GroupRiskPolicyCaseService } from '../../../shared/Services/group-risk-policy-case.service';
import { GroupRiskOptionTypeLevelEnum } from '../../../shared/enums/option-type-level-enum';
import { OptionItemValueLookup } from '../../../shared/entities/option-item-value-lookup';
import { ProductOptionItemValueLookup } from '../../../shared/entities/product-option-item-value-lookup';
import { OptionItemFieldEnum } from '../../../shared/enums/option-item-field.enum';

@Component({
  selector: 'create-benefit-category-death',
  templateUrl: './death-benefit.component.html',
  styleUrls: ['./death-benefit.component.css']
})
export class GroupRiskCreateBenefitCategoryDeathComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  lessApprovedBenefitOptions: OptionItemValueLookup[];
  benefitSalaryTypeOptions: OptionItemValueLookup[];
  premiumSalaryTypeOptions: OptionItemValueLookup[];
  policyLevelOptionItems: ProductOptionItemValueLookup[];
  isShowMaxCoverAge: boolean = false;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

    createForm(id: number): void {
      this.form = this.formBuilder.group({
        maxCoverAge: [""],
        benefitSalaryTypeOptionItemId: ["", [Validators.required]],
        premiumSalaryTypeOptionItemId: ["", Validators.required],
        salaryMultiple: ["", Validators.required],
        lessApprovedBenefitOptionId: ["", Validators.required]
      });
    }
    onLoadLookups(): void {
      
    }
    populateModel(): void {
        
    }
    populateForm(): void {
       
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

  loadLookups(benefitId: number) {
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "PremiumSalary", benefitId).subscribe(results => {
      if (results)
        this.premiumSalaryTypeOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitSalary", benefitId).subscribe(results => {
      if (results)
        this.benefitSalaryTypeOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "LessApprovedBenefit", benefitId).subscribe(results => {
      if (results)
        this.lessApprovedBenefitOptions = results;
    });
  }

  getOptionItemValue(optionItemField: OptionItemFieldEnum): number {
    var optionItem = this.policyLevelOptionItems ? this.policyLevelOptionItems.find(x => x.optionItemField == optionItemField) : null;
    return optionItem ? optionItem.overrideValue : 0;
  }

  setShowMaxCoverAge(showHide: boolean) {
    this.isShowMaxCoverAge = showHide;
  }

  setPolicyLevelOptionItems(optionItems: ProductOptionItemValueLookup[]) {
    this.policyLevelOptionItems = optionItems;

    if (this.form.value.maxCoverAge == "") {
      this.form.patchValue({ "maxCoverAge": this.maximumCoverAge });
    }
  }

  get maximumCoverAge(): number {
    return this.getOptionItemValue(OptionItemFieldEnum.MaximumCoverAge);
  }


}
