import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  templateUrl: './rma-rml-maintain-policy-declaration-wizard.component.html'
})

export class RMARMLMaintainPolicyDeclarationWizardComponent extends WizardDetailBaseComponent<Policy> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  targetedInceptionDate: Date;

  _requiredDeclarationsSubmitted = false;

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

  populateForm(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this._requiredDeclarationsSubmitted) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('All included declaration details are required');
    }

    return validationResult;
  }

  requiredDeclarationsSubmitted($event: boolean) {
    this._requiredDeclarationsSubmitted = $event;
  }
}
