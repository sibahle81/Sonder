import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../shared/entities/personEvent/event.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';

@Component({
  templateUrl: './claim-incident-details-wizard.component.html',
  styleUrls: ['./claim-incident-details-wizard.component.css']
})
export class ClaimIncidentDetailsWizardComponent extends WizardDetailBaseComponent<EventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  employer: RolePlayer;

  employerContacts: RolePlayerContact[];
  filteredDesignationTypes = [ContactDesignationTypeEnum.PrimaryContact];
  filteredInformationTypes = [ContactInformationTypeEnum.Claims];

  hasSetConfirmed = false;
  hasConfirmed = false;

  selectedTab = 2;
  selectedPolicyProductCategory: ProductCategoryTypeEnum;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute
  ) {
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
    this.model.productCategoryType = this.selectedPolicyProductCategory;
    return;
  }

  populateForm(): void { }

  setEmployer($event: RolePlayer) {
    this.employer = $event;
  }

  setContacts($event: RolePlayerContact[]) {
    this.employerContacts = $event;

    if (!this.hasSetConfirmed && !this.hasConfirmed) {
      this.employerContacts.forEach(contact => {
        contact.isConfirmed = false;
        this.hasConfirmed = true;
      });

      this.hasSetConfirmed = true;
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.description) {
      validationResult.errorMessages.push('Event description is required');
      validationResult.errors = validationResult.errors + 1;
    }

    if (!this.model.locationCategory) {
      validationResult.errorMessages.push('Location category is required');
      validationResult.errors = validationResult.errors + 1;
    }

    if (!this.model.memberSiteId) {
      validationResult.errorMessages.push('Employer site is required');
      validationResult.errors = validationResult.errors + 1;
    }

    if (this.model.numberOfDeceasedEmployees < 0) {
      validationResult.errorMessages.push('Number of deceased employees is required');
      validationResult.errors = validationResult.errors + 1;
    }

    if (this.model.numberOfInjuredEmployees < 1) {
      validationResult.errorMessages.push('Number of injured employees is required');
      validationResult.errors = validationResult.errors + 1;
    }

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

  onPolicySelected(policy: Policy) {
    this.selectedPolicyProductCategory = policy.productCategoryType;
  }
}
