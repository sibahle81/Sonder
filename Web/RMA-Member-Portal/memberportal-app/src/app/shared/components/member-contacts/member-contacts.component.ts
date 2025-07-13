import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { MemberContactsDataSource } from './member-contacts.datasource';
import { AuthService } from 'src/app/core/services/auth.service';
import { UnSubscribe } from '../../common/unsubscribe';
import { CommunicationTypeEnum } from '../../enums/communication-type.enum';
import { ContactDesignationTypeEnum } from '../../enums/contact-designation-type-enum';
import { ContactInformationTypeEnum } from '../../enums/contact-information-type-enum';
import { TitleEnum } from '../../enums/title-enum';
import { RolePlayer } from '../../models/roleplayer';
import { RolePlayerContact } from '../../models/roleplayer-contact';
import { RolePlayerService } from '../../services/roleplayer.service';

@Component({
  selector: 'member-contacts',
  templateUrl: './member-contacts.component.html',
  styleUrls: ['./member-contacts.component.css']
})
export class MemberContactsComponent extends UnSubscribe implements OnChanges {

  addPermission = 'Add Contact';
  editPermission = 'Edit Contact';
  viewPermission = 'View Contact';
  viewAuditPermission = 'View Audits';

  @Input() member: RolePlayer;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() title = 'Contacts';
  @Input() triggerReset: boolean;
  @Input() isSelectionMode = false;

  // optional inputs to filter dropdowns in contact details
  @Input() filteredCommunicationTypes = [CommunicationTypeEnum.Email, CommunicationTypeEnum.Phone, CommunicationTypeEnum.Post, CommunicationTypeEnum.SMS];
  @Input() filteredInformationTypes = [ContactInformationTypeEnum.Claims, ContactInformationTypeEnum.Declarations, ContactInformationTypeEnum.Invoices, ContactInformationTypeEnum.PolicyInformation];
  @Input() filteredDesignationTypes = [ContactDesignationTypeEnum.Payroll, ContactDesignationTypeEnum.HR, ContactDesignationTypeEnum.Accounts, ContactDesignationTypeEnum.PrimaryContact, ContactDesignationTypeEnum.AccountExecutive, ContactDesignationTypeEnum.Director];

  @Output() emitContacts = new EventEmitter<RolePlayerContact[]>();
  @Output() selectedContactsEmit: EventEmitter<RolePlayerContact[]> = new EventEmitter();
  @Output() rolePlayerContactsEditedEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  dataSource: MemberContactsDataSource;
  currentQuery: any;

  viewOnly = false;

  selectedRolePlayerContact: RolePlayerContact;
  selectedRolePlayerContacts: RolePlayerContact[];

  titles: TitleEnum[] = [];
  communicationTypes: CommunicationTypeEnum[] = [];
  contactDesignationTypes: ContactDesignationTypeEnum[] = [];
  contactInformationTypes: ContactInformationTypeEnum[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly rolePlayerService: RolePlayerService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.setPagination();
      this.currentQuery = this.member.rolePlayerId ? this.member.rolePlayerId.toString() : '0';
      this.getWizardData();

      this.dataSource.isContactsLoaded$.subscribe(result => {
        if (result && this.dataSource && this.dataSource.data) {
          this.dataSource.data.data = this.dataSource.data.data.filter(a => this.filteredCommunicationTypes.includes(a.communicationType)
            && this.filteredDesignationTypes.includes(a.contactDesignationType) && a.rolePlayerContactInformations.some(s => this.filteredInformationTypes.includes(s.contactInformationType)));
          this.dataSource.filterData(this.dataSource.data.data);
          this.emitContacts.emit(this.dataSource.data.data);
        }
      });
    }
  }

  setPagination() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new MemberContactsDataSource(this.rolePlayerService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  }

  getData() {
    if (!this.isWizard) {
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
  }

  getWizardData() {
    if (this.isWizard) {
      let contacts = this.member.rolePlayerContacts?.length > 0 ? this.member.rolePlayerContacts : [];
      this.dataSource.getWizardData(contacts, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
  }

  currentUserCanEdit(rolePlayerContact: RolePlayerContact): boolean {
    const currentUser = this.authService.getCurrentUser();
    return rolePlayerContact.createdBy === currentUser.email;
  }

  viewDetail(rolePlayerContact: RolePlayerContact) {
    this.selectedRolePlayerContact = rolePlayerContact;
    this.setContactDetailsForm(true, true);
  }

  showForm(rolePlayerContact: RolePlayerContact) {
    if (rolePlayerContact) {
      this.selectedRolePlayerContact = rolePlayerContact;
    } else {
      this.selectedRolePlayerContact = new RolePlayerContact();
      this.selectedRolePlayerContact.rolePlayerId = 0
      this.selectedRolePlayerContact.rolePlayerContactId = 0;
    }
    this.setContactDetailsForm(false, true);
  }

  setWizardContact($event: RolePlayerContact) {
    let contactId = $event.rolePlayerContactId ? $event.rolePlayerContactId : 0;
    let index = -1;
    if(contactId >= 0) { 
      index = this.member.rolePlayerContacts.findIndex(a => a == $event);
    }
    
    if (index > -1) {
      this.member.rolePlayerContacts[index] = $event;
    } else {
      this.member.preferredCommunicationTypeId = +CommunicationTypeEnum[$event.communicationType]
      this.member.rolePlayerContacts.push($event);
      if (this.isWizard) {
        this.dataSource.getWizardData(this.member.rolePlayerContacts, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery)
      }
    }
  }

  notifyOnContactEdited($event: boolean) {
    if ($event) {
      this.rolePlayerContactsEditedEmit.emit(true);
    }
  }

  getTitle(title: number): string {
    const statusText = TitleEnum[title];
    return statusText ? statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim() : 'NA';
  }

  getCommunicationType(communicationType: number): string {
    const statusText = CommunicationTypeEnum[communicationType];
    return statusText ? statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim() : 'NA';
  }

  getDesignation(contactDesignation: number): string {
    const statusText = ContactDesignationTypeEnum[contactDesignation];
    return statusText ? statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim() : 'NA';
  }

  getContext(context: number): string {
    const statusText = ContactInformationTypeEnum[context];
    return statusText ? statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim() : 'NA';
  }

  setContactDetailsForm(viewOnly: boolean, showForm: boolean) {
    this.viewOnly = viewOnly;
    this.showForm$.next(showForm);
  }

  contactSelected(contact: RolePlayerContact) {
    if (this.isSelectionMode) {
      if (!this.selectedRolePlayerContacts) { this.selectedRolePlayerContacts = []; }

      let index = this.selectedRolePlayerContacts.findIndex(a => a.rolePlayerContactId === contact.rolePlayerContactId);
      if (index > -1) {
        this.selectedRolePlayerContacts.splice(index, 1);
      } else {
        this.selectedRolePlayerContacts.push(contact);
      }
      this.selectedContactsEmit.emit(this.selectedRolePlayerContacts);
    }
  }

  getContactInformationType(contactInformationType: ContactInformationTypeEnum): string {
    return this.formatText(ContactInformationTypeEnum[contactInformationType]);
  }

  getContactDesignationType(contactDesignationType: ContactDesignationTypeEnum): string {
    return this.formatText(ContactDesignationTypeEnum[contactDesignationType]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  closeContactDetails($event: boolean) {
    this.showForm$.next($event);
  }

  reloadContactList($event: boolean) {
    this.showForm$.next($event);
    this.getWizardData()
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'select', show: this.isSelectionMode },
      { def: 'isConfirmed', show: true },
      { def: 'title', show: true },
      { def: 'name', show: true },
      { def: 'surname', show: true },
      { def: 'email', show: true },
      { def: 'contact', show: true },
      { def: 'type', show: true },
      { def: 'designation', show: true },
      { def: 'context', show: true },

      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
