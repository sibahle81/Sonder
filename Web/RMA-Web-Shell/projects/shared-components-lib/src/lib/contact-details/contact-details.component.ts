import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { RolePlayerContactInformation } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact-information';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { BehaviorSubject } from 'rxjs';
import 'src/app/shared/extensions/date.extensions';

@Component({
  selector: 'contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})


export class ContactDetailsComponent implements OnInit {
  rolePlayerContact: RolePlayerContact;
  form: UntypedFormGroup;
  communicationTypes: Lookup[];
  titles: Lookup[];
  contactDesignations: Lookup[] = [];
  contactInformationTypes: Lookup[] = [];
  isClaim: boolean;
  title: string;
  selectedCommunicationType: CommunicationTypeEnum;
  selectedContactDesignationType: ContactDesignationTypeEnum;
  selectedTitle: TitleEnum;
  requiredClass = 'mat-label other-label mandatory-field';
  notRequiredClass = 'mat-label other-label';
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  defaultContactDesignation: number;
  defaultContactContext: number;

  constructor(
    public dialogRef: MatDialogRef<ContactDetailsComponent>,
    public alertService: AlertService,
    public lookUpService: LookupService,
    public rolePlayerService: RolePlayerService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.roleplayerContact) {
      this.rolePlayerContact = data.roleplayerContact;
      if (this.rolePlayerContact.rolePlayerContactId !== 0) {
        if (data.menu === 'edit') {
         this.title = 'Edit Contact';
        } else if (data.menu === 'view') {
          this.title = 'View Contact';
        } else {
          this.title = 'Add Contact';
        }
      } else {
        this.title = 'Add Contact';
      }
    }
    if (data.isClaim) {
      this.isClaim = data.isClaim;
    }
  }

  ngOnInit() {
    this.createForm();
    this.getLookups();
    this.patchForm();
    if (this.data.menu === 'edit') {
      this.enableFormFields();
    } else if (this.data.menu === 'view') {
      this.disableFormFields();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      roleplayerContactId: new UntypedFormControl(''),
      roleplayerId: new UntypedFormControl(''),
      title: new UntypedFormControl('', [Validators.required]),
      firstName: new UntypedFormControl('', [Validators.required]),
      surname: new UntypedFormControl('', [Validators.required]),
      communicationType: new UntypedFormControl('', [Validators.required]),
      contactDesignationType: new UntypedFormControl('', [Validators.required]),
      contactInformationType: new UntypedFormControl(),
      emailAddress: new UntypedFormControl(''),
      telephone: new UntypedFormControl(''),
      contactNumber: new UntypedFormControl('', [Validators.required, ValidatePhoneNumber, Validators.maxLength(10)]),
    });
  }

  patchForm() {
    this.getLookups();
    if (this.rolePlayerContact) {
      this.form.patchValue({
        roleplayerContactId: this.rolePlayerContact.rolePlayerContactId,
        roleplayerId: this.rolePlayerContact.rolePlayerId,
        title: this.rolePlayerContact.title,
        firstName: this.rolePlayerContact.firstname,
        surname: this.rolePlayerContact.surname,
        emailAddress: this.rolePlayerContact.emailAddress,
        telephone: this.rolePlayerContact.telephoneNumber,
        contactNumber: this.rolePlayerContact.contactNumber,
        communicationType: this.rolePlayerContact.communicationType,
        contactDesignationType: this.rolePlayerContact.contactDesignationType
      });
      this.selectedTitle = this.rolePlayerContact.title ? this.rolePlayerContact.title : null;
      this.selectedCommunicationType = this.rolePlayerContact.communicationType ? this.rolePlayerContact.communicationType : null;
      this.selectedContactDesignationType = this.rolePlayerContact.contactDesignationType ? this.rolePlayerContact.contactDesignationType : null;
    }
  }

  disableFormFields() {
    this.disableFormControl('title');
    this.disableFormControl('firstName');
    this.disableFormControl('surname');
    this.disableFormControl('emailAddress');
    this.disableFormControl('telephone');
    this.disableFormControl('contactNumber');
    this.disableFormControl('communicationType');
    this.disableFormControl('contactDesignationType');
  }

  enableFormFields() {
    this.enableFormControl('title');
    this.enableFormControl('firstName');
    this.enableFormControl('surname');
    this.enableFormControl('emailAddress');
    this.enableFormControl('telephone');
    this.enableFormControl('contactNumber');
    this.enableFormControl('communicationType');
    this.enableFormControl('contactDesignationType');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }



  readForm() {
    this.rolePlayerContact = this.rolePlayerContact ? this.rolePlayerContact : new RolePlayerContact();
    this.rolePlayerContact.rolePlayerContactId = this.form.controls.roleplayerContactId.value ? this.form.controls.roleplayerContactId.value : 0;
    this.rolePlayerContact.rolePlayerId = this.form.controls.roleplayerId.value ? this.form.controls.roleplayerId.value : 0;
    this.rolePlayerContact.title = this.selectedTitle;
    this.rolePlayerContact.firstname = this.form.controls.firstName.value;
    this.rolePlayerContact.surname = this.form.controls.surname.value;
    this.rolePlayerContact.emailAddress = this.form.controls.emailAddress.value;
    this.rolePlayerContact.telephoneNumber = this.form.controls.telephone.value;
    this.rolePlayerContact.contactNumber = this.form.controls.contactNumber.value;
    this.rolePlayerContact.communicationType = this.selectedCommunicationType;
    this.rolePlayerContact.contactDesignationType = this.selectedContactDesignationType;

    if (this.isClaim) {
      if (this.rolePlayerContact.rolePlayerContactInformations.length === 0) {
        const currentdate = new Date().getCorrectUCTDate();
        const contactInformation = new RolePlayerContactInformation();
        contactInformation.rolePlayerContactInformationId = 0;
        contactInformation.contactInformationType = ContactInformationTypeEnum.Claims;
        contactInformation.rolePlayerContactId = this.form.controls.roleplayerContactId.value ? this.form.controls.roleplayerContactId.value : 0;
        this.rolePlayerContact.rolePlayerContactInformations.push(contactInformation);
      }
    } else if (this.form.controls.contactInformationType.value) {
      this.form.controls.contactInformationType.value.forEach((item: ContactInformationTypeEnum) => {
        const currentdate = new Date().getCorrectUCTDate();
        const contactInformation = new RolePlayerContactInformation();
        contactInformation.rolePlayerContactInformationId = 0;
        contactInformation.contactInformationType = item;
        contactInformation.rolePlayerContactId = this.form.controls.roleplayerContactId.value ? this.form.controls.roleplayerContactId.value : 0;


        this.rolePlayerContact.rolePlayerContactInformations.push(contactInformation);
      });
    }
  }

  getLookups() {
    this.loadTitles();
    this.loadCommunicationTypes();
    this.loadContactDesignationTypes();
    this.loadContactInformationTypes();
  }

  loadTitles(): void {
    this.lookUpService.getTitles().subscribe(data => {
      this.titles = data;
    });
  }

  loadCommunicationTypes(): void {
    this.lookUpService.getCommunicationTypes().subscribe(data => {
      if (this.router.url.includes('claim-manager')) {
        const comTypes = new Array();
        comTypes.push(data.find(a => a.id === CommunicationTypeEnum.Email));
        comTypes.push(data.find(a => a.id === CommunicationTypeEnum.SMS));
        this.communicationTypes = comTypes;
      } else {
        this.communicationTypes = data;
      }
    });
  }

  loadContactDesignationTypes(): void {
    this.lookUpService.getContactDesignationType().subscribe(data => {
      this.contactDesignations = data;
      if(this.isClaim)
      {
        this.setDefaultValueContactDesignation(data);
      }
    });
  }

  loadContactInformationTypes(): void {
    this.lookUpService.getContactInformationType().subscribe(data => {
      this.contactInformationTypes = data;
      if(this.isClaim)
      {
        this.setDefaultValueContactContext(data);
      }
    });
  }

  setDefaultValueContactContext(data: Lookup[])
  {
    this.defaultContactContext = data[0].id;
  }

  setDefaultValueContactDesignation(data: Lookup[])
  {
    this.defaultContactDesignation = data[0].id;
  }

  communictionTypeChanged(value: any) {
    const lblEmail = document.getElementById('lblEmail');
    const type = value.value ? value.value : value;
    this.selectedCommunicationType = CommunicationTypeEnum[type] as unknown as number;
    this.form.get('emailAddress').clearValidators();
    if (value.value === CommunicationTypeEnum.Email) {
      this.form.get('emailAddress').setValidators([Validators.required, Validators.email]);
      this.form.get('emailAddress').updateValueAndValidity();
      lblEmail.className = this.requiredClass;
    } else {
      this.form.get('emailAddress').clearValidators();
      lblEmail.className = this.notRequiredClass;
    }
  }

  contactDesignationTypeChanged(value: any) {
    const type = value.value ? value.value : value;
    this.selectedContactDesignationType = ContactDesignationTypeEnum[type] as unknown as number;
  }

  titleChanged(value: any) {
    const type = value.value ? value.value : value;
    this.selectedTitle = TitleEnum[type] as unknown as number;
  }


  save() {
    this.isSaving$.next(true);
    this.readForm();
    if (this.rolePlayerContact.rolePlayerContactId !== 0) {
      this.rolePlayerService.updateRolePlayerContact(this.rolePlayerContact).subscribe(result => {
        this.isSaving$.next(false);
        this.dialogRef.close(result);
      });
    } else {
      this.rolePlayerService.addRolePlayerContact(this.rolePlayerContact).subscribe(result => {
        this.isSaving$.next(false);
        this.dialogRef.close(result);
      });
    }
    // this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

  enableTellValidation() {
    this.form.get('telephone').setValidators([ValidatePhoneNumber, Validators.maxLength(10)]);
    this.form.get('telephone').updateValueAndValidity();
  }
}
