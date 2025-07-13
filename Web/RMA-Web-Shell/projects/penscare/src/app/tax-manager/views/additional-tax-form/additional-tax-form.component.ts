import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ValidatorService } from '../../../services/validator.service';
import { IAdditionalTaxForm } from '../../models/additional-tax-form.interface';
import { Subscription } from 'rxjs';
import { AdditionalTaxTypeEnum } from '../../../pensioncase-manager/lib/enums/additiona-tax-type.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupItem } from 'projects/shared-models-lib/src/lib/lookup/lookup-item';

@Component({
  selector: 'app-additional-tax-form',
  templateUrl: './additional-tax-form.component.html',
  styleUrls: ['./additional-tax-form.component.css']
})
export class AdditionalTaxFormComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() isWizard = false;
  @Input() isReadOnly = false;


  private subscription: Subscription;
  additionalTaxTypes: Lookup[] = [];
  additionalTaxTypesEnum = AdditionalTaxTypeEnum;

  constructor(private readonly _fb: FormBuilder,
              public validatorService: ValidatorService,
              private alertService: AlertService,
              private lookupService: LookupService,) { }

  ngOnInit(): void {
    this.createForm();
    this.onLoadLookups();
    this.addFormSubscriptions();
  }

  createForm(): void {
    if(!this.isWizard) {
      this.form = this._fb.group<IAdditionalTaxForm>({
        individualAmount: new FormControl(null, {}),
        stopOrderAmount: new FormControl(null, {}),
        startDate: new FormControl(null, { validators: Validators.required }),
        endDate: new FormControl(null, { validators: Validators.required }),
        additionalTaxType: new FormControl(null, { validators: Validators.required }),
        bothAmount: new FormControl(null, {})
      });
    }
  }

  addFormSubscriptions():void {
    const individualAmount = this.form.controls.individualAmount;
    const stopOrderAmount = this.form.controls.stopOrderAmount;
    const bothAmount = this.form.controls.bothAmount;
    this.subscription = this.form.controls.additionalTaxType.valueChanges.subscribe(value => {
      if (value == AdditionalTaxTypeEnum.Individual) {
        individualAmount.setValidators([Validators.required]);
        stopOrderAmount.setValidators(null);
        stopOrderAmount.setValue(null);
        bothAmount.setValidators(null);
        bothAmount.setValue(null);
      }
      else if (value == AdditionalTaxTypeEnum.StopOrder) {
        stopOrderAmount.setValidators([Validators.required]);
        individualAmount.setValidators(null);
        individualAmount.setValue(null);
        bothAmount.setValidators(null);
        bothAmount.setValue(null);
      }
      else if (value == AdditionalTaxTypeEnum.Both) {
        bothAmount.setValidators([Validators.required]);
        stopOrderAmount.setValidators(null);
        stopOrderAmount.setValue(null);
        individualAmount.setValidators(null);
        individualAmount.setValue(null);
      }

      individualAmount.updateValueAndValidity();
      stopOrderAmount.updateValueAndValidity();
      bothAmount.updateValueAndValidity();
    });
  }

  onLoadLookups(): void {
    this.lookupService.getAdditionalTaxTypes().subscribe(res => {
      this.additionalTaxTypes = res;
    });

  }
}
