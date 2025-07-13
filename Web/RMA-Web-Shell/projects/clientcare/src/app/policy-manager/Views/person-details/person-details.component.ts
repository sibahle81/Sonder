import { Component, Input, ViewChild, ElementRef, Output, OnChanges, EventEmitter, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Person } from '../../shared/entities/person';
import { RolePlayerService } from '../../shared/Services/roleplayer.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { Case } from '../../shared/entities/case';
import { IdTypeEnum } from '../../shared/enums/idTypeEnum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { EuropAssistPremiumMatrix } from '../../shared/entities/europ-assist-premium-matrix';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PersonDetailsComponent extends WizardDetailBaseComponent<RolePlayer> implements OnChanges {

  @ViewChild('idNumber', { static: false }) idNumber: ElementRef;
  @Input() parentModel: Case = new Case();
  @Input() showAge = false;
  @Output() isSaIDtype = new EventEmitter<boolean>();
  @Output() birthDateChanged = new EventEmitter<Date>();
  @Output() ageChanged = new EventEmitter<number>();
  @Input() newMainMember: RolePlayer;


  idTypes: Lookup[] = [];
  Identifications: string[] = [];
  currentQuery: string;
  idSearchResults: RolePlayer[] = [];
  formPopulatedWithModel = false;
  IdNumberInputType = 'text';
  mainMemberVopdVerificationRequired = false;
  controlDisabled = true;
  canEditIdNumber = false;
  loadingMainMember = false;
  canChangeStartDate = false;
  isShowEndDate = false;
  eaMinDate: Date;
  minDate: Date;
  isAnnualIncrease = false;
  hasEuropAssist = false;
  hasAnnualIncrease = false;
  isEnableInceptionDate = false;
  europAssistPremiumMatrix: EuropAssistPremiumMatrix;
  europAssistFee: any;
  policyWarning: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private readonly editIdNumberPermission = 'Edit Member Identification Number';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.parentModel) {
      if (this.parentModel.mainMember.person) {
        this.model = this.parentModel.mainMember;
        if (this.form && !this.formPopulatedWithModel) {
          this.populateForm();
          this.formPopulatedWithModel = true;
        }
      }
    }
    if (this.newMainMember) {
      this.populateForm();
    }
  }

  get isAlive(): boolean {
    return this.form.value.isAlive;
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly rolePlayerService: RolePlayerService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.canEditIdNumber = userUtility.hasPermission(this.editIdNumberPermission);
    this.onLoadLookups();
  }

  onLoadLookups(): void {
    this.lookupService.getIdTypes().subscribe(
      data => {
        this.idTypes = data;
      }
    );
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      rolePlayerId: [id],
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      idType: [''],
      idNumber: [''],
      dateOfBirth: ['', [Validators.required]],
      isAlive: [true],
      dateOfDeath: [null],
      deathCertificateNumber: [''],
      isVopdVerified: [true],
      dateVopdVerified: [null],
      age: [''],
      isDeleted: [false],
      createdBy: [null],
      createdDate: [null],
      annualIncreaseType: new UntypedFormControl(''), 
    });

    if (!this.canEditIdNumber) {
      this.form.get('idType').disable();
      this.form.get('idNumber').disable();
    }
    this.form.get('age').disable();
    this.form.get('dateOfDeath').disable();
    this.form.get('deathCertificateNumber').disable();
    this.form.get('dateVopdVerified').disable();
  }

  populateForm(): void {
    if (this.model) {

      if (this.model.person) {
        const person = this.model.person;
        const idNumber = person.idNumber ? person.idNumber : person.passportNumber;
        const numbersOnly = idNumber.match('^[0-9]*$');
        this.form.patchValue({
          rolePlayerId: this.model.rolePlayerId,
          firstName: person ? person.firstName : '',
          surname: person ? person.surname : '',
          idType: person && person.idType ? person.idType : numbersOnly ? IdTypeEnum.SA_ID_Document : IdTypeEnum.Passport_Document,
          idNumber: idNumber ? idNumber : '',
          isAlive: person ? this.enforceBoolean(person.isAlive) : true,
          dateOfDeath: person ? person.dateOfDeath : null,
          deathCertificateNumber: person ? person.deathCertificateNumber : '',
          isVopdVerified: person ? this.enforceBoolean(person.isVopdVerified) : false,
          dateVopdVerified: person ? person.dateVopdVerified : null,
          isDeleted: person ? this.enforceBoolean(person.isDeleted) : false,
          createdBy: person ? person.createdBy : this.authService.getCurrentUser().email,
          createdDate: person ? person.createdDate : new Date()
        });

        this.formPopulatedWithModel = true;
        if (person) {
          let dob = this.isDateAssigned(person.dateOfBirth) ? new Date(person.dateOfBirth) : null;
          if (!dob && person.idType === IdTypeEnum.SA_ID_Document && person.idNumber.length >= 6) {
            dob = this.calculetDateOfBirth(person.idNumber);
          }

          this.form.patchValue({ dateOfBirth: dob });
          this.calculateAge();

          if (this.model.person.idType) {
            if (this.model.person.idType !== IdTypeEnum.SA_ID_Document) {
              this.isSaIDtype.emit(false);
            } else {
              this.isSaIDtype.emit(true);
            }
          }
        }
        this.getClientByIdentification();
      } else {
        this.formPopulatedWithModel = false;
      }
    }
  }

  enforceBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value as boolean;
    }
    return false;
  }

  populateModel(): void {

    // Do NOT change the main member if the policy warning is active
    if (!String.isNullOrEmpty(this.policyWarning.value)) { return; }

    const value = this.form.getRawValue();
    if (!this.model.person) {
      this.model.person = new Person();
    }
    this.model.person.rolePlayerId = (value.rolePlayerId > 0) ? value.rolePlayerId : this.model.rolePlayerId;
    this.model.person.firstName = value.firstName;
    this.model.person.surname = value.surname;
    this.model.person.idType = value.idType;
    this.model.person.idNumber = value.idNumber;
    this.model.person.passportNumber = value.idNumber;
    this.model.person.dateOfBirth = this.fixDateOfBirth(new Date(value.dateOfBirth));
    this.model.person.isAlive = this.enforceBoolean(value.isAlive);
    this.model.person.dateOfDeath = value.dateOfDeath;
    this.model.person.deathCertificateNumber = value.deathCertificateNumber;
    this.model.person.isVopdVerified = this.enforceBoolean(value.isVopdVerified);
    this.model.person.dateVopdVerified = value.dateVopdVerified;
    this.model.person.createdBy = value.createdBy ? value.createdBy : this.authService.getCurrentUser().email;
    this.model.person.createdDate = value.createdDate ? value.createdDate : new Date();
    this.model.person.isDeleted = this.enforceBoolean(value.isDeleted);

  }

  private fixDateOfBirth(date: Date): Date {
    const today = new Date();
    const timeZoneOffset = today.getTimezoneOffset();
    const adjustMinutes = (timeZoneOffset === 0) ? 0 : -timeZoneOffset;
    date.setHours(0, adjustMinutes, 0, 0);
    return date;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.form) {
      if (!this.form.get('firstName').value) {
        validationResult.errorMessages.push('Firstname is required');
        validationResult.errors += 1;
      }
      if (!this.form.get('surname').value) {
        validationResult.errorMessages.push('Surname is required');
        validationResult.errors += 1;
      }
      if (!this.form.get('idType').value) {
        validationResult.errorMessages.push('ID type is required');
        validationResult.errors += 1;
      }
      if (this.form.get('idNumber').hasError('required')) {
        validationResult.errorMessages.push('Identification Number is required');
        validationResult.errors += 1;
      }
      if (this.form.get('idNumber').hasError('invalidSaIdLength')) {
        validationResult.errorMessages.push('SA ID number cannot be less than 13 digits');
        validationResult.errors += 1;
      }
      if (this.form.get('idNumber').hasError('invalidSaIdFormat')) {
        validationResult.errorMessages.push('SA ID number has invalid format');
        validationResult.errors += 1;
      }
      if (!this.form.get('dateOfBirth').value) {
        validationResult.errorMessages.push('Date of Birth is required');
        validationResult.errors += 1;
      }
      if (this.form.get('dateOfBirth').value) {
        const dtm = new Date();
        dtm.setHours(0, 0, 0, 0);
        const today = new Date(dtm).getTime();
        const dob = new Date(this.form.get('dateOfBirth').value).getTime();
        if (dob > today) {
          validationResult.errorMessages.push('Date of Birth cannot be in the future');
          validationResult.errors += 1;
        }
      }
    } else {
      validationResult.errorMessages.push('Person details required');
      validationResult.errors += 1;
    }
    if (!String.isNullOrEmpty(this.policyWarning.value)) {
      validationResult.errorMessages.push(this.policyWarning.value);
      validationResult.errors += 1;
    }
    return validationResult;
  }

  calculetDateOfBirth(idNumber: string): Date {
    const today = new Date();
    let year = +idNumber.substr(0, 2) + 2000;
    if (year > today.getFullYear()) { year -= 100; }
    const month = +idNumber.substr(2, 2) - 1;
    const day = +idNumber.substr(4, 2);
    return new Date(year, month, day);
  }

  calculateAge() {
    const dob1 = this.form.get('dateOfBirth').value;
    if (dob1 == null) {
      this.form.patchValue({ age: null });
      this.form.get('age').disable();
      return;
    }
    const dob = new Date(dob1);
    if (dob) {
      this.model.person.dateOfBirth = dob;
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      this.form.patchValue({ age: calculatedAge });
      this.form.get('age').disable();
      this.birthDateChanged.emit(dob);
      this.ageChanged.emit(calculatedAge);
    }
    this.validateDates();
  }

  loadRolePlayerData(): void {
    if (String.isNullOrEmpty(this.currentQuery)) { return; }
    this.loadingMainMember = true;
    this.rolePlayerService.getRolePlayerByIdNumber(this.currentQuery).subscribe({
      next: (rolePlayers: RolePlayer[]) => {
        if (rolePlayers && rolePlayers.length > 0) {
          const newRolePlayer = rolePlayers[0];
          const values = this.form.getRawValue();
          const oldRolePlayerId = values.rolePlayerId;
          const newRolePlayerId = newRolePlayer.rolePlayerId;
          if (newRolePlayerId !== oldRolePlayerId) {
            this.loadingMainMember = true;
            const policyPayeeId = this.model.policies[0].policyPayeeId;
            // Only check the number of policies if the policy owner will change.
            // If the policy owner and policy payee are not the same, the
            // policyPayeeId will not change.
            if (policyPayeeId === oldRolePlayerId) {
              this.rolePlayerService.getRolePlayerPolicyCount(oldRolePlayerId).subscribe({
                next: (count: number) => {
                  if (count > 1) {
                    this.form.patchValue({ idNumber: this.model.person.idNumber });
                    this.policyWarning.next(`The original policy owner has ${count} policies. The owner of this policy cannot be changed.`);
                  } else {
                    this.updateMainMemberRolePlayer(newRolePlayer);
                    this.populateForm();
                  }
                },
                complete: () => {
                  this.loadingMainMember = false;
                }
              });
            } else {
              this.updateMainMemberRolePlayer(newRolePlayer);
              this.populateForm();
              this.loadingMainMember = false;
            }
          }
        }
      },
      complete: () => {
        this.loadingMainMember = false;
      }
    });
  }

  private updateMainMemberRolePlayer(newRolePlayer: RolePlayer): void {
    const oldRolePlayerId = this.model.rolePlayerId;
    const newRolePlayerId = newRolePlayer.rolePlayerId;
    // Update roleplayer details
    this.model.rolePlayerId = newRolePlayerId;
    this.model.displayName = newRolePlayer.displayName;
    this.model.tellNumber = newRolePlayer.tellNumber;
    this.model.cellNumber = newRolePlayer.cellNumber;
    this.model.emailAddress = newRolePlayer.emailAddress;
    this.model.preferredCommunicationTypeId = newRolePlayer.preferredCommunicationTypeId;
    this.model.rolePlayerIdentificationType = newRolePlayer.rolePlayerIdentificationType;
    this.model.isDeleted = newRolePlayer.isDeleted;
    this.model.createdBy = newRolePlayer.createdBy;
    this.model.createdDate = newRolePlayer.createdDate;
    // Update the member person by just cloning the new one
    this.model.person = JSON.parse(JSON.stringify(newRolePlayer.person));
    // Clear banking details
    this.model.rolePlayerBankingDetails = [];
    this.model.rolePlayerAddresses = [];
    // Update the policy owner & payee
    const policy = this.model.policies[0];
    this.model.policies[0].policyPayeeId = (policy.policyPayeeId === policy.policyOwnerId) ? newRolePlayerId : policy.policyPayeeId;
    this.model.policies[0].policyOwnerId = newRolePlayerId;
    // Update the insured lives
    this.model.policies[0].insuredLives.forEach(
      i => {
        if (i.rolePlayerId === oldRolePlayerId) {
          i.rolePlayerId = newRolePlayerId;
        }
      }
    );
    // Update the roleplayer relations
    this.model.fromRolePlayers.forEach(
      r => {
        if (r.fromRolePlayerId === oldRolePlayerId) {
          r.fromRolePlayerId = newRolePlayerId;
        }
        if (r.toRolePlayerId === oldRolePlayerId) {
          r.toRolePlayerId = newRolePlayerId;
        }
      }
    );
  }

  getClientByIdentification(): void {
    const values = this.form.getRawValue();
    const currentMember = this.model.person;
    if (values.idNumber === currentMember.idNumber) { return; }

    this.policyWarning.next('');
    this.form.get('idNumber').setErrors(null);

    if (!this.form.get('idNumber').value) {
      this.form.get('idNumber').setErrors({ required: true });
    }
    if (values.idType) {
      // Update the ID number input control properties
      if (values.idType !== IdTypeEnum.SA_ID_Document) {
        this.IdNumberInputType = 'text';
        this.isSaIDtype.emit(false);
      } else {
        this.IdNumberInputType = 'number';
        this.isSaIDtype.emit(true);
      }
      // Do some id number validations
      this.currentQuery = values.idNumber;
      this.idSearchResults = [];
      if (values.idType === IdTypeEnum.SA_ID_Document) {
        if (values.idNumber.length === 13) {
          this.setDateOfBirth();
          this.loadRolePlayerData();
        } else {
          this.form.get('idNumber').setErrors({ invalidSaIdLength: true });
        }
      } else {
        this.loadRolePlayerData();
      }
    }
  }

  setDateOfBirth() {
    const idNumber = this.form.get('idNumber').value;
    if (idNumber) {
      if (idNumber.length === 13 && this.form.get('idType').value === IdTypeEnum.SA_ID_Document) {
        const today = new Date();
        let year = +idNumber.substr(0, 2) + 2000;
        if (year > today.getFullYear()) { year -= 100; }
        const month = +idNumber.substr(2, 2) - 1;
        const day = +idNumber.substr(4, 2);
        this.form.patchValue({ dateOfBirth: new Date(year, month, day) });
        this.form.get('dateOfBirth').updateValueAndValidity();
      }
    }
    this.calculateAge();
  }

  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  isValidMonth(month: number): boolean {
    return month > 0 && month < 13;
  }

  isValidDay(day: number): boolean {
    return day > 0 && day < 32;
  }

  isDateAssigned(dt: Date): boolean {
    if (!dt) { return false; }
    const date = new Date(dt);
    return date.getFullYear() > 1;
  }

  validateDates(): void {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const dob = new Date(this.form.get('dateOfBirth').value).getTime();
    if (dob > today) {
      this.form.get('dateOfBirth').markAsTouched();
      this.form.get('dateOfBirth').setErrors({ dateOfBirthInThefuture: true });
    }
  }
  isFirstDay = (d: Date): boolean => {
    if (!d) { return false; }
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }
}
