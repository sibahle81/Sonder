import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { Case } from '../../shared/entities/case';
import { PolicyAddressDetailsComponent } from '../policy-address-details/policy-address-details.component';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { PolicyContact } from '../../shared/entities/policy-contact';
import { Company } from '../../shared/entities/company';
import { PolicyDocumentCommunicationMatrix } from '../../shared/entities/policy-document-communication-matrix';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { ContactTypeEnum } from '../../../broker-manager/models/enums/contact-type.enum';

@Component({
  selector: 'policy-child-contact-details',
  templateUrl: './policy-child-contact-details.component.html',
  styleUrls: ['./policy-child-contact-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class PolicyChildContactDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  @ViewChild(PolicyAddressDetailsComponent, { static: true }) policyAddressDetailComponent: PolicyAddressDetailsComponent;

  commPreferences: Lookup[];
  contactTypes: Lookup[] = [];
  isFirstAlternativeContactRequired: boolean;
  isSecondAlternativeContactRequired: boolean;

  get addressMissing(): boolean {
    if (!this.isWizard || !this.context || !this.context.wizard) { return false; }
    if (!this.context.wizard.canEdit) { return false; }
    if (!this.model || !this.model.mainMember) { return false; }

    if (!this.model.mainMember.rolePlayerAddresses) { return true; }
    return this.model.mainMember.rolePlayerAddresses.length === 0;
  }

  get schemeDetail(): Company {
    let company: Company = new Company();
    const schemeContact = this.model &&
      this.model.mainMember &&
      this.model.mainMember?.company ? this.model.mainMember?.company : company;
    if (schemeContact) {
      schemeContact.contactPersonName = schemeContact.contactPersonName ? schemeContact.contactPersonName : '';
      schemeContact.contactTelephone = schemeContact.contactTelephone ? schemeContact.contactTelephone : '';
      schemeContact.contactEmail = schemeContact.contactEmail ? schemeContact.contactEmail : '';
      schemeContact.contactMobile = schemeContact.contactMobile ? schemeContact.contactMobile : '';
    }
    return schemeContact;
  }

  get brokerDetail(): PolicyContact {
    let policyContact: PolicyContact = new PolicyContact();
    const brokerContact = this.model &&
      this.model.mainMember &&
      this.model.mainMember.policies.length > 0 &&
      this.model.mainMember.policies[0]?.brokerPolicyContact ? this.model.mainMember.policies[0].brokerPolicyContact : policyContact;
    if (brokerContact) {
      brokerContact.contactName = brokerContact.contactName ? brokerContact.contactName : '';
      brokerContact.telephoneNumber = brokerContact.telephoneNumber ? brokerContact.telephoneNumber : '';
      brokerContact.emailAddress = brokerContact.emailAddress ? brokerContact.emailAddress : '';
      brokerContact.mobileNumber = brokerContact.mobileNumber ? brokerContact.mobileNumber : '';
    }
    return brokerContact;
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngAfterViewInit() {
    this.policyAddressDetailComponent.createForm();
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      commPreference: ['', [Validators.min(1)]],
      tellNumber: [''],
      cellNumber: ['', Validators.required],
      emailAddress: ['', [ValidateEmail]],
      firstAlternativePolicyContactId: [''],
      firstAlternativeContactType: [''], 
      firstAlternativeContactName: [''],
      firstAlternativeEmailAddress: ['', [ValidateEmail]],
      firstAlternativeTelNumber: ['', [ValidatePhoneNumber]],
      firstAlternativeMobileNumber: ['', [ValidatePhoneNumber]],
      firstAlternativeContactNumber: ['', [ValidatePhoneNumber]],
      secondAlternativePolicyContactId: [''],
      secondAlternativeContactType: [''],
      secondAlternativeContactName: [''],
      secondAlternativeEmailAddress: ['', [ValidateEmail]],
      secondAlternativeTelNumber: ['', [ValidatePhoneNumber]],
      secondAlternativeMobileNumber: ['', [ValidatePhoneNumber]],
      secondAlternativeContactNumber: ['', [ValidatePhoneNumber]]
    });
  }

  onLoadLookups(): void {
    this.getCommunicationPreferences();
    this.getContactTypes();
  }

  populateModel(): void {
    const form = this.form.value;
    let member: RolePlayer;
    if (this.model.newMainMember) {
      this.model.newMainMember.preferredCommunicationTypeId = form.commPreference;
      this.model.newMainMember.tellNumber = form.tellNumber;
      this.model.newMainMember.cellNumber = form.cellNumber;
      this.model.newMainMember.emailAddress = form.emailAddress;
      if (!this.model.newMainMember.policies[0].firstAlternativePolicyContact) {
        this.model.newMainMember.policies[0].firstAlternativePolicyContact = new PolicyContact();
      }
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.contactType = form.firstAlternativeContactType !== 0 ?  form.firstAlternativeContactType : ContactTypeEnum.FirstAlternativePolicyContact;
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.policyContactId = form.firstAlternativePolicyContactId;
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.contactName = form.firstAlternativeContactName;
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.emailAddress = form.firstAlternativeEmailAddress;
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.telephoneNumber = form.firstAlternativeTelNumber;
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.alternativeNumber = form.firstAlternativeContactNumber;
      this.model.newMainMember.policies[0].firstAlternativePolicyContact.mobileNumber = form.firstAlternativeMobileNumber;
      if (!this.model.newMainMember.policies[0].secondAlternativePolicyContact) {
        this.model.newMainMember.policies[0].secondAlternativePolicyContact = new PolicyContact();
      }
      
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.contactType = form.secondAlternativeContactType !== 0 ?  form.secondAlternativeContactType : ContactTypeEnum.SecondAlternativePolicyContact;
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.policyContactId = form.secondAlternativePolicyContactId;
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.contactName = form.secondAlternativeContactName;
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.emailAddress = form.secondAlternativeEmailAddress;
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.telephoneNumber = form.secondAlternativeTelNumber;
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.alternativeNumber = form.secondAlternativeContactNumber;
      this.model.newMainMember.policies[0].secondAlternativePolicyContact.mobileNumber = form.secondAlternativeMobileNumber;
      if (this.model.newMainMember.person) {
        member = this.model.beneficiaries.find(
          b => b.person
            && b.person.idType === this.model.newMainMember.person.idType
            && b.person.idNumber === this.model.newMainMember.person.idNumber
        );
      }
    } else {
      this.model.mainMember.preferredCommunicationTypeId = form.commPreference;
      this.model.mainMember.tellNumber = form.tellNumber;
      this.model.mainMember.cellNumber = form.cellNumber;
      this.model.mainMember.emailAddress = form.emailAddress;
      if (this.model.mainMember.policies.length > 0) {
        this.model.mainMember.policies[0].firstAlternativePolicyContact = new PolicyContact();
      }
      this.model.mainMember.policies[0].firstAlternativePolicyContact.contactType = form.firstAlternativeContactType !== 0 ?  form.firstAlternativeContactType : ContactTypeEnum.FirstAlternativePolicyContact;
      this.model.mainMember.policies[0].firstAlternativePolicyContact.policyContactId = form.firstAlternativePolicyContactId;
      this.model.mainMember.policies[0].firstAlternativePolicyContact.contactName = form.firstAlternativeContactName;
      this.model.mainMember.policies[0].firstAlternativePolicyContact.emailAddress = form.firstAlternativeEmailAddress;
      this.model.mainMember.policies[0].firstAlternativePolicyContact.telephoneNumber = form.firstAlternativeTelNumber;
      this.model.mainMember.policies[0].firstAlternativePolicyContact.alternativeNumber = form.firstAlternativeContactNumber;
      this.model.mainMember.policies[0].firstAlternativePolicyContact.mobileNumber = form.firstAlternativeMobileNumber;
      if (this.model.mainMember.policies.length > 0) {
        this.model.mainMember.policies[0].secondAlternativePolicyContact = new PolicyContact();
      }
      this.model.mainMember.policies[0].secondAlternativePolicyContact.contactType = form.secondAlternativeContactType !== 0 ?  form.secondAlternativeContactType : ContactTypeEnum.SecondAlternativePolicyContact;
      this.model.mainMember.policies[0].secondAlternativePolicyContact.policyContactId = form.secondAlternativePolicyContactId;
      this.model.mainMember.policies[0].secondAlternativePolicyContact.contactName = form.secondAlternativeContactName;
      this.model.mainMember.policies[0].secondAlternativePolicyContact.emailAddress = form.secondAlternativeEmailAddress;
      this.model.mainMember.policies[0].secondAlternativePolicyContact.telephoneNumber = form.secondAlternativeTelNumber;
      this.model.mainMember.policies[0].secondAlternativePolicyContact.alternativeNumber = form.secondAlternativeContactNumber;
      this.model.mainMember.policies[0].secondAlternativePolicyContact.mobileNumber = form.secondAlternativeMobileNumber;
      if (this.model.mainMember.person) {
        member = this.model.beneficiaries.find(
          b => b.person
            && b.person.idType === this.model.mainMember.person.idType
            && b.person.idNumber === this.model.mainMember.person.idNumber
        );
      }
    }
    if (member) {
      member.preferredCommunicationTypeId = form.commPreference;
      member.tellNumber = form.tellNumber;
      member.cellNumber = form.cellNumber;
      member.emailAddress = form.emailAddress;
    }
    this.policyAddressDetailComponent.wizardReadFormData(this.context);
  }

  populateForm(): void {
    const member = this.model.newMainMember ? this.model.newMainMember : this.model.mainMember;
    this.form.patchValue({
      tellNumber: member.tellNumber,
      cellNumber: member.cellNumber,
      emailAddress: member.emailAddress,
      commPreference: member.preferredCommunicationTypeId,
      
      firstAlternativeContactType: member.policies[0]?.firstAlternativePolicyContact?.contactName && member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.contactType : 0,
      firstAlternativePolicyContactId: member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.policyContactId : 0,
      firstAlternativeContactName: member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.contactName : '',
      firstAlternativeEmailAddress: member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.emailAddress : '',
      firstAlternativeTelNumber: member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.telephoneNumber : '',
      firstAlternativeMobileNumber: member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.mobileNumber : '',
      firstAlternativeContactNumber: member.policies[0]?.firstAlternativePolicyContact ? member.policies[0].firstAlternativePolicyContact?.alternativeNumber : '',
      
      secondAlternativeContactType: member.policies[0].secondAlternativePolicyContact?.contactName && member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.contactType : 0,
      secondAlternativePolicyContactId: member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.policyContactId : 0,
      secondAlternativeContactName: member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.contactName : '',
      secondAlternativeEmailAddress: member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.emailAddress : '',
      secondAlternativeTelNumber: member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.telephoneNumber : '',
      secondAlternativeMobileNumber: member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.mobileNumber : '',
      secondAlternativeContactNumber: member.policies[0]?.secondAlternativePolicyContact ? member.policies[0].secondAlternativePolicyContact?.alternativeNumber : ''
    });

    if (this.context) {
      this.policyAddressDetailComponent.wizardPopulateForm(this.context);
    } else {
      this.policyAddressDetailComponent.setViewData(this.model.mainMember.rolePlayerAddresses);
    }

    if (this.isReadonly) {
      this.policyAddressDetailComponent.disable();
    }

    this.validateCommunicationType(member.preferredCommunicationTypeId);
  }

  getCommunicationPreferences(): void {
    this.lookupService.getCommunicationTypes().subscribe(
      data => {
        this.commPreferences = data;
      }
    );
  }

  getContactTypes(): void {
    this.lookupService.getContactTypes().subscribe(
      data => {
        this.contactTypes = data;
      });
  }

  commPreferenceChange($event: any) {
    this.validateCommunicationType($event.value);
  }

  validateCommunicationType(selectedCommunicationTypeId: number) {
    if (selectedCommunicationTypeId === CommunicationTypeEnum.Email && (this.form.value.emailAddress === '' || this.form.value.emailAddress === null)) {
      this.form.controls.emailAddress.setErrors({ required: true });
      this.form.controls.emailAddress.markAsTouched();
    } else {
      this.form.controls.emailAddress.setErrors(null);
      this.form.controls.emailAddress.updateValueAndValidity();
    }

    if (selectedCommunicationTypeId === CommunicationTypeEnum.Post && (this.form.value.cellNumber === '' || this.form.value.cellNumber === null)) {
      this.form.controls.cellNumber.setErrors(null);
      this.form.controls.cellNumber.updateValueAndValidity();
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.mainMember.rolePlayerAddresses || this.model.mainMember.rolePlayerAddresses.length === 0) {
      validationResult.errorMessages.push('Policy holder address is required');
      validationResult.errors += 1;
    }

    if (this.model?.mainMember?.policies[0]?.firstAlternativePolicyContact?.contactName && (!this.model?.mainMember?.policies[0]?.firstAlternativePolicyContact?.emailAddress)) {
      validationResult.errorMessages.push(`First alternative email address for ${this.model.mainMember.policies[0].firstAlternativePolicyContact.contactName} is required`);
      this.isFirstAlternativeContactRequired = true;
      validationResult.errors += 1;
    }

    if (this.model?.mainMember?.policies[0]?.secondAlternativePolicyContact?.contactName && (!this.model?.mainMember?.policies[0]?.secondAlternativePolicyContact?.emailAddress)) {
      validationResult.errorMessages.push(`Second alternative email address for ${this.model.mainMember.policies[0].secondAlternativePolicyContact.contactName} is required`);
      this.isSecondAlternativeContactRequired = true;
      validationResult.errors += 1;
    }

      return validationResult;
  }



  
}
