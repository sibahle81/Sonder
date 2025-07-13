import { Component } from '@angular/core';
import { PremiumListing } from '../../shared/entities/premium-listing';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PremiumListingService } from './../../shared/Services/premium-listing.service';
import { HttpErrorResponse } from '@angular/common/http';
import { InsuredLivesSummary, InsuredLivesSummaryTable } from '../../shared/entities/insured-lives-summary';

@Component({
  selector: 'app-insured-lives',
  templateUrl: './insured-lives.component.html',
  styleUrls: ['./insured-lives.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class InsuredLivesComponent extends WizardDetailBaseComponent<PremiumListing> {

  errors: string[] = [];
  isLoading = false;
  pollingMessage = '';
  interval;

  datasource = new MatTableDataSource<InsuredLivesSummaryTable>();
  displayedColumns = ['description', 'count'];

  tempdata: InsuredLivesSummaryTable[] = [];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly premiumListingService: PremiumListingService,
    private readonly formBuilder: UntypedFormBuilder
  ) { 
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }

  populateModel() {}

  createForm() {
    this.form = this.formBuilder.group({
      company: '',
      fileIdentifier: '',
      date: '',
      version: ''
    });
  }

  populateForm() {
    this.errors = [];
    this.isLoading = true;
    this.pollingMessage = 'Loading file data...';
    if (Array.isArray(this.model) && this.model.length > 0) {
      this.model = this.model[0];
    }

    this.form.patchValue({
      company: this.model.company,
      fileIdentifier: this.model.fileIdentifier,
      date: new Date(this.model.date),
      version: `Insured Lives ${this.model.version}`
    });

    this.form.disable();
    this.startPolling();
    this.premiumListingService.importPolicyInsuredLives(
      { fileIdentifier: this.model.fileIdentifier, saveInsuredLives: false, createNewPolicies: this.model.createNewPolicies, version: this.model.version }
    ).subscribe(
      data => {
        this.tempdata = [];
        this.createTable(data);
        this.datasource = new MatTableDataSource(this.tempdata);
        this.isLoading = false;
        this.stopPolling();
      },
      (response: HttpErrorResponse) => {
        this.stopPolling();
        this.errors.push(response.error.Error);
        this.isLoading = false;
      }
    );
  }

  createTable(data: InsuredLivesSummary) {
    let transformdatatoRow: InsuredLivesSummaryTable = new InsuredLivesSummaryTable();
    transformdatatoRow.description = 'New';
    transformdatatoRow.count = data.newUsers;
    transformdatatoRow.amount = data.totalNew;
    this.tempdata.push(transformdatatoRow);
    // Updated
    transformdatatoRow = new InsuredLivesSummaryTable();
    transformdatatoRow.description = 'Update';
    transformdatatoRow.count = data.updatedUsers;
    transformdatatoRow.amount = data.totalUpdate;
    this.tempdata.push(transformdatatoRow);
    // Deleted
    if (this.model.version === 1) {
      transformdatatoRow = new InsuredLivesSummaryTable();
      transformdatatoRow.description = 'Cancelled';
      transformdatatoRow.count = data.deletedUsers;
      transformdatatoRow.amount = data.totalDelete;
      this.tempdata.push(transformdatatoRow);
    }
    // Total
    transformdatatoRow = new InsuredLivesSummaryTable();
    transformdatatoRow.description = 'Total';
    transformdatatoRow.count = (this.model.version === 1) ? data.totalUsers - data.deletedUsers : data.totalUsers;
    transformdatatoRow.amount = data.total;
    this.tempdata.push(transformdatatoRow);
  }

  private startPolling(): void {
    this.interval = setInterval(() => {
      this.premiumListingService.getUploadMessage(this.model.fileIdentifier).subscribe(
        data => {
          this.pollingMessage = data;
        }
      );
    }, 5000);
  }

  private stopPolling(): void {
    this.pollingMessage = 'File load completed.';
    clearInterval(this.interval);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.errors.length > 0) {
      validationResult.errors = this.errors.length;
      validationResult.errorMessages = this.errors;
    }
    return validationResult;
  }

}
