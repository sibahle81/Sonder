import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { Contact } from 'projects/shared-components-lib/src/lib/models/contact.model';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FormUtil } from 'projects/shared-utilities-lib/src/lib/form-utility/form-utility';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';
import { LanguageEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/language-enum';
import { PensCareUtilities } from 'projects/penscare/src/app/shared-penscare/utils/penscare-utilities';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-pensioner-information',
  templateUrl: './pensioner-information.component.html',
  styleUrls: ['./pensioner-information.component.css']
})
export class PensionerInformationComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {

  lookupsCacheLoaded = false;
  emitChangeSubscription: any;
  disabledFieldsData = {};
  formUtil = new FormUtil();
  isFormPrepopulated = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private pensCareService: PensCareService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.createForm();
    this.pensCareService.loadLookupsCache();
    this.emitChangeSubscription = this.pensCareService.changeEmmited$.subscribe(change => {
      this.processChildMessage(change);
    })
  }

  //stays here
  createForm(): void {
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      title: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      familyUnit: new UntypedFormControl({value: 0, disabled: true}),
      firstName: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      beneficiaryType: new UntypedFormControl({value: '', disabled: true}),
      surname: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      age: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      dateOfBirth: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      individualIndicator: new UntypedFormControl({value: '', disabled: true}),
      gender: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      provinceId: new UntypedFormControl({value: '', disabled: true}),
      populationGroup: new UntypedFormControl({value: '', disabled: true}),
      marriageType: new UntypedFormControl({value: '', disabled: true}),
      maritalStatus: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      language: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      marriageDate: new UntypedFormControl({value: '', disabled: true}),
      countryOriginId: new UntypedFormControl({value: '', disabled: true}),
      idNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      taxReferenceNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      otherIdNumber: new UntypedFormControl({value: '', disabled: true}),
      col: new UntypedFormControl({value: '', disabled: true}),
      occupation: new UntypedFormControl({value: '', disabled: true}),
      icd10Driver: new UntypedFormControl({value: '', disabled: true}),
      drg: new UntypedFormControl({value: '', disabled: true}),
      idType: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      workPermitNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      communicationType: new UntypedFormControl({value: '', disabled: true}),
      contactDesignationType: new UntypedFormControl({value: '', disabled: true}),
      email: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      otherNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      mobileNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required]),
      workNumber: new UntypedFormControl({value: '', disabled: true}),
      telephoneNumber: new UntypedFormControl({value: '', disabled: true}),
      CertificateOfLife: new UntypedFormControl({value: '', disabled: true}),
      dateOfDeath: new UntypedFormControl({value: '', disabled: true}),
      isRecipient: new UntypedFormControl({value: false, disabled: true}),
      isDisabled: new UntypedFormControl({value: false, disabled: true}),
      colNewEndDate: new UntypedFormControl({value: false, disabled: true}),
      colDateReceived: new UntypedFormControl({value: false, disabled: true}),
      colDateSubmitted: new UntypedFormControl({value: false, disabled: true}),
      colDateVerified: new UntypedFormControl({value: false, disabled: true})
    });
  }

  onLoadLookups(): void {}

  populateModel(): void {
    this.form.patchValue(this.disabledFieldsData);
    const value = this.form.getRawValue();
    this.model['pensioner'] = new Person();
    this.model.pensioner.age = value.age;
    this.model.pensioner.dateOfBirth = value.dateOfBirth;
    this.model.pensioner.firstName = value.firstName;
    this.model.pensioner.gender = value.gender;
    this.model.pensioner.idNumber = value.idNumber;
    this.model.pensioner.surname = value.surname;
    this.model.pensioner.maritalStatus = value.maritalStatus;
    this.model.pensioner.title = value.title;
    this.model.pensioner.workPermitNumber = value.workPermitNumber;
    this.model.pensioner.CertificateOfLife = value.CertificateOfLife;
    this.model.pensioner.dateOfDeath = value.dateOfDeath;
    this.model.pensioner.isRecipient = value.isRecipient;
    this.model.pensioner.idType = value.idType;
    this.model.pensioner.taxReferenceNumber = value.taxReferenceNumber;

    this.model.pensioner.beneficiaryType = value.beneficiaryType;
    this.model.pensioner.language = value.language;
    this.model.pensioner.individualIndicator = value.individualIndicator
    this.model.pensioner.provinceId = value.provinceId;
    this.model.pensioner.populationGroup = value.populationGroup;
    this.model.pensioner.marriageType = value.marriageType;
    this.model.pensioner.marriageDate = value.marriageDate
    this.model.pensioner.countryOriginId = value.countryOriginId;
    this.model.pensioner.otherIdNumber = value.otherIdNumber;
    this.model.pensioner.col = value.col
    this.model.pensioner.occupation = value.occupation;
    this.model.pensioner.CertificateOfLife = value.CertificateOfLife;
    this.model.pensioner.isDisabled = value.isDisabled;

    this.model.pensioner.contact = new Contact();
    this.model.pensioner.contact.title = value.title;
    this.model.pensioner.contact.communicationType = value.communicationType;
    this.model.pensioner.contact.email = value.email;
    this.model.pensioner.contact.otherNumber = value.otherNumber;
    this.model.pensioner.contact.mobileNumber = value.mobileNumber;
    this.model.pensioner.contact.workNumber = value.workNumber;
    this.model.pensioner.contact.telephoneNumber = value.telephoneNumber;
    this.model.pensioner.contact.contactDesignationType = ContactDesignationTypeEnum.PrimaryContact;
    this.model.pensioner.colNewEndDate= value.colNewEndDate;
    this.model.pensioner.colDateReceived= value.colDateReceived;
    this.model.pensioner.colDateSubmitted= value.colDateSubmitted;
    this.model.pensioner.colDateVerified= value.colDateVerified;

    if (this.model.pensionCase.benefitType === BenefitTypeEnum.Disability) {
      if (!isNullOrUndefined(this.model.recipients) && !this.model.recipients.find(recipient => recipient.beneficiaryType === BeneficiaryTypeEnum.Pensioner)) {
        this.model.pensioner.familyUnit = 0;
        this.model.recipients.push(this.model.pensioner);
      }
    }
  }

  populateForm(): void {
    if (this.model && this.model.pensioner) {
      if (!this.model.pensioner.contact) {
        this.model.pensioner.contact = new Contact();
      }
      this.form.patchValue({
        age : this.model.pensioner.age,
        dateOfBirth : this.model.pensioner.dateOfBirth,
        firstName : this.model.pensioner.firstName,
        gender : this.model.pensioner.gender,
        idNumber : this.model.pensioner.idNumber,
        surname : this.model.pensioner.surname,
        maritalStatus : this.model.pensioner.maritalStatus,
        title : this.model.pensioner.title,
        titleLabel : TitleEnum[this.model.pensioner.title],
        workPermitNumber: this.model.pensioner.workPermitNumber,
        CertificateOfLife: this.model.pensioner.CertificateOfLife,
        dateOfDeath: this.model.pensioner.dateOfDeath,
        isRecipient: this.model.pensioner.isRecipient,
        idType: this.model.pensioner.idType,
        taxReferenceNumber: this.model.pensioner.taxReferenceNumber,
        language: !this.model.pensioner.language ? LanguageEnum.English : this.model.pensioner.language,
        beneficiaryType: this.model.pensioner.beneficiaryType,
        individualIndicator: this.model.pensioner.individualIndicator,
        provinceId: this.model.pensioner.provinceId,
        populationGroup: this.model.pensioner.populationGroup,
        marriageType: this.model.pensioner.marriageType,
        marriageDate: this.model.pensioner.marriageDate,
        countryOriginId: this.model.pensioner.countryOriginId,
        otherIdNumber: this.model.pensioner.otherIdNumber,
        col: this.model.pensioner.col,
        occupation: this.model.pensioner.occupation,
        isDisabled: this.model.pensioner.isDisabled,
        communicationType: PensCareUtilities.createPrefferedCommunicationType(this.model.pensioner, this.model.pensioner.contact.communicationType),
        contactDesignationType: ContactDesignationTypeEnum.PrimaryContact,
        email: this.model.pensioner.contact.emailAddress,
        otherNumber: this.model.pensioner.contact.otherNumber,
        mobileNumber: this.model.pensioner.contact.contactNumber,
        workNumber: this.model.pensioner.contact.workNumber,
        telephoneNumber: this.model.pensioner.contact.telephoneNumber,
        colNewEndDate: this.model.pensioner.colNewEndDate,
        colDateReceived: this.model.pensioner.colNewEndDate,
        colDateSubmitted: this.model.pensioner.colNewEndDate,
        colDateVerified: this.model.pensioner.colNewEndDate
      });

      this.form.controls['contactDesignationType'].setValue(ContactDesignationTypeEnum.PrimaryContact);
      this.disabledFieldsData = this.formUtil.getDisabledFieldsData(this.form);

      this.populateRecipient();
      this.isFormPrepopulated = true;
    }
  }

  populateRecipient() {
    if (this.form.controls['isRecipient'].value === true && this.model) {
      if (this.model.recipients && !this.isRecipientInArray(this.form.value)) {
        this.model.recipients.push(this.form.value);
      }
    }
  }

  isRecipientInArray(recipient: Person) {
    if (recipient.idNumber && this.model.recipients.find(item => item.idNumber === recipient.idNumber)) {
      return true;
    }
    return false
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  processChildMessage(message: string) {
    switch (message) {
      case 'lookupsCacheLoaded':
        // Not using settimeout produces ExpressionChanged Error
        setTimeout(() =>{
          this.lookupsCacheLoaded = true;
        }, 1);
        break;
      default:
        break;
    }
  }
}
