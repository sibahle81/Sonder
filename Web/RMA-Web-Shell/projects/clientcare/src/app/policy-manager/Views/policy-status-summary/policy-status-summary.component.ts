import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { Case } from 'projects/clientcare/src/app/policy-manager/shared/entities/case';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';

@Component({
  selector: 'app-policy-status-summary',
  templateUrl: './policy-status-summary.component.html',
  styleUrls: ['./policy-status-summary.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PolicyStatusSummaryComponent extends WizardDetailBaseComponent<Case> {

  policyStatus: Lookup[];
  minPauseDate: Date;

  get showPauseDate(): boolean {
    const status = this.form.get('policyStatusId').value;
    return status === PolicyStatusEnum.Paused;
  }

  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.lookupService.getPolicyStatuses().subscribe({
      next: (data: Lookup[]) => {
        this.policyStatus = data.filter(ps => ps.id === PolicyStatusEnum.Active || ps.id === PolicyStatusEnum.Paused);
      }
    });
  }

  createForm(id: number): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      policyNumber: [],
      policyInceptionDate: [],
      policyOwner: [],
      policyOwnerIdNumber: [],
      policyStatusId: [null, [Validators.required, Validators.min(1)]],
      policyPauseDate: [null, [Validators.required]],
    });
    this.form.get('policyNumber').disable();
    this.form.get('policyInceptionDate').disable();
    this.form.get('policyOwner').disable();
    this.form.get('policyOwnerIdNumber').disable();
  }

  populateForm(): void {
    if (this.model && this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
      const mainMember = this.model.mainMember;
      const policy = this.model.mainMember.policies[0];
      this.minPauseDate = new Date(policy.policyInceptionDate);
      let policyPauseDate: Date = null;
      let idNumber = '';
      if (mainMember.company) {
        idNumber = mainMember.company.referenceNumber;
      } else if (mainMember.person) {
        idNumber = String.isNullOrEmpty(mainMember.person.idNumber) ? mainMember.person.passportNumber : mainMember.person.idNumber;
      }
      if (policy.policyPauseDate) {
        const pauseDate = new Date(policy.policyPauseDate);
        if (pauseDate.getFullYear() >= 2000) {
          policyPauseDate = pauseDate;
        }
      }
      if (!policyPauseDate) {
        policyPauseDate = new Date();
        policyPauseDate.setHours(0, 0, 0, 0);
      }
      this.form.patchValue({
        policyNumber: policy.policyNumber,
        policyInceptionDate: new Date(policy.policyInceptionDate),
        policyOwner: mainMember.displayName,
        policyOwnerIdNumber: idNumber,
        policyPauseDate,
        policyStatusId: policy.policyStatus
      });
    }
  }

  populateModel(): void {
    const values = this.form.getRawValue();
    this.model.mainMember.policies[0].policyStatus = values.policyStatusId;
    if (values.policyStatusId === PolicyStatusEnum.Paused) {
      this.model.mainMember.policies[0].policyPauseDate = new Date(values.policyPauseDate);
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
