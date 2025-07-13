import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PolicyScheduleDataSource } from './policy-schedule-datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PolicyLifeExtension } from '../../shared/entities/policy-life-extension.model';
import { PolicyService } from '../../shared/Services/policy.service';
import { PolicyTemplates } from '../../shared/entities/policy-templates';

@Component({
  selector: 'policy-schedule',
  templateUrl: './policy-schedule.component.html'
})
export class PolicyScheduleComponent extends WizardDetailBaseComponent<Case> implements OnInit {
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
  wizardId: number;
  isLoading = false;
  counter = 0;
  policyLifeExtension: PolicyLifeExtension;
  reportTypes: PolicyTemplates[] = [];

  selectedReportTypeName: string;
  selectedReportType: string;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly policyService: PolicyService,
    public readonly dataSource: PolicyScheduleDataSource
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    super.ngOnInit();
    this.activatedRoute.params.subscribe((params: any) => {
      this.wizardId = params.linkedId;
    });
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.loadDefaultReport();
    });    
  }

  onLoadLookups(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateModel(): void { }

  populateForm(): void {
    
    this.policyService.getPolicyTemplatesByPolicyId(this.model.mainMember.policies[0].policyId).subscribe({
        next: (data) => {this.reportTypes = data;}
    });


   }

  createForm(id: number): void { }

  reportTypeChanged($event: any) {
    this.showReport = false;
    this.isLoading = true;
    this.selectedReportTypeName = $event.value.name;
    this.selectedReportType = $event.value.value;
    if (this.wizardId && this.selectedReportType !== '') {
      this.generateSelectedReport(this.wizardId);
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

  generateSelectedReport(wizardId: number): void {
    this.reportTitle = this.selectedReportTypeName;
    this.reportServerAudit = this.ssrsBaseUrl;

    if (this.selectedReportType.toLowerCase().endsWith('pdf')) {
      this.parametersAudit = { default: true };
      this.showParametersAudit = 'false';
    } else {
      if (this.isCFP() && this.selectedReportType === 'RMAFuneralPolicySchedule') {
        this.selectedReportType = 'RMACFPPolicySchedule';
      }
      
      this.parametersAudit = { wizardId: wizardId };    
      
      this.showParametersAudit = 'true';
    }

    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.selectedReportType;
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.showReport = true;
    this.isLoading = false;
    this.counter++;
  }

  isCFP(): boolean {
    if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      const policy = this.model.mainMember.policies[0];
      return policy.policyLifeExtension !== null;
    }
    return false;
  }
}
