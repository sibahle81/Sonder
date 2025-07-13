import { Component, OnInit } from '@angular/core';
import { MaaRouting } from '../../../../models/maa-routing';
import { ActivatedRoute } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { PreAuthorisation } from '../../../../models/preauthorisation';
import { MediCarePreAuthService } from '../../../../services/medicare-preauth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'app-maa-routing-holistic-view',
  templateUrl: './maa-routing-holistic-view.component.html',
  styleUrls: ['./maa-routing-holistic-view.component.css']
})
export class MaaRoutingHolisticViewComponent extends WizardDetailBaseComponent<PreAuthorisation> implements OnInit {
  loadingData$ = new BehaviorSubject<boolean>(false);
  isInternalUser: boolean = true;
  currentUserEmail: string;
  selectedTab = 0;
  noPersonEventLink: boolean = false;
  personEventId: number;
  claimId = 0;
  selectedEvent: EventModel;
  selectedPersonEvent: PersonEventModel;
  icd10List = [];
  mode = ModeEnum.Default;
  eventId: number;
  previousUrl = '';
  preloadMedicalInvoices = false;
  searchedPreauthType: PreauthTypeEnum = PreauthTypeEnum.Unknown;
  selectedPreAuthId = 0;
  isHolisticView = false;
  selectedClaim: Claim;
  selectedPreAuth: PreAuthorisation;

  createForm(id: number): void {

  }
  onLoadLookups(): void {

  }
  populateModel(): void {
  }

  populateForm(): void {
    if (this.context.wizard.linkedItemId) {
      this.selectedPreAuth = this.model;
      this.selectedPreAuthId = this.context.wizard.linkedItemId;
      if (this.model) {
        this.claimId = this.model.claimId;
        this.searchedPreauthType = this.model.preAuthType;
        this.personEventId = this.model.personEventId;
      }
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  constructor(
    readonly claimCareService: ClaimCareService,
    readonly preauthService: MediCarePreAuthService,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {

  }

  getPersonEvent(personEventId: number) {
    this.claimCareService.getPersonEvent(personEventId).subscribe(result => {
      this.selectedPersonEvent = result;
      this.eventId = this.selectedPersonEvent.eventId
      this.getEvent();
    })
  }

  getEvent() {
    this.claimCareService.getEventDetails(this.selectedPersonEvent.eventId).subscribe(result => {
      this.selectedEvent = result;
      this.loadingData$.next(false);
    })
  }

  setPersonEvent(personEvent: PersonEventModel) {
    this.selectedPersonEvent = personEvent;
  }

  getClaim(claimId: number) {
    this.claimCareService.getClaimDetailsById(claimId).subscribe(result => {
      this.selectedClaim = result;
    })
  }

  getPreauth() {
    this.preauthService.getPreAuthorisationById(this.selectedPreAuthId).subscribe(result => {
      this.selectedPreAuth = result;
      this.searchedPreauthType = result.preAuthType;
      this.personEventId = result.personEventId;
      if (result.personEventId && result.personEventId > 0) {
        this.getPersonEvent(result.personEventId);
      }
      if (result.claimId && result.claimId > 0) {
        this.claimId = result.claimId;
        this.getClaim(result.claimId);
      }
    })
  }
}

