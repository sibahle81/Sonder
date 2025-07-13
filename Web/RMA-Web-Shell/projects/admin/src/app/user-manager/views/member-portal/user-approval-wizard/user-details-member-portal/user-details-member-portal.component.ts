import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';
import { MemberPortalConstants } from 'projects/shared-models-lib/src/lib/constants/member-portal-constants';
import { UserProfileTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-profile-type-enum';

@Component({
  selector: 'app-user-details-member-portal',
  templateUrl: './user-details-member-portal.component.html',
  styleUrls: ['./user-details-member-portal.component.css']
})
export class UserDetailsMemberPortalComponent extends WizardDetailBaseComponent<UserRegistrationDetails>  {

  dateOfBirth: Date;
  userDetails: UserRegistrationDetails;
  form: UntypedFormGroup;
  idType: number;
  userProfileType: number;
  hasPermission: boolean;
  requiredPermission = 'Approve Member Portal User';
  wizardMessage = '';

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {

    if (this.form) { return; }
    this.form = this.formBuilder.group({
      idType: [''],
      idNumber: [''],
      firstName: [''],
      surname: [''],
      tellNumber: [''],
      cellNumber: [''],
      emailAddress: [''],
      dateOfBirth: [''],
      companyRegistrationNo: [''],
      fspNo: [''],
      userProfileType: [''],
      registrationType: [''],
      passportExpiryDate: [''],
    });
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    const value = this.form.value;
    this.dateOfBirth = new Date(this.form.get('dateOfBirth').value);
    this.model.idTypeEnum = this.idType;
    this.model.saId = value.idNumber;
    this.model.passportNo = value.idNumber;
    this.model.name = value.firstName,
      this.model.surname = value.surname,
      this.model.userContact.telephoneNo = value.tellNumber;
    this.model.userContact.cellPhoneNo = value.cellNumber;
    this.model.userContact.email = value.emailAddress;
    this.model.dateOfBirth = value.dateOfBirth;
    this.model.passportExpiryDate = value.passportExpiryDate;
  }

  populateForm(): void {
    const user = this.model;
    this.idType = user.idTypeEnum;
    this.userProfileType = this.model.userProfileTypeId;
    this.form.patchValue({
      idType: IdTypeEnum[this.model.idTypeEnum],
      idNumber: this.model.saId === '' ? this.model.passportNo : this.model.saId,
      firstName: this.model.name,
      surname: this.model.surname,
      tellNumber: this.model.userContact.telephoneNo,
      cellNumber: this.model.userContact.cellPhoneNo,
      emailAddress: this.model.userContact.email,
      dateOfBirth: this.model.dateOfBirth,
      registrationType: UserProfileTypeEnum[this.userProfileType],
      companyRegistrationNo: this.model.companyRegistrationNumber,
      fspNo: this.model.brokerFspNumber,
      passportExpiryDate: this.model.passportExpiryDate
    });
    this.form.disable();

    if (this.userProfileType === UserProfileTypeEnum.Individual) {
      switch (user.idTypeEnum) {
        case IdTypeEnum.SA_ID_Document: this.wizardMessage = MemberPortalConstants.individualFailedVopd; break;
        case IdTypeEnum.Passport_Document: this.wizardMessage = MemberPortalConstants.individualPassport; break;
      }
    }
    if (this.userProfileType === UserProfileTypeEnum.Company) {

    }
    if (this.userProfileType === UserProfileTypeEnum.Broker) {
      switch (user.idTypeEnum) {
        case IdTypeEnum.SA_ID_Document:
          if (user.isVopdPassed) {
            this.wizardMessage = MemberPortalConstants.brokerVopdSuccess; break;
          } else {
            this.wizardMessage = MemberPortalConstants.brokerVopdFailed; break;
          }
        case IdTypeEnum.Passport_Document: this.wizardMessage = MemberPortalConstants.brokerPassport; break;
      }
    }

  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }
}
