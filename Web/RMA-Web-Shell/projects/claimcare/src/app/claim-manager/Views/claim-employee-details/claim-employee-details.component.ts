import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { PolicyInsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-insured-life';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { InsuredLifeStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/insured-life-status.enum';
import { PolicyInsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy-insured-life.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AddressService } from 'projects/shared-services-lib/src/lib/services/address/address.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import {
  DatePickerDateFormat,
  MatDatePickerDateFormat,
} from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { BehaviorSubject, forkJoin, fromEvent, Subscription } from 'rxjs';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { Constants } from '../../../constants';
import { ClaimCareService } from '../../Services/claimcare.service';
import { PatersonGrading } from '../../shared/entities/paterson-grading';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import 'src/app/shared/extensions/array.extensions';
import 'src/app/shared/extensions/date.extensions';
import { VopdStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/vopd-status.enum';
import { ClientVopdResponse } from '../../../../../../clientcare/src/app/policy-manager/shared/entities/vopd-response';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { EmployeeQuestionnaireComponent } from '../employee-questionnaire/employee-questionnaire.component';
import { PersonEventQuestionnaire } from '../../shared/entities/personEvent/personEventQuestionnaire.model';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { IndustryNumberValidators } from 'projects/shared-utilities-lib/src/lib/validators/industry-number.validator';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { PopupQuestionnaireDeleteComponent } from '../popup-questionnaire-delete/popup-questionnaire-delete.component';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { MatPaginator } from '@angular/material/paginator';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { DesignationType } from 'projects/clientcare/src/app/policy-manager/shared/entities/designation-type';

@Component({
  selector: 'claim-employee-details',
  templateUrl: './claim-employee-details.component.html',
  styleUrls: ['./claim-employee-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat },
  ],
})
export class ClaimEmployeeDetailsComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() event: EventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  displayedColumns = [
    'name',
    'surname',
    'idPassportNumber',
    'isVopdVerified',
    'actions',
  ];
  displayedColumnsQuestionnaire = [
    'employeeNumber',
    'averageEarnings',
    'annualBonus',
    'actions',
  ];
  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('nationalityElement', { static: false })
  nationalityElement: ElementRef;
  @ViewChild('countriesElement', { static: false })
  countriesElement: ElementRef;
  elementKeyUp: Subscription;
  nationalityList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  countryList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  nationalityListChange$ = new BehaviorSubject<boolean>(false);
  countryListChange$ = new BehaviorSubject<boolean>(false);
  nationalities: Lookup[] = [];
  nationalitiesFilter: Lookup[] = [];
  countries: Lookup[] = [];
  countriesFilter: Lookup[] = [];
  filter: string ='';

  @ViewChild(MatTable, { static: false }) table: MatTable<RolePlayer>;
  @ViewChild(MatPaginator, { static: false }) set paginator(
    value: MatPaginator
  ) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  dataSource: MatTableDataSource<PersonEventModel>;
  beneficiariesDataSource: RolePlayer[] = [];
  @ViewChild(MatTable) beneficiariesTable: MatTable<RolePlayer>;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isIdLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isIndustryNumberLoading$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  requiredPermission = '';
  hasPermission: boolean;
  form: UntypedFormGroup;
  isViewMode: boolean;
  isEditMode: boolean;
  isAddMode: boolean;
  hideForm = true;
  titles: Lookup[] = [];
  genders: Lookup[] = [];
  maritalStatuses: Lookup[] = [];

  patersonGradings: PatersonGrading[];
  idTypes: Lookup[] = [];
  communicationTypes: Lookup[] = [];
  title: Lookup;
  isTrainee: boolean;
  isSkilled: boolean;
  member: Company;
  subsidiaries: Company[] = [];
  viewClaimantDetails: boolean;
  insuredLife = new PolicyInsuredLife();
  employeeId: number;
  rolePlayerPolicies: RolePlayerPolicy[];
  showTable: boolean;
  rolePlayer: RolePlayer;
  personEmployment: PersonEmployment;
  designationTypes: Lookup[];
  maxDate = new Date();
  personEvent: PersonEventModel;
  yearsOccupationInValid: boolean;
  yearsInIndustryInValid: boolean;
  menus: { title: string; action: string; disable: boolean }[];
  isSAIdentity = false;
  gender: number;
  DOB: Date;
  occupationYears: number;
  isErrorOnTotalYears = false;
  requiredClass = 'mat-label other-label mandatory-field';
  notRequiredClass = 'mat-label other-label';
  monthsInOccupation = 0;
  daysInOccupation = 0;
  selectedPersonEvent: PersonEventModel;
  rolePlayerAddresses: RolePlayerAddress[];
  isValidationError = false;
  vopdStatus = '';
  deadAlive = '';
  clientVopdResponse: ClientVopdResponse;
  reason = '';
  user: User;
  employeeAge: number;
  employeeMinAge: number;
  employeeIsTrainee = false;
  personEventQuestionnaire: PersonEventQuestionnaire;
  isViewQuestionnaire = false;
  questionnaireDataSource: PersonEventQuestionnaire[] = [];
  hasData = false;
  industryClassEnum: IndustryClassEnum;
  editEmployee = true;
  showQuestionnaireButton = false;
  addingEmployee = false;
  employeeFound = false;

  @ViewChild(MatTable)
  personEventQuestionnaireTable: MatTable<PersonEventQuestionnaire>;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService,
    private readonly policyInsuredLifeService: PolicyInsuredLifeService,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly addressService: AddressService,
    private readonly memberService: MemberService,
    private readonly confirmService: ConfirmationDialogsService,
    public dialog: MatDialog,
    private changeDedectorRef: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.employeeAge = Constants.maxAge;
    this.employeeMinAge = Constants.minAge;
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    this.user = this.authService.getCurrentUser();
    this.getLookups();
    this.addressService.addressUpdate$.subscribe(
      (data: RolePlayerAddress[]) => {
        this.rolePlayerAddresses = data;
      }
    );
    if (this.isWizard) {
      this.isViewMode = true;
    }
    this.CheckSetIndustryRequiredField();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event) {
      return;
    }
    this.dataSource = new MatTableDataSource(this.event.personEvents);
    this.dataSource.paginator = this.paginator;
    this.getMemberDetails();
    this.createForm();
    this.getEmployeeDetails();
    this.event = this.event;
  }

  ngAfterViewInit(): void {
    this.nationalityList$.subscribe((result) => {
      if (result) {
        this.generateAutoCompleteSubscriptions();
        this.prepopulateAutocomplete(
          this.nationalityElement.nativeElement,
          this.nationalitiesFilter,
          this.form.controls.nationality
        );
      }
    });
    this.countryList$.subscribe((result) => {
      if (result) {
        this.generateAutoCompleteSubscriptions();
        this.prepopulateAutocomplete(
          this.countriesElement.nativeElement,
          this.countriesFilter,
          this.form.controls.country
        );
      }
    });
  }

  checkPermissions(permission: string): boolean {
    return true;
  }

  getEmployeeDetails() {
    if (this.event.personEvents.length > 0) {
      this.event.personEvents.forEach((personEvent) => {
        if (personEvent.rolePlayer.person) {
          this.checkVopdStatus(personEvent);
          this.updateTable(true);
          this.isLoading$.next(false);
        }
      });
    } else {
      this.dataSource.data = [];
      this.isLoading$.next(false);
    }
  }

  checkVopdStatus(personEvent: PersonEventModel) {
    if (personEvent.insuredLifeId > 0) {
      this.rolePlayerService
        .getVOPDResponseResultByRoleplayerId(personEvent.insuredLifeId)
        .subscribe((results) => {
          if (results) {
            if (results.vopdStatus === VopdStatusEnum.Processed) {
              personEvent.rolePlayer.person.isVopdVerified = true;
            }
          }
        });
    }
  }

  getMemberDetails() {
    if (this.event.memberSiteId) {
      this.isLoading$.next(true);
      this.rolePlayerService
        .getFinPayee(this.event.memberSiteId)
        .subscribe((finPayee) => {
          if (finPayee) {
            this.rolePlayerService
              .GetDebtorIndustryClass(finPayee.finPayeNumber)
              .subscribe((industry) => {
                if (industry) {
                  this.industryClassEnum = industry;
                  this.setIndustryValidators(this.industryClassEnum);
                }
              });
          }
          this.isLoading$.next(false);
        });
    }
  }

  createForm() {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      rolePlayerId: [{ value: '', disabled: true }],
      idNumber: [{ value: '', disabled: true }, Validators.required],
      dateOfBirth: [{ value: '', disabled: true }, Validators.required],
      idType: [{ value: '', disabled: true }, Validators.required],
      gender: [{ value: '', disabled: true }, Validators.required],
      nationality: [{ value: '', disabled: true }, Validators.required],
      maritalStatus: [{ value: '', disabled: true }, Validators.required],
      title: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }],
      firstName: [{ value: '', disabled: true }, Validators.required],
      surname: [{ value: '', disabled: true }, Validators.required],
      cellNumber: [
        { value: '', disabled: true },
        [Validators.required, ValidatePhoneNumber, Validators.maxLength(10)],
      ],
      telNumber: [{ value: '', disabled: true }],
      country: [{ value: '', disabled: true }, Validators.required],
      trainee: [{ value: '', disabled: true }],
      skilled: [{ value: '', disabled: true }, Validators.required],
      yearsOccupation: [{ value: '', disabled: true }, Validators.required],
      employmentDate: [{ value: '', disabled: true }, Validators.required],
      yearsInIndustry: [{ value: '', disabled: true }, Validators.required],
      petersonGrading: [{ value: '', disabled: true }, Validators.required],
      communicationType: [{ value: '', disabled: true }, Validators.required],
      rmaEmployeeNumber: [
        { value: '', disabled: true },
        Validators.minLength(3),
      ],
      employeeNumber: [{ value: '', disabled: true }, Validators.required],
      personEmploymentId: [{ value: '', disabled: true }],
      industryNumber: [{ value: '', disabled: true }],
    });
  }

  readForm(): RolePlayer {
    const formDetails = this.form.getRawValue();
    const rolePlayer = new RolePlayer();
    rolePlayer.person = new Person();
    const person = new Person();
    rolePlayer.rolePlayerId = formDetails.rolePlayerId
      ? formDetails.rolePlayerId
      : 0;
    rolePlayer.displayName = formDetails.firstName + ' ' + formDetails.surname;
    rolePlayer.tellNumber = formDetails.telNumber;
    rolePlayer.cellNumber = formDetails.cellNumber;
    rolePlayer.emailAddress = formDetails.email;
    rolePlayer.preferredCommunicationTypeId = formDetails.communicationType;
    rolePlayer.rolePlayerIdentificationType =
      RolePlayerIdentificationTypeEnum.Person;

    rolePlayer.clientType = ClientTypeEnum.Individual; // Default all the Accident & Disease claims to an individual.

    person.rolePlayerId = formDetails.rolePlayerId
      ? formDetails.rolePlayerId
      : 0;
    person.firstName = formDetails.firstName;
    person.surname = formDetails.surname;
    person.idType = formDetails.idType;
    person.idNumber = formDetails.idNumber;
    person.dateOfBirth = new Date(formDetails.dateOfBirth).getCorrectUCTDate();
    person.isAlive = true;
    person.gender = formDetails.gender;
    person.maritalStatus = formDetails.maritalStatus;
    // The OR statement is to accommodate already existing Event-Objects that have been saved as a Nationality/Country-Name ('South African') instead of Nationality/Country-Id (15)
    person.nationality = this.nationalities.find(
      (c) =>
        c.name === formDetails.nationality || c.id === formDetails.nationality
    ).id;
    person.countryOriginId = this.countries.find(
      (c) => c.name === formDetails.country || c.id === formDetails.country
    ).id;
    person.title = formDetails.title;
    person.isVopdVerified = false;
    rolePlayer.person = person;
    person.personEmployments = person.personEmployments
      ? person.personEmployments
      : [];
    person.personEmployments.push(
      this.readPersonEmployment(rolePlayer.rolePlayerId)
    );

    return rolePlayer;
  }

  readPersonEmployment(employeeRoleplayerId: number): PersonEmployment {
    const personEmployment = new PersonEmployment();
    const formDetails = this.form.getRawValue();

    personEmployment.personEmpoymentId = this.personEmployment
      ? this.personEmployment.personEmpoymentId
      : 0;
    personEmployment.employeeRolePlayerId = employeeRoleplayerId;
    personEmployment.employerRolePlayerId = this.event.memberSiteId;
    personEmployment.isTraineeLearnerApprentice = formDetails.trainee
      ? formDetails.trainee
      : false;
    personEmployment.isSkilled = formDetails.skilled
      ? formDetails.skilled
      : false;
    personEmployment.yearsInPresentOccupation = formDetails.yearsOccupation
      ? formDetails.yearsOccupation
      : 0;
    personEmployment.startDate = new Date(
      formDetails.employmentDate
    ).getCorrectUCTDate();
    personEmployment.yearsInIndustry = formDetails.yearsInIndustry;
    personEmployment.patersonGradingId = formDetails.petersonGrading;
    personEmployment.employeeNumber = formDetails.employeeNumber;
    personEmployment.rmaEmployeeRefNum = formDetails.rmaEmployeeNumber;
    personEmployment.employeeIndustryNumber = formDetails.industryNumber;

    return personEmployment;
  }

  addPolicyInsuredLife(policyId: number, insuredLifeId: number) {
    const policyInsuredLife = new PolicyInsuredLife();

    policyInsuredLife.policyId = policyId;
    policyInsuredLife.rolePlayerId = insuredLifeId;
    policyInsuredLife.insuredLifeStatus = InsuredLifeStatusEnum.Active;
    policyInsuredLife.startDate = new Date();
    policyInsuredLife.rolePlayerTypeId = RolePlayerTypeEnum.InsuredLife;

    this.policyInsuredLifeService
      .addPolicyInsuredLife(policyInsuredLife)
      .subscribe((result) => {
        if (result) {
          this.alertService.success('Insured Life added');
          this.isSaving$.next(false);
        }
      });
  }

  yearsValidation() {
    if (this.form.get('employmentDate').value) {
      const startDate = new Date(this.form.get('employmentDate').value);
      this.doOccupationValidation(startDate);
    }
  }

  validateEmploymentDate(value: any) {
    const startDate = new Date(value.value);
    this.doOccupationValidation(startDate);
  }

  round(num: any) {
    const m = Number((Math.abs(num) * 100).toPrecision(1));
    return (Math.round(m) / 100) * Math.sign(num);
  }

  roundTwo(num: any) {
    const m = Number((Math.abs(num) * 100).toPrecision(2));
    return (Math.round(m) / 100) * Math.sign(num);
  }

  doOccupationValidation(startDate: Date) {
    const currentDate = new Date();
    startDate = new Date(startDate);
    const totalYears = this.monthDiff(startDate, currentDate) / 12;
    if (totalYears % 1 !== 0) {
      this.occupationYears = this.truncate(totalYears, 0);
    } else {
      this.occupationYears = totalYears;
    }
    this.form.get('yearsOccupation').setValue(this.occupationYears);
    this.monthsInOccupation = 0;
    this.daysInOccupation = 0;
    if (this.occupationYears === 0) {
      const differenceInTime = currentDate.getTime() - startDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      const daysWorked = this.roundTwo(differenceInDays);
      if (daysWorked > 59) {
        const monthsWorked = (this.round(totalYears) + '').split('.');
        this.monthsInOccupation = Number(monthsWorked[1]);
        this.daysInOccupation = 0;
      } else {
        this.monthsInOccupation = 0;
        this.daysInOccupation = daysWorked;
      }
    }
  }

  truncate(num: any, index = 0) {
    return +num.toString().slice(0, num.toString().indexOf('.') + (index + 1));
  }

  monthDiff(startDate: Date, currentDate: Date): number {
    let months;
    startDate = new Date(startDate);
    months = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += currentDate.getMonth();
    return months <= 0 ? 0 : months;
  }

  communictionTypeChanged(value: any) {
    const lblEmail = document.getElementById('lblEmail');
    this.form.get('email').clearValidators();
    if (value.value === CommunicationTypeEnum.Email) {
      this.form
        .get('email')
        .setValidators([Validators.required, Validators.email]);
      this.form.get('email').updateValueAndValidity();
      lblEmail.className = this.requiredClass;
    } else {
      lblEmail.className = this.notRequiredClass;
      this.form.get('email').clearValidators();
    }
  }

  setIndustryValidators(industry: IndustryClassEnum) {
    const lblIndustry = document.getElementById('lblIndustry');
    if (lblIndustry) {
      if (industry === IndustryClassEnum.Mining) {
        lblIndustry.className = this.requiredClass;
        this.form.get('industryNumber').setValidators([Validators.required]);
        this.form.get('industryNumber').updateValueAndValidity();
      } else {
        lblIndustry.className = this.notRequiredClass;
        this.form.get('industryNumber').clearValidators();
      }
    }
  }

  patchForm() {
    if (this.selectedPersonEvent) {
      const rolePlayerId = this.selectedPersonEvent.rolePlayer.rolePlayerId
        ? this.selectedPersonEvent.rolePlayer.rolePlayerId
        : 0;
      this.form.patchValue({
        rolePlayerId,
        idNumber: this.selectedPersonEvent.rolePlayer.person.idNumber
          ? this.selectedPersonEvent.rolePlayer.person.idNumber
          : this.selectedPersonEvent.rolePlayer.person.passportNumber,
        dateOfBirth: this.selectedPersonEvent.rolePlayer.person.dateOfBirth
          ? this.selectedPersonEvent.rolePlayer.person.dateOfBirth
          : null,
        idType: this.selectedPersonEvent.rolePlayer.person.idType
          ? this.selectedPersonEvent.rolePlayer.person.idType
          : null,
        gender: this.selectedPersonEvent.rolePlayer.person.gender
          ? this.selectedPersonEvent.rolePlayer.person.gender
          : null,
        maritalStatus: this.selectedPersonEvent.rolePlayer.person.maritalStatus
          ? this.selectedPersonEvent.rolePlayer.person.maritalStatus
          : null,
        title: this.selectedPersonEvent.rolePlayer.person.title
          ? this.selectedPersonEvent.rolePlayer.person.title
          : null,
        email: this.selectedPersonEvent.rolePlayer.emailAddress
          ? this.selectedPersonEvent.rolePlayer.emailAddress
          : null,
        firstName: this.selectedPersonEvent.rolePlayer.person.firstName
          ? this.selectedPersonEvent.rolePlayer.person.firstName
          : null,
        surname: this.selectedPersonEvent.rolePlayer.person.surname
          ? this.selectedPersonEvent.rolePlayer.person.surname
          : null,
        cellNumber: this.selectedPersonEvent.rolePlayer.cellNumber
          ? this.selectedPersonEvent.rolePlayer.cellNumber
          : null,
        telNumber: this.selectedPersonEvent.rolePlayer.tellNumber
          ? this.selectedPersonEvent.rolePlayer.tellNumber
          : null,
        communicationType: this.selectedPersonEvent.rolePlayer
          .preferredCommunicationTypeId
          ? this.selectedPersonEvent.rolePlayer.preferredCommunicationTypeId
          : null,

        trainee:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .isTraineeLearnerApprentice
            : false,
        yearsOccupation:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .yearsInPresentOccupation
            : null,
        employmentDate:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0 &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments[0].startDate.toString() !==
            Constants.minDate
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .startDate
            : null,
        yearsInIndustry:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .yearsInIndustry
            : null,
        petersonGrading:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .patersonGradingId
            : null,
        personEmploymentId:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .patersonGradingId
            : null,
        rmaEmployeeNumber:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .rmaEmployeeRefNum
            : null,
        employeeNumber:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .employeeNumber
            : null,
        industryNumber:
          this.selectedPersonEvent.rolePlayer.person.personEmployments &&
          this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
            0
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
                .employeeIndustryNumber
            : null,
      });
      this.nationalityListChange$.subscribe((result) => {
        if (result) {
          this.form.patchValue({
            nationality:
              this.selectedPersonEvent &&
              this.selectedPersonEvent.rolePlayer.person.nationality
                ? this.nationalities.find(
                    (n) =>
                      n.id ===
                      this.selectedPersonEvent.rolePlayer.person.nationality
                  ).name
                : Constants.prePopulateCountry,
          });
        }
      });
      this.countryListChange$.subscribe((result) => {
        if (result) {
          this.form.patchValue({
            country:
              this.selectedPersonEvent &&
              this.selectedPersonEvent.rolePlayer.person.countryOriginId
                ? this.countries.find(
                    (n) =>
                      n.id ===
                      this.selectedPersonEvent.rolePlayer.person.countryOriginId
                  ).name
                : Constants.prePopulateCountry,
          });
        }
      });
      if (this.form.get('employmentDate').value) {
        const startDate = this.form.get('employmentDate').value;
        this.doOccupationValidation(startDate);
      }

      if (
        this.selectedPersonEvent.rolePlayer.person.personEmployments &&
        this.selectedPersonEvent.rolePlayer.person.personEmployments.length >
          0 &&
        this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
          .isSkilled !== null
      ) {
        this.form
          .get('skilled')
          .setValue(
            this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
              .isSkilled === true
              ? 'true'
              : 'false'
          );
        this.getPatersonGrading(
          this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
            .isSkilled
        );
      }

      if (
        this.selectedPersonEvent.rolePlayer.person.personEmployments &&
        this.selectedPersonEvent.rolePlayer.person.personEmployments.length > 0
      ) {
        this.form
          .get('petersonGrading')
          .setValue(
            this.selectedPersonEvent.rolePlayer.person.personEmployments[0]
              .patersonGradingId
          );
      }

      if (this.selectedPersonEvent.rolePlayer.person.rolePlayerId > 0) {
        this.getVOPDResponse(
          this.selectedPersonEvent.rolePlayer.person.rolePlayerId
        );
      }
    }
  }

  add() {
    if ( this.dataSource.data.length < this.event.numberOfInjuredEmployees || this.event.eventType === EventTypeEnum.Disease ){// this.event.addingMoreInjuredEmployees
      this.isAddMode = true;
      this.isValidationError = false;
      this.selectedPersonEvent = new PersonEventModel();
      this.rolePlayer = new RolePlayer();
      this.addingEmployee = true;
      this.enabledFormFields();
      this.toggle();
    } else {
      this.alertService.loading(
        'Cannot capture employee details that is more than the number of injured employees'
      );
    }
  }

  edit(personEvent: PersonEventModel) {
    this.isEditMode = true;
    this.isValidationError = false;
    this.viewClaimantDetails = !this.viewClaimantDetails;
    this.selectedPersonEvent = personEvent;
    this.patchForm();
    this.enabledFormFields();
    this.checkEmployeeExists();
    if (this.employeeFound) {
      this.disablePersonalDetails();
    }
  }

  toggle() {
    this.hideForm = !this.hideForm;
    this.viewClaimantDetails = !this.viewClaimantDetails;
    this.reset();
  }

  getVOPDResponse(rolePlayerId: number) {
    if (
      this.router.url.includes('claim-notification-view') &&
      this.user.isInternalUser
    ) {
      this.rolePlayerService
        .getVOPDResponseResultByRoleplayerId(rolePlayerId)
        .subscribe((results) => {
          if (results) {
            this.clientVopdResponse = results;
            this.vopdStatus = VopdStatusEnum[results.vopdStatus];
            if (
              results.vopdStatus === VopdStatusEnum.Processed &&
              results.deceasedStatus
            ) {
              this.deadAlive = results.death === false ? 'Alive' : 'Dead';
              this.reason = results.reason;
            }
          }
        });
    }
  }

  enabledFormFields() {
    this.enableFormControl('idNumber');
    this.enableFormControl('dateOfBirth');
    this.enableFormControl('idType');
    this.enableFormControl('gender');
    this.enableFormControl('nationality');
    this.enableFormControl('maritalStatus');
    this.enableFormControl('title');
    this.enableFormControl('email');
    this.enableFormControl('firstName');
    this.enableFormControl('surname');
    this.enableFormControl('cellNumber');
    this.enableFormControl('telNumber');
    this.enableFormControl('country');
    this.enableFormControl('trainee');
    this.enableFormControl('skilled');
    this.enableFormControl('employmentDate');
    this.enableFormControl('yearsInIndustry');
    if (this.isEditMode) {
      this.enableFormControl('petersonGrading');
    } else if (this.addingEmployee) {
      this.disableFormControl('petersonGrading');
      this.addingEmployee = false;
    }
    this.enableFormControl('communicationType');
    this.enableFormControl('employeeNumber');
    this.enableFormControl('rmaEmployeeNumber');
    this.enableFormControl('industryNumber');
    this.enableFormControl('occupationId');
  }

  disableFormFields() {
    this.disableFormControl('idNumber');
    this.disableFormControl('dateOfBirth');
    this.disableFormControl('idType');
    this.disableFormControl('gender');
    this.disableFormControl('nationality');
    this.disableFormControl('maritalStatus');
    this.disableFormControl('title');
    this.disableFormControl('email');
    this.disableFormControl('firstName');
    this.disableFormControl('surname');
    this.disableFormControl('cellNumber');
    this.disableFormControl('telNumber');
    this.disableFormControl('country');
    this.disableFormControl('trainee');
    this.disableFormControl('skilled');
    this.disableFormControl('yearsOccupation');
    this.disableFormControl('employmentDate');
    this.disableFormControl('yearsInIndustry');
    this.disableFormControl('petersonGrading');
    this.disableFormControl('communicationType');
    this.disableFormControl('employeeNumber');
    this.disableFormControl('rmaEmployeeNumber');
    this.disableFormControl('industryNumber');
    this.disableFormControl('occupationId');
  }

  cancel() {
    this.reset();
    this.disableFormFields();
    this.isEditMode = false;
    this.isAddMode = true;
    this.hideForm = !this.hideForm;
    this.viewClaimantDetails = !this.viewClaimantDetails;
  }

  reset() {
    this.form.controls.idNumber.reset();
    this.form.controls.dateOfBirth.reset();
    this.form.controls.idType.reset();
    this.form.controls.gender.reset();
    this.form.controls.nationality.reset();
    this.form.controls.maritalStatus.reset();
    this.form.controls.title.reset();
    this.form.controls.email.reset();
    this.form.controls.firstName.reset();
    this.form.controls.surname.reset();
    this.form.controls.cellNumber.reset();
    this.form.controls.telNumber.reset();
    this.form.controls.country.reset();
    this.form.controls.trainee.reset();
    this.form.controls.skilled.reset();
    this.form.controls.yearsOccupation.reset();
    this.form.controls.employmentDate.reset();
    this.form.controls.yearsInIndustry.reset();
    this.form.controls.petersonGrading.reset();
    this.form.controls.communicationType.reset();
    this.form.controls.rmaEmployeeNumber.reset();
    this.form.controls.employeeNumber.reset();
    this.form.controls.industryNumber.reset();
    this.form.controls.rolePlayerId.reset();
    this.form.controls.occupationId.reset();    

    this.monthsInOccupation = 0;
    this.daysInOccupation = 0;
    this.enabledFormFields();
  }

  getLookups() {
    this.getDesignationTypes(this.filter);
    this.getDetails();
    this.getTitles();
    this.getGenders();
    this.getMaritalStatus();
    this.getIdTypes();
    this.getCommunicationTypes();
    this.getPatersonGrading(false);
  }


  async getDesignationTypes(filter: string)
  {
    this.designationTypes = await this.lookupService.getDesignationTypes(this.filter).toPromise();
  }

  getDetails() {
    forkJoin(
      this.lookupService.getNationalities(),
      this.lookupService.getCountries()
    ).subscribe(
      (data) => {
        this.nationalities = data[0];
        this.nationalitiesFilter = data[0];
        this.nationalityList$.next(true);
        if (data[0].length > 0) {
          this.nationalityListChange$.next(true);
        }

        this.countries = data[1];
        this.countriesFilter = data[1];
        this.countryList$.next(true);
        if (data[1].length > 0) {
          this.countryListChange$.next(true);
        }
      },
      (error) => {
        this.alertService.error(error);
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  formatLookup(lookup: string) {
    return lookup.replace(ConstantPlaceholder.formatRegularExpression, '$1 $2'); // move to shared contants
  }

  skilledChange(): void {
    const formDetails = this.form.getRawValue();
    const isSkilled = formDetails.skilled === 'true' ? true : false;
    const lblTrainee = document.getElementById('lblTrainee');
    const lblSkilled = document.getElementById('lblSkilled');
    const isTrainee = formDetails.trainee;
    this.enableFormControl('petersonGrading');
    if (isSkilled) {
      this.getPatersonGrading(isSkilled);
      this.form.get('trainee').clearValidators();
      lblTrainee.className = this.notRequiredClass;
      lblSkilled.className = this.requiredClass;
    } else {
      this.getPatersonGrading(isSkilled);
      lblTrainee.className = this.requiredClass;
    }
    this.showQuestionnaireButton =
      (isTrainee || this.employeeAge < this.employeeMinAge) &&
      formDetails.petersonGrading !== null;
  }

  petersonGradingChanged(value: any) {
    const formDetails = this.form.getRawValue();
    const isTrainee = formDetails.trainee;
    this.showQuestionnaireButton =
      isTrainee || this.employeeAge < this.employeeMinAge;
  }

  occupationChanged(value: any) {
    const formDetails = this.form.getRawValue();
  }

  traineeChange(): void {
    const formDetails = this.form.getRawValue();
    const isTrainee = formDetails.trainee;
    const lblSkilled = document.getElementById('lblSkilled');
    const lblTrainee = document.getElementById('lblTrainee');
    this.enableFormControl('petersonGrading');
    if (isTrainee) {
      this.getPatersonGrading(false);
      this.form.get('skilled').setValue('false');
      this.form.get('skilled').clearValidators();
      lblSkilled.className = this.notRequiredClass;
      lblTrainee.className = this.requiredClass;
      this.employeeIsTrainee = true;
    } else {
      this.form.get('skilled').setValidators([Validators.required]);
      this.form.get('skilled').updateValueAndValidity();
      lblSkilled.className = this.requiredClass;
      this.employeeIsTrainee = false;
    }
    this.showQuestionnaireButton =
      (isTrainee || this.employeeAge < this.employeeMinAge) &&
      formDetails.petersonGrading !== null;
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    this.isSaving$.next(true);
    const rolePlayer = this.readForm();
    this.selectedPersonEvent.rolePlayer = rolePlayer;
    if (this.personEventQuestionnaire) {
      this.selectedPersonEvent.personEventQuestionnaire =
        this.personEventQuestionnaire;
    }
    this.addOrEditPersonEvent(this.selectedPersonEvent.personEventId);
    this.reset();
  }

  openQuestionnaireDialog(): void {
    const dateOfBirth = new Date(this.form.get('dateOfBirth').value);
    const dialogRef = this.dialog.open(EmployeeQuestionnaireComponent, {
      width: '1024px',
      disableClose: true,
      data: {
        event: this.event,
        employeeName:
          this.form.get('firstName').value +
          ' ' +
          this.form.get('surname').value,
        idNumber: this.form.get('idNumber').value,
        dateOfBirth: this.form.get('dateOfBirth').value,
        employeeAge:
          this.form.get('dateOfBirth').value === null
            ? 0
            : this.getAge(dateOfBirth),
        presentOccupation: null,
        pattersonBand: Number(this.form.get('petersonGrading').value),
        isTrainee:
          this.form.get('trainee').value === null
            ? false
            : this.form.get('trainee').value,
        isSkilled: this.form.get('skilled').value,
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.personEventQuestionnaire = data.personEventQuestionnaire;
        this.isViewQuestionnaire = true;
        this.questionnaireDataSource.push(this.personEventQuestionnaire);
        this.updateQuestionnaireTable();
        this.hasData = true;
        this.showQuestionnaireButton = false;
      }
    });
  }

  addOrEditPersonEvent(personEventId: number) {
    this.isSaving$.next(true);
    if (this.event.eventType === EventTypeEnum.Disease) {
      this.createOrAddPersonEventDiseaseDetails(personEventId);
    } else {
      this.createOrAddPersonEventAccidentDetails(personEventId);
    }
  }

  createOrAddPersonEventDiseaseDetails(personEventId: number) {
    this.isSaving$.next(true);
    const index = this.event.personEvents.findIndex(
      (s) => s.personEventId === personEventId
    );
    if (index < 0) {
      if (!this.event.personEvents[0].rolePlayer.person) {
        this.event.personEvents[0].insuredLifeId =
          this.selectedPersonEvent.rolePlayer.rolePlayerId;
        this.event.personEvents[0].documentSetEnum =
          this.selectedPersonEvent.rolePlayer.person.idType ===
          IdTypeEnum.SA_ID_Document
            ? DocumentSetEnum.ClaimDiseaseNotificationID
            : DocumentSetEnum.ClaimDiseaseNotificationPassport;
        this.event.personEvents[0].rolePlayer =
          this.selectedPersonEvent.rolePlayer;
        this.event.personEvents[0].beneficiaries =
          this.selectedPersonEvent.beneficiaries;
        const alreadyExist = this.dataSource.data.some(
          (a) => a.personEventId === this.event.personEvents[0].personEventId
        );
        if (!alreadyExist) {
          this.dataSource.data.push(this.event.personEvents[0]);
        }
        this.updateTable(false);
        this.toggle();
        this.isSaving$.next(false);
      } else {
        let personEvent = new PersonEventModel();
        this.isSaving$.next(true);
        personEvent = this.selectedPersonEvent;
        personEvent.beneficiaries = this.selectedPersonEvent.beneficiaries;
        this.claimService
          .generatePersonEventReferenceNumber()
          .subscribe((result) => {
            personEvent.personEventId = Number(result);
            personEvent.personEventReferenceNumber = result;
            personEvent.companyRolePlayerId = this.event.memberSiteId;
            personEvent.insuredLifeId = personEvent.rolePlayer.rolePlayerId;
            personEvent.claimantId = this.event.memberSiteId;
            personEvent.documentSetEnum =
              this.selectedPersonEvent.rolePlayer.person.idType ===
              IdTypeEnum.SA_ID_Document
                ? DocumentSetEnum.ClaimDiseaseNotificationID
                : DocumentSetEnum.ClaimDiseaseNotificationPassport;
            personEvent.rolePlayer = this.selectedPersonEvent.rolePlayer;
            personEvent.personEventDiseaseDetail =
              this.event.personEvents[0].personEventDiseaseDetail;
            personEvent.dateCaptured = this.event.personEvents[0].dateCaptured;
            personEvent.dateReceived = this.event.personEvents[0].dateReceived;
            personEvent.createdBy = this.event.personEvents[0].createdBy;
            personEvent.createdDate = this.event.personEvents[0].createdDate;
            personEvent.modifiedBy = this.event.personEvents[0].modifiedBy;
            personEvent.modifiedDate = this.event.personEvents[0].modifiedDate;
            this.event.personEvents[0].physicalDamages[0].personEventId =
              Number(result);
            personEvent.physicalDamages = [];
            personEvent.physicalDamages.push(
              this.event.personEvents[0].physicalDamages[0]
            );
            this.event.personEvents.push(personEvent);
            this.updateTable(false);
            this.toggle();
            this.isSaving$.next(false);
          });
      }
    } else {
      this.event.personEvents[index] = this.selectedPersonEvent;
      this.event.personEvents = this.event.personEvents;
      this.toggle();
      this.isSaving$.next(false);
    }
  }

  createOrAddPersonEventAccidentDetails(personEventId: number) {
    this.isSaving$.next(true);
    if (this.event.personEvents.length !== 0) {
      const index = this.event.personEvents.findIndex(
        (s) => s.personEventId === personEventId
      );
      if (index < 0) {
        const alreadyPerson = this.event.personEvents.some(
          (t) =>
            t.rolePlayer.person.idNumber ===
            this.selectedPersonEvent.rolePlayer.person.idNumber
        );
        if (!alreadyPerson) {
          this.isSaving$.next(true);
          let personEvent = new PersonEventModel();
          personEvent = this.selectedPersonEvent;
          this.claimService
            .generatePersonEventReferenceNumber()
            .subscribe((result) => {
              personEvent.personEventId = Number(result);
              personEvent.personEventReferenceNumber = result;
              personEvent.companyRolePlayerId = this.event.memberSiteId;
              personEvent.insuredLifeId = personEvent.rolePlayer.rolePlayerId;
              personEvent.claimantId = this.event.memberSiteId;
              if (personEvent.personEventQuestionnaire) {
                personEvent.personEventQuestionnaire.personEventId =
                  personEvent.personEventId;
              }
              personEvent.documentSetEnum =
                personEvent.rolePlayer.person.idType ===
                IdTypeEnum.SA_ID_Document
                  ? DocumentSetEnum.ClaimAccidentNotificationID
                  : DocumentSetEnum.ClaimAccidentNotificationPassport;
              this.event.personEvents.push(personEvent);
              if (
                this.event.numberOfInjuredEmployees <
                this.event.personEvents.length
              ) {
                this.event.numberOfInjuredEmployees++;
              }
              this.memberService.updateNumberOfInjured();
              this.updateTable(false);
              this.toggle();
              this.isSaving$.next(false);
            });
        } else {
          this.alertService.loading('Cannot add an employee more than once');
          this.isSaving$.next(false);
          this.toggle();
        }
      } else {
        this.event.personEvents[index] = this.selectedPersonEvent;
        this.event.personEvents = this.event.personEvents;
        this.toggle();
        this.isSaving$.next(false);
      }
    } else {
      this.isSaving$.next(true);
      let personEvent = new PersonEventModel();
      personEvent = this.selectedPersonEvent;
      this.claimService
        .generatePersonEventReferenceNumber()
        .subscribe((result) => {
          personEvent.personEventId = Number(result);
          personEvent.personEventReferenceNumber = result;
          personEvent.companyRolePlayerId = this.event.memberSiteId;
          personEvent.insuredLifeId = personEvent.rolePlayer.rolePlayerId;
          personEvent.claimantId = this.event.memberSiteId;
          personEvent.documentSetEnum =
            personEvent.rolePlayer.person.idType === IdTypeEnum.SA_ID_Document
              ? DocumentSetEnum.ClaimAccidentNotificationID
              : DocumentSetEnum.ClaimAccidentNotificationPassport;
          this.event.personEvents.push(personEvent);
          this.updateTable(false);
          this.toggle();
          this.isSaving$.next(false);
        });
    }
  }

  updateTable(isFromGetEmployee: boolean) {
    this.dataSource.data = this.event.personEvents;
    if (!isFromGetEmployee) {
      this.claimService.updateEmployeeDetails(true);
    }
    if (this.dataSource.data.length > 0) {
      this.showTable = true;
      if (this.table) {
        this.table.renderRows();
      }
    } else {
      this.showTable = false;
    }
  }

  getTitles() {
    this.lookupService.getTitles().subscribe((titles) => {
      this.titles = titles;
    });
  }

  getGenders() {
    this.lookupService.getGenders().subscribe((genders) => {
      this.genders = genders;
    });
  }

  getMaritalStatus() {
    this.lookupService.getMaritalStatus().subscribe((maritalStatuses) => {
      this.maritalStatuses = maritalStatuses;
    });
  }

  getPatersonGrading(isSkilled: boolean) {
    this.claimService
      .getPatersonGradingsBySkill(isSkilled)
      .subscribe((results) => {
        this.patersonGradings = results;
      });
  }

  getIdTypes() {
    this.lookupService.getIdTypes().subscribe((results) => {
      const identityTypes = new Array();
      identityTypes.push(
        results.find((a) => a.id === IdTypeEnum.Passport_Document)
      );
      identityTypes.push(
        results.find((a) => a.id === IdTypeEnum.SA_ID_Document)
      );
      this.idTypes = identityTypes;
    });
  }

  getCommunicationTypes() {
    this.lookupService.getCommunicationTypes().subscribe((results) => {
      const comTypes = new Array();
      comTypes.push(results.find((a) => a.id === CommunicationTypeEnum.Email));
      comTypes.push(results.find((a) => a.id === CommunicationTypeEnum.SMS));
      this.communicationTypes = comTypes;
    });
  }

  view() {
    this.viewClaimantDetails = !this.viewClaimantDetails;
  }

  idTypeChanged(value: any) {
    this.form.get('idNumber').clearValidators();
    if (value.value === IdTypeEnum.SA_ID_Document) {
      this.form
        .get('idNumber')
        .setValidators([
          ValidateSAIdNumber,
          Validators.required,
          Validators.maxLength(13),
        ]);
      this.isSAIdentity = true;
    } else {
      this.form
        .get('idNumber')
        .setValidators([Validators.required, Validators.minLength(3)]);
      this.isSAIdentity = false;
    }
    this.form.get('idNumber').updateValueAndValidity();
  }

  filterMenu(item: PersonEventModel) {
    if (item.claims && item.claims.length > 0) {
      this.editEmployee = false;
    } else {
      this.editEmployee = true;
    }

    this.menus = null;
    if (!this.editEmployee) {
      this.menus = [
        {
          title: 'Edit Employee Details',
          action: 'edit',
          disable: !this.editEmployee ? true : false,
        },
        {
          title: 'Remove Employee Details',
          action: 'remove',
          disable: !this.editEmployee ? true : false,
        },
        { title: 'View Employee Details', action: 'view', disable: false },
      ];
    } else {
      this.menus = [
        {
          title: 'Edit Employee Details',
          action: 'edit',
          disable: this.isReadOnly ? true : false,
        },
        {
          title: 'Remove Employee Details',
          action: 'remove',
          disable: this.isReadOnly ? true : false,
        },
        {
          title: 'View Employee Details',
          action: 'view',
          disable: this.isReadOnly ? true : false,
        },
      ];
    }
  }

  filterQuestionnaireMenu(item: PersonEventQuestionnaire) {
    this.menus = null;
    this.menus = [
      { title: 'View', action: 'view', disable: false },
      { title: 'Edit', action: 'edit', disable: this.isReadOnly },
      { title: 'Delete', action: 'delete', disable: this.isReadOnly },
    ];
  }

  onQuestionnaireMenuItemClick(
    item: PersonEventQuestionnaire,
    menu: any
  ): void {
    switch (menu.action) {
      case 'view':
      case 'edit':
        this.openQuestionnaireDialogView(menu.action);
        break;
      case 'delete':
        if (item) {
          this.openDialogDeleteDouments(item);
        }
        break;
    }
  }

  openDialogDeleteDouments(item: PersonEventQuestionnaire) {
    let message;
    if (!String.isNullOrEmpty(item.employeeNumber)) {
      message =
        'Are you sure you want to delete questionnaire for employee number ' +
        item.employeeNumber +
        '?';
    } else {
      message = 'Are you sure you want to delete questionnaire';
    }

    const dialogRef = this.dialog.open(PopupQuestionnaireDeleteComponent, {
      width: '1024px',
      data: { data: message },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.questionnaireDataSource.splice(0, 1);
        this.updateQuestionnaireTable();
        this.form.markAsDirty();
        this.personEventQuestionnaire = new PersonEventQuestionnaire();
        const formDetails = this.form.getRawValue();
        const isTrainee = formDetails.trainee;
        this.employeeIsTrainee = isTrainee;
        this.doAgeCalculation(new Date(formDetails.dateOfBirth));
      }
    });
  }

  updateQuestionnaireTable() {
    if (this.personEventQuestionnaireTable) {
      this.personEventQuestionnaireTable.renderRows();
    }
    if (this.questionnaireDataSource.length === 0) {
      this.hasData = false;
    }
  }

  openQuestionnaireDialogView(menu: any): void {
    const type = menu;
    const dialogRef = this.dialog.open(EmployeeQuestionnaireComponent, {
      width: '1024px',
      data: {
        event: this.event,
        employeeName:
          this.form.get('firstName').value +
          ' ' +
          this.form.get('surname').value,
        idNumber: this.form.get('idNumber').value,
        dateOfBirth: this.form.get('dateOfBirth').value,
        employeeAge: this.employeeAge,
        presentOccupation: null,
        pattersonBand: Number(this.form.get('petersonGrading').value),
        isTrainee:
          this.form.get('trainee').value === null
            ? false
            : this.form.get('trainee').value,
        isSkilled: this.form.get('skilled').value,
        personEventQuestionnaire: this.personEventQuestionnaire,
        dataType: type,
      },
    });
    if (type === 'edit') {
      dialogRef.afterClosed().subscribe((data) => {
        if (data) {
          this.personEventQuestionnaire = data.personEventQuestionnaire;
          this.hasData = true;
        }
      });
    }
  }

  onMenuItemClick(item: PersonEventModel, menu: any): void {
    switch (menu.action) {
      case 'edit':
        this.edit(item);
        break;
      case 'remove':
        this.removeEmployee(item.personEventId);
        break;
      case 'view':
        this.viewEmployee(item);
        break;
    }
  }

  viewEmployee(personEvent: PersonEventModel) {
    this.viewClaimantDetails = !this.viewClaimantDetails;
    this.selectedPersonEvent = personEvent;
    this.isLoading$.next(true);
    this.rolePlayerService
      .getPersonEmployment(
        this.selectedPersonEvent.rolePlayer.rolePlayerId,
        this.event.memberSiteId
      )
      .subscribe((result) => {
        if (result) {
          this.selectedPersonEvent.rolePlayer.person.personEmployments = this
            .selectedPersonEvent.rolePlayer.person.personEmployments
            ? this.selectedPersonEvent.rolePlayer.person.personEmployments
            : [];
          this.selectedPersonEvent.rolePlayer.person.personEmployments.push(
            result
          );
          if (
            this.selectedPersonEvent.personEventQuestionnaire &&
            !String.isNullOrEmpty(
              this.selectedPersonEvent.personEventQuestionnaire.employeeNumber
            )
          ) {
            this.personEventQuestionnaire =
              this.selectedPersonEvent.personEventQuestionnaire;
            if (this.questionnaireDataSource.length === 0) {
              this.questionnaireDataSource.push(this.personEventQuestionnaire);
              this.updateQuestionnaireTable();
              this.hasData = true;
            }
          }
          this.patchForm();
          this.isLoading$.next(false);
        }
      });
  }

  removeEmployee(personEventId: number) {
    const personEventIndex = this.event.personEvents.findIndex(
      (s) => s.personEventId === personEventId
    );
    this.event.personEvents.splice(personEventIndex, 1);
    this.updateTable(false);
  }

  validateIndustryNumber() {
    const industryNumber = this.form.controls.industryNumber.value;
    if (industryNumber) {
      this.isIndustryNumberLoading$.next(true);
      this.rolePlayerService
        .getPersonEmploymentByIndustryNumber(industryNumber)
        .subscribe((employment) => {
          if (
            employment.personEmpoymentId > 0 &&
            this.industryClassEnum === IndustryClassEnum.Mining
          ) {
            this.form
              .get('industryNumber')
              .setValidators([
                Validators.required,
                IndustryNumberValidators.isIndustryNumberUnique(true),
              ]);
            this.form.get('industryNumber').updateValueAndValidity();
          } else if (this.industryClassEnum === IndustryClassEnum.Mining) {
            this.form
              .get('industryNumber')
              .setValidators([Validators.required]);
            this.form.get('industryNumber').updateValueAndValidity();
          } else {
            this.form.get('industryNumber').clearValidators();
          }
          this.isIndustryNumberLoading$.next(false);
        });
    }
  }

  search() {
    let employeeIdNumber = this.form.controls.idNumber.value;
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
      this.rolePlayerService
        .SearchRolePlayerByRegistrationNumber(
          KeyRoleEnum.InsuredLife,
          employeeIdNumber
        )
        .subscribe((rolePlayerDetails) => {
          if (rolePlayerDetails.rolePlayerId !== 0) {
            this.employeeFound = true;
            this.rolePlayer = rolePlayerDetails;
            this.rolePlayer.rolePlayerIdentificationType =
              RolePlayerIdentificationTypeEnum.Person;
            this.rolePlayerService
              .getPersonEmployment(
                rolePlayerDetails.rolePlayerId,
                this.event.memberSiteId
              )
              .subscribe((result) => {
                if (result) {
                  result.isSkilled = null;
                  this.personEmployment = result;
                  this.personEmployment.isSkilled = null;
                  this.personEmployment.patersonGradingId = null;
                  this.rolePlayer.person.personEmployments = this.rolePlayer
                    .person.personEmployments
                    ? this.rolePlayer.person.personEmployments
                    : [];
                  this.rolePlayer.person.personEmployments.push(result);
                  this.selectedPersonEvent.rolePlayer = this.rolePlayer;
                  this.patchForm();
                  this.disablePersonalDetails();
                  if (
                    this.selectedPersonEvent.rolePlayer.person.gender === null
                  ) {
                    this.SetGender(employeeIdNumber);
                  }
                }
                this.isIdLoading$.next(false);
              });
          } else {
            this.employeeFound = false;
            this.reset();
            this.form.patchValue({
              idNumber: employeeIdNumber,
              idType: idTypeValue,
              dateOfBirth: empDateOfBirth,
            });

            this.enableFormControl('dateOfBirth');

            this.isIdLoading$.next(false);
          }
        });
    }
  }

  SetGender(identificationNumber: string) {
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
      gender: this.gender,
    });
  }

  yearsOccupationChanged() {
    const yearsOccupationValue = this.form.controls.yearsOccupation.value;
    if (typeof yearsOccupationValue === 'number') {
      Number(yearsOccupationValue) >= 1
        ? (this.yearsOccupationInValid = false)
        : (this.yearsOccupationInValid = true);
    } else {
      this.yearsOccupationInValid = true;
    }
  }

  yearsInIndustryChanged() {
    const yearsInIndustry = this.form.controls.yearsInIndustry.value;
    if (typeof yearsInIndustry === 'number') {
      Number(yearsInIndustry) >= 1
        ? (this.yearsInIndustryInValid = false)
        : (this.yearsInIndustryInValid = true);
    } else {
      this.yearsInIndustryInValid = true;
    }
  }

  enableTellValidation() {
    this.form
      .get('telNumber')
      .setValidators([ValidatePhoneNumber, Validators.maxLength(10)]);
    this.form.get('telNumber').updateValueAndValidity();
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
    const yyyy = +yy < 30 ? '20' + yy : '19' + yy;

    this.DOB = new Date(yyyy + '-' + mm + '-' + dd);
    this.form.get('dateOfBirth').setValue(this.DOB);
  }

  subtractYears(numOfYears: number, date: Date) {
    const pivotDate = new Date(date.getTime());
    pivotDate.setFullYear(pivotDate.getFullYear() - numOfYears);
    return this.datePipe.transform(pivotDate, 'yyyy-MM-dd');
  }

  dobChange() {
    const dob = this.form.get('dateOfBirth').value;
    const idNumber = this.form.value.idNumber as string;

    if (this.isSAIdentity && idNumber) {
      const changedDate = this.datePipe.transform(new Date(dob), 'yyyy-MM-dd');
      const formattedDOB = this.datePipe.transform(this.DOB, 'yyyy-MM-dd');

      // Check if the date selected matches the ZAF-ID
      if (
        changedDate === formattedDOB ||
        changedDate === this.subtractYears(100, this.DOB)
      ) {
        this.DOB = new Date(changedDate);
      } else {
        this.setDOB(); // This essentially resets the DOB to use the value passed in the ID-Number Field
      }
    } else {
      this.validateDateField();
    }

    this.doAgeCalculation(dob);
  }

  validateDateField() {
    const control = this.form.get('dateOfBirth');
    if (control instanceof UntypedFormControl) {
      control.markAsTouched({ onlySelf: true });
    } else if (control instanceof UntypedFormGroup) {
      this.validateDateField();
    }
  }

  expand() {
    this.isViewMode = !this.isViewMode;
  }

  doAgeCalculation(startDate: Date) {
    if (startDate) {
      this.employeeAge = this.getAge(startDate);
      const formDetails = this.form.getRawValue();
      const isTrainee = formDetails.trainee;
      this.showQuestionnaireButton =
        (isTrainee || this.employeeAge < this.employeeMinAge) &&
        formDetails.petersonGrading !== null;
    }
  }

  isLeap(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  getAge(birthDate: Date) {
    const now = new Date();
    let days = Math.floor(
      (now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24
    );
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

  omitSpecialChar(event: { charCode: any }) {
    const k = event.charCode;
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k === 8 ||
      k === 32 ||
      (k >= 48 && k <= 57)
    );
  }

  keyPressAlphanumeric(event) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  disablePersonalDetails() {
    this.disableFormControl('gender');
    this.disableFormControl('firstName');
    this.disableFormControl('surname');
  }

  checkEmployeeExists() {
    let emplyeeIdNumber = this.form.controls.idNumber.value;
    if (emplyeeIdNumber) {
      emplyeeIdNumber = emplyeeIdNumber.replace(/[^\w\s]/gi, '');
      emplyeeIdNumber = emplyeeIdNumber.replace(/\s/g, '');
      this.isIdLoading$.next(true);
      this.rolePlayerService
        .SearchRolePlayerByRegistrationNumber(
          KeyRoleEnum.InsuredLife,
          emplyeeIdNumber
        )
        .subscribe((rolePlayerDetails) => {
          if (rolePlayerDetails.rolePlayerId !== 0) {
            this.employeeFound = true;
            this.isIdLoading$.next(false);
          } else {
            this.employeeFound = false;
            this.isIdLoading$.next(false);
          }
        });
    }
  }

  generateAutoCompleteSubscriptions() {
    // nationalityElement
    this.elementKeyUp = fromEvent(
      this.nationalityElement.nativeElement,
      'keyup'
    )
      .pipe(
        map((e: any) => e.target.value),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchData: string) => {
        if (
          String.isNullOrEmpty(searchData) ||
          searchData === Constants.prePopulateCountry
        ) {
          this.nationalitiesFilter = this.nationalities;
          return;
        }
        this.nationalitiesFilter = this.nationalities.filter((option) =>
          String.contains(option.name, searchData)
        );
      });

    // countriesElement
    this.elementKeyUp.add(
      fromEvent(this.countriesElement.nativeElement, 'keyup')
        .pipe(
          map((e: any) => e.target.value),
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((searchData: string) => {
          if (
            String.isNullOrEmpty(searchData) ||
            searchData === Constants.prePopulateCountry
          ) {
            this.countriesFilter = this.countries;
            return;
          }
          this.countriesFilter = this.countries.filter((option) =>
            String.contains(option.name, searchData)
          );
        })
    );
  }

  prepopulateAutocomplete(
    nativeElement,
    options: any[],
    control: AbstractControl
  ): void {
    const option = options.find((opt) => opt.id === control.value);
    if (control.disabled) {
      nativeElement.disabled = true;
    }
    nativeElement.value = option ? option.name : '';
    this.changeDedectorRef.detectChanges();
  }

  CheckResult(listName: string) {
    switch (listName) {
      case Constants.nationality:
        const nationalityType = this.nationalities.find(
          (i) => i.name === this.form.get('nationality').value
        );
        if (nationalityType === undefined) {
          this.nationalitiesFilter = this.nationalities;
          this.form.get('nationality').setValue('');
        }
        break;
      case Constants.country:
        const countryType = this.countries.find(
          (i) => i.name === this.form.get('country').value
        );
        if (countryType === undefined) {
          this.countriesFilter = this.countries;
          this.form.get('country').setValue('');
        }
        break;
    }
  }

  getNationalityName(filteredOption: any) {
    if (filteredOption === null || undefined) {
      this.nationalitiesFilter = this.countries;
    }
    // Decided to search on both name & id because the system already has event-objects that have been saved with Name instead of an Id.
    return this.nationalities.find(
      (option) => option.id === filteredOption || option.name === filteredOption
    )?.name;
  }

  getCountryName(filteredOption: any) {
    if (filteredOption === null || undefined) {
      this.countriesFilter = this.countries;
    }
    // Decided to search on both name & id because the system already has event-objects that have been saved with Name instead of an Id.
    return this.countries.find(
      (option) => option.id === filteredOption || option.name === filteredOption
    )?.name;
  }

  CheckSetIndustryRequiredField() {
    if (this.event.memberSiteId) {
      this.isLoading$.next(true);
      this.rolePlayerService
        .getFinPayee(this.event.memberSiteId)
        .subscribe((finPayee) => {
          if (finPayee) {
            this.rolePlayerService
              .GetDebtorIndustryClass(finPayee.finPayeNumber)
              .subscribe((industry) => {
                if (industry) {
                  this.industryClassEnum = industry;
                  this.setIndustryValidators(this.industryClassEnum);
                }
              });
          }
          this.isLoading$.next(false);
        });
    }
  }
}
