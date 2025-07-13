import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { EventStatusEnum } from '../../../shared/enums/event-status-enum';

@Component({
  selector: 'event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent extends WizardDetailBaseComponent<EventModel>  {

  minDate: Date;
  deathType: number;
  eventType: number;
  communicationType: number;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any): void {
    this.minDate = new Date();
    this.form = this.formBuilder.group({
      id: [id],
      eventType: ['', [Validators.required]],
      deathType: [''],
      communicationType: ['', [Validators.required]],
      dateAdvised: ['', Validators.required],
      eventDate: ['', Validators.required],
      numberOfPeopleInvolved: [''],
      description: ['', [Validators.required]]
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.eventId = formModel.id as number;
    this.model.eventType = this.eventType;
    this.model.adviseMethodId = this.communicationType;
    this.model.description = formModel.description;
    this.model.dateAdvised = formModel.dateAdvised as Date;
    this.model.eventDate = formModel.eventDate as Date;
    //this.model.numberOfPeopleInvolved = formModel.numberOfPeopleInvolved as number;
    this.model.eventStatus = EventStatusEnum.Notified;
    this.model.isDeleted = false;
    this.model.createdBy = this.authService.getCurrentUser().email;
    this.model.modifiedBy = this.authService.getCurrentUser().email;
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.eventId,
      eventType: this.model.eventType,
      communicationType: this.model.adviseMethodId,
      description: this.model.description ? this.model.description : '',
      dateAdvised: this.model.dateAdvised ? this.model.dateAdvised : new Date(),
      eventDate: this.model.eventDate ? this.model.eventDate : new Date(),
      //numberOfPeopleInvolved: this.model.numberOfPeopleInvolved
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    return validationResult;
  }

  eventTypeChanged(event: any) {
    this.eventType = event.value as number;
  }

  deathTypeChanged(event: any) {
    this.deathType = event.value as number;
  }

  communicationTypeChanged(event: any) {
    this.communicationType = event.value as number;
  }
}
