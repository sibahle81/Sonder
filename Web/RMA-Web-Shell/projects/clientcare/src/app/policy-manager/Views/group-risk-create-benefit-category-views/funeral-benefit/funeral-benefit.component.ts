import { Component, EventEmitter, Output } from '@angular/core';
import { WizardDetailBaseComponent } from '../../../../../../../shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { GroupRiskPolicyCaseModel } from '../../../shared/entities/group-risk-policy-case-model';
import { ValidationResult } from '../../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from '../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { OptionItemValueLookup } from '../../../shared/entities/option-item-value-lookup';
import { GroupRiskPolicyCaseService } from '../../../shared/Services/group-risk-policy-case.service';
import { GroupRiskOptionTypeLevelEnum } from '../../../shared/enums/option-type-level-enum';
import { ProductOptionItemValueLookup } from '../../../shared/entities/product-option-item-value-lookup';
import { OptionItemFieldEnum } from '../../../shared/enums/option-item-field.enum';
import { LookupService } from '../../../../../../../shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from '../../../../../../../shared-models-lib/src/lib/lookup/lookup';
import { FuneralCoverTypeEnum } from '../../../shared/enums/funeral-cover-type.enum';

@Component({
  selector: 'create-benefit-category-funeral',
  templateUrl: './funeral-benefit.component.html',
  styleUrls: ['./funeral-benefit.component.css']
})
export class GroupRiskCreateBenefitCategoryFuneralComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  @Output() funeralCoverTypeChanged = new EventEmitter<number>();  

  waitingPeriodOptions: OptionItemValueLookup[];
  coverTypeOptions: Lookup[];
  policyLevelOptionItems: ProductOptionItemValueLookup[];
  isShowMaxCoverAge: boolean = false;


  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private readonly lookupService: LookupService 
  ) {
    super(appEventsManager, authService, activatedRoute);
  }
    createForm(id: number): void {
      this.form = this.formBuilder.group({
        maxCoverAge: ["", [Validators.required]],
        eligibilityWaitingPeriodOptionId: ["", [Validators.required]],
        spouseMaxCoverAge: [""],
        maxSpouseCovered: ["", Validators.required],
        childMaxCoverAge: [""],
        parentEntryAge: [""],
        parentMaxCoverAge: [""],
        extendedFamilyEntryAge: [""],
        extendedFamilyMaxCoverAge: [""],
        coverTypeOptionId: ["", Validators.required],
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
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "EligibilityWaitingPeriod", benefitId).subscribe(result => {
      if (result)
        this.waitingPeriodOptions = result;
    });

    this.coverTypeOptions = this.ToKeyValuePair(FuneralCoverTypeEnum);

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

  coverTypeChanged(funeralCoverTypeId: number) {
    this.funeralCoverTypeChanged.emit(funeralCoverTypeId);
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

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
