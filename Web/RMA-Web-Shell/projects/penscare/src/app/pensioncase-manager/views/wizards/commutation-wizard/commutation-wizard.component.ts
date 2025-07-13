import { Component, OnInit, ViewChild } from '@angular/core';
import {  FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { CommutationNotification } from '../../../models/commutation-notification.model';
import { Commutation } from '../../../models/commutation.model';
import { ExpenditureComponent } from './expenditure/expenditure.component';



interface Iform {
  claimNumber: FormControl<string|null>,
  pensCaseNumber: FormControl<string|null>,
  accidentDate: FormControl<Date|null>,
  stabilizationDate: FormControl<Date|null>,
  capitalValue: FormControl<number|null>,
  idOrPassport: FormControl<string|null>,
  lastName: FormControl<string|null>,
  firstName: FormControl<string|null>,
  member: FormControl<string|null>,
  benIdOrPassport: FormControl<string|null>,
  benLastName: FormControl<string|null>,
  benFirstName: FormControl<string|null>,
  benContactNum: FormControl<string|null>,
  beneficiaryType: FormControl<number|null>,
  monthlyPension: FormControl<number|null>,
  newMNP: FormControl<number|null>,
  CommutationAmountReq: FormControl<number|null>,
  updatedBy: FormControl<string|null>,
  availableCommutation: FormControl<number|null>,
  currentCommutation: FormControl<number|null>,
  stillAvailable: FormControl<number|null>,
  Reason: FormControl<number|null>,
  Recommended: FormControl<boolean|null>,
  ccSchedule: FormControl<number|null>,
  comments: FormControl<string|null>,
  dateReceived: FormControl<Date|null>,
}

@Component({
  selector: 'app-commutation-wizard',
  templateUrl: './commutation-wizard.component.html',
  styleUrls: ['./commutation-wizard.component.css']
})
export class CommutationWizardComponent extends WizardDetailBaseComponent<CommutationNotification> {

  @ViewChild(ExpenditureComponent) expenditureComponent: ExpenditureComponent;

  form: FormGroup;
  matStep: number = 0;
  constructor(
    private readonly _fb: FormBuilder,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);

  }

  setStep(step: number) {
    this.matStep = step;
  }

  createForm(id: number): void {
    this.form = this._fb.group<Iform>({
      claimNumber:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      pensCaseNumber:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      accidentDate:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      stabilizationDate:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      capitalValue:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      idOrPassport: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      lastName:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      firstName: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      member:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      benIdOrPassport:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      benLastName:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      benFirstName:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      benContactNum:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      beneficiaryType:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      dateReceived:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      newMNP: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      CommutationAmountReq:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      updatedBy:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      availableCommutation:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      currentCommutation:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      stillAvailable: new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      monthlyPension:  new FormControl({ value: this.model?.ledger?.currentMonthlyPension, disabled: true }),
      Reason:   new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      Recommended:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      ccSchedule:  new FormControl({value: null, disabled: true}, { validators: Validators.required }),
      comments:   new FormControl({value: null, disabled: true}, { validators: Validators.required })
    });
  }

  onLoadLookups(): void {

  }

  populateModel(): void {
    const value = this.form.getRawValue();
    if (!this.model) {
      this["model"] = new CommutationNotification();
    }
    if (!this.model?.commutation) {
      this.model['commutation'] = new Commutation();
    }

    this.model.commutation.commutationAmountRequested = value.CommutationAmountReq;
    this.model.commutation.commutationReasonId = value.Reason;
    this.model.commutation.comment = value.comments;
    this.model.commutation.isRecommended = value.Recommended;
    this.model.commutation.ccSchedule = value.ccSchedule;
    this.model.commutation.commutationExpenditures = this.expenditureComponent.itemList
  }

  populateForm(): void {
    this.form = this._fb.group<Iform>({
      claimNumber: new FormControl({ value: this.model?.ledger?.claimReferenceNumber, disabled: true }),
      pensCaseNumber: new FormControl({ value: this.model?.ledger?.pensionCaseNumber, disabled: true }),
      accidentDate: new FormControl({ value: this.model?.ledger?.dateOfAccident, disabled: true }),
      stabilizationDate: new FormControl({ value: this.model?.ledger?.dateOfStabilisation, disabled: true }),
      capitalValue: new FormControl({ value: this.model?.ledger?.capitalValue, disabled: true }),
      idOrPassport: new FormControl({ value: this.model?.ledger?.pensionCaseNumber, disabled: true }),
      lastName: new FormControl({ value: this.model?.ledger?.pensionCaseNumber, disabled: true }),
      firstName: new FormControl({ value: this.model?.ledger?.pensionCaseNumber, disabled: true }),
      member: new FormControl({ value: this.model?.ledger?.pensionCaseNumber, disabled: true }),
      benIdOrPassport: new FormControl({ value: this.model?.ledger?.beneficiaryIdNumber, disabled: true }),
      benLastName: new FormControl({ value: this.model?.ledger?.beneficiarySurname, disabled: true }),
      benFirstName: new FormControl({ value: this.model?.ledger?.beneficiaryFirstName, disabled: true }),
      benContactNum: new FormControl({ value: this.model?.ledger?.pensionCaseNumber, disabled: true }),
      beneficiaryType: new FormControl({ value: this.model?.ledger?.beneficiaryType, disabled: true }),
      dateReceived: new FormControl({ value: this.model?.commutation?.requestedDate, disabled: false}),
      newMNP: new FormControl({ value: this.model?.ledger?.normalMonthlyPension, disabled: true }),
      CommutationAmountReq: new FormControl({ value: this.model?.commutation?.commutationAmountRequested, disabled: false}),
      updatedBy: new FormControl({ value: this.model?.commutation?.createdBy, disabled: true }),
      availableCommutation: new FormControl({ value: this.model?.ledger?.normalMonthlyPension, disabled: true }),
      currentCommutation: new FormControl({ value: this.model?.ledger?.currentMonthlyPension, disabled: true }),
      stillAvailable: new FormControl({ value: this.model?.ledger?.normalMonthlyPension, disabled: true}),
      monthlyPension:  new FormControl({ value: this.model?.ledger?.currentMonthlyPension, disabled: true }),
      Reason:  new FormControl({ value: this.model?.commutation?.commutationReasonId, disabled: false}),
      Recommended:  new FormControl({value: this.model?.commutation?.isRecommended, disabled: false}),
      ccSchedule:  new FormControl({ value: this.model?.commutation?.ccSchedule, disabled: false}),
      comments:  new FormControl({ value: this.model?.commutation?.comment, disabled: false})
    });
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
