import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { LookupService } from 'src/app/shared/services/lookup.service';
@Component({
  selector: 'app-link-member-wizard',
  templateUrl: './link-member-wizard.component.html',
  styleUrls: ['./link-member-wizard.component.scss']
})
export class LinkMemberWizardComponent extends WizardDetailBaseComponent<UserRegistrationDetails> {
  dateOfBirth: Date;
  form: FormGroup;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly formBuilder: FormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      name: [''],
      surname: [''],
      dateOfBirth: [''],
      tellNumber: [''],
      cellNumber: [''],
      emailAddress: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      postalCode: [''],
      city: [''],
      province: [''],
      country: [''],
    });
  }

  onLoadLookups(): void {
    throw new Error('Method not implemented.');
  }

  populateModel(): void {
    const value = this.form.value;

    this.dateOfBirth = new Date(this.form.get('dateOfBirth').value);
    this.model.name = value.name,
      this.model.surname = value.surname,
      this.model.dateOfBirth = value.dateOfBirth;
    this.model.userContact.telephoneNo = value.tellNumber;
    this.model.userContact.cellPhoneNo = value.cellNumber;
    this.model.userContact.email = value.emailAddress;
    this.model.userAddress.address1 = value.address1;
    this.model.userAddress.address2 = value.address2;
    this.model.userAddress.address3 = value.address3;
    this.model.userAddress.postalCode = value.postalCode;
    this.model.userAddress.city = value.city;
    this.model.userAddress.province = value.province;
    this.model.userAddress.countryId = value.countryId;
  }

  populateForm(): void {
    this.form.patchValue({});
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    // if (this.model != null) {
    // }
    return validationResult;
  }

  findCountryById() {

  }
}
