import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PensIncreaseLookups } from '../../models/annual-increase-lookups';
import { AnnualIncreaseService } from '../../services/annual-increase.service';
import { ValidatorService } from '../../../services/validator.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AnnualIncreaseForm } from '../../models/increase-form.interface';
import { IncreaseAmountType } from '../../lib/enums/amount-type-enum';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AnnualIncreaseNotification } from '../../models/annual-increase-notification.model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: "app-annual-increase",
  templateUrl: "./annual-increase.component.html",
  styleUrls: ["./annual-increase.component.css"],
})
export class AnnualIncreaseComponent implements OnInit {

  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() form: FormGroup;
  @Output() initiateWizard = new EventEmitter();
  @Output() cancelApplication = new EventEmitter();

  amountTypes: IncreaseAmountType[];
  increaseAmt = IncreaseAmountType;
  lookups: PensIncreaseLookups;
  private subscription: Subscription;

  errFormMsgs = {
    increaseType: {
      disp: 'Increase Type',
      required: 'Increase type is required'
    },
    legislativeValue: {
      disp: 'Legislative Value',
      required: 'Legislative Value is required'
    },
    amountType: {
      disp: 'Increase Amount Type',
      required: 'Increase Amount Type is required'
    },
    effectiveDate: {
      disp: 'Effective Date',
      required: 'Effective Date is required'
    },
    increaseAmount: {
      disp: 'Increase Amount',
      required: 'Increase Amount is required'
    },
    increasePercent: {
      disp: 'Increase Percentage',
      required: 'Increase Percentage is required'
    }
  }

  creatingWizard: boolean;

  constructor(
    private annualIncreaseService: AnnualIncreaseService,
    private readonly _fb: FormBuilder,
    public validatorService: ValidatorService,
    private alertService: AlertService,) {
  }

  ngOnInit(): void {
    this.onLoadLookups();
    this.createForm();
    this.addFormSubscriptions();
  }

  createForm(): void {
    if(!this.isWizard) {
      this.form = this._fb.group<AnnualIncreaseForm>({
        increaseType: new FormControl(null, { validators: Validators.required }),
        legislativeValue: new FormControl(null, { validators: Validators.required }),
        amountType: new FormControl(null, { validators: Validators.required }),
        effectiveDate: new FormControl(null, { validators: Validators.required }),
        fromAccidentDate: new FormControl(null),
        toAccidentDate: new FormControl(null),
        increaseAmount: new FormControl(null),
        increasePercent: new FormControl(null),
        description: new FormControl(null, { validators: Validators.required}),
    });

    }
  }

  onLoadLookups(): void {
    const lookups = this.annualIncreaseService.getPensCareLookupsCache();
    if (lookups) {
      this.lookups = lookups;
      this.amountTypes = this.ToArray(IncreaseAmountType);
    }
  }

  addFormSubscriptions():void {
    this.subscription = this.form.controls.amountType.valueChanges.subscribe(value => {
        if (value === IncreaseAmountType[1]) {
          this.form.controls.increaseAmount.setValidators([Validators.required,Validators.min(0)]);
          this.form.controls.increasePercent.clearValidators();
          this.form.controls.increasePercent.setValue(null);
        }
        else {
          this.form.controls.increasePercent.setValidators([Validators.required,Validators.min(0), Validators.max(100)]);
          this.form.controls.increaseAmount.clearValidators();
          this.form.controls.increaseAmount.setValue(null, { validators: Validators.required });
        }
        this.form.updateValueAndValidity();
      });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  save(): void {
    if(this.form.invalid) {
      let error_msg = this.validatorService.formValidationMessages(this.form.controls, this.errFormMsgs);
      this.alertService.error(error_msg);
      return;
    }
    else {
        let reqObject = new AnnualIncreaseNotification();
        reqObject.legislativeValue = this.form.controls.legislativeValue.value;
        reqObject.increaseType = this.form.controls.increaseType.value;
        //data will be recieve from clientcare
        reqObject.benefitNames = ['DPN'];
        reqObject.pensionIncreaseAmountType = +IncreaseAmountType[this.form.controls.amountType.value];
        reqObject.percentage = !this.form.controls.increasePercent.value ? 0 : Number(this.form.controls.increasePercent.value);
        reqObject.amount = !this.form.controls.increaseAmount.value ? 0 : Number(this.form.controls.increaseAmount.value);
        reqObject.effectiveDate = this.form.controls.effectiveDate.value;
        reqObject.fromAccidentDate = this.form.controls.fromAccidentDate.value;
        reqObject.toAccidentDate = this.form.controls.toAccidentDate.value;
        reqObject.description = this.form.controls.description.value;
        this.initiateWizard.emit(reqObject);
    }
  }

  cancel(): void {
    this.cancelApplication.emit();
  }


}
