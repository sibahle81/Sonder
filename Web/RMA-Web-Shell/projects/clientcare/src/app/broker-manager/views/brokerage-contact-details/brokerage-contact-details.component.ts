import { Component, ViewChild } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Validators, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { Brokerage } from '../../models/brokerage';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ContactTypeEnum } from '../../models/enums/contact-type.enum';
import { BrokerageContact } from '../../models/brokerage-contact';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { BrokerageContactDataSource } from '../../datasources/brokerage-contact.datasource';
import { BrokerageService } from '../../services/brokerage.service';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';
import { UserContact } from 'projects/admin/src/app/user-manager/views/member-portal/user-contact.model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BrokerageDialogComponent } from '../brokerage-dialog/brokerage-dialog.component';
import { BrokerageDialogMessage } from '../../models/brokerage-dialog-message';
import { UserProfileTypeEnum } from './../../../../../../shared-models-lib/src/lib/enums/user-profile-type-enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';

@Component({
  selector: 'brokerage-contact-details',
  templateUrl: './brokerage-contact-details.component.html',
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})
export class BrokerageContactDetailsComponent extends WizardDetailBaseComponent<Brokerage> {
  displayName: string;
  isNew = true;
  contactTypeId: number;
  brokerageId: number;
  brokerage: Brokerage;
  contactTypes: Lookup[];
  contacts: BrokerageContact[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  showContactForm = true;
  public menus: { title: string, disable: boolean, }[];
  brokerageDialogMessage: BrokerageDialogMessage;
  hideActionsLink: boolean = false;
  isEditContact = false;
  selectedItemRowIndex: number;

  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    private readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly confirmservice: ConfirmationDialogsService,
    public readonly dataSource: BrokerageContactDataSource,
    private readonly router: Router,
    private readonly brokerageService: BrokerageService,
    public dialog: MatDialog,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.getContactTypes();
  }

  populateModel(): void {
    this.model.contacts = this.dataSource.data;
      this.toggleContactForm();
  }

  populateForm(): void {
    if (this.model.contacts) {
      this.contacts = this.model.contacts;
    } else {
      this.contacts = [];
    }
    this.dataSource.getData(this.contacts);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (validationResult.valid) {
      if (this.model != null) {
        if (this.model.contacts === undefined || this.model.contacts.length === 0) {
          validationResult.errorMessages = ['No contact/s added'];
          validationResult.errors = 1;
        } else if (this.model.contacts.length < 2) {
          validationResult.errorMessages = ['There must be at least two contacts (principal/compliance officer and a contact person)'];
          validationResult.errors = 1;
        } else if (this.model.contacts.filter(x => (x.contactType === ContactTypeEnum.BrokerComplianceOfficer || x.contactType === ContactTypeEnum.FSBCompliance)).length < 1) {
          validationResult.errorMessages = ['Principal or compliance officer is missing'];
          validationResult.errors = 1;
        } else if (this.model.contacts.filter(x => x.contactType === ContactTypeEnum.BrokerContact).length < 1) {
          validationResult.errorMessages = ['Contact person is missing'];
          validationResult.errors = 1;
        }
      }
    }
    return validationResult;
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      id: [''],
      firstName: [''],
      lastName: [''],
      contactType: new UntypedFormControl(''),
      email: [''],
      telephoneNumber: [''],
      mobileNumber: [''],
      idPassportNumber: [''],
      dateOfBirth: ['']
    });
    this.dataSource.setControls(this.paginator, this.sort);
  }

  setFormValidators(): void {
    this.form.get('firstName').setValidators([Validators.required, Validators.minLength(3)]);
    this.form.get('firstName').updateValueAndValidity();

    this.form.get('lastName').setValidators([Validators.required, Validators.minLength(3)]);
    this.form.get('lastName').updateValueAndValidity();

    this.form.get('contactType').setValidators([Validators.required, Validators.minLength(1)]);
    this.form.get('contactType').updateValueAndValidity();

    this.form.get('email').setValidators([Validators.required, ValidateEmail]);
    this.form.get('email').updateValueAndValidity();

    this.form.get('telephoneNumber').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
    this.form.get('telephoneNumber').updateValueAndValidity();

    this.form.get('mobileNumber').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
    this.form.get('mobileNumber').updateValueAndValidity();

    this.form.get('idPassportNumber').setValidators([Validators.maxLength(13)]);
    this.form.get('idPassportNumber').updateValueAndValidity();
  }

  resetFormValidators(): void {
    this.form.get('firstName').setValidators([]);
    this.form.get('firstName').updateValueAndValidity();

    this.form.get('lastName').setValidators([]);
    this.form.get('lastName').updateValueAndValidity();

    this.form.get('contactType').setValidators([]);
    this.form.get('contactType').updateValueAndValidity();

    this.form.get('email').setValidators([]);
    this.form.get('email').updateValueAndValidity();

    this.form.get('telephoneNumber').setValidators([]);
    this.form.get('telephoneNumber').updateValueAndValidity();

    this.form.get('mobileNumber').setValidators([]);
    this.form.get('mobileNumber').updateValueAndValidity();

    this.form.get('idPassportNumber').setValidators([]);
    this.form.get('idPassportNumber').updateValueAndValidity();
  }

  disable(): void {
    this.isDisabled = true;
    this.form.disable(); 
  }

  enable(): void {
    this.isDisabled = false;
    this.form.enable();
  }

  getContactTypes(): void {
    this.lookupService.getContactTypes().subscribe(
      data => {
        this.contactTypes = data.filter(d => d.id === ContactTypeEnum.FSBCompliance || d.id === ContactTypeEnum.BrokerContact ||
          d.id === ContactTypeEnum.BrokerComplianceOfficer);
      });
  }

  getContactTypeDesc(id: number): string {
    switch (id) {
      case ContactTypeEnum.BrokerContact: // if you want to change this talk to me (jvz) 25.11.2019
        return 'Broker Contact';
      case ContactTypeEnum.FSBCompliance:
        return 'FSB Compliance';
      case ContactTypeEnum.BrokerComplianceOfficer:
        return 'Broker Compliance Officer';
      default:
        return '';
    }
  }

  onDelete(rowIndex: number): void {
    this.confirmservice.confirmWithoutContainer('Delete Contact', ' Are you sure you want to delete this contact?',
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            this.contacts.splice(rowIndex, 1);
            this.dataSource.getData(this.contacts);
          }
        });
  }

  onEdit(item: any, rowIndex: number): void {
    this.toggleContactForm();
    this.selectedItemRowIndex = rowIndex;
    this.isEditContact = true;    

    this.form.patchValue({
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      contactType: item.contactType,
      email: item.email,
      telephoneNumber: item.telephoneNumber,
      mobileNumber: item.mobileNumber,
      idPassportNumber: item.idNumber,
      dateOfBirth: item.dateOfBirth
    });
  }

  onSaveEditedContact(): void {    
    this.setFormValidators();
    this.form.markAllAsTouched();

    if (this.form.valid) {
      const contact = this.readContactForm();
      this.contacts = this.dataSource.data;
      this.contacts[this.selectedItemRowIndex] = contact;
      this.dataSource.getData(this.contacts);   
      
      this.toggleContactForm();
    }    
  }

  cancelEditedContact() {
    this.toggleContactForm();
  }

  onRemove(item: any, rowIndex: number): void {
    this.confirmservice.confirmWithoutContainer('Remove Contact', ' Are you sure you want to remove this contact?',
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            this.contacts.splice(rowIndex, 1);
            this.dataSource.getData(this.contacts);
          }
        });
  }

  toggleContactForm() {

    if (this.showContactForm) {
      this.form.get('firstName').enable();
      this.form.get('lastName').enable();
      this.form.get('email').enable();
      this.form.get('mobileNumber').enable();
      this.form.get('telephoneNumber').enable();
      this.form.get('contactType').enable();
      this.form.get('dateOfBirth').enable()
      this.form.get('idPassportNumber').enable();

      this.form.reset();

    } else {
      this.form.get('firstName').disable();
      this.form.get('lastName').disable();
      this.form.get('email').disable();
      this.form.get('mobileNumber').disable();
      this.form.get('telephoneNumber').disable();
      this.form.get('contactType').disable();
      this.form.get('dateOfBirth').disable();
      this.form.get('idPassportNumber').disable();      
    }

    this.resetFormValidators();
    this.resetEditContactForm();
  }

  resetEditContactForm() {
    this.isEditContact = false;
    this.selectedItemRowIndex = -1;
  }

  readContactForm() {
    const formModel = this.form.getRawValue();
    const contact = new BrokerageContact();
    contact.id = formModel.id === '' || formModel.id === null || formModel.id === undefined ? 0 : formModel.id as number;
    contact.brokerageId = this.model.id;
    contact.email = formModel.email;
    contact.telephoneNumber = formModel.telephoneNumber;
    contact.mobileNumber = formModel.mobileNumber;
    contact.contactType = this.contactTypeId;
    contact.firstName = formModel.firstName;
    contact.lastName = formModel.lastName;
    contact.idNumber = formModel.idPassportNumber;
    contact.dateOfBirth = formModel.dateOfBirth;
    return contact;
  }

  addContact() {
    this.setFormValidators();
    this.form.markAllAsTouched();

    if (this.form.valid) {
      const contact = this.readContactForm();
      this.contacts = this.dataSource.data;
      this.contacts.unshift(contact);
      this.dataSource.getData(this.contacts);

      this.toggleContactForm();
    }
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'First Name', def: 'firstName', show: true },
      { display: 'Last Name', def: 'lastName', show: true },
      { display: 'ID/Passport Number', def: 'idNumber', show: true},
      { display: 'Date Of Birth', def: 'dateOfBirth', show: true},
      { display: 'Telephone', def: 'telephoneNumber', show: true },
      { display: 'Mobile', def: 'mobileNumber', show: true },
      { display: 'Email', def: 'email', show: true },
      { display: 'Contact Type', def: 'contactType', show: true },
      { display: 'Actions', def: 'actions', show: true}
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }  

  openAuditDialog(account: BrokerageContact) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.BrokerageManager,
        clientItemType: BrokerItemTypeEnum.BrokerageContact,
        itemId: account.id,
        heading: 'Brokerage Contact Details Audit',
        propertiesToDisplay: [ 
          'Id', 'BrokerageId', 'FirstName', 'LastName', 'IdNumber', 'IdType', 'ContactType', 'Email', 'TelephoneNumber', 'MobileNumber', 'IsDeleted',
           'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate' 
        ]
      }
    });
  }

  back() {
    this.router.navigateByUrl('clientcare/broker-manager');
  }
}