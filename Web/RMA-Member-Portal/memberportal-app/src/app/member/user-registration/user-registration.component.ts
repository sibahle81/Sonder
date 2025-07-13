import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';
import { ValidateSAIdNumber } from 'src/app/shared-utilities/validators/id-number-sa.validator';
import { ValidatePhoneNumber } from 'src/app/shared-utilities/validators/phone-number.validator';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { AddressTypeEnum } from 'src/app/shared/enums/address-type.enum';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { IdTypeEnum } from 'src/app/shared/enums/id-type.enum';
import { UserProfileType } from 'src/app/shared/enums/user-profile-type.enum';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { UserAddress } from 'src/app/shared/models/user-address.model';
import { UserContact } from 'src/app/shared/models/user-contact.model';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { UserRegistrationService } from '../services/user-registration.service';
import { UserRegistrationDocumentsComponent } from '../user-registration-documents/user-registration-documents.component';
import { HealthCareProviderService } from 'src/app/shared/services/healthcare-provider.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  @ViewChild('userRegistrationDocuments') userRegistrationDocuments: UserRegistrationDocumentsComponent;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingHCP$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isCityLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingPersonExist$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  submitLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingBrokerageExist$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLinear = false;
  isCompleted = false;
  alreadySubmitted = false;
  isSubmitting = false;
  isProvinceSelected = false;
  isOtherSelected = false;
  telplaceholder = ConstantPlaceholder.telPlaceholder;
  telPrefix = ConstantPlaceholder.telPrefix;
  telFormat = ConstantPlaceholder.telFormat;
  southAfrica = ConstantPlaceholder.southAfrica;
  cityOther = ConstantPlaceholder.cityOther;
  userDetailsForm: FormGroup;
  userAdrressDetailsForm: FormGroup;
  userTypeForm: FormGroup;
  day = new Date().getDay().toString();
  year = (new Date().getFullYear() - 1).toString();
  dateOfBirth: Date;
  saidValue = IdTypeEnum.SAIDDocument;
  passportValue = IdTypeEnum.PassportDocument;
  addressTypes: Lookup[] = [];
  countries: Lookup[] = [];
  stateProvinces: Lookup[] = [];
  cities: Lookup[] = [];
  communicationTypes: Lookup[] = [];
  isAgeInMonths: boolean;
  user: UserDetails;
  companyType: string;
  isOlderChild = false;
  selectedUserType: number;
  isPassportEntered = false;
  showDocuments = false;
  smallScreen = false;
  isNumberInput = false;
  isPassportIdType = false;
  isHCPTypeSelected: boolean = false;
  isValidHCP: boolean = true;
  healthCareProviderId: number = 0;
  practiceName: string;


  constructor(
    private authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly userRegistrationService: UserRegistrationService,
    private readonly alertService: AlertService,
    private readonly healthCareProviderService: HealthCareProviderService,
    private readonly router: Router,
    private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
    });
  }


  ngOnInit(): void {
    this.getAddressTypes();
    this.getCountry();
    this.createForm();
    this.setDropdownDefaults();
    this.getStateProvincesByCountry(1);
  }

  createForm(): void {
    if (this.userDetailsForm) { return; }

    this.userTypeForm = this.formBuilder.group({
      radioCompanyType: [''],
      userProfileTypeRadio: ['', [Validators.required]],
      companyRegistrationNo: [''],
      fspNo: [''],
      practiceNumber: [''],
    });

    this.userDetailsForm = this.formBuilder.group({
      idType: ['', [Validators.required, Validators.min(1)]],
      idNumber: ['', [Validators.required, ValidateSAIdNumber]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(3)]],
      tellNumber: ['', [ValidatePhoneNumber]],
      cellNumber: ['', [ValidatePhoneNumber]],
      emailAddress: ['', [Validators.required, ValidateEmail]],
      dateOfBirth: [''],
      passportExpiryDate: [''],
    });

    this.userAdrressDetailsForm = this.formBuilder.group({
      addressType: ['', [Validators.required]],
      Addr1: [''],
      Addr2: [''],
      Addr3: [''],
      postalCode: [''],
      city: [{ value: '', disabled: this.isProvinceSelected }],
      province: ['', [Validators.required]],
      country: [''],
      cityName: [''],
    });
  }

  getAddressTypes(): void {
    this.isLoading$.next(true);
    this.lookupService.getUserRegistrationAddressTypes().subscribe(
      addressTypes => {
        this.addressTypes = addressTypes;
        const type = this.addressTypes.find(a => a.id === AddressTypeEnum.Physical);
        this.userAdrressDetailsForm.patchValue({
          addressType: type.id
        });
        this.isLoading$.next(false);
      });
    this.isLoading$.next(false);
  }

  getCities(): void {
    this.isCityLoading$.next(true);
    this.lookupService.getCities().subscribe(
      cities => {
        this.cities = cities;
        this.isCityLoading$.next(false);
      });
    this.isCityLoading$.next(false);
  }

  setDropdownDefaults(): void {
    this.userDetailsForm.patchValue({
      idType: this.saidValue
    });
    this.userDetailsForm.get('dateOfBirth').disable();
  }

  private getCountry(): void {
    this.lookupService.getCountries().subscribe(countries => {
      if (countries) {
        this.countries = countries;
        const country = this.countries.find(a => a.name === this.southAfrica);
        this.userAdrressDetailsForm.patchValue({
          country: country.id
        });
      }
    },
      error => {
        this.alertService.error(error.message);
      });
  }

  getStateProvinces(): void {
    this.lookupService.getLocations().subscribe(stateProvinces => {
      if (stateProvinces) {
        this.stateProvinces = stateProvinces;
      }
    });
  }

  getStateProvincesByCountry(countryid: number): void {
    this.lookupService.getStateProvincesByCountry(countryid).subscribe(stateProvinces => {
      if (stateProvinces) {
        this.stateProvinces = stateProvinces;
      }
    });
  }

  getCityByProvinceId($event: any): void {
    this.isCityLoading$.next(true);
    this.lookupService.getCityByProvinceId($event.value).subscribe(cities => {
      if (cities) {
        this.cities = cities;
        this.isCityLoading$.next(false);
        this.userAdrressDetailsForm.get('city').setValidators([Validators.required]);
        this.userAdrressDetailsForm.get('city').updateValueAndValidity();
        this.isProvinceSelected = true;
      }
    });
  }

  setCommunicationValidators(event: any) {
    this.userDetailsForm.get('cellNumber').setValidators([ValidatePhoneNumber]);
    this.userDetailsForm.get('tellNumber').setValidators([ValidatePhoneNumber]);
    this.userDetailsForm.get('emailAddress').setValidators([ValidateEmail]);
    switch (event.value) {
      case 1: // Email
        this.userDetailsForm.get('emailAddress').setValidators([Validators.required, ValidateEmail]);
        break;
      case 2: // Phone
        this.userDetailsForm.get('cellNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
      case 3: // SMS
        this.userDetailsForm.get('cellNumber').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
    }
    this.userDetailsForm.get('cellNumber').updateValueAndValidity();
    this.userDetailsForm.get('tellNumber').updateValueAndValidity();
    this.userDetailsForm.get('emailAddress').updateValueAndValidity();
  }

  calculateBirthday(idNumber: string): void {
    const idType = this.userDetailsForm.get('idType').value;
    if (idType !== 1) {
      return;
    }
    if (idNumber.length >= 6) {
      const today = new Date();
      let year = +idNumber.substr(0, 2) + 2000;
      if (year > today.getFullYear()) { year -= 100; }
      const month = +idNumber.substr(2, 2) - 1;
      const day = +idNumber.substr(4, 2);
      const birthDate = new Date(year, month, day);
      this.userDetailsForm.patchValue({ dateOfBirth: new Date(birthDate + 'Z') });
      this.userDetailsForm.get('dateOfBirth').updateValueAndValidity();
    }
  }

  populateForm(): void {
  }

  calculateAge(): void {
    this.isAgeInMonths = false;
    let age = 0;
    if (this.userDetailsForm) {
      const dateOfBirth = new Date(this.userDetailsForm.getRawValue().dateOfBirth + 'Z');
      if (dateOfBirth) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dob = new Date(dateOfBirth);
        age = today.getFullYear() - dob.getFullYear();
        const birthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (birthday.getTime() > today.getTime()) {
          age--;
        }
        if (age === 0) {
          this.isAgeInMonths = true;
          age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          age = age * 12 + m;
        }
      }
    }
    this.isOlderChild = age >= 21 && age <= 24;
    this.userDetailsForm.patchValue({ age });
    this.validateDOBNotInFuture();
  }

  validateDOBNotInFuture(): void {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const dateOfBirth = new Date(this.userDetailsForm.getRawValue().dateOfBirth + 'Z');
    const dob = new Date(dateOfBirth).getTime();
    if (dob > today) {
      this.userDetailsForm.get('dateOfBirth').markAsTouched();
      this.userDetailsForm.get('dateOfBirth').setErrors({ dateOfBirthInThefuture: true });
    }
  }

  validateExpiryDate($event) {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const passportExpiryDate = new Date(this.userDetailsForm.getRawValue().passportExpiryDate + 'Z');
    const dob = new Date(passportExpiryDate).getTime();
    if (dob < today) {
      this.userDetailsForm.get('passportExpiryDate').markAsTouched();
      this.userDetailsForm.get('passportExpiryDate').setErrors({ passportExpiryDateInThePast: true });
    }
  }

  changeIdType(event: any): void {
    this.userDetailsForm.get('idNumber').clearValidators();
    const idType = this.userDetailsForm.get('idType').value;
    if (idType === 1) {
      this.userDetailsForm.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required]);
      this.userDetailsForm.get('dateOfBirth').disable();
      this.userDetailsForm.get('passportExpiryDate').clearValidators();
      this.isPassportIdType = false;
    } else {
      this.userDetailsForm.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);
      this.userDetailsForm.get('passportExpiryDate').setValidators([Validators.required]);
      this.userDetailsForm.get('dateOfBirth').enable();
      this.isPassportIdType = true;

      this.userDetailsForm.patchValue({
        dateOfBirth: ''
      });
    }
    this.userDetailsForm.get('idNumber').updateValueAndValidity();
    this.userDetailsForm.get('passportExpiryDate').updateValueAndValidity();
  }

  // Method in Html Date of Birth
  updateAge(event: any) {
    this.calculateAge();
  }

  setOther($event) {
    if ($event.value === this.cityOther) {
      this.isOtherSelected = true;
      this.userAdrressDetailsForm.get('cityName').setValidators([Validators.required]);
      this.userAdrressDetailsForm.get('cityName').updateValueAndValidity();

    } else {
      this.isOtherSelected = false;
      this.userAdrressDetailsForm.get('cityName').clearValidators();
      this.userAdrressDetailsForm.get('cityName').updateValueAndValidity();
    }
  }
  // Method in Html IdNumber
  calculateDateOfBirth(event: any): void {
    const isValid = this.userDetailsForm.get('idNumber').valid;
    const idType = this.userDetailsForm.get('idType').value;
    if (isValid) {
      const idNumber = event.srcElement.value;
      this.calculateBirthday(idNumber);
      this.calculateAge();
      this.showDocuments = false;
    }
    if (idType === IdTypeEnum.PassportDocument) {
      this.showDocuments = true;
      const idNumber = this.userDetailsForm.get('idNumber').value;
      this.userRegistrationDocuments.userRegistrationIdnumber = idNumber;
      this.userRegistrationDocuments.documentSet = DocumentSetEnum.UserRegistrationPassportDocuments;
      this.userRegistrationDocuments.ngOnInit();
    }
  }

  checkIfBrokerageExist(fspNumber: string) {
    this.isLoadingBrokerageExist$.next(true);
    this.userRegistrationService.checkIfBrokerageExists(fspNumber).subscribe(result => {
      if (result === 0) {
        this.alertService.loading('FSP Number Does not Exist, Please Contact RMA for Onboarding process');
        this.router.navigateByUrl('');
      } else {
        this.isLoadingBrokerageExist$.next(false);
        this.createUserDetails();
      }
    });
  }

  checkPersonExists(idNumber: string) {
    this.isLoadingPersonExist$.next(true);
    const idType = this.userDetailsForm.get('idType').value;
    const emailAddress = this.userDetailsForm.get('emailAddress').value;
    this.userRegistrationService.getUserDetailsById(idNumber).subscribe((result) => {
      if ((result.id > 0 && !result.userExistInActivationTable) || (result.id > 0 && result.userExistInActivationTable)) {
        this.alertService.error('User with ID - ' + idNumber + ' already exists in the system');
        this.isLoadingPersonExist$.next(false);
      }
      if (result.id === 0 && result.userExistInActivationTable) {
        this.alertService.error('Registration has previously been Processed for user with ID - ' + idNumber);
        this.isLoadingPersonExist$.next(false);
      } else {
        this.isLoadingPersonExist$.next(false);
        this.checkPersonWithEmailExists(emailAddress);
      }
    }, (error) => {
      this.alertService.error('Error in checking if user exists');
      this.isLoadingPersonExist$.next(false);
    });
  }

  checkPersonWithEmailExists(email: string) {
    this.isLoadingPersonExist$.next(true);
    const emailAddress = this.userDetailsForm.get('emailAddress').value;
    this.userRegistrationService.getUserDetailsByEmail(email).subscribe((userDetail) => {
      if ((userDetail.id > 0 && !userDetail.userExistInActivationTable) || (userDetail.id > 0 && userDetail.userExistInActivationTable)) {
        this.alertService.error('User with email ' + emailAddress + ' already exists in the system');
        this.isLoadingPersonExist$.next(false);
      }
      if (userDetail.id === 0 && userDetail.userExistInActivationTable) {
        this.alertService.error('Registration has previously been Processed for user with email - ' + emailAddress);
        this.isLoadingPersonExist$.next(false);
      } else {
        const userProfileType = this.userTypeForm.get('userProfileTypeRadio').value;

          if (UserProfileType[UserProfileType[userProfileType]] == UserProfileType.Broker) {
            this.isLoadingPersonExist$.next(false);
            const fspNumber = this.userTypeForm.get('fspNo').value;
            this.checkIfBrokerageExist(fspNumber);
            return;
          }
          else if (userDetail.userProfileType === UserProfileType.Company) {

          }
          else if (this.isHCPTypeSelected) {
            this.isLoadingPersonExist$.next(false);
            this.checkCompcareUserWithEmailExists(emailAddress);
          }
          else {
            this.isLoadingPersonExist$.next(false);
            this.createUserDetails();
          }

      }
    }, (error) => {
      this.alertService.error('Error in checking if user exists');
      this.isLoadingPersonExist$.next(false);
    });
  }

  userTypeChange($event: any) {
    this.selectedUserType = $event.value;
    this.isHCPTypeSelected = false;


      switch (UserProfileType[$event.value]) {
        case UserProfileType[UserProfileType.Individual]:
          this.clearValidationToFormControl('fspNo');
          this.clearValidationToFormControl('companyRegistrationNo');
          this.clearValidationToFormControl('practiceNumber');
          this.userDetailsForm.get('dateOfBirth').setValidators([Validators.required]);
          this.userDetailsForm.get('dateOfBirth').updateValueAndValidity();
          break;
        case UserProfileType[UserProfileType.Company]:
          this.userTypeForm.get('companyRegistrationNo').setValidators([Validators.required]);
          this.userTypeForm.get('companyRegistrationNo').updateValueAndValidity();
          this.userDetailsForm.get('dateOfBirth').setValidators([Validators.required]);
          this.userDetailsForm.get('dateOfBirth').updateValueAndValidity();
          break;
        case UserProfileType[UserProfileType.Broker]:
          this.userTypeForm.get('fspNo').setValidators([Validators.required]);
          this.userTypeForm.get('fspNo').updateValueAndValidity();
          break;
        case UserProfileType[UserProfileType.HealthcareProvider]:
          this.isHCPTypeSelected = true;
          this.isValidHCP = false;
          this.userTypeForm.patchValue({ practiceNumber: '' });
          this.practiceName = '';
          this.userTypeForm.get('practiceNumber').setValidators([Validators.required]);
          this.userTypeForm.get('practiceNumber').updateValueAndValidity();
          break;
      }

  }

  clearValidationToFormControl(controlName: string) {
    this.userTypeForm.get(controlName).clearValidators();
    this.userTypeForm.get(controlName).markAsTouched();
    this.userTypeForm.get(controlName).updateValueAndValidity();
  }

  companyTypeChange($event) {
    this.companyType = $event.value;
  }

  readForm(): UserRegistrationDetails {
    const userDetailsFormModel = this.userDetailsForm.getRawValue();
    const userAdrressDetailsFormModel = this.userAdrressDetailsForm.getRawValue();
    const userTypeFormModel = this.userTypeForm.getRawValue();
    const userDetails = new UserRegistrationDetails();
    const userAddressDetails = new UserAddress();
    const userContactDetails = new UserContact();
    userDetails.memberTypeId = this.selectedUserType;
    userDetails.userProfileType = this.selectedUserType;
    userDetails.name = userDetailsFormModel.firstName;
    userDetails.surname = userDetailsFormModel.surname;
    userDetails.saId = userDetailsFormModel.idType === IdTypeEnum.SAIDDocument ? userDetailsFormModel.idNumber : '';
    userDetails.passportNo = userDetailsFormModel.idType !== IdTypeEnum.SAIDDocument ? userDetailsFormModel.idNumber : '';
    userDetails.dateOfBirth = userDetailsFormModel.dateOfBirth;
    userDetails.idTypeEnum = userDetailsFormModel.idType;
    userDetails.passportExpiryDate = userDetailsFormModel.passportExpiryDate;
    userDetails.companyRegistrationNumber = userTypeFormModel.companyRegistrationNo;
    userDetails.healthCareProviderId = this.healthCareProviderId;
    userDetails.brokerFspNumber = userTypeFormModel.fspNo;
    userDetails.isInternalUser = false;
    userContactDetails.telephoneNo = userDetailsFormModel.tellNumber ? userDetailsFormModel.tellNumber : '';
    userContactDetails.cellPhoneNo = userDetailsFormModel.cellNumber ? userDetailsFormModel.cellNumber : '';
    userContactDetails.email = userDetailsFormModel.emailAddress ? userDetailsFormModel.emailAddress : '';
    userAddressDetails.addressType = userAdrressDetailsFormModel.addressType;
    userAddressDetails.address1 = userAdrressDetailsFormModel.Addr1 ? userAdrressDetailsFormModel.Addr1 : '';
    userAddressDetails.address2 = userAdrressDetailsFormModel.Addr2 ? userAdrressDetailsFormModel.Addr2 : '';
    userAddressDetails.address3 = userAdrressDetailsFormModel.Addr3 ? userAdrressDetailsFormModel.Addr3 : '';
    userAddressDetails.postalCode = userAdrressDetailsFormModel.postalCode ? userAdrressDetailsFormModel.postalCode : '';
    userAddressDetails.city = userAdrressDetailsFormModel.city !== this.cityOther ? userAdrressDetailsFormModel.city : userAdrressDetailsFormModel.cityName;
    userAddressDetails.province = userAdrressDetailsFormModel.province ? userAdrressDetailsFormModel.province : '';
    userAddressDetails.countryId = userAdrressDetailsFormModel.country;
    userDetails.userAddress = userAddressDetails;
    userDetails.userContact = userContactDetails;

    return userDetails;
  }

  Submit() {
    const idType = this.userDetailsForm.get('idType').value;
    if (idType === IdTypeEnum.PassportDocument) {
      const allDocumentsUploaded = this.userRegistrationDocuments.checkAllDocumentsUpload();
      if (allDocumentsUploaded) {
        this.disableFormAfterSubmit();
        const IdNumber = this.userDetailsForm.controls.idNumber.value;
        this.checkPersonExists(IdNumber);
      } else {
        this.alertService.error('Please upload all required documents');
      }
    } else {
      this.disableFormAfterSubmit();
      const IdNumber = this.userDetailsForm.controls.idNumber.value;
      this.checkPersonExists(IdNumber);
    }
  }

  disableFormAfterSubmit() {
    this.userDetailsForm.disable();
    this.userAdrressDetailsForm.disable();
    this.alreadySubmitted = true;
  }

  createUserDetails() {
    const userDetails = this.readForm();
    this.isSubmitting = true;
    this.submitLoading$.next(true);
    this.userRegistrationService.registerUserDetails(userDetails).subscribe((result) => {
      if (result) {
        this.alertService.success('Registration has been processed, an activation email will be sent through to complete registration');
        this.submitLoading$.next(false);
        this.router.navigateByUrl('');
      }
      this.submitLoading$.next(false);
    }, (error) => {
      this.alertService.error(error.message);
      this.submitLoading$.next(false);
    });
  }

  searchForHealthCareProvider(): void {
    const filter = this.userTypeForm.get('practiceNumber').value;
    if (filter == "")
      return;

    this.isLoadingHCP$.next(true);
    this.healthCareProviderService.searchHealthCareProviderByPracticeNumber(filter).subscribe((result) => {
      if (result != null && result.healthCareProviderId > 0) {
        this.isValidHCP = true;
        this.healthCareProviderId = result.healthCareProviderId;
        this.practiceName = "Practice Name: " + result.name;
        this.isLoadingHCP$.next(false);
      }
      else {
        this.isValidHCP = false;
        this.practiceName = '';
        this.practiceName = "Practice not found";
        this.isLoadingHCP$.next(false);
      }
      }, (error) => {
        this.isValidHCP = false;
        this.practiceName = '';
        this.alertService.error(error.message);
        this.isLoadingHCP$.next(false);
    });
  }

  checkCompcareUserWithEmailExists(emailAddress: string): void {
    this.isLoadingPersonExist$.next(true);

    this.userRegistrationService.getMatchingCompcareUsersByEmailAddress(emailAddress).subscribe(
      compcareUserList => {

        if (compcareUserList.length === 0)
        {
          this.alertService.error(`To register for DigiCare a CompCare profile must exist with this email address ${emailAddress}.  Please use your current CompCare email credentials when you register.  If you do not yet have an existing CompCare profile, please go to https://compcare.randmutual.co.za/Registration.aspx to register and then return to here to complete your User Registration`);
          this.isLoadingPersonExist$.next(false);
        }
        else if (compcareUserList.length > 1)
        {
          this.alertService.error(`Multiple user profiles have been found linked to this email address : ${emailAddress} on Compcare.  Email addresses need to be unique on Compcare. Kindly contact the RMA Helpdesk on 0860 222 132 for assistance.`);
          this.isLoadingPersonExist$.next(false);
        }
        else
        {
          this.isLoadingPersonExist$.next(false);
          this.createUserDetails();
        }
      }
    );
  }
}
