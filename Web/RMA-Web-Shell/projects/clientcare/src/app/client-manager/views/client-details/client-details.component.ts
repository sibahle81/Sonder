import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { BankAccountListComponent } from 'projects/clientcare/src/app/client-manager/views/bank-account-list/bank-account-list.component';
import { ClientAddressListComponent } from 'projects/clientcare/src/app/client-manager/views/client-address-list/client-address-list.component';
import { ClientSubsidiaryListComponent } from 'projects/clientcare/src/app/client-manager/views/client-subsidiary-list/client-subsidiary-list.component';
import { ContactListComponent } from 'projects/clientcare/src/app/client-manager/views/contact-list/contact-list.component';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';

import { ClientAffinityComponent } from 'projects/clientcare/src/app/client-manager/views/client-details/client-affinity.component';
import { ClientCompanyComponent } from 'projects/clientcare/src/app/client-manager/views/client-details/client-company.component';
import { ClientDetailsBase } from 'projects/clientcare/src/app/client-manager/views/client-details/client-details.base';
import { ClientIndividualComponent } from 'projects/clientcare/src/app/client-manager/views/client-details/client-individual.component';
import { ClientGroupIndividualComponent } from 'projects/clientcare/src/app/client-manager/views/client-details/client-group-individual.component';
import { NotesComponent } from 'projects/shared-components-lib/src/lib/notes/notes.component';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { LastModifiedByComponent } from 'projects/shared-components-lib/src/lib/last-modified-by/last-modified-by.component';
import { UserPreferences } from 'projects/shared-models-lib/src/lib/security/user-preferences';
import { UserPreferenceService } from 'projects/shared-services-lib/src/lib/services/userpreferenceservice/userpreferenceservice.service';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { ItemType } from 'projects/clientcare/src/app/client-manager/shared/Enums/item-type.enum';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { Subscription } from 'rxjs';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './client-details.component.html',
  // tslint:disable-next-line: component-selector
  selector: 'client-details'
})
export class ClientDetailsComponent implements AfterViewInit {

  constructor(
    private readonly location: Location,
    private readonly breadcrumbService: BreadcrumbClientService,
    private readonly clientService: ClientService,
    private readonly appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userPreferenceService: UserPreferenceService) {

  }

  get pristine(): boolean {
    const clientControl = this.getSelectedClientControl();
    if (!clientControl) { return true; }
    return clientControl.form.pristine;
  }

  get isNotCompany(): boolean {
    if (!this.client) { return true; }
    return this.client.clientTypeId !== 3;
  }

  get isCompanyOrAffinity(): boolean {
    if (!this.client) { return true; }
    return this.client.clientTypeId !== 1;
  }

  get showButtons(): boolean {
    return !this.isWizard;
  }

  // tslint:disable-next-line: indent
  get showSaveButton(): boolean {
    const clientControl = this.getSelectedClientControl();
    if (!clientControl) { return false; }
    return !this.isWizard && this.canEdit && clientControl.form.enabled;
  }

  get showEditButton(): boolean {
    const clientControl = this.getSelectedClientControl();
    if (!clientControl) { return false; }
    return !this.isWizard && this.canEdit && !clientControl.form.enabled;
  }

  get isDefaultClient(): boolean {
    if (this.userPreference && this.client) {
      return (this.client.id === this.userPreference.defaultClientId);
    }
    return false;

  }

  get parentClientName(): string {
    const clientControl = this.getSelectedClientControl();
    if (!clientControl) { return null; }
    return clientControl.getSubHeading();
  }
  @ViewChild(ClientIndividualComponent, { static: true }) clientIndividualComponent: ClientIndividualComponent;
  @ViewChild(ClientAffinityComponent, { static: true }) clientAffinityComponent: ClientAffinityComponent;
  @ViewChild(ClientCompanyComponent, { static: true }) clientCompanyComponent: ClientCompanyComponent;
  @ViewChild(ClientGroupIndividualComponent, { static: true }) clientGroupIndividualComponent: ClientGroupIndividualComponent;
  @ViewChild(ClientAddressListComponent, { static: true }) clientAddressListComponent: ClientAddressListComponent;
  @ViewChild(ClientSubsidiaryListComponent, { static: true }) clientSubsidiaryListComponent: ClientSubsidiaryListComponent;
  @ViewChild(BankAccountListComponent, { static: true }) bankAccountListComponent: BankAccountListComponent;
  @ViewChild(ContactListComponent, { static: true }) contactListComponent: ContactListComponent;
  @ViewChild(NotesComponent, { static: true }) notesComponent: NotesComponent;
  @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
  @ViewChild(LastModifiedByComponent, { static: true }) lastModifiedByComponent: LastModifiedByComponent;
  @ViewChild(MatTabGroup, { static: true }) matTabGroup: MatTabGroup;

  isWizard = false;
  selected: number;
  disabled: boolean;
  name: string;
  clientId: string;
  client: Client;
  userPreference: UserPreferences;
  isReadonly = false;
  tabIndex: number;
  canAdd = true;
  canEdit = true;
  canAddBranch = true;
  canAddDepartment = true;
  clientControls: { [id: number]: ClientDetailsBase; } = {};
  pendingAsyncValidation: Subscription;
  disableSaveButton = false;
  // tslint:disable-next-line: use-life-cycle-interface
  ngOnInit() {
    this.checkUserPermissions();

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.tabIndex) { this.tabIndex = params.tabIndex; }

      if (!this.isWizard && params.id) {
        this.appEventsManager.loadingStart('Loading client details...');
        this.clientId = params.id;
        this.getClient(params.id);
      }
    });

    this.subscribeToPreferencesChanged();
  }


  subscribeToPreferencesChanged(): void {
    this.appEventsManager.onUserPreferenceChanged.subscribe(preferences => {
      this.userPreference = preferences;
    });
  }

  ngAfterViewInit(): void {
    this.clientControls[1] = this.clientIndividualComponent;
    this.clientControls[2] = this.clientAffinityComponent;
    this.clientControls[3] = this.clientCompanyComponent;
    this.clientControls[4] = this.clientGroupIndividualComponent;

    const clientControl = this.getSelectedClientControl();
    if (clientControl != null) {
      clientControl.createForm();

      if (this.client != null) {
        clientControl.setForm(this.client);
      }
    }

    if (this.tabIndex) { this.matTabGroup.selectedIndex = this.tabIndex; }
  }

  getSelectedClientControl(): ClientDetailsBase {
    return this.clientControls[this.selected];
  }

  createForm(): void {
    this.clearDisplayName();
    const clientControl = this.getSelectedClientControl();
    clientControl.createForm();
  }

  readForm(): Client {
    const clientControl = this.getSelectedClientControl();
    const client = clientControl.readForm();
    return client;
  }

  setForm(client: Client): void {
    this.checkUserPermissions();
    const clientControl = this.getSelectedClientControl();
    if (clientControl != null) {
      clientControl.isWizard = this.isWizard;
      clientControl.setForm(client);
      clientControl.setCurrentValues();
      this.client = client;

      if (this.isReadonly) { clientControl.disable(); }
    } else {
      this.client = client;
    }

    if (!this.isWizard) { this.disabled = true; }
    this.getDisplayName(client);
  }

  checkUserPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Client');
    this.canEdit = userUtility.hasPermission('Edit Client');
  }

  getClient(clientId: number, isReadonly = false): void {
    this.isReadonly = isReadonly;
    this.breadcrumbService.setBreadcrumb('Edit a client');

    this.clientService.getClient(clientId)
      .subscribe(client => {
        this.selected = client.clientTypeId;
        this.setForm(client);
        this.appEventsManager.loadingStop();
        this.getTabControlsData(client);
      });
  }

  getTabControlsData(client: Client): void {
    if (!this.isWizard) {
      const bankDetails = new Array();
      bankDetails.push(client.id);
      bankDetails.push('Client');
      this.clientAddressListComponent.getData(client);
      this.bankAccountListComponent.getData(bankDetails);
      this.clientSubsidiaryListComponent.getData(client);
      this.contactListComponent.getData(client);
      this.getNotes(client.id);
      this.getAuditDetails(client.id);
    }
  }

  getAuditDetails(id: number): void {
    const auditRequest = new AuditRequest(ServiceTypeEnum.ClientManager, ItemType.Client, id);
    this.auditLogComponent.getData(auditRequest);
  }

  getNotes(id: number): void {
    const noteRequest = new NotesRequest(ServiceTypeEnum.ClientManager, 'Client', id);
    this.notesComponent.getData(noteRequest);
  }


  save(): void {
    this.disableSaveButton = true;
    const clientControl = this.getSelectedClientControl();
    if (!clientControl.validate()) {
      if (clientControl.form.status === 'PENDING') {
        if (!this.pendingAsyncValidation) {
          this.pendingAsyncValidation = clientControl.form.statusChanges.subscribe(changes => {
            if (changes === 'VALID') {
              this.saveValidatedChanges();
            } else if (changes === 'INVALID') {
              this.unsubscribePendingChanges();
            }
          });
        }
      } else if (clientControl.form.status === 'VALID') {
        this.saveValidatedChanges();
      } else {
        this.unsubscribePendingChanges();
      }
    } else {
      this.saveValidatedChanges();
    }

  }

  unsubscribePendingChanges(): void {
    this.disableSaveButton = false;
    if (this.pendingAsyncValidation) {
      this.pendingAsyncValidation.unsubscribe();
      this.pendingAsyncValidation = null;
    }
  }

  private saveValidatedChanges(): void {
    this.unsubscribePendingChanges();
    const clientControl = this.getSelectedClientControl();
    const client = clientControl.readForm();
    this.name = client.name;
    clientControl.disable();
    this.appEventsManager.loadingStart(`Saving ${client.name}...`);
    if (client.id > 0) {
      this.editClient(client);
    } else {
      this.addClient(client);
    }
  }

  edit(): void {
    const clientControl = this.getSelectedClientControl();
    clientControl.enable();
    clientControl.setCurrentValues();
    this.disabled = false;
  }

  back(): void {

    if (this.client) {
      this.router.navigate(['clientcare/client-manager/client-dashboard/', this.client.id]);
    } else {
      this.location.back();
    }
  }

  editClient(client: Client): void {
    this.clientService.editClient(client).subscribe(() => this.done());
  }

  addClient(client: Client): void {
    this.clientService.addClient(client).subscribe(() => this.done());
  }

  done(): void {
    this.appEventsManager.loadingStop();
    this.alertService.success(`'${this.name}' was saved successfully`, 'Client saved', true);
    this.back();
  }

  addBankingDetails(): void {
    this.router.navigate([`clientcare/client-manager/bank-account-details/add/${this.clientId}`]);
  }

  disable(): void {
    const control = this.getSelectedClientControl();
    if (control) { control.disable(); }
  }

  getDisplayName(baseClass: BaseClass): void {
    if (!this.lastModifiedByComponent) { return; }
    this.lastModifiedByComponent.getDisplayName(baseClass);
  }

  clearDisplayName(): void {
    if (!this.lastModifiedByComponent) { return; }
    this.lastModifiedByComponent.clearDisplayName();
  }

  onPinClientToggle(item: any): void {
    if (this.userPreference === null) {
      this.userPreference = new UserPreferences();
    }
    if (item.checked) {
      this.userPreference.defaultClientId = this.client.id;
      this.userPreference.defaultClientName = this.client.clientFullName;
    } else {
      this.userPreference.defaultClientId = null;
      this.userPreference.defaultClientName = null;
    }

    this.userPreferenceService.saveUserPreferances(this.userPreference).subscribe(result => {
      this.appEventsManager.setUserPreferences(this.userPreference);
    });
  }
}
