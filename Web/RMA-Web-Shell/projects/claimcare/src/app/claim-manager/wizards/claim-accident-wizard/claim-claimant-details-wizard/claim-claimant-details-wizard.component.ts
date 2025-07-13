import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';

@Component({
  templateUrl: './claim-claimant-details-wizard.component.html',
  styleUrls: ['./claim-claimant-details-wizard.component.css']
})
export class ClaimClaimantDetailsWizardComponent extends WizardDetailBaseComponent<EventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  triggerRefresh: boolean;

  diseaseType = EventTypeEnum.Disease

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
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
    if (this.model) {
      this.model.wizardId = this.context.wizard.id;
    }
  }

  refresh() {
    this.triggerRefresh = !this.triggerRefresh;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    if (this.model.personEvents.length <= 0) {
      this.populateError(validationResult, 'No employees have been captured');
    } else {
      if(this.model.numberOfInjuredEmployees && this.model.numberOfInjuredEmployees > 0 && this.model.numberOfInjuredEmployees > this.model.personEvents?.length) {
        this.populateError(validationResult, `Number of employees captured is less then indicated: (${this.model.personEvents.length} / ${this.model.numberOfInjuredEmployees})`);
      }

      for (let pev of this.model.personEvents) {

        if (!pev.rolePlayer?.displayName || !pev.rolePlayer?.person) {
          this.populateError(validationResult, 'No employees have been captured');
          break;
        }

        if (pev.rolePlayer && (!pev.rolePlayer.rolePlayerContacts || pev.rolePlayer.rolePlayerContacts.length <= 0)) {
          this.populateError(validationResult, `${pev.rolePlayer?.displayName ? pev.rolePlayer.displayName : 'Employee'} does not have at least one contact detail`);
        }

        if (pev.rolePlayer && (pev.rolePlayer.rolePlayerContacts && pev.rolePlayer.rolePlayerContacts.length > 0)) {
          pev.rolePlayer.rolePlayerContacts.forEach(contact => {
            if (pev.personEventStatus == PersonEventStatusEnum.New && !contact.isConfirmed) {
              this.populateError(validationResult, `${pev.rolePlayer?.displayName ? pev.rolePlayer.displayName : 'Employee'} contact details must be confirmed`);
            }
          });
        }

        if (pev.rolePlayer && pev.rolePlayer.person && (!pev.rolePlayer.person.personEmployments || pev.rolePlayer.person.personEmployments.length <= 0)) {
          this.populateError(validationResult, `${pev.rolePlayer?.displayName ? pev.rolePlayer.displayName : 'Employee'} does not have any employment information`);
        }

        if (!pev.physicalDamages || pev.physicalDamages.length <= 0) {
          this.populateError(validationResult, `${pev.rolePlayer?.displayName ? pev.rolePlayer.displayName : 'Employee'} does not have any injury details captured`);
        } else {
          pev.physicalDamages.forEach(pd => {
            if (!pd.injuries || pd.injuries.length <= 0) {
              this.populateError(validationResult, `${pev.rolePlayer?.displayName ? pev.rolePlayer.displayName : 'Employee'} does not have any injuries for each injury detail captured`);
            }
          });
        }
      }
    }

    return validationResult;
  }

  populateError(validationResult: ValidationResult, message: string): ValidationResult {
    validationResult.errorMessages.push(message);
    validationResult.errors = validationResult.errors + 1;
    return validationResult;
  }
}

