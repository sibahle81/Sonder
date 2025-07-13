import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { BundleRaise } from '../../models/bundle-raise';
import { BundleRaiseComponent } from 'projects/shared-components-lib/src/lib/bundle-raise/bundle-raise.component';

@Component({
  selector: 'bundle-raise-wizard',
  templateUrl: './bundle-raise-wizard.component.html',
  styleUrls: ['./bundle-raise-wizard.component.css']
})

export class BundleRaiseWizardComponent extends WizardDetailBaseComponent<BundleRaise> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @ViewChild(BundleRaiseComponent, { static: false }) bundleRaiseComponent: BundleRaiseComponent;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
      this.context.wizard.canEdit = this.context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;
    }

  createForm(id: number): void {}

  onLoadLookups(): void {}

  populateModel(): void {}

  populateForm(): void {
    if (this.bundleRaiseComponent) {
    this.bundleRaiseComponent.isReadOnly = this.context.wizard.wizardStatusId !== WizardStatus.AwaitingApproval;
   }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const zeroPremiumPolicy = this.model.policies.find( p => p.installmentPremium <= 0 && p.policyStatus === PolicyStatusEnum.PendingFirstPremium);
    if (zeroPremiumPolicy) {
      validationResult.errors++;
      validationResult.errorMessages.push('Policy premiums must be greater than zero.');
    }

    return validationResult;
  }

  get isReadonly(): boolean {
    if (this.isWizard) {
      return  !this.context.wizard.canEdit;
    } else {
      return false;
    }
  }
}
