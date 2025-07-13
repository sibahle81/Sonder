import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { EventModel } from '../../../entities/personEvent/event.model';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'holistic-event',
  templateUrl: './holistic-event.component.html',
  styleUrls: ['./holistic-event.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HolisticEventComponent extends UnSubscribe implements OnChanges {

  @Input() eventId: number;
  @Input() personEventId: number;

  @Output() eventEmit = new EventEmitter<EventModel>();

  event: EventModel;

  isEdit = false;
  isNotSTP = false;
  
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading event details...please wait');
  locationCategories: Lookup[] = [];
  accidentRoute = '/claimcare/claim-manager/accident-claim/continue/';
  diseaseRoute = '/claimcare/claim-manager/disease-claim/continue/';

  hasEditPermissions = 'Edit Event';
  hasRunningWizard = false;
  activeWizards: Wizard[];

  accident = EventTypeEnum.Accident;

  currentUser: User;

  constructor(
    private readonly claimService: ClaimCareService,
    private readonly lookUpService: LookupService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly authService: AuthService,
    public dialog: MatDialog
    ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.eventId) { return };
    this.getLocationCategories()
    this.getEvent();
  }

  getLocationCategories(): void {
    this.lookUpService.getLocationCategories().subscribe(data => {
      this.locationCategories = data;
    });
  }

  getEvent() {
    this.claimService.getEvent(this.eventId).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result) {
        this.event = result;
        this.eventEmit.emit(result);
        this.isLoading$.next(false);
        this.isNotSTP = this.getPersonEventStp(this.event, this.personEventId);
      } else {
        return;
      }
    })
  }

  getPersonEventStp(event: EventModel, personEventId: number): boolean {
    const personEvent = event.personEvents.find(pe => pe.personEventId == personEventId);
    return personEvent ? personEvent.isStraightThroughProcess : this.isNotSTP;
  }

  getLocationCategory(id: number) {
    if (this.locationCategories.length != 0) {
      var locationCategory = this.locationCategories.find(a => a.id === id);
      return locationCategory ? locationCategory.name : '';
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getEventType(eventType: number): string {
    return this.formatText(EventTypeEnum[eventType]);
  }

  edit() {
    this.isEdit = !this.isEdit;
  }

  updateForm($event: EventModel) {
    if ($event) {
      this.event.eventDate = $event.eventDate;
      this.event.description = $event.description;
      this.event.locationCategory = $event.locationCategory;
      this.event.numberOfDeceasedEmployees = $event.numberOfDeceasedEmployees;
      this.event.numberOfInjuredEmployees = $event.numberOfInjuredEmployees;
    }
  }

  openStartEditWizardConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Start Edit Event Workflow?',
        text: 'Are you sure you want to proceed?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editWizard();
      }
    });
  }


  editWizard() {
    if (this.event.eventType === EventTypeEnum.Accident) {
      this.startWizard('accident-claim');
    }
    if (this.event.eventType === EventTypeEnum.Disease) {
      this.startWizard('disease-claim');
    }
  }

  startWizard(type: string) {
    this.alertService.loading('Starting wizard');
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(this.event);
    startWizardRequest.type = type;
    startWizardRequest.linkedItemId = this.event.eventId;
    this.createWizard(startWizardRequest);
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('starting wizard... please wait');
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      if (startWizardRequest.type === 'accident-claim') {
        this.router.navigate([this.accidentRoute, result.id]);
      }
      if (startWizardRequest.type === 'disease-claim') {
        this.router.navigate([this.diseaseRoute, result.id]);
      }
      this.isLoading$.next(false);
    });
  }

  setRunningWizards($event: boolean) {
    this.hasRunningWizard = $event;
  } 

  setActiveWizards($event: Wizard[]) {
    this.activeWizards = $event;
  }
}

