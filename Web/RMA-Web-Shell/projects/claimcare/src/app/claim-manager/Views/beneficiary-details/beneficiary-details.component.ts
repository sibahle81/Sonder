import { RolePlayerBankingDetail } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-banking-detail';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { Constants } from '../../../constants';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerRelation } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { RolePlayerBankingDetailDataSource } from 'projects/shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.datasource';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { DatePipe } from '@angular/common';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';

@Component({
  selector: 'app-beneficiary-details',
  templateUrl: './beneficiary-details.component.html',
  styleUrls: ['./beneficiary-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class BeneficiaryDetailsComponent implements OnInit, OnChanges, AfterViewInit {
  form: FormGroup;
  titles: Lookup[] = [];
  genders: Lookup[] = [];
  marriageTypes: Lookup[] = [];
  beneficiaryTypes: Lookup[] = [];
  languages: Lookup[] = [];
  provinces: Lookup[] = [];
  maritalStatuses: Lookup[] = [];
  idTypes: Lookup[] = [];
  communicationTypes: Lookup[] = [];
  title: Lookup;
  maxDate = new Date();
  isSAIdentity = false;
  gender: number;
  DOB: Date;
  employeeAge: number;
  hasErrors = false;
  isEmployee = false;
  @Input() isWizard: boolean;
  @ViewChild('provinceElement', { static: false }) provinceElement: ElementRef;
  @ViewChild('languageElement', { static: false }) languageElement: ElementRef;
  @ViewChild('countriesElement', { static: false }) countriesElement: ElementRef;
  @ViewChild('beneficiaryElement', { static: false }) beneficiaryElement: ElementRef;
  menus: { title: string, action: string, disable: boolean }[];
  countryList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  provinceList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  languageList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  beneficiaryTypesList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  countryListChange$ = new BehaviorSubject<boolean>(false);
  provinceListChange$ = new BehaviorSubject<boolean>(false);
  languageListChange$ = new BehaviorSubject<boolean>(false);
  beneficiaryTypesListChange$ = new BehaviorSubject<boolean>(false);
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isIdLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  nationalities: Lookup[] = [];
  nationalitiesFilter: Lookup[] = [];
  countries: Lookup[] = [];
  countriesFilter: Lookup[] = [];
  beneficiary: RolePlayer;
  beneficiaries: RolePlayer[];
  elementsKeyUp: Subscription;
  provincesFilter: Lookup[] = [];
  languagesFilter: Lookup[] = [];
  beneficiaryTypesFilter: Lookup[] = [];
  requiredClass = 'mat-label other-label mandatory-field';
  notRequiredClass = 'mat-label other-label';
  isViewMode: boolean;
  isEditMode: boolean;
  isAddMode: boolean;
  bankAccountTypes: Lookup[];
  banks: Lookup[];
  branches: BankBranch[] = [];
  filteredBranches: BankBranch[] = [];
  addForm: FormGroup;
  activeSection = 'showAccounts';
  accountValidationErrorMsg = '';
  rolePlayerBankAccounts: RolePlayerBankingDetail[] = [];
  isDisabled = true;
  idNumber = '';
  isEditBank = false;
  itemToRemove: RolePlayerBankingDetail;
  @Input() event: EventModel;
  selectedPersonEvent: PersonEventModel;
  beneficiaryBankAccounts: RolePlayerBankingDetail[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  get isLoading(): boolean {
    if (!this.dataSource) { return false; }
    return this.dataSource.isLoading;
  }

  get noBankAccounts(): boolean {
    if (this.isLoading) { return true; }
    if (!this.dataSource.data) { return true; }
    return this.dataSource.data.length === 0;
  }

  get hasBankAccounts(): boolean {
    if (this.isLoading) { return false; }
    if (!this.dataSource || !this.dataSource.data) { return false; }
    return this.dataSource.data.length > 0;
  }

  constructor(public dialogRef: MatDialogRef<BeneficiaryDetailsComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly formBuilder: FormBuilder,
              private readonly rolePlayerService: RolePlayerService,
              private readonly lookupService: LookupService,
              public readonly dataSource: RolePlayerBankingDetailDataSource,
              private readonly integrationService: IntegrationService,
              private readonly confirmservice: ConfirmationDialogsService,
              private readonly alertService: AlertService,
              private datePipe: DatePipe,
              private changeDedectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.createForm();
    this.event = this.data.event;
    this.selectedPersonEvent = this.data.personEvent;
    this.isWizard = this.data.isWizard;
    this.dataSource.clearData();
    this.dataSource.setControls(this.paginator, this.sort);
    this.getLookups();
    if (this.rolePlayerBankAccounts && this.rolePlayerBankAccounts.length > 0) {
      this.createBankAccountForm(this.rolePlayerBankAccounts[0].rolePlayerId);
    } else {
      this.createBankAccountForm(0);
    }
    if (this.data.dataType === 'edit' || this.data.dataType === 'view') {
      this.isEditMode = true;
      this.isAddMode = false;
      this.beneficiary = this.data.beneficiary;
      this.patchForm();
      if (this.data.dataType === 'edit') {
        this.enabledFormFields();
      }
    } else {
      this.enabledFormFields();
      this.isEditMode = false;
      this.isAddMode = true;
      this.beneficiary = new RolePlayer();
      this.form.get('marriageType').disable();
      this.form.get('marriageDate').disable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.countryList$.subscribe(result => {
      if (result) {
        this.generateAutoCompleteSubscriptions();
        this.prepopulateAutocomplete(
          this.countriesElement.nativeElement,
          this.countriesFilter,
          this.form.controls.country
        );
      }
    });
    this.provinceList$.subscribe(result => {
      if (result) {
        this.generateAutoCompleteSubscriptions();
        this.prepopulateAutocomplete(
          this.provinceElement.nativeElement,
          this.provincesFilter,
          this.form.controls.province
        );
      }
    });
    this.languageList$.subscribe(result => {
      if (result) {
        this.generateAutoCompleteSubscriptions();
        this.prepopulateAutocomplete(
          this.languageElement.nativeElement,
          this.languagesFilter,
          this.form.controls.language
        );
      }
    });
    this.beneficiaryTypesList$.subscribe(result => {
      if (result) {
        this.generateAutoCompleteSubscriptions();
        this.prepopulateAutocomplete(
          this.beneficiaryElement.nativeElement,
          this.beneficiaryTypesFilter,
          this.form.controls.beneficiaryType
        );
      }
    });
  }

  createForm() {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      rolePlayerId: [{ value: '', disabled: true }],
      idType: [{ value: '', disabled: true }, Validators.required],
      idNumber: [{ value: '', disabled: true }, Validators.required],
      dateOfBirth: [{ value: '', disabled: true }, Validators.required],
      gender: [{ value: '', disabled: true }, Validators.required],
      title: [{ value: '', disabled: true }, Validators.required],
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      age: [{ value: '', disabled: true }],
      province: [{ value: '', disabled: true }],
      language: [{ value: '', disabled: true }],
      populationGroup: [{ value: '', disabled: true }],
      country: [{ value: '', disabled: true }, Validators.required],
      communicationType: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }],
      cellNumber: [{ value: '', disabled: true }, [Validators.required, ValidatePhoneNumber, Validators.maxLength(10)]],
      telNumber: [{ value: '', disabled: true }],
      maritalStatus: [{ value: '', disabled: true }, Validators.required],
      marriageType: [{ value: '', disabled: true }],
      marriageDate: [{ value: '', disabled: true }],
      beneficiaryType: [{ value: '', disabled: true }, Validators.required],
    });
  }

  patchForm() {
    if (this.beneficiary) {
      const rolePlayerId = this.beneficiary.rolePlayerId ? this.beneficiary.rolePlayerId : 0;
      this.form.patchValue({
        rolePlayerId,
        idNumber: this.beneficiary.person.idNumber ? this.beneficiary.person.idNumber : this.beneficiary.person.passportNumber,
        dateOfBirth: this.beneficiary.person.dateOfBirth ? this.beneficiary.person.dateOfBirth : null,
        idType: this.beneficiary.person.idType ? this.beneficiary.person.idType : null,
        gender: this.beneficiary.person.gender ? this.beneficiary.person.gender : null,
        maritalStatus: this.beneficiary.person.maritalStatus ? this.beneficiary.person.maritalStatus : null,
        title: this.beneficiary.person.title ? this.beneficiary.person.title : null,
        email: this.beneficiary.emailAddress ? this.beneficiary.emailAddress : null,
        firstName: this.beneficiary.person.firstName ? this.beneficiary.person.firstName : null,
        lastName: this.beneficiary.person.surname ? this.beneficiary.person.surname : null,
        cellNumber: this.beneficiary.cellNumber ? this.beneficiary.cellNumber : null,
        telNumber: this.beneficiary.tellNumber ? this.beneficiary.tellNumber : null,
        communicationType: this.beneficiary.preferredCommunicationTypeId ? this.beneficiary.preferredCommunicationTypeId : null,
        language: this.beneficiary.person.language ? this.languages.find(p => p.id === this.beneficiary.person.language).name : null,
        populationGroup: this.beneficiary.person.populationGroup ? this.beneficiary.person.populationGroup : null,
        marriageType: this.beneficiary.person.marriageType ? this.beneficiary.person.marriageType : null,
        marriageDate: this.beneficiary.person.marriageDate ? this.beneficiary.person.marriageDate : null,
        age: this.beneficiary.person.age ? this.beneficiary.person.age : null,
        beneficiaryType: null,
      });

      this.countryListChange$.subscribe(result => {
        if (result) {
          // When loading the screen for edit, the form-field get initialized with the name instead of the Id that throws an error when saving the beneficiary.
          const countryById = this.countries.find(n => n.id === this.beneficiary.person?.countryOriginId);
          const countryByName = this.countries.find(n => n.id === this.beneficiary.person?.countryOriginId);
          let countryId = this.countries.find(n => n.name === Constants.prePopulateCountry).id; // Default value if all fails.

          if (countryById) {
            countryId = countryById.id;
          }
          else if (countryByName) {
            countryId = countryByName.id;
 }

          this.form.patchValue({
            country: countryId
          });
        }
      });

      this.provinceListChange$.subscribe(result => {
        if (result) {
          // When loading the screen for edit, the form-field get initialized with the name instead of the Id that throws an error when saving the beneficiary.
          const provinceById = this.provinces.find(p => p.id === this.beneficiary.person.provinceId);
          const provinceByName = this.provinces.find(n => n.id === this.beneficiary.person?.provinceId);
          let provinceId = this.provinces.find(n => n.name === Constants.prePopulateProvince).id; // Default value if all fails.

          if (provinceById) {
            provinceId = provinceById.id;
          }
          else if (provinceByName) {
            provinceId = provinceByName.id;
 }

          this.form.patchValue({
            province: provinceId
          });
        }
      });

      if (this.beneficiary.rolePlayerBankingDetails.length > 0) {
        this.beneficiary.rolePlayerBankingDetails.forEach(account => {
          this.rolePlayerBankAccounts.push(account);
        });
        this.setViewData(this.beneficiary.rolePlayerBankingDetails);
      }
    }
  }

  enabledFormFields() {
    this.enableFormControl('idType');
    this.enableFormControl('idNumber');
    this.enableFormControl('dateOfBirth');
    this.enableFormControl('gender');
    this.enableFormControl('maritalStatus');
    this.enableFormControl('title');
    this.enableFormControl('email');
    this.enableFormControl('firstName');
    this.enableFormControl('lastName');
    this.enableFormControl('age');
    this.enableFormControl('province');
    this.enableFormControl('language');
    this.enableFormControl('populationGroup');
    this.enableFormControl('language');
    this.enableFormControl('cellNumber');
    this.enableFormControl('telNumber');
    this.enableFormControl('country');
    this.enableFormControl('communicationType');
    this.enableFormControl('marriageType');
    this.enableFormControl('marriageDate');
    this.enableFormControl('beneficiaryType');
  }

  disableFormFields() {
    this.disableFormControl('idType');
    this.disableFormControl('idNumber');
    this.disableFormControl('dateOfBirth');
    this.disableFormControl('gender');
    this.disableFormControl('maritalStatus');
    this.disableFormControl('title');
    this.disableFormControl('email');
    this.disableFormControl('firstName');
    this.disableFormControl('lastName');
    this.disableFormControl('age');
    this.disableFormControl('province');
    this.disableFormControl('language');
    this.disableFormControl('populationGroup');
    this.disableFormControl('language');
    this.disableFormControl('cellNumber');
    this.disableFormControl('telNumber');
    this.disableFormControl('country');
    this.disableFormControl('communicationType');
    this.disableFormControl('marriageType');
    this.disableFormControl('marriageDate');
    this.disableFormControl('beneficiaryType');
  }

  reset() {
    this.form.controls.idType.reset();
    this.form.controls.dateOfBirth.reset();
    this.form.controls.gender.reset();
    this.form.controls.maritalStatus.reset();
    this.form.controls.title.reset();
    this.form.controls.email.reset();
    this.form.controls.firstName.reset();
    this.form.controls.lastName.reset();
    this.form.controls.age.reset();
    this.form.controls.province.reset();
    this.form.controls.language.reset();
    this.form.controls.populationGroup.reset();
    this.form.controls.cellNumber.reset();
    this.form.controls.telNumber.reset();
    this.form.controls.country.reset();
    this.form.controls.communicationType.reset();
    this.form.controls.rolePlayerId.reset();
    this.form.controls.marriageType.reset();
    this.form.controls.marriageDate.reset();
    this.form.controls.beneficiaryType.reset();
    this.enabledFormFields();
  }

  getLookups() {
    this.getDetails();
    this.getTitles();
    this.getGenders();
    this.getMaritalStatus();
    this.getIdTypes();
    this.getCommunicationTypes();
    this.getMarriageTypes();
    this.getBanks();
    this.getBankBranches();
    this.getBankAccountTypes();
  }

  getDetails() {
    this.lookupService.getCountries().subscribe(countries => {
      this.countries = countries;
      this.countriesFilter = countries;
      this.countryList$.next(true);
      if (countries.length > 0) { this.countryListChange$.next(true); }
    });

    this.lookupService.getStateProvinces().subscribe(provinces => {
      this.provinces = provinces;
      this.provincesFilter = provinces;
      this.provinceList$.next(true);
      if (provinces.length > 0) { this.provinceListChange$.next(true); }
    });

    this.lookupService.getLanguages().subscribe(languages => {
      this.languages = languages;
      this.languagesFilter = languages;
      this.languageList$.next(true);
      if (languages.length > 0) { this.languageListChange$.next(true); }
    });

    this.lookupService.getBeneficiaryTypes().subscribe(beneficiaryTypes => {
      this.beneficiaryTypes = beneficiaryTypes;
      this.beneficiaryTypesFilter = beneficiaryTypes;
      this.beneficiaryTypesList$.next(true);
      if (beneficiaryTypes.length > 0) { this.languageListChange$.next(true); }
    });
  }

  getTitles() {
    this.lookupService.getTitles().subscribe(titles => {
      this.titles = titles;
    });
  }

  getGenders() {
    this.lookupService.getGenders().subscribe(genders => {
      this.genders = genders;
    });
  }

  getMarriageTypes() {
    this.lookupService.getMarriageTypes().subscribe(marriageTypes => {
      this.marriageTypes = marriageTypes;
    });
  }

  getMaritalStatus() {
    this.lookupService.getMaritalStatus().subscribe(maritalStatuses => {
      this.maritalStatuses = maritalStatuses;
    });
  }

  getIdTypes() {
    this.lookupService.getIdTypes().subscribe(results => {
      const identityTypes = new Array();
      identityTypes.push(results.find(a => a.id === IdTypeEnum.Passport_Document));
      identityTypes.push(results.find(a => a.id === IdTypeEnum.SA_ID_Document));
      this.idTypes = identityTypes;
    });
  }

  getBankAccountTypes(): void {
    this.lookupService.getBankAccountTypes().subscribe(
      data => {
        this.bankAccountTypes = data;
      });
  }

  getBanks(): void {
    this.lookupService.getBanks().subscribe(
      data => {
        this.banks = data;
      });
  }

  getBankBranches(): void {
    this.lookupService.getBankBranches().subscribe(
      data => {
        this.branches = data;
      });
  }

  getCommunicationTypes() {
    this.lookupService.getCommunicationTypes().subscribe(results => {
      const comTypes = new Array();
      comTypes.push(results.find(a => a.id === CommunicationTypeEnum.Email));
      comTypes.push(results.find(a => a.id === CommunicationTypeEnum.SMS));
      this.communicationTypes = comTypes;
    });
  }

  idTypeChanged(value: any) {
    this.form.get('idNumber').clearValidators();
    if (value.value === IdTypeEnum.SA_ID_Document) {
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required, Validators.maxLength(13)]);
      this.isSAIdentity = true;
    } else {
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);
      this.isSAIdentity = false;
    }
    this.form.get('idNumber').updateValueAndValidity();
  }

  setDOB() {
    const formModel = this.form.value;
    const idNumber = formModel.idNumber as string;
    if (idNumber !== null && idNumber.length >= 12) {
      this.extractDoBFromZAIdNumber(idNumber);
      this.doAgeCalculation(this.DOB);
    } else {
      this.form.get('dateOfBirth').enable();
      this.validateDateField();
    }
  }

  extractDoBFromZAIdNumber(idNumber: string) {
    const birthDate = idNumber.substring(0, 6);
    const d = birthDate;
    const yy = d.substr(0, 2);
    const mm = d.substr(2, 2);
    const dd = d.substr(4, 2);
    const yyyy = (+yy < 30) ? '20' + yy : '19' + yy;

    this.DOB = new Date(yyyy + '-' + mm + '-' + dd);
    this.form.get('dateOfBirth').setValue(this.DOB);
  }

  subtractYears(numOfYears: number, date: Date) {
    const pivotDate = new Date(date.getTime());
    pivotDate.setFullYear(pivotDate.getFullYear() - numOfYears);
    return this.datePipe.transform(pivotDate, 'yyyy-MM-dd');
  }

  maritalStatusChanged(value: any) {
    const lblMarriageType = document.getElementById('lblMarriageType');
    const lblMarriageDate = document.getElementById('lblMarriageDate');
    this.form.get('marriageType').clearValidators();
    this.form.get('marriageDate').clearValidators();
    if (value.value === MaritalStatusEnum.Married) {
      this.form.get('marriageType').setValidators([Validators.required]);
      this.form.get('marriageType').updateValueAndValidity();
      this.form.get('marriageDate').setValidators([Validators.required]);
      this.form.get('marriageDate').updateValueAndValidity();
      lblMarriageType.className = this.requiredClass;
      lblMarriageDate.className = this.requiredClass;
      this.form.get('marriageType').enable();
      this.form.get('marriageDate').enable();
    } else if (value.value === MaritalStatusEnum.Separated) {
      lblMarriageType.className = this.notRequiredClass;
      lblMarriageDate.className = this.notRequiredClass;
      this.form.get('marriageType').clearValidators();
      this.form.get('marriageDate').clearValidators();
      this.form.get('marriageType').enable();
      this.form.get('marriageDate').enable();
    } else {
      lblMarriageType.className = this.notRequiredClass;
      lblMarriageDate.className = this.notRequiredClass;
      this.form.get('marriageType').clearValidators();
      this.form.get('marriageDate').clearValidators();
      this.form.get('marriageType').disable();
      this.form.get('marriageDate').disable();
      this.form.get('marriageType').setValue(null);
      this.form.get('marriageDate').setValue(null);
    }
  }

  validateDateField() {
    const control = this.form.get('dateOfBirth');
    if (control instanceof FormControl) {
      control.markAsTouched({ onlySelf: true });
    } else if (control instanceof FormGroup) {
      this.validateDateField();
    }
  }

  doAgeCalculation(startDate: Date) {
    if (startDate) {
      this.employeeAge = this.getAge(startDate);
      this.form.get('age').setValue(this.employeeAge);
      this.form.get('age').disable();
    }
  }

  getAge(birthDate: Date) {
    const now = new Date();
    let days = Math.floor((now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24);
    let age = 0;
    for (let y = birthDate.getFullYear(); y <= now.getFullYear(); y++) {
      const daysInYear = this.isLeap(y) ? 366 : 365;
      if (days >= daysInYear) {
        days -= daysInYear;
        age++;
      }
    }
    return age;
  }

  isLeap(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  disablePersonalDetails() {
    this.disableFormControl('age');
    this.disableFormControl('gender');
    this.disableFormControl('firstName');
    this.disableFormControl('lastName');
  }

  search() {
    let employeeIdNumber = this.form.controls.idNumber.value;
    this.idNumber = employeeIdNumber;
    const idTypeValue = this.form.controls.idType.value;
    let empDateOfBirth: any;
    if (this.isSAIdentity) {
      this.setDOB();
      empDateOfBirth = this.form.get('dateOfBirth').value;
    } else {
      this.enableFormControl('dateOfBirth');
      this.validateDateField();
    }

    if (employeeIdNumber) {
      employeeIdNumber = employeeIdNumber.replace(/[^\w\s]/gi, '');
      employeeIdNumber = employeeIdNumber.replace(/\s/g, '');
      this.isIdLoading$.next(true);
      this.rolePlayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.InsuredLife, employeeIdNumber).subscribe(
        rolePlayerDetails => {
          if (rolePlayerDetails.rolePlayerId !== 0) {
            this.employeeCheck(rolePlayerDetails.rolePlayerId);
            this.beneficiary = rolePlayerDetails;
            this.beneficiary.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
            this.patchForm();
            this.disablePersonalDetails();
            if (this.selectedPersonEvent.rolePlayer.person.gender === null) {
              this.setGender(employeeIdNumber);
            }
            this.isIdLoading$.next(false);
          } else {
            this.reset();
            this.form.patchValue({
              idNumber: employeeIdNumber,
              idType: idTypeValue,
              dateOfBirth: empDateOfBirth,
              age: this.employeeAge ? this.employeeAge : null
            });

            if (empDateOfBirth && this.employeeAge > 0) {
              this.disableFormControl('age');
            }
            this.isIdLoading$.next(false);
          }
        });
    }
  }

  employeeCheck(rolePlayerId: number) {
    if (this.selectedPersonEvent.rolePlayer && this.selectedPersonEvent.rolePlayer.rolePlayerId > 0) {
      if (rolePlayerId === this.selectedPersonEvent.rolePlayer.rolePlayerId) {
        this.isEmployee = true;
      } else {
        this.isEmployee = false;
      }
    }
  }

  dobChange() {
    const dob = this.form.get('dateOfBirth').value;
    const idNumber = this.form.value.idNumber as string;

    if (this.isSAIdentity && idNumber) {
      const changedDate = this.datePipe.transform(new Date(dob), 'yyyy-MM-dd');
      const formattedDOB = this.datePipe.transform(this.DOB, 'yyyy-MM-dd');

      // Check if the date selected matches the ZAF-ID
      if (changedDate === formattedDOB || changedDate === this.subtractYears(100, this.DOB)) {
        this.DOB = new Date(changedDate);
      } else {
        this.setDOB(); // This essentially resets the DOB to use the value passed in the ID-Number Field
      }

    } else {
      this.validateDateField();
    }

    this.doAgeCalculation(dob);
  }

  setGender(identificationNumber: string) {
    const idNumber = identificationNumber;
    const genderNumber = idNumber.substring(6);
    const gender = genderNumber.substring(0, 4);
    // tslint:disable-next-line: radix
    const sex = parseInt(gender);
    if (sex > 0 && sex < 4999) {
      this.gender = Constants.female;
    } else if (sex > 5000 && sex < 9999) {
      this.gender = Constants.male;
    }

    this.form.patchValue({
      gender: this.gender
    });
  }

  generateAutoCompleteSubscriptions() {
    // countriesElement
    this.elementsKeyUp = fromEvent(this.countriesElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData) || searchData === Constants.prePopulateCountry) {
        this.countriesFilter = this.countries;
        return;
      }
      this.countriesFilter = this.countries.filter(option => String.contains(option.name, searchData));
    });

    // provinceElement
    this.elementsKeyUp = fromEvent(this.provinceElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData) || searchData === Constants.prePopulateProvince) {
        this.provincesFilter = this.provinces;
        return;
      }
      this.provincesFilter = this.provinces.filter(option => String.contains(option.name, searchData));
    });

    // languageElement
    this.elementsKeyUp = fromEvent(this.languageElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData) || searchData === Constants.prePopulateLanguage) {
        this.languagesFilter = this.languages;
        return;
      }
      this.languagesFilter = this.languages.filter(option => String.contains(option.name, searchData));
    });

    // beneficiaryElement
    this.elementsKeyUp = fromEvent(this.beneficiaryElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData) || searchData === Constants.prePopulateBeneficiary) {
        this.beneficiaryTypesFilter = this.beneficiaryTypes;
        return;
      }
      this.beneficiaryTypesFilter = this.beneficiaryTypes.filter(option => String.contains(option.name, searchData));
    });
  }

  prepopulateAutocomplete(nativeElement, options: any[], control: AbstractControl): void {
    const option = options.find(opt => opt.id === control.value);
    if (control.disabled) {
      nativeElement.disabled = true;
    }
    nativeElement.value = option ? option.name : '';
    this.changeDedectorRef.detectChanges();
  }

  CheckResult(listName: string) {
    switch (listName) {
      case Constants.country:
        const countryType = this.countries.find(i => i.name === this.form.get('country').value);
        if (countryType === undefined) {
          this.countriesFilter = this.countries;
          this.form.get('country').setValue('');
        }
        break;
      case Constants.province:
        const province = this.provinces.find(i => i.name === this.form.get('province').value);
        if (province === undefined) {
          this.provincesFilter = this.provinces;
          this.form.get('province').setValue('');
        }
        break;
      case Constants.language:
        const language = this.languages.find(i => i.name === this.form.get('language').value);
        if (language === undefined) {
          this.languagesFilter = this.languages;
          this.form.get('language').setValue('');
        }
        break;
      case Constants.beneficiary:
        const beneficiaryType = this.beneficiaryTypes.find(i => i.name === this.form.get('beneficiaryType').value);
        if (beneficiaryType === undefined) {
          this.beneficiaryTypesFilter = this.beneficiaryTypes;
          this.form.get('beneficiaryType').setValue('');
        }
        break;
    }
  }

  getCountryName(filteredOption: any) {
    if (filteredOption === null || undefined) {
      this.countriesFilter = this.countries;
    }
    return this.countries.find(option => option.id === filteredOption || option.name === filteredOption)?.name;
  }

  getProvinceName(filteredOption: any) {
    if (filteredOption === null || undefined) {
      this.provincesFilter = this.provinces;
    }
    return this.provinces.find(option => option.id === filteredOption || option.name === filteredOption)?.name;
  }

  getLanguageName(filteredOption: any) {
    if (filteredOption === null || undefined) {
      this.languagesFilter = this.languages;
    }
    return this.languages.find(option => option.id === filteredOption || option.name === filteredOption)?.name;
  }

  getBeneficiaryName(filteredOption: any) {
    if (filteredOption === null || undefined) {
      this.beneficiaryTypesFilter = this.beneficiaryTypes;
    }
    return this.beneficiaryTypes.find(option => option.id === filteredOption || option.name === filteredOption)?.name;
  }

  enableTellValidation() {
    this.form.get('telNumber').setValidators([ValidatePhoneNumber, Validators.maxLength(10)]);
    this.form.get('telNumber').updateValueAndValidity();
  }

  communicationTypeChanged(value: any) {
    const lblEmail = document.getElementById('lblEmail');
    this.form.get('email').clearValidators();
    if (value.value === CommunicationTypeEnum.Email) {
      this.form.get('email').setValidators([Validators.required, Validators.email]);
      this.form.get('email').updateValueAndValidity();
      lblEmail.className = this.requiredClass;
    } else {
      lblEmail.className = this.notRequiredClass;
      this.form.get('email').clearValidators();
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  setFormOnAction() {
    switch (this.data.dataType) {
      case 'view':
        this.viewOnly();
        break;
      case 'edit':
        this.editOnly();
        break;
    }
  }

  viewOnly() {
    this.disableFormFields();
    this.isViewMode = true;
  }

  editOnly() {
    this.enabledFormFields();
    this.isViewMode = false;
  }

  save(): void {
    if (!this.form.valid) {
      return;
    }
    this.beneficiary = this.readForm();
    if (this.beneficiary) {
      const data = {
        beneficiary: this.beneficiary
      };
      this.dialogRef.close(data);
    } else {
      this.dialogRef.close(null);
    }
  }

  readForm(): RolePlayer {
    const formDetails = this.form.getRawValue();

    const rolePlayer = new RolePlayer();
    rolePlayer.person = new Person();
    rolePlayer.rolePlayerId = formDetails.rolePlayerId ? formDetails.rolePlayerId : 0;
    rolePlayer.displayName = this.form.get('firstName').value + ' ' + formDetails.lastName;
    rolePlayer.tellNumber = formDetails.telNumber;
    rolePlayer.cellNumber = formDetails.cellNumber;
    rolePlayer.emailAddress = formDetails.email;
    rolePlayer.preferredCommunicationTypeId = formDetails.communicationType;
    rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    rolePlayer.rolePlayerTypeId = formDetails.beneficiaryType;
    rolePlayer.clientType = ClientTypeEnum.Individual;

    const person = new Person();
    person.rolePlayerId = formDetails.rolePlayerId ? formDetails.rolePlayerId : 0;
    person.firstName = formDetails.firstName;
    person.surname = formDetails.lastName;
    person.idType = formDetails.idType;
    person.idNumber = formDetails.idNumber;
    person.dateOfBirth = formDetails.dateOfBirth;
    person.isAlive = true;
    person.gender = formDetails.gender;
    person.maritalStatus = formDetails.maritalStatus;
    person.countryOriginId = formDetails.country;
    person.title = formDetails.title;
    person.provinceId = formDetails.province;
    person.language = this.form.get('language').value;
    person.populationGroup = formDetails.populationGroup;
    person.marriageType = formDetails.marriageType;
    person.marriageDate = formDetails.marriageDate;
    person.isVopdVerified = false;
    person.age = formDetails.age;

    rolePlayer.person = person;
    rolePlayer.rolePlayerBankingDetails = this.rolePlayerBankAccounts;

    const rolePlayerRelation = new RolePlayerRelation();
    rolePlayerRelation.toRolePlayerId = this.selectedPersonEvent.rolePlayer.rolePlayerId;
    rolePlayerRelation.rolePlayerTypeId = formDetails.beneficiaryType;
    rolePlayer.fromRolePlayers.push(rolePlayerRelation);

    return rolePlayer;
  }

  getData(): void {
    if (this.rolePlayerBankAccounts) {
      this.dataSource.getData(this.rolePlayerBankAccounts);
    }
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Account Number', def: 'accountNumber', show: true },
      { display: 'Account Holder', def: 'accountHolderName', show: true },
      { display: 'Bank', def: 'bank', show: true },
      { display: 'Branch', def: 'branch', show: true },
      { display: 'Branch Code', def: 'branchCode', show: true },
      { display: 'Effective Date', def: 'effectiveDate', show: true },
      { display: 'Status', def: 'statusText', show: true },
      { display: 'Actions', def: 'actions', show: true }

    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  showSection(section: string) {
    this.activeSection = section;
  }

  populateForm(): void {
    this.setCalculatedStatus();
  }

  setCalculatedStatus() {
    const today = new Date();
    const current = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.rolePlayerBankAccounts.length; ++i) {
      if (new Date(this.rolePlayerBankAccounts[i].effectiveDate) > new Date(today)) {
        this.rolePlayerBankAccounts[i].statusText = 'Future';
      }

      if (new Date(this.rolePlayerBankAccounts[i].effectiveDate) < new Date(today)) {
        this.rolePlayerBankAccounts[i].statusText = 'History';
        current.push(this.rolePlayerBankAccounts[i]);
      }
    }

    if (this.rolePlayerBankAccounts.length === 1) {
      this.rolePlayerBankAccounts[0].statusText = 'Current';
    }

    if (current.length > 1) {
      current.sort((a, b) => (new Date(a.effectiveDate) > new Date(b.effectiveDate)) ? -1 : 1);
      current[0].statusText = 'Current';
    }
  }

  createBankAccountForm(id): void {
    this.addForm = this.formBuilder.group({
      rolePlayerId: id,
      bankId: ['', [Validators.min(1)]],
      bankBranchId: ['', [Validators.min(1)]],
      effectiveDate: ['', [Validators.required]],
      bankAccountType: ['', [Validators.min(1)]],
      accountNumber: ['', [Validators.required]],
      name: ['', [Validators.required]],
      branchCode: ['', [Validators.required]]
    });
    this.enable();
  }

  showAddAccount(): void {
    this.filteredBranches = [];
    this.addForm.patchValue({
      bankId: 0,
      bankBranchId: 0,
      effectiveDate: new Date(),
      bankAccountType: 0,
      accountNumber: '',
      name: '',
      branchCode: ''
    });
    this.showSection('addAccount');
  }

  editBankDetail(rolePlayerBankingDetail: RolePlayerBankingDetail, menu: any) {
    this.addForm.patchValue({
      bankId: this.getBankId(rolePlayerBankingDetail.bankBranchId),
      bankBranchId: rolePlayerBankingDetail.bankBranchId,
      effectiveDate: new Date(rolePlayerBankingDetail.effectiveDate),
      bankAccountType: rolePlayerBankingDetail.bankAccountType,
      accountNumber: rolePlayerBankingDetail.accountNumber,
      name: rolePlayerBankingDetail.accountHolderName,
      branchCode: rolePlayerBankingDetail.branchCode
    });
    this.showSection('addAccount');
    if (menu === 'view') {
      this.addForm.disable();
    } else {
      this.addForm.enable();
      this.itemToRemove = rolePlayerBankingDetail;
    }
  }

  readBankAccountForm(): RolePlayerBankingDetail {
    const value = this.addForm.value;
    const account = new RolePlayerBankingDetail();
    account.rolePlayerBankingId = 0;
    account.purposeId = 1;
    account.rolePlayerId = value.rolePlayerId;
    account.effectiveDate = value.effectiveDate;
    account.accountNumber = value.accountNumber;
    account.bankBranchId = value.bankBranchId;
    account.bankAccountType = value.bankAccountType;
    account.accountHolderName = value.name;
    account.branchCode = value.branchCode;
    account.isDeleted = false;
    return account;
  }

  addBankAccount(): void {
    if (!this.addForm.valid) { return; }
    const account = this.readBankAccountForm();
    this.verifyBankAccount(account);
  }

  verifyBankAccount(account: RolePlayerBankingDetail): void {
    this.accountValidationErrorMsg = '';
    this.dataSource.isLoading = true;
    this.dataSource.statusMsg = 'Verifying bank account ...';
    this.integrationService.verifyBankAccount(account.accountNumber,
      account.bankAccountType, account.branchCode, account.accountHolderName.substring(0, 1),
      account.accountHolderName, this.idNumber)
      .subscribe(
        data => {
          this.dataSource.isLoading = false;
          this.dataSource.statusMsg = '';
          if (data.success) {
            this.accountValidationErrorMsg = '';
            this.alertService.success('Account has been verified');
            this.rolePlayerBankAccounts.push(account);
            if (this.dataSource.data.length > 0 && this.itemToRemove) {
              this.rolePlayerBankAccounts.forEach((item, index) => {
                if (item === this.itemToRemove) { this.rolePlayerBankAccounts.splice(index, 1); }
              });
            }
            this.dataSource.getData(this.rolePlayerBankAccounts);
            this.showSection('showAccounts');
            this.setCalculatedStatus();
          } else {
            this.accountValidationErrorMsg = data.errmsg;
            this.alertService.error(this.accountValidationErrorMsg);
          }
        }
      );
  }

  getBank(branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch && branch.bank ? branch.bank.name : 'unknown';
  }

  getBankId(branchId: number): number {
    const branch = this.branches.find(b => b.id === branchId);
    return branch && branch.bank ? branch.bank.id : 0;
  }

  getBranch(branchId: number): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? branch.name : 'unknown';
  }

  loadBranches(): void {
    this.addForm.patchValue({ bankBranchId: 0 });
    const bankId = this.addForm.value.bankId;
    this.filteredBranches = this.branches.filter(b => b.bankId === bankId);
  }

  loadBranchCode(): void {
    const branchId = this.addForm.value.bankBranchId;
    const branchData = this.branches.filter(b => b.id === branchId);
    if (branchData.length > 0) {
      const branchCode = branchData[0].code;
      this.addForm.controls.branchCode.setValue(branchCode);
    }
  }

  setViewData(rolePlayerBankAccounts: RolePlayerBankingDetail[]): void {
    this.rolePlayerBankAccounts = rolePlayerBankAccounts;
    this.getData();
    this.disable();
  }

  enable(): void {
    this.isDisabled = false;
    this.addForm.enable();
  }

  disable(): void {
    this.isDisabled = true;
    this.addForm.disable();
  }

  filterBankMenu(item: RolePlayerBankingDetail) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: false },
        { title: 'Delete', action: 'delete', disable: false }
      ];
  }

  onBankMenuItemClick(item: RolePlayerBankingDetail, menu: any): void {
    switch (menu.action) {
      case 'view':
      case 'edit':
        this.editBankDetail(item, menu.action);
        break;
      case 'delete':
        if (item) {
          this.openDialogDeleteAccount(item);
        }
        break;
    }
  }

  openDialogDeleteAccount(rolePlayerBankingDetail: RolePlayerBankingDetail) {
    if (rolePlayerBankingDetail) {
      this.confirmservice.confirmWithoutContainer(' Delete', ' Are you sure you want to delete account ' + rolePlayerBankingDetail.accountNumber + '?', 'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            this.rolePlayerBankAccounts.forEach((item, index) => {
              if (item === rolePlayerBankingDetail) { this.rolePlayerBankAccounts.splice(index, 1); }
            });
            this.dataSource.data.forEach((item, index) => {
              if (item === rolePlayerBankingDetail) { this.dataSource.data.splice(index, 1); }
            });
            this.updateBankTable();
          }
        });
    }
  }

  updateBankTable() {
    if (this.dataSource.data.length === 0) {
      this.enable();
    }
  }

}
