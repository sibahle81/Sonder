import { AfterContentChecked, ChangeDetectorRef, Component, Directive, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Data } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { GroupPolicySchemeService } from './group-policy-scheme.service';
import { MoveSchemeCase } from '../../shared/entities/move-scheme-case';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { Policy } from '../../shared/entities/policy';

@Component({
  selector: 'app-base',
  template: '<p>base component</p>',
  styleUrls: []
})
export class GroupPolicySchemeSelectionComponent extends WizardDetailBaseComponent<MoveSchemeCase> implements AfterContentChecked {

  isSourceScheme: boolean;
  loadedPolicyId: number;
  loadingPolicy = false;

  get getTitle(): string {
    return this.isSourceScheme ? 'Source Scheme' : 'Target Scheme';
  }

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
      policyId: [null, [Validators.required, Validators.min(1)]],
      policyNumber: [null, [Validators.required]],
      policyStatus: [null],
      schemeName: [null, [Validators.required]],
      productOption: [null],
      brokerage: [null],
      representative: [null]
    });
    this.form.get('policyStatus').disable();
    this.form.get('productOption').disable();
    this.form.get('brokerage').disable();
    this.form.get('representative').disable();
  }

  populateForm(): void { }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.isSourceScheme && this.model.sourcePolicyId === this.model.destinationPolicyId) {
      validationResult.errorMessages.push('The source and target schemes cannot be the same');
      validationResult.errors++;
    }
    return validationResult;
  }

  loadPolicyDetails(policyId: number): void {
    if (!policyId || policyId === 0) { return; }
    if (policyId === this.loadedPolicyId) { return; }
    this.loadingPolicy = true;
    this.schemeService.getPolicyById(policyId).subscribe({
      next: (data: Policy) => {
        this.form.patchValue({
          policyStatus: PolicyStatusEnum[data.policyStatusId],
          schemeName: data.policyOwner.company ? data.policyOwner.company.name : null,
          brokerage: data.brokerageName,
          representative: data.representativeName,
          productOption: data.productOption.name
        });
        this.loadedPolicyId = data.policyId;
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : 'Could not load policy';
        this.alertService.error(errorMessage, 'Policy Error');
        this.loadingPolicy = false;
      },
      complete: () => {
        this.loadingPolicy = false;
      }
    });
  }

  searchPolicyKeyup(event: any): void {
    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter') { return; }
      this.getPolicyDetails();
    }
  }

  searchPolicyButton(event: any): void {
    this.getPolicyDetails();
  }

  getPolicyDetails(): void {
    if (this.isSourceScheme) { return; }
    this.loadedPolicyId = null;
    const policyNumber = this.form.get('policyNumber').value as string;
    this.clearPolicyDetails();
    if (policyNumber.length > 13) {
      this.loadingPolicy = true;
      this.schemeService.getPolicyByNumber(policyNumber).subscribe({
        next: (data: Policy) => {
          if (data && data.policyId > 0) {
            if (this.isSourceScheme) {
              this.model.sourcePolicyId = data.policyId;
              this.model.sourcePolicyNumber = data.policyNumber;
            } else {
              this.model.destinationPolicyId = data.policyId;
              this.model.destinationPolicyNumber = data.policyNumber;
            }
            this.form.patchValue({
              policyId: data.policyId,
              policyNumber
            });
            this.loadPolicyDetails(data.policyId);
          } else {
            this.alertService.error(`Could not find policy ${policyNumber}`, 'Search Error');
            this.loadingPolicy = false;
          }
        },
        error: (response: HttpErrorResponse) => {
          this.alertService.error(response.error.Error, 'Search Error');
          this.loadingPolicy = false;
        }
      });
    }
  }

  clearPolicyDetails(): void {
    this.form.patchValue({
      policyId: null,
      policyStatus: '',
      schemeName: '',
      productOption: '',
      brokerage: '',
      representative: ''
    });
  }
}
