import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Validators } from 'ngx-editor';
import { WizardDetailBaseComponent } from '../../../../../../../shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from '../../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from '../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { GroupRiskPolicyCaseService } from '../../../shared/Services/group-risk-policy-case.service';
import { GroupRiskPolicyCaseModel } from '../../../shared/entities/group-risk-policy-case-model';
import { OptionItemValueLookup } from '../../../shared/entities/option-item-value-lookup';
import { GroupRiskOptionTypeLevelEnum } from '../../../shared/enums/option-type-level-enum';
import { ValidationResult } from '../../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'create-benefit-category-ttd',
  templateUrl: './total-temporal-disability-benefit.component.html',
  styleUrls: ['./total-temporal-disability-benefit.component.css']
})
export class GroupRiskCreateBenefitCategoryTTDComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
 
  waitingPeriodOptions: OptionItemValueLookup[];
  employeeBenefitOptions: OptionItemValueLookup[];
  benefitSalaryTypeOptions: OptionItemValueLookup[];
  premiumSalaryTypeOptions: OptionItemValueLookup[];
  benefitDefinitionOptions: OptionItemValueLookup[];
  medicalWaiverPaymentTermOptions: OptionItemValueLookup[];
  initialBenefitPeriodOptions: OptionItemValueLookup[];
  medicalPremiumWaiverOptions: OptionItemValueLookup[];
  benefitEscalationRateOptions: OptionItemValueLookup[];

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
      claimWaitingPeriodOptionId: ["", Validators.required],
      employeeBenefitsOptionId: ["", Validators.required],
      benefitSalaryTypeOptionItemId: ["", Validators.required],
      premiumSalaryTypeOptionItemId: ["", Validators.required],
      benefitDefinitionOptionItemId: ["", Validators.required],
      initialBenefitPeriodOptionItemId: ["", Validators.required],
      benefitEscalationRateOptionItemId: ["", Validators.required],
      employerWaiver: ["", Validators.required],
      medicalPremiumWaiverOptionItemId: ["", Validators.required],
      medicalWaiverPaymentTermOptionId: ["", Validators.required],
      benefitPaymentTerm: ["", Validators.required]
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
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "ClaimWaitingPeriod", benefitId).subscribe(results => {
      if (results)
        this.waitingPeriodOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "DisabilityBenefit", benefitId).subscribe(results => {
      if (results)
        this.employeeBenefitOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitSalary", benefitId).subscribe(results => {
      if (results)
        this.benefitSalaryTypeOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "PremiumSalary", benefitId).subscribe(results => {
      if (results)
        this.premiumSalaryTypeOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitDefinition", benefitId).subscribe(results => {
      if (results)
        this.benefitDefinitionOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "InitialBenefitPeriod", benefitId).subscribe(results => {
      if (results)
        this.initialBenefitPeriodOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "MedicalPremiumWaiver", benefitId).subscribe(results => {
      if (results)
        this.medicalPremiumWaiverOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "MedicalPremWaiverPaymentTerm", benefitId).subscribe(results => {
      if (results)
        this.medicalWaiverPaymentTermOptions = results;
    });


    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitEscalation", benefitId).subscribe(results => {
      if (results)
        this.benefitEscalationRateOptions = results;
    });

  }
}
