import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { EventSummary } from '../../../shared/entities/funeral/event-summary';
import { PersonEventSummary } from '../../../shared/entities/funeral/person-event-summary';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';

@Component({
  selector: 'app-event-summary',
  templateUrl: './event-summary.component.html',
  styleUrls: ['./event-summary.component.css']
})
export class EventSummaryComponent extends WizardDetailBaseComponent<EventModel> {

  ignoredFields = [];
  notes: string[] = [];
  eventSummary: EventSummary;
  personEventSummary: PersonEventSummary;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    this.eventSummary = new EventSummary();
    this.personEventSummary = new PersonEventSummary();

    this.eventSummary.eventReferenceNumber = this.model.eventReferenceNumber;
    // this.eventSummary.numberOfPeopleInvolved = this.model.numberOfPeopleInvolved;
    this.eventSummary.dateAdvised = this.model.dateAdvised == null ? '' : formatDate(this.model.dateAdvised, 'yyyy/MM/dd', 'en-US');
    this.eventSummary.eventDate = this.model.eventDate == null ? '' : formatDate(this.model.eventDate, 'yyyy/MM/dd', 'en-US');
    this.eventSummary.eventType = EventTypeEnum[this.model.eventType];
    this.eventSummary.description = this.model.description;

    this.personEventSummary.personEventReferenceNumber = this.model.personEvents[0].personEventReferenceNumber;
    this.personEventSummary.name = this.model.personEvents[0].firstName;
    this.personEventSummary.lastname = this.model.personEvents[0].lastName;
    this.personEventSummary.dHAReferenceNo = this.model.personEvents[0].personEventDeathDetail.dhaReferenceNo;
    this.personEventSummary.deathCertificateNo = this.model.personEvents[0].personEventDeathDetail.deathCertificateNo;
    this.personEventSummary.homeAffairsRegion = this.model.personEvents[0].personEventDeathDetail.homeAffairsRegion;
    this.personEventSummary.placeOfDeath = this.model.personEvents[0].personEventDeathDetail.placeOfDeath;
    this.personEventSummary.dateOfPostMortem = this.model.personEvents[0].personEventDeathDetail.dateOfPostmortem == null ? '' : formatDate(this.model.personEvents[0].personEventDeathDetail.dateOfPostmortem, 'yyyy/MM/dd', 'en-US');
    this.personEventSummary.postMortemNumber = this.model.personEvents[0].personEventDeathDetail.postMortemNumber;
    this.personEventSummary.bodyNumber = this.model.personEvents[0].personEventDeathDetail.bodyNumber;
    this.personEventSummary.sAPCaseNumber = this.model.personEvents[0].personEventDeathDetail.sapCaseNumber;
    this.getNotes();
  }

  getNotes() {
    if (this.model.eventNotes) {
      let count = 0 as number;
      for (const i of this.model.eventNotes) {
        const eventNote = (this.model.eventNotes[count]);
        const note = new Note();
        note.text = eventNote.text;
        this.notes.push(note.text);
        count++;
      }
    }
  }

  createForm(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm(): void {
    this.resetObjects();
    this.populateModel();
  }

  resetObjects() {
    const eventSummary = new EventSummary();
    const personEventSummary = new PersonEventSummary();
    const notes: string[] = [];

    this.eventSummary = eventSummary;
    this.personEventSummary = personEventSummary;
    this.notes = notes;
  }

  getObjectType(object): any {
    if (typeof object === null) { return; }
    return typeof object;
  }

  formatCamelCase(property): string {
    return property.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }

  asIsOrder(a, b) {
    return 1;
  }
}
