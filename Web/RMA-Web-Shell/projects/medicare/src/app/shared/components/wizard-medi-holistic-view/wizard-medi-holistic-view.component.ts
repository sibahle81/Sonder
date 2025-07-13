import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { PreauthTypeEnum } from '../../../medi-manager/enums/preauth-type-enum';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PreAuthorisation } from '../../../preauth-manager/models/preauthorisation';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { MediCarePreAuthService } from '../../../preauth-manager/services/medicare-preauth.service';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WizardLockStatusEnum } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-lock-status.enum';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';

@Component({
  selector: 'app-wizard-medi-holistic-view',
  templateUrl: './wizard-medi-holistic-view.component.html',
  styleUrls: ['./wizard-medi-holistic-view.component.css']
})
export class WizardMediHolisticViewComponent extends WizardDetailBaseComponent<PreAuthorisation> implements OnInit {
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
  eventId: Number;
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
    if (this.context) {
      this.selectedPreAuthId = this.context.wizard.linkedItemId;
      this.getPreauth();
    }
    if (this.model.claimId && this.model.claimId > 0) {
      this.claimId = this.model.claimId;
      this.getClaim();
    }
    if (this.model.personEventId > 0) {
      this.personEventId = this.model.personEventId
      this.loadingData$.next(true);
      this.getPersonEvent();
    }

  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  constructor(
    readonly claimCareService: ClaimCareService,
    readonly preauthService: MediCarePreAuthService,
    appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {

  }

  getPersonEvent() {
    this.claimCareService.getPersonEvent(this.model.personEventId).subscribe(result => {

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

  getClaim() {
    this.claimCareService.getClaimDetailsById(this.model.claimId).subscribe(result => {
      this.selectedClaim = result;
    })
  }


  setPersonEvent(personEvent: PersonEventModel) {
    this.selectedPersonEvent = personEvent;
  }


  getPreauth() {
    this.preauthService.getPreAuthorisationById(this.selectedPreAuthId).subscribe(result => {
      this.selectedPreAuth = result;
      this.searchedPreauthType = result.preAuthType;
    })
  }
}

