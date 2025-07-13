import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PolicyCancellationDataSource } from './policy-cancellation-datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';

@Component({
  selector: 'policy-cancellation',
  templateUrl: './policy-cancellation.component.html'
})
export class PolicyCancellationComponent extends WizardDetailBaseComponent<Case> implements WizardComponentInterface, OnInit {
  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  linkedId: any;
  showReport = true;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public readonly dataSource: PolicyCancellationDataSource) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    super.ngOnInit();

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.linkedId) {
        this.linkedId = params.linkedId;
      }
    });
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (value: any) => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
  }

  onLoadLookups(): void { }

  populateModel(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      paymentFrequency: ['', [Validators.min(1)]]
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm(): void {
    this.generatePolicyCancellation(this.linkedId);
  }

  loadDefaultReport(): void {
    this.showReport = true;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  generatePolicyCancellation(wizardId: number): void {
    this.showReport = false;
    this.parametersAudit = { wizardId };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/RMAFuneralPolicyCancellationLetter';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.showReport = true;
  }
}
