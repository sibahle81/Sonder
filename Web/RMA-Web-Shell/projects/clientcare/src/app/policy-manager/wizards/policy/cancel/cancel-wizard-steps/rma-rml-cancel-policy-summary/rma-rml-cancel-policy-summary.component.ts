import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyStatusChangeAudit } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-status-change-audit';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  templateUrl: './rma-rml-cancel-policy-summary.component.html',
  styleUrls: ['./rma-rml-cancel-policy-summary.component.css']
})

export class RMARMLCancelPolicySummaryComponent extends WizardDetailBaseComponent<PolicyStatusChangeAudit> implements OnInit {

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void { }

  getStartDate(policy: Policy, startDate: Date) {
    return startDate < new Date(policy.policyInceptionDate) ?  policy.policyInceptionDate : startDate;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
