import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MultipleContactListComponent } from 'projects/clientcare/src/app/client-manager/views/contact-list/multiple-contact-list.component';
import { ActionParameters } from 'projects/clientcare/src/app/client-manager/shared/Entities/action-parameters';
import { Contact } from 'projects/clientcare/src/app/client-manager/shared/Entities/contact';
import { ContactService } from 'projects/clientcare/src/app/client-manager/shared/services/contact.service';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { ItemType } from 'projects/clientcare/src/app/client-manager/shared/Enums/item-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ClientTypeEnum } from '../../../policy-manager/shared/enums/client-type-enum';


@Component({
  templateUrl: './contact-details.component.html',
  selector: 'contact-details'
})
export class ContactDetailsComponent extends DetailsComponent implements OnInit {
  actionParameters: ActionParameters;
  titles: Lookup[];
  contactTypes: Lookup[];
  itemId: number;
  action: string;
  contacts: any[];
  isAddMultiple: boolean;
  numberOfSelectedServiceTypes: number;
  hasContactType = false;
  @ViewChild(MultipleContactListComponent, { static: true })
  multipleContactListComponent: MultipleContactListComponent;
  contactTypeId: number;
  personTitleId: number;

  constructor(
    private readonly router: Router,
    private readonly breadcrumbService: BreadcrumbClientService,
    private readonly appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly contactDetailService: ContactService,
    private readonly lookupService: LookupService,
    private readonly clientService: ClientService,
    private readonly authService: AuthService,
  ) {

    super(appEventsManager, alertService, router, 'Contact detail', 'clientcare/client-manager/address-list', 1);
    this.contacts = [];
    this.setUserPermissions();
  }

  ngOnInit() {
    if (!this.isWizard) {
      this.breadcrumbService.setBreadcrumb('Contact Details');
    }
    if (this.isWizard) {
      this.createForm(0);
      this.getContactTypes();
      this.getPersonTitles();
      return;
    }

    this.getContactTypes();
    this.getPersonTitles();

    this.activatedRoute.params.subscribe((params: any) => {
      this.itemId = params.itemId;
      this.action = params.action;

      if (params.action === 'add') {
        this.actionParameters = new ActionParameters(params.id, params.action, params.itemId, params.linkType);
        this.createForm(params.id);
        this.checkIndividual(null);
        this.isAddMultiple = true;
        this.form.enable();
      } else if (params.action === 'edit') {
        this.loadingStart('Loading  details...');
        this.actionParameters = new ActionParameters(params.selectedId, params.action, params.itemId, params.linkType);
        this.createForm(params.id);
        this.getContactDetail(params.selectedId);
        this.isAddMultiple = false;
        this.form.disable();
      } else {
        throw new Error(`Incorrect action was specified '${params.action}', expected was: add or edit`);
      }
    });
  }

  setUserPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Contact');
    this.canEdit = userUtility.hasPermission('Edit Contact');
  }

  createForm(id: any): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      id,
      name: new UntypedFormControl('', [Validators.required]),
      title: new UntypedFormControl('', [Validators.required]),
      designation: new UntypedFormControl(),
      mobileNumber: new UntypedFormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(12)]),
      telephoneNumber: new UntypedFormControl('', [Validators.minLength(10), Validators.maxLength(12)]),
      email: new UntypedFormControl('', [Validators.email]),
      unsubscribe: new UntypedFormControl(),
      contactType: new UntypedFormControl(),
      serviceTypes: new UntypedFormControl('')
    });
  }

  setForm(contactDetail: Contact) {
    if (!this.form) { this.createForm(0); }
    if (contactDetail == null) { this.createForm(0); }

    this.form.patchValue({
      id: contactDetail.id ? contactDetail.id : 0,
      name: contactDetail.name ? contactDetail.name : '',
      title: contactDetail.personTitleId ? contactDetail.personTitleId : null,
      designation: contactDetail.designation ? contactDetail.designation : '',
      mobileNumber: contactDetail.mobileNumber ? contactDetail.mobileNumber : '',
      telephoneNumber: contactDetail.telephoneNumber ? contactDetail.telephoneNumber : '',
      email: contactDetail.email ? contactDetail.email : '',
      unsubscribe: contactDetail.unsubscribe,
      contactType: contactDetail.contactTypeId ? contactDetail.contactTypeId : 0,
      serviceTypes: contactDetail.serviceTypeIds ? contactDetail.serviceTypeIds : null
    });
    this.getDisplayName(contactDetail);
    this.checkIndividual(contactDetail.contactTypeId);
  }

  readForm(): Contact {
    const formModel = this.form.getRawValue();
    const contactDetail = new Contact();
    contactDetail.id = formModel.id as number;
    contactDetail.name = formModel.name as string;
    contactDetail.personTitleId = formModel.title as number;
    contactDetail.designation = '', // formModel.designation as string;
      contactDetail.mobileNumber = formModel.mobileNumber as string;
    contactDetail.telephoneNumber = formModel.telephoneNumber as string;
    contactDetail.email = formModel.email as string;
    contactDetail.unsubscribe = formModel.unsubscribe as boolean;
    contactDetail.contactTypeId = formModel.contactType; // this.hasContactType ? formModel.contactType as number : 0;
    const serviceTypeLookup = this.getLookupControl('ServiceType');
    contactDetail.serviceTypeIds = serviceTypeLookup.getSelectedItems();
    return contactDetail;
  }

  getNumberOfSelectedServiceTypes() {
    const serviceTypeLookup = this.getLookupControl('ServiceType');
    const serviceTypeIds = serviceTypeLookup.getSelectedItems();
    this.numberOfSelectedServiceTypes = serviceTypeIds.length;
  }

  getContactDetail(id: number): void {
    this.contactDetailService.getContact(id).subscribe(contactDetail => {
      this.setForm(contactDetail);
      this.loadingStop();
    });

    this.getNotes(id, ServiceTypeEnum.ClientManager, 'Contact');
    this.getAuditDetails(id, ServiceTypeEnum.ClientManager, ItemType.Contact);
  }

  save(): void {
    this.getNumberOfSelectedServiceTypes();
    if (this.numberOfSelectedServiceTypes === 0 || !this.form.valid) { return; }
    this.form.disable();

    const contactDetail = this.readForm();
    if (contactDetail) {
      contactDetail.itemId = this.itemId,
        contactDetail.itemType = 'Client',
        this.contacts.push(contactDetail);
    }


    this.loadingStart(`Saving ${contactDetail.name}...`);

    if (this.action === 'add' && (this.contacts.length >= 2)) {
      this.addMultipleContactDetails(this.contacts);

    } else if (this.action === 'add' && this.contacts.length === 1) {
      this.addContactDetail(this.contacts[0]);
    } else {
      this.editContactDetail(contactDetail);
    }
  }

  getContactTypes(): void {
    this.lookupService.getContactTypes().subscribe(
      data => {
        this.contactTypes = data;
      });
  }

  getPersonTitles(): void {
    this.lookupService.getTitles().subscribe(
      data => {
        this.titles = data;
      });
  }

  addMultipleContactDetails(contactDetail: Contact[]): void {
    this.contactDetailService.addMultipleContact(contactDetail).subscribe(contactId => {
      this.contacts = [];
      this.multipleContactListComponent.getData([]);
      this.done();
    });
  }

  addContactDetail(contactDetail: Contact): void {
    contactDetail.id = 0;
    this.contactDetailService.addContact(contactDetail).subscribe(contactId => {
      this.done();
    });
  }

  editContactDetail(contactDetail: Contact): void {
    console.log('contact', contactDetail);
    this.contactDetailService.editContact(contactDetail).subscribe(() => this.done());
  }

  done(): void {
    this.appEventsManager.loadingStop();
    const actionText = this.action === 'add' ? 'added' : 'updated';
    this.alertService.success(`Contact has been ${actionText} successfully`, 'Contact', true);
    this.back();
  }

  back(): void {
    const actionId = this.itemId ? this.itemId : this.actionParameters.linkId;
    this.router.navigate([`clientcare/client-manager/client-details/${actionId}/3`]);
  }

  addMultipleContacts(): void {
    if (!this.form.valid) { return; }
    this.form.markAsTouched();
    const contact = this.readForm();

    contact.itemId = this.itemId;
    contact.itemType = 'Client';

    this.contacts.push(contact);
    this.multipleContactListComponent.getData(this.contacts);

    this.form.patchValue({
      id: 0,
      name: '',
      title: 0,
      email: '',
      mobileNumber: '',
      telephoneNumber: '',
      designation: 0,
      serviceTypes: []
    });

    if (this.hasContactType) { this.form.patchValue({ contactType: 0 }); }
    this.form.clearValidators();
  }

  checkIndividual(value: number): void {
    if (!this.isWizard) {
      this.clientService.getClient(this.actionParameters.linkId).subscribe(client => {
        if (client.clientTypeId !== ClientTypeEnum.Individual) {
          this.createContactTypeControl(value);
        }
      });
    }
  }

  createContactTypeControl(value: number): void {
    this.form.addControl('contactType', new UntypedFormControl(value, [Validators.required]));
    this.contactTypeId = value;
    this.hasContactType = true;
  }
}
