import { Component, OnInit, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { SearchResultModel } from '../../../shared/entities/funeral/search-result.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PersonEventAccidentDetail } from '../../../shared/entities/funeral/person-event-accident-detail';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { PersonEventDeathDetailModel } from '../../../shared/entities/personEvent/personEventDeathDetail.model';
import { EventModel } from '../../../shared/entities/personEvent/event.model';

@Component({
  selector: 'person-event',
  templateUrl: './person-event.component.html',
  styleUrls: ['./person-event.component.css']
})
export class PersonEventComponent extends WizardDetailBaseComponent<EventModel> implements OnInit {

  @ViewChild('personEventDeathCom', { static: false }) personEventDeathCom;

  showHide = 0;
  isGetDetail = 0;
  eventResult = 0;

  showAdd: number;
  numberOfPersons: number;
  resultType = new UntypedFormControl('');

  personEvents: PersonEventModel[];
  searchResultModel: SearchResultModel;
  personEventDeathDetail: PersonEventDeathDetailModel;

  constructor(
    authService: AuthService,
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: any): void {
    this.form = this.formBuilder.group({
      id: [id]
    });
  }

  ngOnInit() {
    this.showAdd = 0;
    if (this.router.url.includes('event/event-details')) {
      console.log('yes');
      this.showHide = 1;
      this.eventResult = 1;
    }
  }

  onLoadLookups(): void { }

  showHideChangeHandler(res: any) {
    this.showHide = 0;
    if (this.numberOfPersons === res) {
      this.showAdd = 0;
    }
    this.populateModel();
  }

  resultTypeChanged(event: any) {
    this.eventResult = event.value as number;
  }

  resultsChangeHandler(searchResultModel: SearchResultModel): void {
    this.searchResultModel = searchResultModel;
    this.showHide = 1;
    this.numberOfPersons = 0; // this.model.numberOfPeopleInvolved;
    if (this.numberOfPersons > 1) {
      this.showAdd = 1;
    } else {
      this.showAdd = 0;
    }
    if (this.model.personEvents !== null) {
      if (this.model.personEvents.length === this.numberOfPersons) {
        this.showAdd = 0;
      }
      if (this.model.personEvents.length < this.numberOfPersons) {
        this.showAdd = 1;
      } else {
        this.showAdd = 0;
      }
    }
  }

  populateModel(): void {
    this.isGetDetail = 1;
    const formModel = this.form.getRawValue();
    const personEvent = new PersonEventModel();
    personEvent.personEventId = 1;
    personEvent.eventId = 1;
    personEvent.insuredLifeId = this.searchResultModel.id;
    personEvent.firstName = this.searchResultModel.memberFirstName;
    personEvent.lastName = this.searchResultModel.memberLastName;
    personEvent.claimantId = 1; // To be changed as we proceed
    personEvent.personEventBucketClassId = 1; // To be changed as we proceed
    personEvent.dateReceived = new Date();
    personEvent.dateCaptured = new Date();
    personEvent.capturedByUserId = this.authService.getCurrentUser().id;

    personEvent.personEventAccidentDetail = null;
    personEvent.personEventDiseaseDetail = null;
    personEvent.personEventNoiseDetail = null;
    personEvent.personEventDeathDetail = this.personEventDeathCom.readForm();
    if (this.model.personEvents == null) {
      this.model.personEvents = new Array();
    }
    this.model.personEvents.push(personEvent);
    console.log(this.model);
  }

  personEventDeathChangeHandler(personEventDeathDetail: PersonEventDeathDetailModel) {
    // this.model.personEvent[0].personEventDeathDetail = personEventDeathDetail;
  }

  personEventAccidentChangeHandler(personEventAccidentDetail: PersonEventAccidentDetail) {
    // this.model.personEvent[0].personEventAccidentDetail = personEventAccidentDetail;
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.eventId
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
