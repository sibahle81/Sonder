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


@Component({
  selector: 'create-policy-funeral-benefit',
  templateUrl: './funeral-benefit.component.html',
  styleUrls: ['./funeral-benefit.component.css']
})
export class FuneralBenefitComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {

  continuedCoverOptions: OptionItemValueLookup[];
  extendedBenefitOptions: OptionItemValueLookup[];
  bodyRepatriationOptions: OptionItemValueLookup[];
  paidUpBenefitOptions: OptionItemValueLookup[];
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
      continuedCover: ["", Validators.required],
      extendedDeathBenefit: ["", Validators.required],
      bodyRepatriation: ["", Validators.required],
      paidUpBenefit: ["", Validators.required]
    });
  }

  populateForm() {

  }

  populateModel() { }

  loadLookups(benefitId: number) {
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

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "ExtendedDeathBenefit", benefitId).subscribe(
      {
        next: result => {
          this.extendedBenefitOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "BodyRepatriation", benefitId).subscribe(
      {
        next: result => {
          this.bodyRepatriationOptions = result;
        },
        error: err => {
          this.privateAlertService.error(
            "An error occured while trying to fetch options.",
            "Get Options");
        }
      }
    );

    this.groupRiskPolicyCaseService.getOptionItems(GroupRiskOptionTypeLevelEnum.Benefit, "PaidUpBenefit", benefitId).subscribe(
      {
        next: result => {
          this.paidUpBenefitOptions = result;
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
}
