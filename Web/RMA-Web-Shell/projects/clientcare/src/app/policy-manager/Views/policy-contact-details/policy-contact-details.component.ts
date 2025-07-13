import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import { PolicyDocumentCommunicationMatrix } from '../../shared/entities/policy-document-communication-matrix';

@Component({
  selector: 'policy-contact-details',
  templateUrl: './policy-contact-details.component.html',
  styleUrls: ['./policy-contact-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class PolicyContactDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  @ViewChild(PolicyAddressDetailsComponent, { static: true }) policyAddressDetailComponent: PolicyAddressDetailsComponent;

  commPreferences: Lookup[];
  contactTypes: Lookup[] = [];

  get addressMissing(): boolean {
    if (!this.isWizard || !this.context || !this.context.wizard) { return false; }
    if (!this.context.wizard.canEdit) { return false; }
    if (!this.model || !this.model.mainMember) { return false; }

    if (!this.model.mainMember.rolePlayerAddresses) { return true; }
    return this.model.mainMember.rolePlayerAddresses.length === 0;
  }

  get brokerDetail(): PolicyContact {  
    let policyContact: PolicyContact = new PolicyContact();
    const broker = this.model && 
          this.model.mainMember && 
          this.model.mainMember.policies.length > 0 && 
          this.model.mainMember.policies[0]?.brokerPolicyContact ? this.model.mainMember.policies[0].brokerPolicyContact : policyContact;          
          if (broker) {
              broker.contactName =  broker.contactName ?  broker.contactName : '';
              broker.telephoneNumber =  broker.telephoneNumber ?  broker.telephoneNumber : '';
              broker.emailAddress =  broker.emailAddress ?  broker.emailAddress : '';
          }
    return broker;
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
      sendPolicyDocsToBroker: [false],
      sendPolicyDocsToAdmin: [false],
      sendPolicyDocsToMember: [false],
      sendPolicyDocsToScheme: [false],
      sendPaymentScheduleToBroker: [false],
      tellNumber: [''],
      cellNumber: ['', Validators.required],     
      emailAddress: ['', [ValidateEmail]],
      adminPolicyContactId: [''],
      adminContactType: new UntypedFormControl('', [Validators.required]),
      adminContactName: new UntypedFormControl('', [Validators.required]),
      adminEmailAddress: ['', [ValidateEmail]],
      adminTelNumber: [''],     
      adminMobileNumber: [''],
      adminAlternativeContactNumber: [''],
      policyDocumentCommunicationMatrixId: ['']          
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
      if (this.model.newMainMember.policies.length > 0){
        this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix = new PolicyDocumentCommunicationMatrix();
      }
      this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToBroker = form.sendPolicyDocsToBroker;    
      this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToAdmin = form.sendPolicyDocsToAdmin;
      this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToMember = form.sendPolicyDocsToMember;      
      this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToScheme = form.sendPolicyDocsToScheme;
      this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix.sendPaymentScheduleToBroker = form.sendPaymentScheduleToBroker;
      if (this.model.newMainMember.policies.length > 0){
        this.model.newMainMember.policies[0].adminPolicyContact = new PolicyContact();
      }
      this.model.newMainMember.policies[0].adminPolicyContact.contactType = form.adminContactType;
      this.model.newMainMember.policies[0].adminPolicyContact.policyContactId = form.adminPolicyContactId;
      this.model.newMainMember.policies[0].adminPolicyContact.contactName = form.adminContactName;
      this.model.newMainMember.policies[0].adminPolicyContact.emailAddress = form.adminEmailAddress;
      this.model.newMainMember.policies[0].adminPolicyContact.telephoneNumber = form.adminTelNumber;
      this.model.newMainMember.policies[0].adminPolicyContact.alternativeNumber = form.adminAlternativeContactNumber;
      this.model.newMainMember.policies[0].adminPolicyContact.mobileNumber = form.adminMobileNumber;
      this.model.newMainMember.policies[0].policyDocumentCommunicationMatrix.policyDocumentCommunicationMatrixId = form.policyDocumentCommunicationMatrixId;

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
      if (this.model.mainMember.policies.length > 0){
        this.model.mainMember.policies[0].policyDocumentCommunicationMatrix = new PolicyDocumentCommunicationMatrix();
      }
      this.model.mainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToBroker = form.sendPolicyDocsToBroker;
      this.model.mainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToAdmin = form.sendPolicyDocsToAdmin;
      this.model.mainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToMember = form.sendPolicyDocsToMember;     
      this.model.mainMember.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToScheme = form.sendPolicyDocsToScheme;
      this.model.mainMember.policies[0].policyDocumentCommunicationMatrix.sendPaymentScheduleToBroker = form.sendPaymentScheduleToBroker;
      if (this.model.mainMember.policies.length > 0){
        this.model.mainMember.policies[0].adminPolicyContact = new PolicyContact();
      }
      this.model.mainMember.policies[0].adminPolicyContact.contactType = form.adminContactType;
      this.model.mainMember.policies[0].adminPolicyContact.policyContactId = form.adminPolicyContactId;
      this.model.mainMember.policies[0].adminPolicyContact.contactName = form.adminContactName;
      this.model.mainMember.policies[0].adminPolicyContact.emailAddress = form.adminEmailAddress;
      this.model.mainMember.policies[0].adminPolicyContact.telephoneNumber = form.adminTelNumber;
      this.model.mainMember.policies[0].adminPolicyContact.alternativeNumber = form.adminAlternativeContactNumber;
      this.model.mainMember.policies[0].adminPolicyContact.mobileNumber = form.adminMobileNumber;
      this.model.mainMember.policies[0].policyDocumentCommunicationMatrix.policyDocumentCommunicationMatrixId = form.policyDocumentCommunicationMatrixId;

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
      sendPolicyDocsToBroker: member.policies[0]?.policyDocumentCommunicationMatrix ? member.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToBroker : false,
      sendPolicyDocsToAdmin: member.policies[0]?.policyDocumentCommunicationMatrix ? member.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToAdmin : false,
      sendPolicyDocsToMember: member.policies[0]?.policyDocumentCommunicationMatrix ? member.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToMember : false,
      sendPolicyDocsToScheme: member.policies[0]?.policyDocumentCommunicationMatrix ? member.policies[0].policyDocumentCommunicationMatrix.sendPolicyDocsToScheme : false,
      sendPaymentScheduleToBroker: member.policies[0]?.policyDocumentCommunicationMatrix ? member.policies[0].policyDocumentCommunicationMatrix.sendPaymentScheduleToBroker : false,      
      tellNumber: member.tellNumber,
      cellNumber: member.cellNumber,
      emailAddress: member.emailAddress,
      commPreference: member.preferredCommunicationTypeId,
      adminContactType: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.contactType : null,
      adminPolicyContactId: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.policyContactId : 0,
      adminContactName: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.contactName : '',
      adminEmailAddress: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.emailAddress : '',
      adminTelNumber: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.telephoneNumber : '',
      adminMobileNumber: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.mobileNumber : '',
      adminAlternativeContactNumber: member.policies[0]?.adminPolicyContact ? member.policies[0]?.adminPolicyContact.alternativeNumber : '',
      policyDocumentCommunicationMatrixId:  member.policies[0]?.policyDocumentCommunicationMatrix ? member.policies[0]?.policyDocumentCommunicationMatrix.policyDocumentCommunicationMatrixId : 0
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

    if (member.policies[0]?.adminPolicyContact.emailAddress){
      this.validateSendToCheckBoxes(member.policies[0]?.adminPolicyContact.emailAddress,'admin-email');
    }
    if (member.emailAddress){
      this.validateSendToCheckBoxes(member.emailAddress,'scheme-email');
    }
    if (member.policies[0]?.brokerPolicyContact.emailAddress){
      this.validateSendToCheckBoxes(member.policies[0]?.brokerPolicyContact.emailAddress,'broker-email');
    }   
  
  }

  getCommunicationPreferences(): void {
    this.lookupService.getCommunicationTypes().subscribe(
      data => {
        this.commPreferences = data;
      }
    );
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
      validationResult.errorMessages.push('Policy holder address is required.');
      validationResult.errors += 1;
    }
    return validationResult;
  }

  getContactTypes(): void {
    this.lookupService.getContactTypes().subscribe(
        data => {
            this.contactTypes = data;
        });
}

  onEmailAddressChange($event: any, emailType:any){
    let emailAddress = $event.target.value;
    this.validateSendToCheckBoxes(emailAddress,emailType);
  }

  validateSendToCheckBoxes(emailAddress:any, emailType:any){
    if (!emailAddress){
      if (emailType === 'broker-email'){
        this.form.get('sendPolicyDocsToBroker').disable();
        this.form.get('sendPaymentScheduleToBroker').disable();
      }
      else if  (emailType === 'admin-email'){
        this.form.get('sendPolicyDocsToAdmin').disable();
        this.form.get('sendPolicyDocsToMember').disable();
      }
      else if  (emailType === 'scheme-email'){
        this.form.get('sendPolicyDocsToScheme').disable();
      }
    }
    else{
      if (emailType === 'broker-email'){
        this.form.get('sendPolicyDocsToBroker').enable();
        this.form.get('sendPaymentScheduleToBroker').enable();
      }
      else if  (emailType === 'admin-email'){
        this.form.get('sendPolicyDocsToAdmin').enable();
        this.form.get('sendPolicyDocsToMember').enable();
      }
      else if  (emailType === 'scheme-email'){
        this.form.get('sendPolicyDocsToScheme').enable();
      }
    }
  }
}
