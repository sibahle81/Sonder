import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { CommunicationTypeEnum } from 'src/app/shared/enums/communication-type.enum';
import { Case } from 'src/app/shared/models/case';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { PolicyAddressDetailsComponent } from '../policy-address-details/policy-address-details.component';


@Component({
  selector: 'policy-contact-details',
  templateUrl: './policy-contact-details.component.html',
  styleUrls: ['./policy-contact-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class PolicyContactDetailsComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  @ViewChild(PolicyAddressDetailsComponent) policyAddressDetailComponent: PolicyAddressDetailsComponent;

  commPreferences: Lookup[];
  hasAddress = false;
  sedToBroker = true;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      commPreference: ['', [Validators.min(1)]],
      sendPolicyDocsToBroker: [true],
      tellNumber: [''],
      cellNumber: ['', Validators.required],
      emailAddress: ['', [ValidateEmail]]
    });
  }

  ngAfterViewInit(): void {
    this.populatePolicyAddressDetailComponent
  }

  onLoadLookups(): void {
    this.getCommunicationPreferences();
    this.populatePolicyAddressDetailComponent();
  }

  populateForm(): void {
    if (this.model) {
      this.form.patchValue({
        sendPolicyDocsToBroker: this.model.mainMember.policies[0].sendPolicyDocsToBroker,
        tellNumber: this.model.mainMember.tellNumber,
        cellNumber: this.model.mainMember.cellNumber,
        emailAddress: this.model.mainMember.emailAddress,
        commPreference: this.model.mainMember.preferredCommunicationTypeId
      });
    }

    this.populatePolicyAddressDetailComponent();
  }

  populateModel(): void {
    const form = this.form.value;
    this.model.mainMember.preferredCommunicationTypeId = form.commPreference;
    this.model.mainMember.tellNumber = form.tellNumber;
    this.model.mainMember.cellNumber = form.cellNumber;
    this.model.mainMember.emailAddress = form.emailAddress;
    this.model.mainMember.policies[0].sendPolicyDocsToBroker = form.sendPolicyDocsToBroker;

    if (this.model.mainMember.person) {
      const member = this.model.beneficiaries.find(
        b => b.person
          && b.person.idType === this.model.mainMember.person.idType
          && b.person.idNumber === this.model.mainMember.person.idNumber
      );
      if (member) {
        member.preferredCommunicationTypeId = form.commPreference;
        member.tellNumber = form.tellNumber;
        member.cellNumber = form.cellNumber;
        member.emailAddress = form.emailAddress;
      }
    }
    this.policyAddressDetailComponent.wizardReadFormData(this.context);
  }

  populatePolicyAddressDetailComponent() {
    if (this.policyAddressDetailComponent && this.model) {
      this.policyAddressDetailComponent.createForm(0);

      if (this.context) {
        this.policyAddressDetailComponent.wizardPopulateForm(this.context);
      } else {
        this.policyAddressDetailComponent.setViewData(this.model.mainMember.rolePlayerAddresses);
      }

      if (this.isReadonly) {
        this.policyAddressDetailComponent.disable();
      }

      this.validateCommunicationType(this.model.mainMember.preferredCommunicationTypeId);
    } else {
      this.ngAfterViewInit();
    }
  }

  getCommunicationPreferences(): void {
    this.lookupService.getCommunicationTypes().subscribe(
      data => {
        this.commPreferences = data;
      }
    );
  }

  commPreferenceChange($event: any) {
    this.validateCommunicationType($event.value);
  }

  validateCommunicationType(selectedCommunicationTypeId: number) {
    if (selectedCommunicationTypeId === CommunicationTypeEnum.Email && (this.form.value.emailAddress === '' || this.form.value.emailAddress === null)) {
      this.form.controls.emailAddress.setErrors({ required: true });
      this.form.controls.emailAddress.markAsTouched();
    } else {
      this.form.controls.emailAddress.setErrors(null);
      this.form.controls.emailAddress.updateValueAndValidity();
    }

    if (selectedCommunicationTypeId === CommunicationTypeEnum.Post && (this.form.value.cellNumber === '' || this.form.value.cellNumber === null)) {
      this.form.controls.cellNumber.setErrors(null);
      this.form.controls.cellNumber.updateValueAndValidity();
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.mainMember.rolePlayerAddresses || this.model.mainMember.rolePlayerAddresses.length === 0) {
      validationResult.errorMessages.push('Policy holder address is required.');
      validationResult.errors += 1;
    }
    return validationResult;
  }
}
