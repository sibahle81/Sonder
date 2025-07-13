import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { RepresentativeService } from '../../services/representative.service';
import { Representative } from '../../models/representative';
import { RepresentativeDataSource } from '../../datasources/representative.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'representative-authorised-representative',
  templateUrl: './representative-authorised-representative.component.html'
})
export class RepresentativeAuthorisedRepresentativeComponent extends WizardDetailBaseComponent<Representative>  {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  loadingReps = false;
  displayedColumns = ['code', 'name', 'idNumber', 'dateOfAppointment', 'startDate', 'endDate'];

  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    private readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly brokerService: RepresentativeService,
    public readonly dataSource: RepresentativeDataSource
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id]
    });
    this.dataSource.setControls(this.paginator, this.sort);
  }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    this.loadingReps = true;
    this.brokerService.getAuthorisedRepresentatives(this.model.id).subscribe(
      data => {
        this.dataSource.getData(data);
        this.loadingReps = false;
      },
      request => {
        this.alertService.error(request.error.Error, 'View Representative');
        this.loadingReps = false;
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
