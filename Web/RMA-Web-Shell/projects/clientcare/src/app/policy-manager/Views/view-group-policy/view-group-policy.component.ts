import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { GroupPolicySchemeService } from '../group-policy-scheme-selection/group-policy-scheme.service';
import { UpgradeDowngradePolicyCase } from '../../shared/entities/upgrade-downgrade-policy-case';
import { Policy } from '../../shared/entities/policy';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ChangePolicyOption } from '../../shared/entities/change-policy-option';
import { ProductOption } from '../../../product-manager/models/product-option';

@Component({
  selector: 'app-view-group-policy',
  templateUrl: './view-group-policy.component.html',
  styleUrls: ['./view-group-policy.component.css']
})
export class ViewGroupPolicyComponent extends WizardDetailBaseComponent<UpgradeDowngradePolicyCase> implements AfterContentChecked {

  isLoading = false;
  loadedPolicyId: number;
  productOptionId: number;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    public readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly schemeService: GroupPolicySchemeService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      policyId: [null],
      policyNumber: [null],
      policyStatus: [null],
      schemeName: [null],
      productOption: [null],
      brokerage: [null],
      representative: [null]
    });
    this.form.disable();
  }

  populateForm(): void {
    if (!this.model.policyId) { return; }
    if (this.loadedPolicyId > 0) { return; }

    this.isLoading = true;

    this.schemeService.getPolicyById(this.model.policyId).subscribe({
      next: (data: Policy) => {
        this.form.patchValue({
          policyStatus: PolicyStatusEnum[data.policyStatusId],
          policyNumber: data.policyNumber,
          schemeName: data.policyOwner.company ? data.policyOwner.company.name : 'Individual Policy',
          brokerage: data.brokerageName,
          representative: data.representativeName,
          productOption: data.productOption.name
        });
        this.loadedPolicyId = data.policyId;
        this.productOptionId = data.productOption.id;
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : 'Could not load policy';
        this.alertService.error(errorMessage, 'Policy Error');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  populateModel(): void {
    if (!this.model.productOption) {
      this.model.productOption = new ChangePolicyOption();
    }
    this.model.productOption.before = this.productOptionId;
    if (!this.model.productOption.after) {
      this.model.productOption.after = 0;
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
