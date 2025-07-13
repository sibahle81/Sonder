import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { ImportRequest } from 'projects/admin/src/app/campaign-manager/shared/entities/import-request';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { TargetAudience } from 'projects/admin/src/app/campaign-manager/shared/entities/target-audience';
import { TargetAudienceService } from 'projects/admin/src/app/campaign-manager/shared/services/target-audience.service';
import { TargetAudienceDataSource } from 'projects/admin/src/app/campaign-manager/views/target-audience-list/target-audience-list.datasource';
import { TargetAudienceLeadComponent } from 'projects/admin/src/app/campaign-manager/views/target-audience-leads/target-audience-leads.component';
import { TargetAudienceClientComponent } from 'projects/admin/src/app/campaign-manager/views/target-audience-clients/target-audience-clients.component';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { LookupItem } from 'projects/shared-models-lib/src/lib/lookup/lookup-item';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ContactValidator } from 'projects/shared-utilities-lib/src/lib/validators/contact.validator';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { CampaignMembersComponent } from 'projects/admin/src/app/campaign-manager/views/campaign-members/campaign-members.component';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { NotesDialogComponent } from 'projects/shared-components-lib/src/lib/notes-dialog/notes-dialog.component';
import { CampaignStatus } from 'projects/admin/src/app/campaign-manager/views/campaign-review/campaign-status';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  styleUrls: ['./target-audience-list.component.css'],
  templateUrl: './target-audience-list.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'target-audience'
})
export class TargetAudienceListComponent extends ListComponent implements OnInit, AfterViewInit {

  @ViewChild(UploadControlComponent, { static: true }) uploadComponent: UploadControlComponent;
  @ViewChild(TargetAudienceClientComponent, { static: true }) clientComponent: TargetAudienceClientComponent;
  @ViewChild(TargetAudienceLeadComponent, { static: true }) leadComponent: TargetAudienceLeadComponent;
  @ViewChild(CampaignMembersComponent, { static: true }) memberComponent: CampaignMembersComponent;

  campaign: Campaign;
  audienceMember: TargetAudience;
  audienceType: LookupItem;
  audienceMemberId: number;
  audienceShowType = 0;
  audienceSubType = 0;
  showState = 0;

  initialising = true;
  hasLoaded = false;
  showSection = 'list';
  showEditButton: boolean;
  showSaveButton: boolean;
  disabled = true;

  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canRemove: boolean;
  loadingNote: boolean;

  note: Note;
  form: UntypedFormGroup;
  leads: Lookup[] = [];
  clients: Lookup[] = [];
  audienceTypeList: LookupItem[] = [];
  showAudienceTypes: LookupItem[] = [];
  noteControl = new UntypedFormControl('', [Validators.required]);
  selectedClients: number[];
  selectedLeads: number[];

  get hasCampaign(): boolean {
    if (this.campaign) {
      return this.campaign.id > 0;
    }
    return false;
  }

  get isLoading(): boolean {
    return this.audienceDataSource.isLoading || this.initialising;
  }

  get canSave(): boolean {
    if (this.showState >= 10 && this.showState < 20) {
      return this.clientComponent.formValid;
    } else if (this.showState >= 40 && this.showState < 50) {
      return this.leadComponent.formValid;
    } else {
      return !this.form.pristine && this.form.valid;
    }
  }

  get hideUnsubscribe(): boolean {
    // Hide if the target audience has not been saved yet.
    if (this.audienceMemberId === 0) { return true; }
    // Show for individual clients, companies and persons.
    if (this.showState === 10) { return false; }
    if (this.showState === 20) { return false; }
    if (this.showState === 30) { return false; }
    return true;
  }

  get idNumberRequired(): boolean {
    if (this.showState === 11) { return true; }
    if (this.showState === 30) { return true; }
    return false;
  }

  get idNumberError(): boolean {
    if (this.showState === 30) {
      if (this.form.dirty) {
        const control = this.form.get('memberNumber');
        return control.touched && control.hasError('idNumber');
      }
    }
    return false;
  }

  constructor(
    router: Router,
    alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly noteService: NotesService,
    private readonly lookupService: LookupService,
    private readonly campaignService: CampaignService,
    private readonly authService: AuthService,
    private readonly targetAudienceService: TargetAudienceService,
    private readonly audienceDataSource: TargetAudienceDataSource,
    private readonly appEventsManager: AppEventsManager,
    private notesDialogComponent: MatDialog
  ) {
    super(alertService, router, audienceDataSource, '', 'Audience', 'Target Audience');
    this.getAudienceTypes();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.setPermissions();
  }

  setPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Target Audience');
    this.canView = userUtility.hasPermission('View Target Audience');
    this.canEdit = userUtility.hasPermission('Edit Target Audience');
    this.canRemove = userUtility.hasPermission('Remove Target Audience');
  }

  getAudienceTypes(): void {
    this.lookupService.getCampaignAudienceTypes().subscribe(
      data => {
        this.audienceTypeList = data.sort(this.compareLookupItems);
        this.showAudienceTypes = this.audienceTypeList.filter(at => at.parentId === null);
      }
    );
  }

  getMembers(campaign: Campaign): void {
    this.showSection = 'list';
    if (campaign) {
      if (!this.hasLoaded) {
        this.hasLoaded = true;
        this.initialising = false;
        this.campaign = campaign;

        this.setSelectedClients();
        this.setSelectedLeads();

        this.leadComponent.campaign = campaign;
        this.clientComponent.campaign = campaign;
        this.audienceDataSource.getData(campaign.id);

        this.form.controls.email.setValidators([ContactValidator.emailAddressRequired(this.campaign.campaignType)]);
        this.form.controls.mobileNumber.setValidators([ContactValidator.phoneNumberRequired(this.campaign.campaignType)]);
      }
    }
  }

  compareLookupItems(a: LookupItem, b: LookupItem): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }


  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'itemType', header: 'Audience Type', cell: (row: TargetAudience) => row.itemType },
      { columnDefinition: 'name', header: 'Name', cell: (row: TargetAudience) => row.name },
      { columnDefinition: 'email', header: 'Email', cell: (row: TargetAudience) => row.email },
      { columnDefinition: 'mobileNumber', header: 'Mobile', cell: (row: TargetAudience) => row.mobileNumber }
    ];
  }

  getColumnType(header: string): number {
    switch (header) {
      case 'itemType':
        return 1;
      case 'email':
        return 2;
      case 'mobileNumber':
        return 3;
      default: return 0;
    }
  }

  showImportFile(): void {
    this.showSection = 'import';
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      id: '',
      itemId: '',
      audienceTypeId: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      memberName: new UntypedFormControl('', [Validators.required]),
      email: new UntypedFormControl(''),
      mobileNumber: new UntypedFormControl(''),
      memberNumber: new UntypedFormControl(''),
      unsubscribed: new UntypedFormControl(''),
      unsubscribedAll: new UntypedFormControl('')
    });
  }

  getAudienceTypeId(audience: TargetAudience): number {
    if (this.audienceType.id === 1 || this.audienceType.id === 4) {
      return audience.itemId === 0 ? 1 : 2;
    }
    return this.audienceType.id;
  }

  setForm(audience: TargetAudience): void {
    this.setupDetailForm(audience);
    this.form.setValue({
      id: audience.id ? audience.id : 0,
      itemId: audience.itemId ? audience.itemId : 0,
      audienceTypeId: this.audienceShowType,
      memberName: audience.name ? audience.name : '',
      memberNumber: this.getMemberNumber(audience),
      email: audience.email ? audience.email : '',
      mobileNumber: audience.mobileNumber ? audience.mobileNumber : '',
      unsubscribed: audience.unsubscribed,
      unsubscribedAll: audience.unsubscribedAll
    });
    if (audience.id > 0 && audience.clientTypeId === 1) {
      this.form.controls.memberNumber.setValidators([ValidateIdNumber]);
    } else {
      this.form.controls.memberNumber.setValidators([]);
    }
  }

  setupDetailForm(audience: TargetAudience): void {
    this.audienceMemberId = audience.id;
    this.audienceType = this.getAudienceType(audience.itemType);
    this.audienceShowType = this.getAudienceShowType(this.audienceType);
    this.audienceSubType = this.getAudienceSubType(this.audienceType);
    this.showState = this.getShowState();

    if (this.audienceShowType === 1) {
      this.setChildComponentCategoryId(this.clientComponent, this.getAudienceTypeId(audience));
      this.setChildSelectedCategories(this.clientComponent, audience.itemType, this.audienceDataSource.data);
      if (audience.itemType === 'Client' && audience.itemId > 0) {
        this.clientComponent.setSelectedEntity(this.getLookupItem(audience));
      }
      this.clientComponent.enableEdit(audience.id === 0);
    } else if (this.audienceShowType === 4) {
      this.setChildComponentCategoryId(this.leadComponent, this.getAudienceTypeId(audience));
      this.setChildSelectedCategories(this.leadComponent, audience.itemType, this.audienceDataSource.data);
      if (audience.itemType === 'Lead' && audience.itemId > 0) {
        this.leadComponent.setSelectedEntity(this.getLookupItem(audience));
      }
      this.leadComponent.enableEdit(audience.id === 0);
    }

  }

  getLookupItem(audience: TargetAudience): LookupItem {
    const item = new LookupItem();
    item.id = audience.itemId;
    item.name = audience.name;
    return item;
  }

  getShowState(): number {
    switch (this.audienceType.id) {
      case 1: // Client
        return 10;
      case 2: // Company
        return 20;
      case 3: // Person
        return 30;
      case 4: // Lead
        return 40;
      case 5: // Client :: ClientType
        return 11;
      case 6: // Client :: Group
        return 12;
      case 7: // Client :: Industry
        return 13;
      case 8: // Client :: Industry Class
        return 14;
      case 9: // Lead :: ClientType
        return 41;
      case 10: // Lead :: Industry Class
        return 42;
      case 11: // Client :: With Product
        return 15;
      case 12:  // Client :: Without Product
        return 16;
      default:
        return 0;
    }
  }

  getAudienceSubType(audienceType: LookupItem): number {
    if (!audienceType) { return 0; }
    return audienceType.parentId ? audienceType.id : 0;
  }

  getAudienceShowType(audienceType: LookupItem): number {
    if (!audienceType) { return 0; }
    return audienceType.parentId ? audienceType.parentId : audienceType.id;
  }

  getMemberNumber(audience: TargetAudience): string {
    switch (audience.clientTypeId) {
      case 1:
        return audience.idNumber;
      case 2:
      case 3:
        return audience.memberNumber;
      default:
        return '';
    }
  }

  getAudienceType(itemType: string): LookupItem {
    const targetAudienceType = this.audienceTypeList.find(audienceType => audienceType.name === itemType);
    return targetAudienceType ? targetAudienceType : this.getBlankLookupItem();
  }

  getBlankLookupItem(): LookupItem {
    const item = new LookupItem();
    item.id = 0;
    item.name = '';
    return item;
  }

  getAudienceTypeName(typeId: number): string {
    const targetAudienceType = this.audienceTypeList.find(audienceType => audienceType.id === typeId);
    return targetAudienceType ? targetAudienceType.name : '';
  }

  readForm(): TargetAudience {
    const member = new TargetAudience();
    member.id = this.form.get('id').value;
    member.campaignId = this.campaign.id;
    member.clientTypeId = 1;
    member.itemType = this.getAudienceTypeName(this.form.get('audienceTypeId').value);
    member.itemId = this.form.get('itemId').value;
    member.name = this.form.get('memberName').value;
    member.email = this.form.get('email').value;
    member.memberNumber = this.form.get('memberNumber').value;
    member.idNumber = this.form.get('memberNumber').value;
    member.mobileNumber = this.form.get('mobileNumber').value;
    member.postalAddress = '';
    member.unsubscribed = this.form.get('unsubscribed').value;
    member.unsubscribedAll = this.form.get('unsubscribedAll').value;
    return member;
  }

  getNewTargetAudienceMember(): TargetAudience {
    const audience = new TargetAudience();
    audience.id = 0;
    audience.campaignId = this.campaign.id;
    audience.itemType = '';
    audience.itemId = 0;
    audience.name = '';
    audience.email = '';
    audience.memberNumber = '';
    audience.idNumber = '';
    audience.mobileNumber = '';
    audience.postalAddress = '';
    audience.unsubscribed = false;
    audience.unsubscribedAll = false;
    return audience;
  }

  addNote(item: any, canEdit: boolean): void {
    const notesRequest = new NotesRequest(ServiceTypeEnum.CampaignManager, 'Recipient', item.id);
    const dialog = this.notesDialogComponent.open(NotesDialogComponent, {
      data: notesRequest
    });
  }

  editNote(): void {
    this.appEventsManager.loadingStart('Saving note...');
    this.note.text = this.noteControl.value;
    if (this.note.id === 0) {
      this.insertNote();
    } else {
      this.updateNote();
    }
  }

  insertNote(): void {
    this.noteService.addNote(ServiceTypeEnum.CampaignManager, this.note).subscribe(
      () => {
        this.appEventsManager.loadingStop();
        this.alertService.success('The note has been added.');
        this.back();
      },
      error => {
        this.appEventsManager.loadingStop();
        this.alertService.error(error);
      }
    );
  }

  updateNote(): void {
    this.noteService.editNote(ServiceTypeEnum.CampaignManager, this.note).subscribe(
      () => {
        this.appEventsManager.loadingStop();
        this.alertService.success('The note has been updated.');
        this.back();
      },
      error => {
        this.appEventsManager.loadingStop();
        this.alertService.error(error);
      }
    );
  }

  confirmDeleteAudience(item: any): void {
    this.audienceMember = item;
    this.showSection = 'delete';
    this.loadingNote = false;
  }

  deleteAudience(): void {
    this.appEventsManager.loadingStart('Removing audience member...');
    this.targetAudienceService.removeAudienceMember(this.audienceMember.id).subscribe(
      () => {
        this.saveCampaign();
        this.refreshAudienceList(`${this.audienceMember.name} has been removed from the campaign.`);
      },
      error => {
        this.appEventsManager.loadingStop();
        this.alertService.error(error);
      }
    );
  }

  newItem(): void {
    this.form.reset();
    this.form.enable();
    this.form.markAsPristine();
    this.showSection = 'detail';
    this.showEditButton = false;
    this.showSaveButton = this.canAdd;
    this.setChildComponentCategories(this.clientComponent, 1, false, true);
    this.setChildComponentCategories(this.leadComponent, 4, false, true);
    this.setForm(this.getNewTargetAudienceMember());
    this.form.get('unsubscribed').disable();
    this.form.get('unsubscribedAll').disable();
  }

  selectAudience(item: any): void {
    this.form.reset();
    this.form.disable();
    this.showSection = 'detail';
    this.showSaveButton = false;
    this.showEditButton = this.canEdit;
    this.setChildComponentCategories(this.clientComponent, 1, item.itemType === 'Client' && item.itemId > 0, false);
    this.setChildComponentCategories(this.leadComponent, 4, item.itemType === 'Lead' && item.itemId > 0, false);

    // this.clientComponent.setEntiyList(33190, 'some client');
    // this.leadComponent.setEntiyList(7, 'some lead');

    this.setForm(item);
  }

  viewMembers(item: any): void {
    if (item.itemId === 0 && ['Client', 'Lead'].includes(item.itemType)) { return; }
    this.memberComponent.getMembersData(item.itemType, item.itemId);
    this.showSection = 'members';
  }

  setChildComponentCategories(component: any, parentId: number, includeIndividual: boolean, newItem: boolean): void {
    component.setSelectedCategories([]);
    component.setTargetCategories(this.audienceTypeList.filter(at => at.parentId === parentId), includeIndividual);
    component.setTargetCategoryId(0);
    if (newItem) {
      component.enableEdit(true);
    }
  }

  setChildComponentCategoryId(component: any, categoryId: number): void {
    component.setTargetCategoryId(categoryId);
  }

  setChildSelectedCategories(component: any, itemType: string, data: any[]): void {
    const list = data.filter(d => d.itemType === itemType);
    const ids = list.map(d => d.itemId);
    component.setSelectedCategories(ids);
  }

  setSelectedClients(): void {
    if (this.campaign) {
      if (this.campaign.targetAudiences) {
        const clients = this.campaign.targetAudiences.filter(member => member.itemType === 'Client');
        this.selectedClients = clients.map(client => client.itemId);
      }
    }
  }

  setSelectedLeads(): void {
    if (this.campaign) {
      if (this.campaign.targetAudiences) {
        const leads = this.campaign.targetAudiences.filter(member => member.itemType === 'Lead');
        this.selectedLeads = leads.map(lead => lead.itemId);
      }
    }
  }

  setupAudienceFields(item: any): void {
    this.form.controls.memberNumber.setValidators([]);
    switch (item.value) {
      case 1: // Client
        this.showState = 10;
        break;
      case 2: // Company
        this.showState = 20;
        break;
      case 3: // Person
        this.form.controls.memberNumber.setValidators([ValidateIdNumber]);
        this.showState = 30;
        break;
      case 4: // Lead
        this.showState = 40;
        break;
      default:
        this.showState = 0;
    }
  }

  save(): void {
    this.appEventsManager.loadingStart('Saving target audience...');
    const audienceType = this.form.get('audienceTypeId').value;
    if (audienceType === 1) {
      this.saveTargetAudienceList(this.clientComponent);
      this.saveCampaign();
    } else if (audienceType === 4) {
      this.saveTargetAudienceList(this.leadComponent);
      this.saveCampaign();
    } else {
      if (!this.form.valid) { return; }
      this.form.disable();
      if (this.audienceMemberId > 0) {
        this.updateAudienceMember();
      } else {
        this.insertAudienceMember();
      }
      this.saveCampaign();
    }
  }

  edit(): void {
    this.form.enable();
    this.showSaveButton = true;
    this.showEditButton = false;
    if (this.audienceMemberId > 0) {
      // Do not allow the audience type for existing
      // members to be edited. For new members it is fine.
      this.form.get('audienceTypeId').disable();
    }
    if (this.audienceShowType === 1 || this.audienceShowType === 4) {
      // Details of existing clients cannot be changed here.
      this.form.get('memberName').disable();
      this.form.get('memberNumber').disable();
      this.form.get('email').disable();
      this.form.get('mobileNumber').disable();
      this.form.get('unsubscribed').disable();
      this.form.get('unsubscribedAll').disable();
      if (this.audienceShowType === 1) {
        if (this.showState === 10) {
          this.form.get('unsubscribed').enable();
          this.form.get('unsubscribedAll').enable();
        }
        this.clientComponent.enableEdit(false);
      } else {
        this.leadComponent.enableEdit(false);
      }
    }
    if (this.campaign.campaignCategory === 1) {
      // Cannot unsubscribe from operational campaigns.
      this.form.get('unsubscribed').disable();
      this.form.get('unsubscribedAll').disable();
    }
  }

  saveTargetAudienceList(component: any): void {
    let list: TargetAudience[] = (component.targetCategoryId > 2)
      ? this.audienceDataSource.data.filter(member => member.itemType === component.itemType)
      : this.audienceDataSource.data.filter(member => member.itemType === component.itemType && member.itemId === component.entityId);
    list = this.flagMembersAsDeleted(list);
    let newList = this.getTargetAudienceList(component);
    newList = this.updateMemberRecords(list, newList);
    if (newList.length > 0) {
      this.targetAudienceService.saveTargetAudienceList(newList).subscribe(
        (count) => {
          this.refreshAudienceList(`${count} members added to campaign target audience.`);
        }
      );
    } else {
      this.alertService.error('No member has been added to the audience list');
      this.appEventsManager.loadingStop();
    }
  }

  isClientContactType(itemType: string): boolean {
    const clients = ['Client', 'ClientType', 'Industry', 'IndustryClass'];
    return clients.includes(itemType);
  }

  isLeadContactType(itemType: string): boolean {
    const leads = ['Lead', 'LeadClientType', 'LeadIndustryClass'];
    return leads.includes(itemType);
  }

  updateMemberRecords(list: any[], newList: any[]): TargetAudience[] {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < newList.length; i++) {
      const newMember = newList[i];
      const idx = list.findIndex(member => member.itemId === newMember.itemId);
      if (idx >= 0) {
        list[idx].isActive = true;
        list[idx].isDeleted = false;
        list[idx].unsubscribed = newMember.unsubscribed;
        list[idx].unsubscribedAll = newMember.unsubscribedAll;
      } else {

        list.push(this.getTargetAudienceMember(0, newMember.itemType, newMember.itemId, true, false, newMember.unsubscribed, newMember.unsubscribedAll));
      }
    }
    return list;
  }

  individualMember(item: any): boolean {
    if (item.itemId > 0) {
      return ['Client', 'Company', 'Lead', 'Person'].includes(item.itemType);
    }
    return false;
  }

  flagMembersAsDeleted(list: any[]): TargetAudience[] {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < list.length; i++) {
      list[i].isActive = false;
      list[i].isDeleted = true;
      list[i].modifiedBy = this.authService.getUserEmail();
      list[i].modifiedDate = new Date();
    }
    return list;
  }

  getTargetAudienceList(component: any): TargetAudience[] {
    const list: TargetAudience[] = [];
    switch (component.targetCategoryId) {
      case 1:
      case 2:
        const unsubscribed = this.form.value.unsubscribed;
        const unsubscribedAll = this.form.value.unsubscribedAll;

        list.push(this.getTargetAudienceMember(0, component.itemType, component.entityId, true, false, unsubscribed, unsubscribedAll));
        break;
      default:
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < component.selectedCategories.length; i++) {
          list.push(this.getTargetAudienceMember(0, component.itemType, component.selectedCategories[i], true, false));
        }
        break;
    }
    return list;
  }


  getTargetAudienceMember(id: number, itemType: string, itemId: number, isActive: boolean, isDeleted: boolean, unsubscribed: boolean = false, unsubscribedAll: boolean = false): TargetAudience {
    const audience = new TargetAudience();
    audience.id = id;
    audience.campaignId = this.campaign.id;
    audience.clientTypeId = 0;
    audience.itemType = itemType;
    audience.itemId = itemId;
    audience.name = '';
    audience.email = '';
    audience.memberNumber = '';
    audience.idNumber = '';
    audience.mobileNumber = '';
    audience.postalAddress = '';
    audience.unsubscribed = unsubscribed;
    audience.unsubscribedAll = unsubscribedAll;
    audience.isActive = isActive;
    audience.isDeleted = isDeleted;
    audience.createdBy = this.authService.getUserEmail();
    audience.createdDate = new Date();
    audience.modifiedBy = audience.createdBy;
    audience.modifiedDate = audience.createdDate;
    return audience;
  }

  insertAudienceMember(): void {
    const member = this.readForm();
    this.targetAudienceService.insertAudienceMember(member).subscribe(
      () => {
        this.refreshAudienceList('Target audience member successfully saved.');
      }
    );
  }

  updateAudienceMember(): void {
    const member = this.readForm();
    this.targetAudienceService.updateAudienceMember(member).subscribe(
      () => {
        this.refreshAudienceList('Target audience member successfully saved.');
      }
    );
  }

  back(): void {
    this.showSaveButton = false;
    this.showEditButton = false;
    this.showSection = 'list';
  }

  subscribeUploadChanged(): void {
    this.uploadComponent.uploadChanged.subscribe(
      data => {
        this.disabled = data ? false : true;
      }
    );
  }

  importFile(): void {
    this.disabled = true;
    const files = this.uploadComponent.getUploadedFiles();
    if (files) {
      for (const file of files) {
        if (!file.hasError) {
          this.appEventsManager.loadingStart('Importing target audience...');
          const importRequest = new ImportRequest();
          importRequest.campaignId = this.campaign.id;
          importRequest.fileToken = file.token;
          importRequest.fileUri = file.url;

          this.targetAudienceService.importTargetAudience(importRequest).subscribe(
            () => {
              this.refreshAudienceList('File imported successfully');
            },
            error => {
              this.appEventsManager.loadingStop();
              this.alertService.error(error);
            }
          );
        }
      }
    }
  }

  refreshAudienceList(msg: string): void {
    this.alertService.success(msg);
    this.appEventsManager.loadingStop();
    this.hasLoaded = false;
    this.showSection = 'list';
    this.getMembers(this.campaign);
  }

  saveCampaign(): void {
    if (this.hasCampaign) {
      if (this.campaign.campaignStatus === CampaignStatus.New) { return; }
      if (this.campaign.campaignStatus === CampaignStatus.Updated) { return; }
      this.campaign.campaignStatus = CampaignStatus.Updated;
      this.appEventsManager.loadingStart('Updating campaign status...');
      this.campaignService.editCampaign(this.campaign).subscribe(() => {
        this.appEventsManager.loadingStop();
      });
    }
  }

  viewAudience(): void {
    this.memberComponent.getMemberData(this.campaign.id);
    this.showSection = 'members';
  }

  filterData(event: any): void {
    if (this.dataSource) {
      this.dataSource.filter = this.filter.nativeElement.value;
    }
  }

}
