import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { PremiumListingService } from './../../shared/Services/premium-listing.service';
import { PremiumListing } from '../../shared/entities/premium-listing';

@Component({
  selector: 'app-premium-listing-documents-group',
  templateUrl: './premium-listing-documents-group.component.html',
  styleUrls: ['./premium-listing-documents-group.component.css']
})
export class PremiumListingDocumentsGroupComponent extends WizardDetailBaseComponent<PremiumListing> implements OnInit {

  ssrsBaseUrl: string;
  reportServer: string;
  reportUrl: string;
  showParameters: string;
  parameters: any;
  language: string;
  width: number;
  height: number;
  toolbar: string;

  reportTitle: string;
  selectedReportType: string;
  showReport = false;
  isLoading = false;
  isDownloading = false;
  counter = 0;

  reportTypes = [
    { name: '', value: '' },
    { name: 'Welcome Letter', value: 'RMAFuneralGroupWelcomeLetter' },
    { name: 'Group Policy Schedule', value: 'RMAFuneralGroupPolicySchedule' },
    { name: 'Terms & Conditions', value: 'RMAFuneralPolicyGroupTermsAndConditions.pdf' }
  ];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    private readonly premiumListingService: PremiumListingService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = 'RMA.Reports.Common/Placeholder';
    this.showParameters = 'false';
    this.parameters = { default: true };
    this.language = 'en-us';
    this.width = 50;
    this.height = 50;
    this.toolbar = 'false';
  }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void {}

  populateForm(): void {
    this.setAvailableDocuments();
    this.loadPolicyData();
  }

  private setAvailableDocuments(): void {
    this.reportTypes = [];
    if (this.model.groupWelcomeLetter) {
      this.reportTypes.push({ name: 'Welcome Letter', value: 'RMAFuneralGroupWelcomeLetter' });
    }
    this.reportTypes.push({ name: 'Group Policy Schedule', value: 'RMAFuneralGroupPolicySchedule' });
    if (this.model.groupTermsAndConditions) {
      this.reportTypes.push({ name: 'Terms & Conditions', value: 'RMAFuneralPolicyGroupTermsAndConditions.pdf' });
    }
  }

  private loadPolicyData(): void {
    if (this.model.policyId && this.model.policyId > 0) { return; }
    this.isLoading = true;
    this.premiumListingService.getPolicyId(this.model.fileIdentifier).subscribe(
      (data) => {
        this.model.policyId = Number(data);
        this.isLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.message);
        this.isLoading = false;
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  showSelectedReport(reportId: any): void {
    this.showReport = false;
    if (!this.model.policyId || this.model.policyId < 0) { return; }
    const title = this.getReportName(reportId);
    if (title === '') { return; }
    this.counter++;
    this.reportTitle = title;
    this.parameters = { policyId: this.model.policyId, counter: this.counter };
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = 'RMA.Reports.ClientCare.Policy/' + reportId;
    this.showParameters = 'true';
    this.language = 'en-us';
    this.width = 100;
    this.height = 100;
    this.toolbar = 'false';
    this.isLoading = false;
    this.showReport = true;
  }

  getReportName(reportId: any): string {
    const report = this.reportTypes.find(s => s.value === reportId);
    return report ? report.name : '';
  }

  reportError(event: any): void {
    this.showReport = false;
    if (event instanceof HttpErrorResponse) {
      this.alertService.error(event.message);
    }
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }
}
