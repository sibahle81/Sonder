import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { ValidationResult } from "src/app/shared/components/wizard/shared/models/validation-result";
import { WizardDetailBaseComponent } from "src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { Case } from "src/app/shared/models/case";
import { LookupService } from "src/app/shared/services/lookup.service";
import { PolicyScheduleDataSource } from "./policy-schedule-datasource";


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

  reportTypes = [
    { name: '', value: '' },
    { name: 'Welcome Cover Letter', value: 'RMAFuneralWelcomeLetter' },
    { name: 'Policy Schedule', value: 'RMAFuneralPolicySchedule' },
    { name: 'Terms And Conditions', value: 'RMAFuneralCoverTermsAndConditions.pdf' }
  ];

  selectedReportTypeName: string;
  selectedReportType: string;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
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

  populateForm(): void { }

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
    this.parametersAudit = { wizardId, counter: this.counter };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Policy/' + this.selectedReportType;
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading = false;
    this.showReport = true;
    this.counter++;
  }
}
