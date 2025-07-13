import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { InsuredLivesSummaryTable, InsuredLivesSummary } from '../../shared/entities/insured-lives-summary';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ConsolidatedFuneralService } from '../../shared/Services/consolidated-funeral.service';
import { ConsolidatedFuneral } from '../../shared/entities/consolidated-funeral';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'app-consolidated-funeral-summary',
  templateUrl: './consolidated-funeral-summary.component.html',
  styleUrls: ['./consolidated-funeral-summary.component.css']
})
export class ConsolidatedFuneralSummaryComponent extends WizardDetailBaseComponent<ConsolidatedFuneral> {

  pollingMessage = '';
  errors: string[] = [];
  isLoading = false;

  datasource = new MatTableDataSource<InsuredLivesSummaryTable>();
  displayedColumns = ['description', 'count', 'amount'];

  tempdata: InsuredLivesSummaryTable[] = [];
  policyOnboardOptions: Lookup[] = [];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly consolidatedFuneralService: ConsolidatedFuneralService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }

  createForm() {
    this.form = this.formBuilder.group({
      company: '',
      fileIdentifier: '',
      date: '',
      policyOnboardOption: '',
      policyNumber: ''
    });
  }

  populateForm() {
    this.errors = [];
    this.isLoading = true;
    this.pollingMessage = 'Loading file data...';
    if (Array.isArray(this.model) && this.model.length > 0) {
      this.model = this.model[0];
    }

    this.lookupService.getPolicyOnboardOptions().subscribe({
      next: (data: Lookup[]) => {
        this.policyOnboardOptions = data;
        const option = this.policyOnboardOptions.find(s => s.id === this.model.policyOnboardOption);
        this.form.patchValue({
          company: this.model.company,
          fileIdentifier: this.model.fileIdentifier,
          date: new Date(this.model.date),
          policyOnboardOption: option?.name,
          policyNumber: this.model.policyNumber === 'none' ? '' : this.model.policyNumber
        });

        this.form.disable();
        this.consolidatedFuneralService.verifyConsolidatedFuneralImport(this.model.fileIdentifier, this.model.policyOnboardOption, this.model.policyNumber).subscribe({
          next: (data) => {
            this.tempdata = [];
            this.createTable(data);
            this.datasource = new MatTableDataSource(this.tempdata);
          },
          error: (response: HttpErrorResponse) => {
            const errorMessage = response.error.Error ? response.error.Error : response.message;
            this.errors.push(errorMessage);
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
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
    // Total
    transformdatatoRow = new InsuredLivesSummaryTable();
    transformdatatoRow.description = 'Total';
    transformdatatoRow.count = data.totalUsers;
    transformdatatoRow.amount = data.total;
    this.tempdata.push(transformdatatoRow);
  }

  populateModel() { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.errors.length > 0) {
      validationResult.errors = this.errors.length;
      validationResult.errorMessages = this.errors;
    }
    return validationResult;
  }
}
