import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';

@Component({
  selector: 'app-claim-incident-details-wizard',
  templateUrl: './claim-disease-details-wizard.component.html',
  styleUrls: ['./claim-disease-details-wizard.component.css']
})
export class ClaimDiseaseDetailsWizardComponent extends WizardDetailBaseComponent<EventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  isValid: boolean;

  employer: RolePlayer;

  employerContacts: RolePlayerContact[];
  filteredDesignationTypes = [ContactDesignationTypeEnum.PrimaryContact];
  filteredInformationTypes = [ContactInformationTypeEnum.Claims];

  selectedTab = 2;

  hasConfirmed = false;

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
    return;
  }

  setEmployer($event: RolePlayer) {
    this.employer = $event;
  }

  setContacts($event: RolePlayerContact[]) {
    this.employerContacts = $event;
    if(!this.hasConfirmed) {
      this.employerContacts.forEach(contact => {
        contact.isConfirmed = false;
        this.hasConfirmed = true;
      });
    }
  }

  setIsValid($event: boolean) {
    this.isValid = $event;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.isValid) {
      this.populateError(validationResult, 'Disease details are required')
    };

    if (this.employerContacts?.length <= 0 || !this.employerContacts?.some(s => s.rolePlayerContactInformations?.some(t => t.contactInformationType == ContactInformationTypeEnum.Claims))) {
      validationResult.errorMessages.push('Employer requires a claims contact');
      validationResult.errors = validationResult.errors + 1;
    }

    if (this.employerContacts?.some(s => s.rolePlayerContactInformations?.some(t => t.contactInformationType == ContactInformationTypeEnum.Claims) && !s.isConfirmed)) {
      validationResult.errorMessages.push('Employer claims contacts must be confirmed');
      validationResult.errors = validationResult.errors + 1;
    }

    return validationResult;
  }

  populateError(validationResult: ValidationResult, message: string): ValidationResult {
    validationResult.errorMessages.push(message);
    validationResult.errors = validationResult.errors + 1;
    return validationResult;
  }
}