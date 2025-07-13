import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { PenscareLookups } from '../../../../../shared-penscare/models/penscare-lookups';
import { PensionCase } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { FormUtil } from 'projects/shared-utilities-lib/src/lib/form-utility/form-utility';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';

class ComponentInputData {
  public pensionCaseContext: PensionCaseContextEnum;
  public lookups: {
    genders: Lookup[],
    benefitTypes: Lookup[]
  };
}
@Component({
  selector: 'app-pension-case-details',
  templateUrl: './pension-case-details.component.html',
  styleUrls: ['./pension-case-details.component.css']
})
export class PensionCaseDetailsComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit, OnDestroy {
  public lookups: Lookup[];
  pensCareLookups: PenscareLookups;
  emitChangeSubscription: any;
  genders: Lookup[] = [];
  lookupsCacheLoaded = false;
  form: UntypedFormGroup;
  disabledFieldsData = {};
  formUtil = new FormUtil();
  public benefitTypes: Lookup[] = [];
  @Input() componentInputData: ComponentInputData;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private pensCareService: PensCareService,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.createForm();
    if (!this.componentInputData) {
      this.getLookups();
    } else {
      this.genders = this.componentInputData.lookups.genders;
      this.benefitTypes = this.componentInputData.lookups.benefitTypes;
      this.lookupsCacheLoaded = true;
    }
    this.toggleIdNumberValidation();
    this.pensCareService.loadLookupsCache();
    this.emitChangeSubscription = this.pensCareService.changeEmmited$.subscribe(change => {
      this.processChildMessage(change);
    })
  }

  createForm(): void {
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      pensionCaseNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      industryNumber: new UntypedFormControl({value: '', disabled: true}),
      firstName: new UntypedFormControl({value: '', disabled: true}),
      surname: new UntypedFormControl({value: '', disabled: true}),
      gender: new UntypedFormControl({value: '', disabled: true}),
      dateOfBirth: new UntypedFormControl({value: '', disabled: true}),
      benefitType: new UntypedFormControl({value: '', disabled: true}),
      idNumber: new UntypedFormControl({value: '', disabled: true}),
      idType: new UntypedFormControl({value: '', disabled: true}),
      pdPercentage: new UntypedFormControl({value: '', disabled: true})
    });
  }

  onLoadLookups(): void {}

  getLookups() {
    const lookups = this.pensCareService.getPensCareLookupsCache();
    if (lookups) {
      this.genders = lookups.genders;
      this.benefitTypes = lookups.benefitTypes;
    }
  };

  populateModel(): void {
    this.form.patchValue(this.disabledFieldsData);
    const value = this.form.getRawValue();
    if (!this.model) {
      this['model'] = new InitiatePensionCaseData()
    }
    if (!this.model.pensionCase) {
      this.model['pensionCase'] = new PensionCase()
    }

    if (!this.model.pensioner) {
      this.model['pensioner'] = new Person()
    }
    this.model.pensionCase.pensionCaseNumber = value.pensionCaseNumber;
    this.model.pensioner.gender = value.gender;
    this.model.pensioner.firstName = value.firstName;
    this.model.pensioner.surname = value.surname;
    this.model.pensioner.dateOfBirth = value.dateOfBirth;
    this.model.pensioner.idNumber = value.idNumber;
    this.model.pensioner.idType = value.idType;
    this.model.pensionCase.benefitType = value.benefitType;
    this.model.pensionCase.pdPercentage = value.pdPercentage;
  }

  populateForm(): void {
    if (this.model && this.model.pensionCase) {
      this.form.patchValue({
        pensionLumpSum : this.model.pensionCase.pensionLumpSum,
        benefitType: this.model.pensionCase.benefitType,
        pdPercentage: this.model.pensionCase.pdPercentage,
        gender: this.model.pensioner.gender,
        dateOfBirth: this.model.pensioner.dateOfBirth,
        idNumber: this.model.pensioner.idNumber,
        idType: this.model.pensioner.idType,
        pensionCaseNumber: this.model.pensionCase.pensionCaseNumber,
        firstName: this.model.pensioner.firstName,
        surname: this.model.pensioner.surname,
      });
      this.disabledFieldsData = this.formUtil.getDisabledFieldsData(this.form);
    }
  }

  toggleIdNumberValidation() {
    const idType = this.form.controls["idType"].value;
    const idNumber = this.form.controls["idNumber"];

    if (idType === 1) { // SA ID
      idNumber.setValidators([
        Validators.required,
        ValidateIdNumber
      ])
    } else {
      idNumber.setValidators([
        Validators.required
      ])
    }

    idNumber.updateValueAndValidity();
  }

  processChildMessage(message: string) {
    switch (message) {
      case 'lookupsCacheLoaded':
        const lookups = this.pensCareService.getPensCareLookupsCache();
        if (lookups) {
          this.genders = lookups.genders;
          // Not using settimeout produces ExpressionChanged Error
          setTimeout(() =>{
            this.lookupsCacheLoaded = true;
          }, 1);
        }
        break;
      default:
        break;
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  ngOnDestroy(): void {
    if(this.emitChangeSubscription) {
      this.emitChangeSubscription.unsubscribe();
    }
  }
}
