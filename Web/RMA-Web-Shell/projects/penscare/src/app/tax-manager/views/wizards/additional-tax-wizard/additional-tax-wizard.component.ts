import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IAdditionalTaxForm } from '../../../models/additional-tax-form.interface';
import { AdditionalTax } from 'projects/penscare/src/app/pensioncase-manager/models/additional-tax.model';
import { AdditionalTaxTypeEnum } from 'projects/penscare/src/app/pensioncase-manager/lib/enums/additiona-tax-type.enum';

@Component({
  selector: 'app-additional-tax-wizard',
  templateUrl: './additional-tax-wizard.component.html',
  styleUrls: ['./additional-tax-wizard.component.css']
})
export class AdditionalTaxWizardComponent extends WizardDetailBaseComponent<AdditionalTax>  implements OnInit {

  form: FormGroup;

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly _fb: FormBuilder,
    activatedRoute: ActivatedRoute,) {
    super(appEventsManager, authService, activatedRoute)
  }

  createForm(): void {
    this.form = this._fb.group<IAdditionalTaxForm>({
      individualAmount: new FormControl(null),
      stopOrderAmount: new FormControl(null),
      startDate: new FormControl(null, { validators: Validators.required }),
      endDate: new FormControl(null, { validators: Validators.required }),
      additionalTaxType: new FormControl(null, { validators: Validators.required }),
      bothAmount: new FormControl(null)
    });
  }
  onLoadLookups(): void {}

  populateModel(): void {
    const value = this.form.getRawValue();
    if (!this.model) {
      this["model"] = new AdditionalTax();
    }

    this.model.additionalTaxType = value.additionalTaxType;
    this.model.amount = value.individualAmount || value.stopOrderAmount || value.bothAmount ;
    this.model.startDate = value.startDate;
    this.model.endDate = value.endDate;
  }

  populateForm(): void {
    let taxType = this.model.additionalTaxType;
    this.form.patchValue({
      individualAmount: taxType == AdditionalTaxTypeEnum.Individual ? this.model.amount : null,
      stopOrderAmount: taxType == AdditionalTaxTypeEnum.StopOrder ? this.model.amount : null,
      bothAmount : taxType == AdditionalTaxTypeEnum.Both ? this.model.amount : null,
      startDate: this.model.startDate,
      endDate: this.model.endDate,
      additionalTaxType: this.model.additionalTaxType,
    });
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model && this.form.valid) {}
    return validationResult;
  }

}
