import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { GroupRiskPolicyCaseModel } from '../../../shared/entities/group-risk-policy-case-model';
import { GroupRiskPolicyCaseService } from '../../../shared/Services/group-risk-policy-case.service';
import { GroupRiskOptionTypeLevelEnum } from '../../../shared/enums/option-type-level-enum';
import { AlertService } from '../../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import { OptionItemValueLookup } from '../../../shared/entities/option-item-value-lookup';
import { Benefit } from '../../../../product-manager/models/benefit';
import { GroupRiskPolicy } from '../../../shared/entities/group-risk-policy';
import { ProductOptionService } from '../../../../product-manager/services/product-option.service';

@Component({
  selector: 'create-policy-standard-benefit',
  templateUrl: './standard-benefit.component.html',
  styleUrls: ['./standard-benefit.component.css']
})
export class StandardBenefitComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  @Output() policyChanged = new EventEmitter<number>();
  @Output() benefitChanged = new EventEmitter<Benefit>();
  @Output() startDateChanged = new EventEmitter<Date>();

  billingLevelOptions: OptionItemValueLookup[];
  branchBillingOptions: OptionItemValueLookup[];
  conversionOptions: OptionItemValueLookup[];
  benefitPayeeOptions: OptionItemValueLookup[];
  benefitCalcOptions: OptionItemValueLookup[];

  groupRiskPolicies: GroupRiskPolicy[] = [];
  benefits: Benefit[] = [];
    isLoading: boolean;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private readonly privateAlertService: AlertService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }

  onStartDateChanged(startDate: Date) {
    this.startDateChanged.emit(startDate);
      
  }

  createForm() {
    this.form = this.formBuilder.group({
      policyId: ["", Validators.required],
      benefitId: ["", Validators.required],
      startDate: ["", Validators.required],
      endDate: [""],
      benefitCalcId: ["", Validators.required],
      benefitPayeeId: ["", Validators.required],
      billingLevel: ["", Validators.required],
      branchBilling: ["", Validators.required],
      effectiveDate: ["", Validators.required]

    });
  }

  populateForm() {
    this.groupRiskPolicies = this.model.groupRiskPolicies;
  }

  populateModel() {}

  loadLookups(benefitId: number) {
    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "BillingLevel", benefitId).subscribe(
      {
        next: result => {
          this.billingLevelOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "BranchBilling", benefitId).subscribe(
      {
        next: result => {
          this.branchBillingOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "BenefitPayee", benefitId).subscribe(
      {
        next: result => {
          this.benefitPayeeOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "BenefitCalculation", benefitId).subscribe(
      {
        next: result => {
          this.benefitCalcOptions = result;
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

  groupRiskPolicyChange($event) {
    var productOptionId = this.groupRiskPolicies.filter(x => x.policyId === $event.value)[0].productOptionId;
    if (productOptionId > 0) {
      this.changeGroupRiskPolicy($event.value, productOptionId);
    }
    
  }

  changeGroupRiskPolicy(policyId: number, productOptionId: number, emitPolicyChanged :boolean = true) {
    this.isLoading = true;
    this.productOptionService
      .getBenefitsByProductOptionId(productOptionId)
      .subscribe({
        next: (result) => {
          this.benefits = result;
        },
        complete: () => {
          this.isLoading = false;
          if(emitPolicyChanged) this.policyChanged.emit(policyId);
        }
      });
  }

  onBenefitChange($event) {
    var benefit = this.benefits.find(x => x.id == $event);
    this.benefitChanged.emit(benefit);
  }

  getSelectedBenefit(): Benefit {
    var benefitId = this.form.controls.benefitId.value;
    var benefit = this.benefits.find(x => x.id == benefitId);
    return benefit;
  }

  getSelectedBenefitById(benefitId): Benefit {
    var benefit = this.benefits.find(x => x.id == benefitId);
    return benefit;
  }

  filterBenefits(benefitIds: number[]) {
    var filteredList = this.benefits.filter(x => benefitIds.indexOf(x.id) == -1);
    this.benefits = filteredList;
  }
}
