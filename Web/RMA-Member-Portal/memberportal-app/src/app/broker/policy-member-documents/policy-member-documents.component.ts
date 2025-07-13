import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { CompanyIdTypeEnum } from 'src/app/shared/enums/company-id-type-enum';
import { Case } from 'src/app/shared/models/case';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { PolicyMemberDocumentsDataSource } from './policy-member-documents-datasource';

@Component({
  selector: 'policy-member-documents',
  templateUrl: './policy-member-documents.component.html'
})
export class PolicyMemberDocumentsComponent extends WizardDetailBaseComponent<Case> implements OnInit {
  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  showReport = false;
  reportTitle: string;
  companyIdType: number;
  reportValue: string;

  public reportTypes = [
    { name: '', value: '' },
    { name: 'Premium Listing', value: 'RMAFuneralPolicyPremiumListing' },
    { name: 'Terms And Conditions', value: 'RMAFuneralPolicyGroupTermsAndConditions.pdf' },
  ];

  public selectedReportType: any;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,

    public readonly dataSource: PolicyMemberDocumentsDataSource
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    super.ngOnInit();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (value: any) => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
  }

  reportTypeChanged($event: any) {
    this.selectedReportType = this.reportTypes.filter(i => i.value === $event.value.value)[0];
    this.showReport = false;
    this.reportValue = this.selectedReportType.value;

    this.reportValue = (this.selectedReportType.value === 'RMAFuneralPolicyPremiumListing') ? (this.companyIdType === CompanyIdTypeEnum.Group ? 'RMAFuneralPolicyGroupPremiumListing' : 'RMAFuneralPolicyEmployerPremiumListing') : this.selectedReportType.value;

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.linkedId && this.selectedReportType.value !== '') {
        this.generatePolicyMemberDocuments(params.linkedId);
      }
    });
  }

  onLoadLookups(): void {

  }

  populateModel(): void {

  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      paymentFrequency: ['', [Validators.min(1)]]
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm(): void {
    if (this.model && this.model.mainMember && this.model.mainMember.company) {
      this.companyIdType = this.model.mainMember.company.companyIdType;
    }
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  generatePolicyMemberDocuments(wizardId: number): void {
      this.reportTitle = this.selectedReportType.name;
      this.parametersAudit = { wizardId };
      this.reportServerAudit = this.ssrsBaseUrl;
      this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.reportValue;
      this.showParametersAudit = 'true';
      this.languageAudit = 'en-us';
      this.widthAudit = 100;
      this.heightAudit = 100;
      this.toolbarAudit = 'false';
      this.showReport = true;
  }
}
