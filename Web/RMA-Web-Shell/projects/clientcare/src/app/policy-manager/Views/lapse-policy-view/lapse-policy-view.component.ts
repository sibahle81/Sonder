import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Case } from '../../shared/entities/case';

@Component({
  selector: 'app-lapse-policy-view',
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }],
  templateUrl: './lapse-policy-view.component.html',
  styleUrls: ['./lapse-policy-view.component.css']
})
export class LapsePolicyViewComponent extends WizardDetailBaseComponent<Case> {

  policyStatus: Lookup[] = [];
  idType: Lookup[] = [];

  mainMember: RolePlayer = null;
  policy: RolePlayerPolicy = null;
  minDate = new Date();

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.lookupService.getPolicyStatuses().subscribe({
      next: (data: Lookup[]) => {
        this.policyStatus = data;
        this.setPolicyStatus();
      }
    });
    this.lookupService.getIdTypes().subscribe({
      next: (data: Lookup[]) => {
        this.idType = data;
        this.setIdType();
      }
    });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      policyNumber: [''],
      policyStatus: [''],
      firstName: [''],
      surname: [''],
      idType: [''],
      idNumber: [''],
      dateOfBirth: [''],
      age: [''],
      product: [''],
      productOption: [''],
      lapseDate: ['', [Validators.required]]
    });
  }

  populateForm(): void {
    this.mainMember = this.model.mainMember;
    this.policy = this.mainMember.policies[0];
    this.minDate = new Date(this.policy.policyInceptionDate);
    this.form.patchValue({
      policyNumber: this.policy.policyNumber,
      policyStatus: this.getPolicyStatus(),
      firstName: this.mainMember.person.firstName,
      surname: this.mainMember.person.surname,
      idType: this.getIdType(),
      idNumber: this.mainMember.person.idNumber,
      dateOfBirth: this.datePipe.transform(this.mainMember.person.dateOfBirth, 'yyyy-MM-dd'),
      age: this.calculateAge(new Date(this.mainMember.person.dateOfBirth)),
      product: this.policy.productOption.product.name,
      productOption: this.policy.productOption.name,
      lapseDate: this.policy.lapseEffectiveDate
    });
    this.form.get('policyNumber').disable();
    this.form.get('policyStatus').disable();
    this.form.get('firstName').disable();
    this.form.get('surname').disable();
    this.form.get('idType').disable();
    this.form.get('idNumber').disable();
    this.form.get('dateOfBirth').disable();
    this.form.get('age').disable();
    this.form.get('product').disable();
    this.form.get('productOption').disable();
  }

  populateModel(): void {
    if (!this.form.valid) { return; }
    const lapseDate = this.form.get('lapseDate').value;
    this.model.mainMember.policies[0].lapseEffectiveDate = lapseDate;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let age = today.getFullYear() - dob.getFullYear();
    const birthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthday.getTime() > today.getTime()) {
      age--;
    }
    return age;
  }

  private setIdType(): void {
    if (!this.model) { return; }
    const idType = this.getIdType();
    this.form.patchValue({ idType });
  }

  private getIdType(): string {
    const idx = this.idType.findIndex(s => s.id === this.mainMember.person.idType);
    return idx >= 0 ? this.idType[idx].name : '<Unknown>';
  }

  private setPolicyStatus(): void {
    if (!this.model) { return; }
    const policyStatus = this.getPolicyStatus();
    this.form.patchValue({ policyStatus });
  }

  private getPolicyStatus(): string {
    const idx = this.policyStatus.findIndex(s => s.id === this.policy.policyStatus);
    return idx >= 0 ? this.policyStatus[idx].name : '<Unknown>';
  }

}
