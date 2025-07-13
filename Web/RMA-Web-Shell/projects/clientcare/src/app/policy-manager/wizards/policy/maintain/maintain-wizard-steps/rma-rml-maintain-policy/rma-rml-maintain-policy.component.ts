import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { Cover } from 'projects/clientcare/src/app/policy-manager/shared/entities/cover';
import { DatePipe } from '@angular/common';

@Component({
  templateUrl: './rma-rml-maintain-policy.component.html',
  styleUrls: ['./rma-rml-maintain-policy.component.css']
})

export class RMARMLMaintainPolicyComponent extends WizardDetailBaseComponent<Policy> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  filteredPolicyIds: number[];
  paymentFrequencies: PaymentFrequencyEnum[];
  paymentMethods: PaymentMethodEnum[];

  documentSystemName = DocumentSystemNameEnum.WizardManager;
  documentSet = DocumentSetEnum.PolicyAmendment;
  allRequiredDocumentsUploaded: boolean;

  wizardId: string;

  minDate: Date;
  maxDate: Date;

  previousCover: Cover;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    public datepipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
    this.paymentFrequencies = this.ToArray(PaymentFrequencyEnum);
    this.paymentMethods = this.ToArray(PaymentMethodEnum);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.linkedId) {
        this.wizardId = params.linkedId;
      }
    });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      targetedPolicyInceptionDate: [{ value: null, disabled: this.inApprovalMode }, Validators.required],
      paymentFrequency: [{ value: null, disabled: this.inApprovalMode }, Validators.required],
      paymentMethod: [{ value: null, disabled: this.inApprovalMode }, Validators.required]
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    var date1 = this.datepipe.transform(new Date(this.form.controls.targetedPolicyInceptionDate.value).getCorrectUCTDate(), 'yyyy-MM-dd');
    var date2 = this.datepipe.transform(new Date(this.minDate).getCorrectUCTDate(), 'yyyy-MM-dd');

    this.model.targetedPolicyInceptionDate = date1 == date2 ? new Date(this.previousCover.effectiveFrom).getCorrectUCTDate() : new Date(date1);

    this.model.paymentFrequencyId = +PaymentFrequencyEnum[this.form.controls.paymentFrequency.value];
    this.model.paymentMethodId = +PaymentMethodEnum[this.form.controls.paymentMethod.value];
  }

  populateForm(): void {
    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      targetedPolicyInceptionDate: this.model.targetedPolicyInceptionDate,
      paymentFrequency: PaymentFrequencyEnum[this.model.paymentFrequencyId],
      paymentMethod: PaymentMethodEnum[this.model.paymentMethodId]
    });

    this.minDate = this.model.covers && this.model.covers.length > 1 ? this.setMinDateFromPolicyCover() : null;
    this.maxDate = new Date(this.model.policyInceptionDate);

    this.setContextPolicyIds();
  }

  setMinDateFromPolicyCover(): Date {
    var currentCoverIndex = this.model.covers.findIndex(s => s.effectiveTo == null);
    this.previousCover = this.model.covers[currentCoverIndex - 1];
    return this.previousCover.effectiveTo;
  }

  setContextPolicyIds() {
    this.filteredPolicyIds = [this.model.policyId];
    this.isLoading$.next(false);
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const index = validationResult.errorMessages.findIndex(s => s == 'Field "targetedPolicyInceptionDate" is invalid');
    if (index > -1) {
      if (this.datepipe.transform(this.model.targetedPolicyInceptionDate, 'yyyy-MM-dd') == this.datepipe.transform(this.previousCover.effectiveFrom, 'yyyy-MM-dd')) {
        validationResult.errors--;
        validationResult.errorMessages.splice(index, 1)
      }
    }

    if (!this.allRequiredDocumentsUploaded) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('All required documents must be uploaded');
    }
    return validationResult;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
