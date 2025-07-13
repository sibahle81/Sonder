import { Component, Input } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';

import { NotesDialogComponent } from 'projects/shared-components-lib/src/lib/notes-dialog/notes-dialog.component';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';

import { TargetAudienceMember } from '../../shared/entities/target-audience-member';
import { CampaignMembersDataSource } from './campaign-members.datasource';

@Component({
  styleUrls: ['./campaign-members.component.css'],
  templateUrl: './campaign-members.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'campaign-members'
})
export class CampaignMembersComponent extends ListComponent {

  @Input() parent: any;

  note: Note;
  loadingNote = false;
  showSection = 'members';
  audienceMember: TargetAudienceMember;
  noteControl = new UntypedFormControl('', [Validators.required]);
  serviceType: ServiceTypeEnum;

  get isLoading(): boolean {
    return this.memberDataSource.isLoading;
  }

  constructor(
    router: Router,
    alertService: AlertService,
    private readonly noteService: NotesService,
    private readonly appEventsManager: AppEventsManager,
    private readonly memberDataSource: CampaignMembersDataSource,
    private notesDialogComponent: MatDialog
  ) {
    super(alertService, router, memberDataSource, '', 'Member', 'Members');
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'name', header: 'Name', cell: (row: TargetAudienceMember) => row.name },
      { columnDefinition: 'contactName', header: 'Contact', cell: (row: TargetAudienceMember) => row.contactName },
      { columnDefinition: 'email', header: 'Email', cell: (row: TargetAudienceMember) => row.email },
      { columnDefinition: 'mobileNo', header: 'Mobile', cell: (row: TargetAudienceMember) => row.mobileNo },
      { columnDefinition: 'phoneNo', header: 'Phone', cell: (row: TargetAudienceMember) => row.phoneNo }
    ];
  }

  getColumnType(header: string): number {
    switch (header) {
      case 'email':
        return 1;
      case 'mobileNo':
      case 'phoneNo':
        return 2;
      default: return 0;
    }
  }

  getMemberData(campaignId: number) {
    this.memberDataSource.getData(campaignId);
  }

  getMembersData(itemType: string, itemId: number) {
    if (this.isClientItem(itemType)) {
      this.memberDataSource.getClientRecords(itemType, itemId);
    } else if (this.isLeadItem(itemType)) {
      this.memberDataSource.getLeadRecords(itemType, itemId);
    } else {
      this.alertService.error('The selected target audience does not contain sub-members');
    }
  }

  isClientItem(itemType: string): boolean {
    const itemTypes = ['Client', 'ClientType', 'Group', 'Industry', 'IndustryClass'];
    return itemTypes.includes(itemType);
  }

  isLeadItem(itemType: string): boolean {
    const itemTypes = ['Lead', 'LeadClientType', 'LeadIndustryClass'];
    return itemTypes.includes(itemType);
  }

  addNotes(member: TargetAudienceMember): void {

    this.serviceType = member.policyId ? ServiceTypeEnum.PolicyManager : ServiceTypeEnum.CampaignManager;
    const itemType = member.policyId ? 'Policy' : 'Member';
    const itemId = member.policyId ? member.policyId : member.id;

    const notesRequest = new NotesRequest(this.serviceType, itemType, itemId);
    const dialog = this.notesDialogComponent.open(NotesDialogComponent, { data: notesRequest });

    //this.audienceMember = member;
    //this.showSection = 'addNote';
    //this.loadingNote = true;
    //this.noteService.getNotes(this.serviceType, itemType, itemId).subscribe(
    //    data => {
    //        if (data && data.length > 0) {
    //            this.noteService.getNote(this.serviceType, data[0].id).subscribe(
    //                note => {
    //                    this.note = note;
    //                    this.loadingNote = false;
    //                    this.noteControl.setValue(this.note.text);
    //                }
    //            );
    //        } else {
    //            this.note = new Note();
    //            this.note.id = 0;
    //            this.note.itemType = itemType;
    //            this.note.itemId = itemId;
    //            this.note.text = '';
    //            this.loadingNote = false;
    //            this.noteControl.setValue(this.note.text);
    //        }
    //    }
    //);
  }

  //editNote(): void {
  //    this.appEventsManager.loadingStart('Saving note...');
  //    this.note.text = this.noteControl.value;
  //    if (this.note.id === 0) {
  //        this.insertNote();
  //    } else {
  //        this.updateNote();
  //    }
  //}

  //insertNote(): void {
  //    this.noteService.addNote(this.serviceType, this.note).subscribe(
  //        () => {
  //            this.appEventsManager.loadingStop();
  //            this.alertService.success('The note has been added.');
  //            this.showList();
  //        },
  //        error => {
  //            this.appEventsManager.loadingStop();
  //            this.alertService.error(error);
  //        }
  //    );
  //}

  //updateNote(): void {
  //    this.noteService.editNote(this.serviceType, this.note).subscribe(
  //        () => {
  //            this.appEventsManager.loadingStop();
  //            this.alertService.success('The note has been updated.');
  //            this.showList();
  //        },
  //        error => {
  //            this.appEventsManager.loadingStop();
  //            this.alertService.error(error);
  //        }
  //    );
  //}

  showList(): void {
    this.showSection = 'members';
  }

  back(): void {
    this.parent.showSection = 'list';
  }
}
