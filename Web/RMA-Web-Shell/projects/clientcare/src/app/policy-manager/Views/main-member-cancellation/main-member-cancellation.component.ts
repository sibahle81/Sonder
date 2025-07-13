import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { IdTypeEnum } from '../../shared/enums/idTypeEnum';
import { Case } from '../../shared/entities/case';

import 'src/app/shared/extensions/date.extensions';

@Component({
  selector: 'app-main-member-cancellation',
  templateUrl: './main-member-cancellation.component.html',
  styleUrls: ['./main-member-cancellation.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class MainMemberCancellationComponent extends WizardDetailBaseComponent<Case> implements AfterContentChecked {


  minCancellationDate: Date;
  isWithinCoolingOfPeriod = false;
  cancellationReasons: Lookup[] = [];
  loadingCancellationReasons = false;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups(): void {
    this.loadingCancellationReasons = true;
    this.lookupService.getPolicyCancelReasons().subscribe({
      next: (data: Lookup[]) => {
        this.cancellationReasons = data;
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage, 'Cancellation Reasons');
        this.loadingCancellationReasons = false;
      },
      complete: () => {
        this.loadingCancellationReasons = false;
      }
    });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      policyNumber: [],
      clientReference: [],
      policyInceptionDate: [],
      policyStatus: [],
      firstName: [],
      surname: [],
      idType: [],
      idNumber: [],
      dateOfBirth: [],
      age: [],
      product: [],
      productOption: [],
      cancellationDate: [null, [Validators.required]],     
      cancellationReasonId: [null, [Validators.required, Validators.min(1)]]
    });
    this.form.get('policyNumber').disable();
    this.form.get('clientReference').disable();
    this.form.get('policyInceptionDate').disable();
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

  populateForm(): void {
    if (!this.model) { return; }
    if (!this.model.mainMember) { return; }
    if (!this.model.mainMember.policies || this.model.mainMember.policies.length === 0) { return; }
    const mainMember = this.model.mainMember;
    const policy = this.model.mainMember.policies[0];
    this.form.patchValue({
      'policyNumber': policy.policyNumber,
      'clientReference': policy.clientReference,
      'policyInceptionDate': new Date(policy.policyInceptionDate),
      'policyStatus': PolicyStatusEnum[policy.policyStatus],
      'firstName': mainMember.person.firstName,
      'surname': mainMember.person.surname,
      'dateOfBirth': mainMember.person.dateOfBirth,
      'idType': this.replaceValue(IdTypeEnum[mainMember.person.idType], '_', ' '),
      'idNumber': mainMember.person.idNumber,
      'age': mainMember.person.age,
      'product': policy.productOption.product.name,
      'productOption': policy.productOption.name,
      'cancellationDate': policy.cancellationDate ? new Date(policy.cancellationDate) : null,
      'cancellationReasonId': policy.policyCancelReason
    });
    this.minCancellationDate = new Date(policy.policyInceptionDate);
    if (policy.cancellationDate) {      
      this.isWithinCoolingOfPeriod = this.checkIfWithinCoolingOffPeriod(new Date(policy.cancellationDate));
    }
  }

  private checkIfWithinCoolingOffPeriod(cancellationDate: Date): boolean {
    if (!cancellationDate) { return false; }
    const commencementDate = new Date(this.model.mainMember.policies[0].policyInceptionDate);
    const differenceInTime = cancellationDate.getTime() - commencementDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return (differenceInDays <= 31);
  }

  private replaceValue(s: string, oldValue: string, newValue: string): string {
    while(s.indexOf(oldValue) >= 0) {
      s = s.replace(oldValue, newValue)
    }
    return s;
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    this.model.mainMember.policies[0].cancellationDate = value.cancellationDate?.getCorrectUCTDate();
    this.model.mainMember.policies[0].policyCancelReason = value.cancellationReasonId;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  isLastDayOfMonth = (d: Date): boolean => {
    if (!d) { return false; }
    const day = d.getDate();
    const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return day === lastDayOfMonth;
  }
}
