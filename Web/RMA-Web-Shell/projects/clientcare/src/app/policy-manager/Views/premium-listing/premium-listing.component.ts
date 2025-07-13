import { PremiumListingService } from './../../shared/Services/premium-listing.service';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PremiumListing } from '../../shared/entities/premium-listing';
import { InsuredLivesSummary, InsuredLivesSummaryTable } from '../../shared/entities/insured-lives-summary';

@Component({
  selector: 'app-premium-listing',
  templateUrl: './premium-listing.component.html',
  styleUrls: ['./premium-listing.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PremiumListingComponent extends WizardDetailBaseComponent<PremiumListing> {

  errors: string[] = [];
  isLoading = false;
  pollingMessage = '';

  datasource = new MatTableDataSource<InsuredLivesSummaryTable>();
  displayedColumns = ['description', 'count', 'amount'];

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

    this.form.patchValue({
      company: this.model.company,
      fileIdentifier: this.model.fileIdentifier,
      date: new Date(this.model.date),
      version: `Premium Listing ${this.model.version}`
    });

    this.form.disable();
    this.premiumListingService.importInsuredLives(
      { fileIdentifier: this.model.fileIdentifier, saveInsuredLives: false, createNewPolicies: this.model.createNewPolicies, version: this.model.version }
    ).subscribe(
      data => {
        this.tempdata = [];
        this.createTable(data);
        this.datasource = new MatTableDataSource(this.tempdata);
        this.isLoading = false;
      },
      (response: HttpErrorResponse) => {
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

  populateModel() {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.errors.length > 0) {
      validationResult.errors = this.errors.length;
      validationResult.errorMessages = this.errors;
    }
    return validationResult;
  }
}
