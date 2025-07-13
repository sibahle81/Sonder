import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';
import { ValidatePhoneNumber } from 'src/app/shared-utilities/validators/phone-number.validator';
import { CommunicationTypeEnum } from 'src/app/shared/enums/communication-type.enum';
import { ContactDesignationTypeEnum } from 'src/app/shared/enums/contact-designation-type-enum';
import { ContactInformationTypeEnum } from 'src/app/shared/enums/contact-information-type-enum';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'src/app/shared/enums/document-system-name-enum';
import { TitleEnum } from 'src/app/shared/enums/title-enum';
import { RolePlayerContact } from 'src/app/shared/models/roleplayer-contact';
import { RolePlayerContactInformation } from 'src/app/shared/models/roleplayer-contact-information';
import { MemberService } from 'src/app/shared/services/member.service';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { DocumentUploaderDialogComponent } from '../../dialog/dialogs/document-uploader-dialog/document-uploader-dialog.component';

@Component({
  selector: 'member-contact-details',
  templateUrl: './member-contact-details.component.html',
  styleUrls: ['./member-contact-details.component.css']
})
export class MemberContactDetailsComponent implements OnChanges {

  @Input() contact: RolePlayerContact;
  originalContact: RolePlayerContact;

  // optional
  @Input() isViewOnly = false;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  // optional inputs to filter the dropdowns
  @Input() filteredCommunicationTypes = [CommunicationTypeEnum.Email, CommunicationTypeEnum.Phone, CommunicationTypeEnum.Post, CommunicationTypeEnum.SMS];
  @Input() filteredInformationTypes = [ContactInformationTypeEnum.Claims, ContactInformationTypeEnum.Declarations, ContactInformationTypeEnum.Invoices, ContactInformationTypeEnum.PolicyInformation];
  @Input() filteredDesignationTypes =
    [ContactDesignationTypeEnum.Payroll, ContactDesignationTypeEnum.HR, ContactDesignationTypeEnum.Accounts, ContactDesignationTypeEnum.PrimaryContact,
    ContactDesignationTypeEnum.AccountExecutive, ContactDesignationTypeEnum.Director];

  @Output() emitContact: EventEmitter<RolePlayerContact> = new EventEmitter();
  @Output() closeContactDetails: EventEmitter<boolean> = new EventEmitter();
  @Output() reloadContacts: EventEmitter<boolean> = new EventEmitter();
  @Output() contactEditedEmit: EventEmitter<boolean> = new EventEmitter();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: FormGroup;
  viewOnly = false;

  isConfirmed$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  titles: TitleEnum[] = [];
  communicationTypes: CommunicationTypeEnum[] = [];
  contactDesignationTypes: ContactDesignationTypeEnum[] = [];
  contactInformationTypes: ContactInformationTypeEnum[] = [];
  contextTypes = [];

  allRequiredDocumentsUploaded = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly rolePlayerService: RolePlayerService,
    private readonly memberService: MemberService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.contact) {

      // ensures that a copy is made and not an object with reference to this.contact
      this.originalContact = JSON.parse(JSON.stringify(this.contact)) as RolePlayerContact;

      this.getLookups();
      this.createForm();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      isConfirmed: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      title: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      firstName: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      surname: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      communicationType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      contactDesignationType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      contactInformationType: [{ value: null, disabled: this.isReadOnly }],
      emailAddress: [{ value: null, disabled: this.isReadOnly }],
      contactNumber: [{ value: null, disabled: this.isReadOnly }]
    });


    if (this.isViewOnly) {
      this.viewDetail(this.contact);
    } else {
      this.showForm(this.contact);
      this.autoSelectContactDesignationOption();
      this.autoSelectContactInformationTypeOption();
    }
  }

  getLookups() {
    this.titles = this.ToArray(TitleEnum);
    this.communicationTypes = this.ToArray(CommunicationTypeEnum);
    this.communicationTypes = this.communicationTypes.filter(a => this.filteredCommunicationTypes.includes(+CommunicationTypeEnum[a]));
    this.contactDesignationTypes = this.ToArray(ContactDesignationTypeEnum);
    this.contactDesignationTypes = this.contactDesignationTypes.filter(a => this.filteredDesignationTypes.includes(+ContactDesignationTypeEnum[a]));
    this.contactInformationTypes = this.ToArray(ContactInformationTypeEnum);
    this.contactInformationTypes = this.contactInformationTypes.filter(a => this.filteredInformationTypes.includes(+ContactInformationTypeEnum[a]));

    this.isLoading$.next(false);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    if (!lookup) { return; }
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  viewDetail(rolePlayerContact: RolePlayerContact) {
    this.setForm(rolePlayerContact);
    this.disableFormControl('title');
    this.disableFormControl('firstName');
    this.disableFormControl('surname');
    this.disableFormControl('communicationType');
    this.disableFormControl('contactDesignationType');
    this.disableFormControl('emailAddress');
    this.disableFormControl('contactNumber');
    this.disableFormControl('contactInformationType');
    this.disableFormControl('isConfirmed');
  }

  showForm(rolePlayerContact: RolePlayerContact) {
    if (rolePlayerContact) {
      this.setForm(rolePlayerContact);
    }
    this.enableFormControl('title');
    this.enableFormControl('firstName');
    this.enableFormControl('surname');
    this.enableFormControl('communicationType');
    this.enableFormControl('contactDesignationType');
    this.enableFormControl('emailAddress');
    this.enableFormControl('contactNumber');
    this.enableFormControl('contactInformationType');
    this.enableFormControl('isConfirmed');
  }

  setForm(rolePlayerContact: RolePlayerContact) {
    const contexts = [];
    rolePlayerContact?.rolePlayerContactInformations?.forEach(s => {
      contexts.push(ContactInformationTypeEnum[s.contactInformationType]);
    });

    this.form.patchValue({
      title: TitleEnum[rolePlayerContact.title],
      firstName: rolePlayerContact.firstname,
      surname: rolePlayerContact.surname,
      communicationType: CommunicationTypeEnum[rolePlayerContact.communicationType],
      contactDesignationType: ContactDesignationTypeEnum[rolePlayerContact.contactDesignationType],
      contactInformationType: contexts,
      emailAddress: rolePlayerContact.emailAddress,
      contactNumber: rolePlayerContact.contactNumber,
    });
  }

  autoSelectContactDesignationOption() {
    if (this.contactDesignationTypes.length === 1) {
      this.form.patchValue({
        contactDesignationType: this.contactDesignationTypes[0]
      });
      this.form.get('contactDesignationType').disable();
    } else {
      this.form.get('contactDesignationType').enable();
    }
  }

  autoSelectContactInformationTypeOption() {
    if (this.contactInformationTypes.length === 1) {
      this.form.patchValue({
        contactInformationType: [this.contactInformationTypes[0]]
      });
      this.form.get('contactInformationType').disable();
    } else {
      this.form.get('contactInformationType').enable();
    }
  }

  addContextTypes() {
    this.contextTypes = [];
    const contexts = this.form.controls.contactInformationType.value;
    if (contexts !== '') {
      contexts?.forEach(context => {
        this.contextTypes.push(ContactInformationTypeEnum[context]);
      });
    }
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  cancel() {
    this.closeContactDetails.emit(false);
  }

  checkKYC() {
    this.readForm();
    this.save();
  }

  openDocumentUploaderDialog() {
    const dialogRef = this.dialog.open(DocumentUploaderDialogComponent, {
      width: '70%',
      data: {
        title: 'Documents Required (K.Y.C): Directors Information Changed',
        documentSystemName: DocumentSystemNameEnum.MemberManager,
        documentSet: DocumentSetEnum.MemberDocumentSet,
        keyName: 'MemberId',
        keyValue: this.contact.rolePlayerId && this.contact.rolePlayerId > 0 ? this.contact.rolePlayerId : null,
        documentTypeFilter: [DocumentSetEnum.LetterheadConfirmingDetails],
        forceRequiredDocumentTypeFilter: [DocumentSetEnum.LetterheadConfirmingDetails]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.allRequiredDocumentsUploaded = result;
      if (this.allRequiredDocumentsUploaded) {
        this.save();
      } else {
        this.contact = this.originalContact;
        this.reloadContacts.emit(false);
      }
    });
  }

  save() {
    this.isLoading$.next(true);
    this.emitContact.emit(this.contact);
    this.closeContactDetails.emit(false);
    this.isLoading$.next(false);
  }

  readForm() {
    this.contact.title = +TitleEnum[this.form.controls.title.value];
    this.contact.firstname = this.form.controls.firstName.value;
    this.contact.surname = this.form.controls.surname.value;
    this.contact.communicationType = +CommunicationTypeEnum[this.form.controls.communicationType.value];
    this.contact.contactDesignationType = +ContactDesignationTypeEnum[this.form.controls.contactDesignationType.value];
    this.contact.emailAddress = this.form.controls.emailAddress.value;
    this.contact.contactNumber = this.form.controls.contactNumber.value;
    this.contact.rolePlayerId = this.contact.rolePlayerId > 0 ? this.contact.rolePlayerId : 0
    this.addContextTypes();
    this.deleteContactInformation(this.contact);
    this.addContactInformation(this.contact);
  }

  deleteContactInformation(rolePlayerContact: RolePlayerContact) {
    const contactInformation = rolePlayerContact.rolePlayerContactInformations.filter(info => !this.contextTypes.includes(info.contactInformationType));
    if (contactInformation.length > 0) {
      contactInformation.forEach(contactInfo => {
        rolePlayerContact.rolePlayerContactInformations.splice(rolePlayerContact.rolePlayerContactInformations.indexOf(contactInfo), 1);
        if (contactInfo.rolePlayerContactInformationId > 0) {
          this.memberService.deleteContactInformation(contactInfo.rolePlayerContactInformationId).subscribe();
        }
      });
    }
  }

  addContactInformation(rolePlayerContact: RolePlayerContact) {
    this.contextTypes.forEach(contextType => {
      const index = rolePlayerContact.rolePlayerContactInformations.findIndex(info => info.contactInformationType == contextType);
      if (index === -1) {
        const rolePlayerContactInformation = new RolePlayerContactInformation();
        rolePlayerContactInformation.rolePlayerContactInformationId = 0;
        rolePlayerContactInformation.rolePlayerContactId = rolePlayerContact.rolePlayerContactId ? rolePlayerContact.rolePlayerContactId : 0;
        rolePlayerContactInformation.contactInformationType = contextType;
        rolePlayerContact.rolePlayerContactInformations.push(rolePlayerContactInformation);
      }
    });
  }

  edit(rolePlayerContact: RolePlayerContact) {
    this.rolePlayerService.updateRolePlayerContact(rolePlayerContact).subscribe(result => {
      this.resetForm();
      this.contactEditedEmit.emit(true);
    });
  }

  add(rolePlayerContact: RolePlayerContact) {
    this.rolePlayerService.addRolePlayerContact(rolePlayerContact).subscribe(result => {
      this.resetForm();
      this.contactEditedEmit.emit(true);
    });
  }

  communicationTypeChanged($event: any) {
    const communicationType = +CommunicationTypeEnum[$event.value];
    switch (communicationType) {
      case CommunicationTypeEnum.Email:
        this.applyControlValidation([Validators.required, ValidateEmail], 'emailAddress');
        this.clearControlValidation('contactNumber');
        break;
      case CommunicationTypeEnum.Phone:
        this.applyControlValidation([Validators.required, ValidatePhoneNumber], 'contactNumber');
        this.clearControlValidation('emailAddress');
        break;
      case CommunicationTypeEnum.Post:
        this.applyControlValidation([Validators.required, ValidateEmail], 'emailAddress');
        this.clearControlValidation('contactNumber');
        break;
      case CommunicationTypeEnum.SMS:
        this.applyControlValidation([Validators.required, ValidatePhoneNumber], 'contactNumber');
        this.clearControlValidation('emailAddress');
        break;
    }
  }

  clearControlValidation(controlName: string) {
    this.form.get(controlName).clearValidators();
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  applyControlValidation(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators(validationToApply);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  resetForm() {
    this.isLoading$.next(false);
    this.reloadContacts.emit(false);
  }

  getContactDesignationType(contactDesignationType: string): string {
    if (!contactDesignationType) { return; }
    return contactDesignationType.replace(/([a-z]+)([A-Z])/g, '$1 $2').trim();
  }
}
