import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PensIncreaseLookups } from '../../models/annual-increase-lookups';
import { AnnualIncreaseService } from '../../services/annual-increase.service';
import { ValidatorService } from '../../../services/validator.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BonusPaymentForm } from '../../models/bonus-payment-form.interface';
import { IncreaseAmountType } from '../../lib/enums/amount-type-enum';
import { AnnualIncreaseNotification } from '../../models/annual-increase-notification.model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: "app-bonus-payment-details",
  templateUrl: "./bonus-payment-details.component.html",
  styleUrls: ["./bonus-payment-details.component.css"],
})
export class BonusPaymentDetailsComponent implements OnInit {

  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() form: FormGroup;
  @Output() initiateWizard = new EventEmitter();
  @Output() cancelApplication = new EventEmitter();

  amountTypes: IncreaseAmountType[];
  increaseAmt = IncreaseAmountType;
  lookups: PensIncreaseLookups;
  private subscription: Subscription;
  bonusTypeValue: number = 1;
  isValidEffectiveDate: boolean = true;

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
    private alertService: AlertService,
    public readonly datepipe: DatePipe,) {
  }

  ngOnInit(): void {
    this.onLoadLookups();
    this.createForm();
    this.addFormSubscriptions();
  }

  createForm(): void {
    if(!this.isWizard) {
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
  }

  effectiveDateChange(value: Date) {
    let effectiveDate = this.datepipe.transform(value, 'yyyy-MM-dd');
    this.annualIncreaseService.ValidateBonusEffectiveDate(effectiveDate).subscribe(
        valid => {
          this.isValidEffectiveDate = valid;
          if (!valid) {
            this.alertService.error("Bonus Payment already exits!");
          }
        }
      )
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
    let defaultDate = new Date("1900-01-01");
    if(this.form.invalid) {
      let error_msg = this.validatorService.formValidationMessages(this.form.controls, this.errFormMsgs);
      this.alertService.error(error_msg);
      return;
    }
    else {
        let reqObject = new AnnualIncreaseNotification();
        reqObject.legislativeValue = this.form.controls.legislativeValue.value;
        reqObject.increaseType = this.form.controls.increaseType.value;
        reqObject.pensionIncreaseAmountType = +IncreaseAmountType[this.form.controls.amountType.value];
        reqObject.percentage = !this.form.controls.increasePercent.value ? 0 : parseInt(this.form.controls.increasePercent.value);
        reqObject.amount = !this.form.controls.increaseAmount.value ? 0 : parseInt(this.form.controls.increaseAmount.value);
        reqObject.effectiveDate = this.form.controls.effectiveDate.value;
        reqObject.fromAccidentDate = defaultDate;
        reqObject.toAccidentDate = defaultDate;
        reqObject.description = this.form.controls.description.value;        
        this.initiateWizard.emit(reqObject);
    }
  }

  cancel(): void {
    this.cancelApplication.emit();
  }
}
