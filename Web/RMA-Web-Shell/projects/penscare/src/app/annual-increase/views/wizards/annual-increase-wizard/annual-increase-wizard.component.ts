import { Component, OnInit } from '@angular/core';
import { AnnualIncreaseNotification } from '../../../models/annual-increase-notification.model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { IncreaseAmountType } from '../../../lib/enums/amount-type-enum';
import { PensIncreaseLookups } from '../../../models/annual-increase-lookups';
import { AnnualIncreaseForm } from '../../../models/increase-form.interface';
import { AnnualIncreaseService } from '../../../services/annual-increase.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-annual-increase-wizard',
  templateUrl: './annual-increase-wizard.component.html',
  styleUrls: ['./annual-increase-wizard.component.css']
})
export class AnnualIncreaseWizardComponent extends WizardDetailBaseComponent<AnnualIncreaseNotification> {

  form: FormGroup;
  lookups: PensIncreaseLookups;

  constructor(private readonly _fb: FormBuilder,
              private annualIncreaseService: AnnualIncreaseService,
              appEventsManager: AppEventsManager,
              authService: AuthService,
              activatedRoute: ActivatedRoute,) {
              super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
    this.form = this._fb.group<AnnualIncreaseForm>({
      increaseType: new FormControl(null, { validators: Validators.required }),
      legislativeValue: new FormControl(null, { validators: Validators.required }),
      amountType: new FormControl(null, { validators: Validators.required }),
      effectiveDate: new FormControl(null, { validators: Validators.required }),
      fromAccidentDate: new FormControl(null, { validators: Validators.required }),
      toAccidentDate: new FormControl(null, { validators: Validators.required }),
      increaseAmount: new FormControl(null),
      increasePercent: new FormControl(null),
      description: new FormControl(null, { validators: Validators.required}),
    });
  }

  onLoadLookups(): void {
    const lookups = this.annualIncreaseService.getPensCareLookupsCache();
    if (lookups) {
      this.lookups = lookups;
    }
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    if (!this.model) {
      this["model"] = new AnnualIncreaseNotification();
    }

    this.model.legislativeValue = value.legislativeValue;
    this.model.increaseType = value.increaseType;
    this.model.benefitNames = ["DPN"];
    this.model.pensionIncreaseAmountType = +IncreaseAmountType[value.amountType];
    this.model.percentage = !value.increasePercent ? 0 : Number(value.increasePercent);
    this.model.amount = !value.increaseAmount ? 0 : Number(value.increaseAmount);
    this.model.effectiveDate = value.effectiveDate;
    this.model.fromAccidentDate = value.fromAccidentDate;
    this.model.toAccidentDate = value.toAccidentDate;
    this.model.description = value.description;
    this.model.gazetteId = this.model.gazetteId;
  }

  populateForm(): void {
    if (this.model) {
      this.form.patchValue({
        increaseType: this.model.increaseType,
        legislativeValue: this.model.legislativeValue,
        amountType: IncreaseAmountType[this.model.pensionIncreaseAmountType],
        effectiveDate: this.model.effectiveDate?.toLocaleString().substring(0,10)  == '1900-01-01' ? '' : this.model.effectiveDate,
        fromAccidentDate: this.model.fromAccidentDate?.toLocaleString().substring(0,10)  == '1900-01-01'  ? '' : this.model.fromAccidentDate,
        toAccidentDate: this.model.toAccidentDate?.toLocaleString().substring(0,10)  == '1900-01-01'  ? '' : this.model.toAccidentDate,
        increaseAmount: !this.model.amount ? null : this.model.amount,
        increasePercent: !this.model.percentage ? null : this.model.percentage,
        description: this.model.description,
        gazetteId: this.model.gazetteId,
      });
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model) {
    }
    return validationResult;
  }

}
