import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { LeadContact } from 'projects/clientcare/src/app/lead-manager/models/lead-contact';
import { Component, OnInit, OnChanges, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from '../../../shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { LeadItemTypeEnum } from '../../../broker-manager/models/enums/lead-item-type.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'lead-contacts',
  templateUrl: './lead-contacts.component.html',
  styleUrls: ['./lead-contacts.component.css']
})
export class LeadContactsComponent implements OnInit, OnChanges {

  @Input() lead: Lead = new Lead();
  @Input() isWizard = false;
  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  form: FormGroup;

  communicationTypes: any[] = []; // any[] because of enum

  contact: LeadContact;
  contacts: LeadContact[] = [];
  hideForm = true;
  currentUser: string;
  selectedCommunicationTypeId: number;
  isContactNumber: boolean;

  requiredPermission = 'Manage Lead';
  hasPermission: boolean;

  isValid = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    this.createForm();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.contacts = this.lead.contacts;
  }

  createForm() {
    this.form = this.formBuilder.group({
      id: new FormControl(0),
      name: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      communicationType: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      communicationTypeValue: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      isPreffered: [{ value: false, disabled: !this.hasPermission || this.isWizard }],
    });
  }

  readForm() {
    this.contact = this.contact ? this.contact : new LeadContact();
    this.contact.contactId = this.form.controls.id.value ? this.form.controls.id.value : 0;
    this.contact.name = this.form.controls.name.value;
    this.contact.communicationTypeId = this.selectedCommunicationTypeId;
    this.contact.communicationTypeValue = this.form.controls.communicationTypeValue.value;
    this.contact.isPreferred = this.contacts.length === 0 ? true : this.form.controls.isPreffered.value;
  }

  patchForm() {
    if (this.contact) {
      this.form.patchValue({
        id: this.contact.contactId ? this.contact.contactId : 0,
        name: this.contact.name,
        communicationType: CommunicationTypeEnum[this.contact.communicationTypeId],
        communicationTypeValue: this.contact.communicationTypeValue,
        isPreffered: this.contact.isPreferred
      });
      this.selectedCommunicationTypeId = this.contact.communicationTypeId;
      this.communictionTypeChanged(CommunicationTypeEnum[this.selectedCommunicationTypeId]);
      if (this.selectedCommunicationTypeId !== CommunicationTypeEnum.Email && this.selectedCommunicationTypeId !== CommunicationTypeEnum.Post) {
        this.isContactNumber = true;
      }
    }
  }

  delete(contact: LeadContact) {
    const index = this.contacts.findIndex(s => s === contact);
    this.contacts.splice(index, 1);
    this.validateContacts();
  }

  disableForm() {
    this.disableFormControl('name');
    this.disableFormControl('communicationType');
    this.disableFormControl('communicationTypeValue');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  toggleContact(contact: LeadContact) {
    this.contact = contact;
    this.patchForm();
    this.toggle();
  }

  toggleContactForAdd(contact: LeadContact) {
    this.contact = contact;
    this.patchForm();
    this.toggle();
    this.resetForAdd();
  }

  toggle() {
    this.hideForm = !this.hideForm;
  }

  communictionTypeChanged(value: any) {
    const type = value.value ? value.value : value;
    this.selectedCommunicationTypeId = CommunicationTypeEnum[type] as unknown as number;
    this.form.get('communicationTypeValue').clearValidators();
    if (this.selectedCommunicationTypeId === CommunicationTypeEnum.Email) {
      this.form.get('communicationTypeValue').setValidators([Validators.required, Validators.email]);
      this.isContactNumber = false;
    } else if (this.selectedCommunicationTypeId === CommunicationTypeEnum.Post) {
      this.form.get('communicationTypeValue').setValidators([Validators.required]);
      this.isContactNumber = false;
    } else {
      this.form.get('communicationTypeValue').setValidators([Validators.required, ValidatePhoneNumber, Validators.maxLength(10)]);
      this.isContactNumber = true;
    }
    this.form.get('communicationTypeValue').updateValueAndValidity();
  }

  add() {
    this.toggle();
    this.readForm();

    const isPreferred = this.contact.isPreferred;

    if (this.contact.isPreferred) {
      this.contacts.forEach(s => {
        s.isPreferred = false;
      });
    }

    if (this.contact.contactId <= 0) {
      this.contacts.push(this.contact);
      this.lead.contacts = this.contacts;
    } else {
      const index = this.contacts.findIndex(s => s.contactId === this.contact.contactId);
      this.contact.isPreferred = isPreferred;
      this.contacts[index] = this.contact;
      this.lead.contacts = this.contacts;
    }

    this.contacts.sort((a, b) => {
      if (a.name > b.name) { return 1; }
      if (a.name < b.name) { return -1; }
      return 0;
    });

    this.isPristineEmit.emit(false);
    this.reset();
    this.validateContacts();
  }

  cancel() {
    this.toggle();
    this.reset();
  }

  reset() {
    this.form.controls.id.reset();
    this.form.controls.name.reset();
    this.form.controls.communicationType.reset();
    this.form.controls.communicationTypeValue.reset();
    this.form.controls.isPreffered.reset();
    this.enableFormControl('name');
  }

  resetForAdd() {
    this.contact = new LeadContact();
    this.form.controls.id.reset();
    this.form.controls.communicationType.reset();
    this.form.controls.communicationTypeValue.reset();
    this.form.controls.isPreffered.reset(false);
    this.disableFormControl('name');
  }

  getLookups() {
    this.communicationTypes = this.ToArray(CommunicationTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  validateContacts() {
    this.isValid =  this.lead.contacts && this.lead.contacts.length > 0 && this.lead.contacts.some(s => s.communicationTypeId == CommunicationTypeEnum.Email);
    this.isValidEmit.emit(this.isValid);
  }

  openAuditDialog(contact: LeadContact) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Contact,
        itemId: contact.contactId,
        heading: 'Contact Details Audit',
        propertiesToDisplay: ['Name', 'CommunicationType', 'CommunicationTypeValue', 'IsPreferred',
        'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate']
      }
    });
  }
}
