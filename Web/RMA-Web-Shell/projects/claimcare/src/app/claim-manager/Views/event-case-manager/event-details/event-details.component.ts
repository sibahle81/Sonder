import { Component, OnInit, ViewChild } from '@angular/core';
import { EventComponent } from '../event/event.component';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { EventNotesComponent } from '../event-notes/event-notes.component';
import { Router } from '@angular/router';
import { BreadcrumbProductService } from 'projects/clientcare/src/app/product-manager/services/breadcrumb-product.service';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { EventModel } from '../../../shared/entities/personEvent/event.model';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {

  @ViewChild(EventComponent, { static: true }) eventComponent: EventComponent;
  @ViewChild(AuditLogComponent, { static: false }) auditLogComponent: AuditLogComponent;
  @ViewChild(EventNotesComponent, { static: false }) notesComponent: EventNotesComponent;
  @ViewChild('personEventDeathCom', { static: true }) personEventDeathCom;

  isLoading: boolean;
  statusId: number;
  currentId: number;
  event: EventModel;

  constructor(
    private router: Router,
    private readonly breadCrumbService: BreadcrumbProductService) {
  }

  ngOnInit(): void {
    this.event = new EventModel();
    this.isLoading = true;
    this.breadCrumbService.setBreadcrumb('View Event Details');
  }

  /** @description Gets the audit details for the selected details class */
  getAuditDetails(id: number, serviceType: number, itemType: number): void {
    const auditRequest = new AuditRequest(serviceType, itemType, id);
    this.auditLogComponent.getData(auditRequest);
  }

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }

  edit() {
    this.router.navigate(['claimcare/claim-manager/manage-event/new', this.currentId]);
  }

  acknowledge() { }

  reject() { }

  back() {
    this.router.navigate(['claimcare/event-manager/event/search-event']);
  }
}
