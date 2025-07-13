import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  templateUrl: './policy-member-details-wizard.component.html'
})

export class PolicyMemberDetailsWizardComponent extends WizardDetailBaseComponent<Policy[]> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  rolePlayerId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

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
      this.rolePlayerId = this.model[0].policyOwnerId;
      this.isLoading$.next(false);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
