import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { BehaviorSubject } from 'rxjs';
import { Claim } from '../../../../shared/entities/funeral/claim.model';
import { EventModel } from '../../../../shared/entities/personEvent/event.model';

@Component({
  templateUrl: './invoice-pay-sca.component.html'
})
export class InvoicePaySCA extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedPersonEvent: PersonEventModel;
  selectedClaim: Claim;

  defaultPEVTabIndex = 2;
  isReadOnly = false;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
    this.getEvent();
   }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getEvent() {
    this.claimService.getEvent(this.model.eventId).subscribe(result => {
      this.model.event = result;
      this.selectedPersonEvent = result.personEvents.find(p => p.personEventId == this.model.personEventId);
      
      const shallowEvent = { ...result, personEvents: [] } as EventModel;
      this.selectedPersonEvent.event = shallowEvent; 
      this.isLoading$.next(false);
    });
  }

  setSelectedClaim($event: Claim) {
    this.selectedClaim = $event;
  }

  resetClaim() {
    this.selectedClaim = null;
  }
}