import { Component, OnInit, ViewChild} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AnnualIncreaseNotification } from '../../../models/annual-increase-notification.model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { IncreaseAmountType } from '../../../lib/enums/amount-type-enum';
import { PensIncreaseLookups } from '../../../models/annual-increase-lookups';
import { BonusPaymentForm } from '../../../models/bonus-payment-form.interface';
import { AnnualIncreaseService } from '../../../services/annual-increase.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BonusPaymentDetailsComponent } from '../../bonus-payment-details/bonus-payment-details.component';

@Component({
  selector: 'bonus-payment-wizard',
  templateUrl: './bonus-payment-wizard.component.html',
  styleUrls: ['./bonus-payment-wizard.component.css']
})
export class BonusPaymentWizardComponent extends WizardDetailBaseComponent<AnnualIncreaseNotification> {

  form: FormGroup;
  lookups: PensIncreaseLookups;

  constructor(private readonly _fb: FormBuilder,
              private annualIncreaseService: AnnualIncreaseService,
              appEventsManager: AppEventsManager,
              authService: AuthService,
              activatedRoute: ActivatedRoute,
              public readonly datepipe: DatePipe,) {
              super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
    this.form = this._fb.group<BonusPaymentForm>({
      increaseType: new FormControl(null, { validators: Validators.required }),
      legislativeValue: new FormControl(null, { validators: Validators.required }),
      amountType: new FormControl(null, { validators: Validators.required }),
      effectiveDate: new FormControl(null, { validators: Validators.required }),
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
    let defaultDate = new Date("1900-01-01");
    const value = this.form.getRawValue();
    if (!this.model) {
      this["model"] = new AnnualIncreaseNotification();
    }

    this.model.legislativeValue = value.legislativeValue;
    this.model.increaseType = value.increaseType;
    this.model.pensionIncreaseAmountType = +IncreaseAmountType[value.amountType];
    this.model.percentage = !value.increasePercent ? 0 : parseInt(value.increasePercent);
    this.model.amount = !value.increaseAmount ? 0 : parseInt(value.increaseAmount);
    this.model.effectiveDate = value.effectiveDate;
    this.model.fromAccidentDate = defaultDate;
    this.model.toAccidentDate = defaultDate;
    this.model.description = value.description;
  }

  populateForm(): void {
    if (this.model) {
      this.form.patchValue({
        increaseType: this.model.increaseType,
        legislativeValue: this.model.legislativeValue,
        amountType: IncreaseAmountType[this.model.pensionIncreaseAmountType],
        effectiveDate: this.model.effectiveDate.toLocaleString().substring(0,10)  == '0001-01-01' ? '' : this.model.effectiveDate,
        increaseAmount: !this.model.amount ? null: this.model.amount,
        increasePercent: !this.model.percentage ? null: this.model.percentage,
        description: this.model.description,
      });
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {    
    if (this.model) {
    }
    return validationResult;
  }

}
