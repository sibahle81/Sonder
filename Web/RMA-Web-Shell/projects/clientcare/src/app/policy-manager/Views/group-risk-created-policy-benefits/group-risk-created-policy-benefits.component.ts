import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { ConsolidatedFuneral } from '../../shared/entities/consolidated-funeral';  // remove
import { GroupRisk } from '../../shared/entities/group-risk';
import { InsuredLivesSummaryTable, InsuredLivesSummary } from '../../shared/entities/insured-lives-summary';
import { GroupRiskService } from '../../shared/Services/group-risk.service';

@Component({
  selector: 'app-group-risk-created-policy-benefits',
  templateUrl: './group-risk-created-policy-benefits.component.html',
  styleUrls: ['./group-risk-created-policy-benefits.component.css']
})
export class GroupRiskCreatedPolicyBenefitsComponent extends WizardDetailBaseComponent<GroupRisk> {

  pollingMessage = '';
  errors: string[] = [];
  isLoading = false;

  datasource = new MatTableDataSource<InsuredLivesSummaryTable>();
  displayedColumns = ['description', 'count', 'amount'];

  tempdata: InsuredLivesSummaryTable[] = [];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupriskService: GroupRiskService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }

  createForm() {
    this.form = this.formBuilder.group({
      company: '',
      fileIdentifier: '',
      date: ''
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
        date: new Date(this.model.date)
      });

      this.form.disable();
      this.groupriskService.verifyGroupRiskImport(this.model.fileIdentifier).subscribe({
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

  populateModel() {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.errors.length > 0) {
      validationResult.errors = this.errors.length;
      validationResult.errorMessages = this.errors;
    }
    return validationResult;
  }
}
