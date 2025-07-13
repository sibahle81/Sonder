import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyStatusChangeAudit } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-status-change-audit';

@Component({
  templateUrl: './rma-rml-reinstate-policy.component.html',
  styleUrls: ['./rma-rml-reinstate-policy.component.css']
})

export class RMARMLReinstatePolicyComponent extends WizardDetailBaseComponent<PolicyStatusChangeAudit> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  filteredPolicyIds: number[];

  documentSystemName = DocumentSystemNameEnum.WizardManager;
  documentSet = DocumentSetEnum.PolicyReinstatement;
  allRequiredDocumentsUploaded: boolean;
  wizardId: string;

  policy: Policy;

  minDate: Date;
  maxDate: Date;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.linkedId) {
        this.wizardId = params.linkedId;
      }
    });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      effectiveDate: [{ value: null, disabled: this.inApprovalMode }, Validators.required]
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    this.model.effectiveFrom = new Date(this.form.controls.effectiveDate.value).getCorrectUCTDate();
  }

  populateForm(): void {
    this.getPolicy();
  }

  getPolicy() {
    this.policy = this.model.policy;

    this.form.patchValue({
      effectiveDate: this.model.effectiveFrom ? this.model.effectiveFrom : new Date(this.policy.cancellationDate)
    });

    this.minDate = new Date(this.policy.cancellationDate);
    this.maxDate = new Date();

    this.setContextPolicyIds();

  }

  setContextPolicyIds() {
    this.filteredPolicyIds = [this.policy.policyId];

    if (this.model.vapsPolicies && this.model.vapsPolicies.length > 0) {
      this.model.vapsPolicies.forEach(s => {
        this.filteredPolicyIds.push(s.policyId);
      });
    }

    this.isLoading$.next(false);
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.allRequiredDocumentsUploaded) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('All required documents must be uploaded');
    }
    return validationResult;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
