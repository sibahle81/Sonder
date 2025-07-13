import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
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
//import { CauseOfDeathModel } from "projects/claimcare/src/app/claim-manager/shared/entities/funeral/cause-of-death.model";
import { BenefitService } from "../../../../product-manager/services/benefit.service";
import { GroupRiskBenefit } from "../../../shared/entities/group-risk-benefit";
import { GroupRiskPolicyCaseService } from "../../../shared/Services/group-risk-policy-case.service";
import { OptionItemValueLookup } from "../../../shared/entities/option-item-value-lookup";
import { GroupRiskOptionTypeLevelEnum } from "../../../shared/enums/option-type-level-enum";


@Component({
  selector: "create-benefit-category-standard",
  templateUrl: "./standard-benefit.component.html",
  styleUrls: ["./standard-benefit.component.css"],
})
export class GroupRiskCreateBenefitCategoryStandardComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  @Input() parentModel: GroupRiskPolicyCaseModel = new GroupRiskPolicyCaseModel();
  @Output() benefitChanged = new EventEmitter<string>();
  @Output() policyChanged = new EventEmitter<number>();
  @Output() startDateChanged = new EventEmitter<Date>();

  selectedBenefits: number[];
  selectedBenefitPaymentOption: number;
  newEffectiveDate: Date;
  policyBenefits: GroupRiskPolicyBenefit[];
  benefitPaymentOptions: OptionItemValueLookup[];
  createdPolicies: GroupRiskPolicy[];
  linkedBenefits: GroupRiskBenefit[] = [];


  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly benefitService: BenefitService,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number) {
    this.form = this.formBuilder.group({
      benefitId: ["", [Validators.required]],
      categoryDescription: ["", [Validators.required]],
      startDate: ["", Validators.required],
      newEffectiveDate: [{ value: "", disabled: true }, Validators.required],
      minimumEntryAge: ["0", [Validators.required]],
      normalRetirementAge: ["0", [Validators.required]],
      flatCoverAmount: ["0.00", [Validators.required]],
      benefitPaymentOption: ["", [Validators.required]],
      maxEntryAge: ["0", [Validators.required]],
      endDate: "",
      policyId: ["", Validators.required],
      name: [""]
    });
  }

  onLoadLookups() {
    ;

  }
  populateModel() {

  }
  populateForm() {
    this.loadCasePolicies();
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

  onPolicyChanged(id: number): void {
    this.loadPolicyBenefits(id);
    this.policyChanged.emit(id);
  }

  onBenefitChanged(benefitId: number): void {
    var benefit = this.linkedBenefits.find(x => x.benefitId === benefitId);
    if (benefit)
      this.benefitChanged.emit(benefit.code);
  }

  loadLookups(benefitId: number) {
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.BenefitCategory, "BenefitPaymentOption", benefitId).subscribe(results => {
      if (results) {
        this.benefitPaymentOptions = results;
      }
    });
  }

  onStartDateChanged(startDate: Date) {
    this.startDateChanged.emit(startDate);
  }

  loadCasePolicies(): void {
    this.createdPolicies = this.model.groupRiskPolicies;
  }

  loadPolicyBenefits(policyId: number): void {
    this.linkedBenefits = [];
    if (this.model.groupRiskPolicies)
      var pol = this.model.groupRiskPolicies.find(p => p.policyId === policyId);

    if (pol) {
      this.policyBenefits = pol.groupRiskPolicyBenefits;
      this.benefitService.getBenefitsByBenefitIds(this.policyBenefits.map(b => b.benefitId)).subscribe(r => {
        r.forEach(benefit => this.linkedBenefits.push({ "benefitId": benefit.id, "code": benefit.code, "name": benefit.name }));
      });
    }
    return;
  }

}
