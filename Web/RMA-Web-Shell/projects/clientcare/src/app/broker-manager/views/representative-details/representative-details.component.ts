import { Component } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Representative } from '../../models/representative';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'representative-details',
  templateUrl: './representative-details.component.html',
  styleUrls: ['./representative-details.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})
export class RepresentativeDetailsComponent extends WizardDetailBaseComponent<Representative> {

  idTypes: Lookup[] = [];
  repTypes: Lookup[] = [];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.loadIdTypes();
    this.loadRepTypes();
  }

  loadIdTypes(): void {
    this.lookupService.getIdTypes().subscribe(data => {
      this.idTypes = data;
    });
  }

  loadRepTypes(): void {
    this.lookupService.getRepTypes().subscribe(data => {
      this.repTypes = data;
    });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      code: [''],
      name: [''],
      contactNumber: [''],
      email: [''],
      idNumber: [''],
      idType: [''],
      repType: [''],
      countryOfRegistration: [''],
      dateOfBirth: [''],
      medicalAccreditationNo: ['']
    });
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.id,
      code: this.model.code,
      name: this.model.name,
      contactNumber: this.model.contactNumber,
      email: this.model.email,
      idNumber: this.model.idNumber,
      idType: this.model.idType,
      repType: this.model.repType,
      countryOfRegistration: this.model.countryOfRegistration,
      dateOfBirth: this.model.dateOfBirth,
      medicalAccreditationNo: this.model.medicalAccreditationNo
    });
    this.form.disable();
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
