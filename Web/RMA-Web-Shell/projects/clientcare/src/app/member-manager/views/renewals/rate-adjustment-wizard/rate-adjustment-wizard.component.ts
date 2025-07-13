import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientRate } from 'projects/clientcare/src/app/policy-manager/shared/entities/client-rate';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './rate-adjustment-wizard.component.html'
})

export class RateAdjustmentWizardComponent extends WizardDetailBaseComponent<ClientRate[]> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  rolePlayer: RolePlayer;

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.isLoading$.next(false);
  }

  createForm(id: number): void { return; }

  onLoadLookups(): void { return;  }

  populateModel(): void { return; }

  populateForm(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
