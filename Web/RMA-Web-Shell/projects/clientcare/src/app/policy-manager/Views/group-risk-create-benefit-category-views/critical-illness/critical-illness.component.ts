import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";

import { WizardDetailBaseComponent } from "projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { ValidationResult } from "projects/shared-components-lib/src/lib/wizard/shared/models/validation-result";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { GroupRiskPolicyCaseModel } from "../../../shared/entities/group-risk-policy-case-model";
import { GroupRiskPolicyBenefit } from "../../../shared/entities/group-risk-policy-benefit";
import { GroupRisk } from "../../../shared/entities/group-risk";
import { GroupRiskPolicy } from "../../../shared/entities/group-risk-policy";
import { CauseOfDeathModel } from "projects/claimcare/src/app/claim-manager/shared/entities/funeral/cause-of-death.model";
import { OptionItemValueLookup } from "../../../shared/entities/option-item-value-lookup";
import { GroupRiskPolicyCaseService } from "../../../shared/Services/group-risk-policy-case.service";
import { GroupRiskOptionTypeLevelEnum } from "../../../shared/enums/option-type-level-enum";

@Component({
  selector: "create-benefit-category-ci",
  templateUrl: "./critical-illness.component.html",
  styleUrls: ["./critical-illness.component.css"],
})
export class GroupRiskCreateBenefitCategoryCIComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  
 // benefitPackageId: number;
  benefitSalaryTypeOptionItemId: number;
  premiumSalaryTypeOptionItemId: number;
  salaryMultiple: number;
  benefitSalaryTypeOptions: OptionItemValueLookup[];
  premiumSalaryTypeOptions: OptionItemValueLookup[];
  benefitPackageOptions: OptionItemValueLookup[];

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
      benefitPackageId: ["", [Validators.required]],
      benefitSalaryTypeOptionItemId: ["", [Validators.required]],
      premiumSalaryTypeOptionItemId: ["", Validators.required],
      salaryMultiple: ["", Validators.required],
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
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitSalary", benefitId).subscribe(results => {
      if (results)
        this.benefitSalaryTypeOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "PremiumSalary", benefitId).subscribe(results => {
      if (results)
        this.premiumSalaryTypeOptions = results;
    });

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitPackage", benefitId).subscribe(results => {
      if (results)
        this.benefitPackageOptions = results;
    });
  }
}
