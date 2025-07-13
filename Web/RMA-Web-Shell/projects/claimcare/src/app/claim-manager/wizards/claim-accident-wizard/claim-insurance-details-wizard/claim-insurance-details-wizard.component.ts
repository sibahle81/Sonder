import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../shared/entities/personEvent/event.model';

@Component({
  selector: 'app-claim-insurance-details-wizard',
  templateUrl: './claim-insurance-details-wizard.component.html',
  styleUrls: ['./claim-insurance-details-wizard.component.css']
})
export class ClaimInsuranceDetailsWizardComponent extends WizardDetailBaseComponent<EventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  eventModel: EventModel;
  member: RolePlayer;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly rolePlayerService: RolePlayerService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    return;
  }

  createForm(id: number): void {
    return;
  }

  onLoadLookups(): void {
    return;
  }

  populateModel(): void {
    return;
  }

  populateForm(): void {
    this.eventModel = this.model;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.personEvents.length <= 0) {
      validationResult.errorMessages.push('No Employee Details Are Captured');
      validationResult.errors += 1;
    } else {
      this.model.personEvents.forEach(personEvent => {
        if (!personEvent.personEventAccidentDetail) {
          validationResult.errorMessages.push(`No Injury Details Captured for ${personEvent.rolePlayer.person.firstName} ${personEvent.rolePlayer.person.surname}`);
          validationResult.errors += 1;
        }
      });
    }
    return validationResult;
  }
}
