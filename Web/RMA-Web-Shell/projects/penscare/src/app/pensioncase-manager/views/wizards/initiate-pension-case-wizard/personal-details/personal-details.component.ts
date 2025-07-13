import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';
import { PersonalDetailsComponentModel } from './personal-details.component.model';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { IdNumberUtil } from 'projects/shared-utilities-lib/src/lib/idnumber-utility/idnumber-utility';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { BeneficiaryUtil } from 'projects/shared-utilities-lib/src/lib/beneficiary-utility/beneficiary-utility';
import { isSelectRequired } from 'projects/shared-utilities-lib/src/lib/validators/select.validator';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import 'src/app/shared/extensions/string.extensions';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { ValidatorService } from 'projects/penscare/src/app/services/validator.service';
@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private changeDedectorRef: ChangeDetectorRef,
    private alertService: AlertService,
    private pensCareService: PensCareService,
    private validatorService: ValidatorService) {
  }
  @Output() cancelButtonClicked = new EventEmitter<any>();
  @Output() saveButtonClicked = new EventEmitter<any>();
  isRecipientIdHidden = false;

  @Input() componentData: PersonalDetailsComponentModel;
  @Input('isView') isView: boolean;
  @Input('minAge') minAge: number;
  @Input('maxAge') maxAge: number;
  public form: UntypedFormGroup;
  public lookupsCacheLoaded = false;
  public beneficiaryUtil = new BeneficiaryUtil();


  public genders: Lookup[];
  public titles: Lookup[];
  public languages: Lookup[];
  public provinces: Lookup[];
  public maritalStatus: Lookup[];
  public marriageTypes: Lookup[];
  public idTypes: Lookup[];
  public countries: Lookup[];
  public communicationTypes: Lookup[];
  public populationGroups: Lookup[];
  public recipientIdNumbers: {id: string, name: string}[];
  public idNumberUtil = new IdNumberUtil();
  public formControlsSubscription: Subscription;
  public benefitTypeEnum: any;

  maxDate = new Date();
  @ViewChild('languageElement', { static: false }) languageElement: ElementRef;
  @ViewChild('provinceIdElement', { static: false }) provinceIdElement: ElementRef;
  @ViewChild('countryOriginIdElement', { static: false }) countryOriginIdElement: ElementRef;
  @ViewChild('taxReferenceNumberElement', { static: false }) taxReferenceNumberElement: ElementRef;
  @ViewChild('countryOriginIdLabelElement', { static: false }) countryOriginIdLabelElement: ElementRef;


  filteredLanguages: Lookup[];
  filteredProvinces: Lookup[];
  filteredCountries: Lookup[];
  beneficiaryTypes: Lookup[];
  designationTypes: Lookup[];

  step = 0;
  elementKeyUp: Subscription;
  isRecipientRequired = false;

  today = new Date(); // Todays date to avoid future date of birth selection

  ngOnInit() {
    // check if the lookups have been called by another component
    if (this.componentData.pensCareContext !== PensionCaseContextEnum.Manage) {
      this.onLoadLookups();
      this.generaterecipientIdNumbers();
    } else {
      this.genders = this.componentData.lookups.genders;
      this.communicationTypes = this.componentData.lookups.communicationTypes;
      this.languages = this.componentData.lookups.languages;
      this.provinces = this.componentData.lookups.provinces;
      this.maritalStatus = this.componentData.lookups.maritalStatus;
      this.countries = this.componentData.lookups.countries;
      this.titles = this.componentData.lookups.titles;
      this.idTypes  =  this.componentData.lookups.idTypes;
      this.form = this.componentData.form;

      this.filteredLanguages = this.languages;
      this.filteredProvinces = this.provinces;
      this.filteredCountries = this.countries;

    }
    this.addFormSubscriptions();
    this.toggleIdNumberValidation();
    this.benefitTypeEnum = BenefitTypeEnum;
    this.prepopulateTaxReferenceNumber();

    if (this.form.controls.isBeneficiary?.value || this.form.controls.isRecipient?.value) {
      this.form.controls.age.setValidators([Validators.required, Validators.min(this.minAge), Validators.max(this.maxAge)]);
      this.form.controls.age.updateValueAndValidity();
    }
  }

  prepopulateTaxReferenceNumber() {
    this.form.controls.taxReferenceNumber.setValue(
      this.form.controls.taxReferenceNumber.value ?
      this.form.controls.taxReferenceNumber.value :
      '0000000000');
  }

  generaterecipientIdNumbers() {
    if (this.componentData.model.recipients) {
      this.recipientIdNumbers = this.componentData.model.recipients.map(recipient => {
        return {
          id: recipient.idNumber,
          name: `${recipient.firstName} ${recipient.surname}`
        };
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.componentData.pensCareContext === PensionCaseContextEnum.Manage) {
      return;
    }
    this.generateAutoCompleteSubscriptions();

    this.prepopulateAutocomplete(
      this.provinceIdElement.nativeElement,
      this.filteredProvinces,
      this.form.controls.provinceId
    );

    this.prepopulateAutocomplete(
      this.countryOriginIdElement.nativeElement,
      this.filteredCountries,
      this.form.controls.countryOriginId
    );

    this.checkIfFieldIsRequired(
      this.form.controls.taxReferenceNumber,
      this.taxReferenceNumberElement.nativeElement
    );
  }

  checkIfFieldIsRequired(control: AbstractControl, element) {
    if (control.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && validator.required) {
        element.classList.add('mandatory-field');
        return;
      }
    }
    element.classList.remove('mandatory-field');
  }

  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.toggleIdNumberValidation();
        this.validateAllFormFields(control);
      }
    });
  }

  addFormSubscriptions() {
    this.formControlsSubscription = this.form.controls.idType.valueChanges.subscribe(() => {
        this.toggleIdNumberValidation();
        this.toggleProofOfAddressValidation();
      }
    );

    this.formControlsSubscription = this.form.controls.idNumber.valueChanges.subscribe(() => {
      this.generateDateOfBirthFromIdNumber();
      this.generateGenderFromID();
    });

    this.formControlsSubscription.add(
      this.form.controls.dateOfBirth.valueChanges.subscribe((data) => {
        let value = data;
        // the datepicker sometimes uses data._d to generate the value of a control
        value = this.idNumberUtil.isValidDate(data) ? value : data._d;
        if (this.idNumberUtil.isValidDate(value)) {
          this.form.controls.age.setValue(this.idNumberUtil.getAge(value));
          this.form.controls.age.disable();
        }
        else {
          this.form.controls.age.enable();
        }
      }
    ));

    if (this.componentData.pensCareContext !== PensionCaseContextEnum.Manage) {
      this.formControlsSubscription.add(
        this.form.controls.beneficiaryType.valueChanges.subscribe((data) => {
          if (data === BeneficiaryTypeEnum.Spouse) {
            const numberOfSpouses = this.beneficiaryUtil.getNumberOfSpouses(this.componentData.model.beneficiaries);
            this.form.controls.familyUnit.setValue(numberOfSpouses);
            if (this.form.controls.recipientIdNumber) {
              this.form.controls.recipientIdNumber.setValue(this.form.controls.idNumber.value);
              this.form.controls.recipientIdNumber.clearValidators();
            }
            this.isRecipientIdHidden = true;
          } else if (data === BeneficiaryTypeEnum.Child) {
            if (this.form.controls.recipientIdNumber) {
              this.isRecipientRequired = true;
              this.form.controls.recipientIdNumber.addValidators([isSelectRequired]);
              this.form.controls.recipientIdNumber.updateValueAndValidity();
            }
            this.isRecipientIdHidden = false;
          } else {
            this.isRecipientIdHidden = false;
            if (this.form.controls.recipientIdNumber) {
              this.form.controls.recipientIdNumber.clearValidators();
              this.form.controls.recipientIdNumber.updateValueAndValidity();
            }
          }
        }
      ));
    }

    if (this.form.controls.isBeneficiary?.value) {
      this.formControlsSubscription.add(
        this.form.controls.isDisabled.valueChanges.subscribe((data) => {
          if (data){
            this.form.controls.age.setValidators([Validators.required, Validators.min(this.minAge), Validators.max(40)]);
          }
          else {
            this.form.controls.age.setValidators([Validators.required, Validators.min(this.minAge), Validators.max(18)]);
          }

          this.form.controls.age.updateValueAndValidity();
        })
      );
    }


    if (this.form.controls.recipientIdNumber) {
      this.formControlsSubscription.add(
        this.form.controls.recipientIdNumber.valueChanges.subscribe((data) => {
          this.generateFamilyUnit();
        })
      );
      this.generateFamilyUnit();
    }

    this.form.updateValueAndValidity();
  }

  generateFamilyUnit() {
    const idNumber = this.form.controls.recipientIdNumber.value;
    if ( idNumber && this.componentData.model.recipients) {
      const recipient = this.componentData.model.recipients.find(recipient => recipient.idNumber === idNumber);
      if (recipient) {
        this.form.controls.familyUnit.setValue(recipient.familyUnit);
      }
    }
  }


  toggleIdNumberValidation() {
    const idType = this.form.controls.idType.value;
    const idNumber = this.form.controls.idNumber;

    if (idType === 1) { // SA ID
      idNumber.setValidators([
        Validators.required,
        ValidateIdNumber
      ]);
    } else {
      idNumber.setValidators([
        Validators.required
      ]);
    }

    idNumber.updateValueAndValidity();
  }

  toggleProofOfAddressValidation() {
    const idType = this.form.controls.idType.value;
    const countryOriginId = this.form.controls.countryOriginId;

    if (idType === 2) { // Non SA ID
      countryOriginId.setValidators([
        Validators.required
      ]);
    } else {
      countryOriginId.setValidators([]);
    }

    countryOriginId.updateValueAndValidity();
    this.checkIfFieldIsRequired(countryOriginId, this.countryOriginIdLabelElement.nativeElement);
  }

  generateDateOfBirthFromIdNumber() {
    const idType = this.form.controls.idType.value;
    if (idType === 1) {

      const dateOfBirth = this.idNumberUtil.getDateFromIdNumber(this.form.controls.idNumber.value);

      if (dateOfBirth) {
        this.form.controls.dateOfBirth.setValue(dateOfBirth);
        this.form.controls.dateOfBirth.disable();
      }
      else {
        this.form.controls.dateOfBirth.enable();
      }

    }
  }

  generateGenderFromID() {
    if (this.form.controls.idType.value === 1) {
      const gender = this.idNumberUtil.getGenderFromID(this.form.controls.idNumber.value);
      if (gender) {
        this.form.controls.gender.setValue(gender);
      }
    }
  }

  setStep(step: number) {
    this.step = step;
  }

  onLoadLookups(): void {
    const lookups = this.pensCareService.getPensCareLookupsCache();

    if (lookups) {
      this.genders = lookups.genders;
      this.communicationTypes = lookups.communicationTypes;
      this.languages = lookups.languages;
      this.provinces = lookups.provinces;
      this.maritalStatus = lookups.maritalStatus;
      this.marriageTypes = lookups.marriageTypes;
      this.designationTypes = lookups.designationTypes;
      if (this.componentData.form.controls.beneficiaryType.value === BeneficiaryTypeEnum.Pensioner) {
        this.beneficiaryTypes = lookups.beneficiaryTypes.filter(beneficiaryType => {
          return beneficiaryType.id === BeneficiaryTypeEnum.Pensioner;
        });
      } 
      else if (this.componentData.personType === 'beneficiary') {
        this.beneficiaryTypes = lookups.beneficiaryTypes.filter(beneficiaryType => {
          return [BeneficiaryTypeEnum.Spouse, BeneficiaryTypeEnum.Child, BeneficiaryTypeEnum.Other, BeneficiaryTypeEnum.Pensioner].includes(beneficiaryType.id);
        });
      } 
      else {
        this.beneficiaryTypes = lookups.beneficiaryTypes.filter(beneficiaryType => {
          return [BeneficiaryTypeEnum.Spouse, BeneficiaryTypeEnum.GuardianRecipient, BeneficiaryTypeEnum.Child, BeneficiaryTypeEnum.Other, BeneficiaryTypeEnum.Pensioner].includes(beneficiaryType.id);
        });
      }

      this.idTypes = lookups.idTypes.filter(idType => {
        return idType.name === 'SA ID Document' || idType.name === 'Passport Document';
      });
      this.countries = lookups.countries;
      this.titles = lookups.titles;
      this.populationGroups = lookups.populationGroups;
      this.form = this.componentData.form;

      this.filteredLanguages = this.languages;
      this.filteredProvinces = this.provinces;
      this.filteredCountries = this.countries;
    }
  }

  prepopulateAutocomplete(nativeElement, options: any[], control: AbstractControl): void {
    const option = options.find(option => option.id === control.value);
    if (control.disabled) {
      nativeElement.disabled = true;
    }
    nativeElement.value = option ? option.name : '';
    this.changeDedectorRef.detectChanges();
  }

  setAutocompleteValue(event, options: any[], controlKey: string) {
    this.form.controls[controlKey].setValue(options.find((option) => option.name === event.option.value).id);
  }

  // Tried not to duplicate the code but the code broke therefore duplicating for now
  generateAutoCompleteSubscriptions() {
    // provinces
    this.elementKeyUp = fromEvent(this.provinceIdElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)){
        this.filteredProvinces = this.provinces;
        return;
      }
      this.filteredProvinces = this.provinces.filter(option => String.contains(option.name, searchData));
    });

    // countries
    this.elementKeyUp.add(fromEvent(this.countryOriginIdElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)){
        this.filteredCountries = this.countries;
        return;
      }
      this.filteredCountries = this.countries.filter(option => String.contains(option.name, searchData));
    }));
  }

  cancel() {
    this.cancelButtonClicked.emit();
  }

  save() {
    if (this.form.valid) {
      this.saveButtonClicked.emit(this.form);
    } else {
      this.validateAllFormFields(this.form);
      this.alertService.error('Please make sure that all form fields are entered correctly');
    }
  }

  ngOnDestroy() {
    if (this.formControlsSubscription) {
      this.formControlsSubscription.unsubscribe();
    }
    if (this.elementKeyUp) {
      this.elementKeyUp.unsubscribe();
    }
  }
}
