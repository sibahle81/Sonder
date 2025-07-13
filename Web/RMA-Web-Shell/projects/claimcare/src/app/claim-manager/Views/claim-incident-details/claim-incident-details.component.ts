import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '../../../constants';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import 'src/app/shared/extensions/date.extensions';
import { TimeValidators } from 'projects/shared-utilities-lib/src/lib/validators/time-validator';
import { RolePlayerBenefitWaitingPeriodEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/roleplayer-benefit-waiting-period.enum';
import { DatePipe } from '@angular/common';
import { ClaimCareService } from '../../Services/claimcare.service';
import { takeUntil } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
@Component({
  selector: 'claim-incident-details',
  templateUrl: './claim-incident-details.component.html',
  styleUrls: ['./claim-incident-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ClaimIncidentDetailsComponent extends UnSubscribe implements OnInit, OnChanges {

  @Input() event: EventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;
  @Input() employer: RolePlayer;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;

  startDate = new Date();
  maxDate = new Date();

  hideForm = true;
  currentUser: string;

  locationCategories: Lookup[] = [];
  subsidiaries: Company[];

  maxTime = '';
  menus: { title: string, action: string, disable: boolean }[];
  selectedTab = 2;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly lookUpService: LookupService,
    public readonly datePipeService: DatePipe,
    private readonly memberService: MemberService,
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog
  ) { super() }

  ngOnInit() {
    this.currentUser = this.authService.getUserEmail().toLowerCase();
    this.getLookups();
    if (this.isWizard) {
      if (this.event.eventId > 0) {
        this.resetForm();
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event || !this.employer) { return; }

    if (!this.isWizard) {
      this.getEventDetails(this.event.eventId);
    }
    else {
      this.createForm();
    }

    this.memberService.createReaction$.subscribe(increased => {
      if (increased) {
        this.form.patchValue({
          employeesInjured: this.event.numberOfInjuredEmployees
        });
      }
    });
    if (this.isWizard) {
      this.edit();
    }
  }

  getRolePlayerMemberBenefitDetails(rolePlayerBenefitWaitingPeriod: RolePlayerBenefitWaitingPeriodEnum): string {
    if (!rolePlayerBenefitWaitingPeriod)
      return 'No Medical Waiting Period Defined';
    return this.format(RolePlayerBenefitWaitingPeriodEnum[rolePlayerBenefitWaitingPeriod]);
  }

  createForm() {
    this.form = this.formBuilder.group({
      memberSite: [{ value: '', disabled: this.isReadOnly }],
      dateOfAccident: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      timeOfAccident: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      detailsOfAccident: [{ value: '', disabled: this.isReadOnly }, [Validators.required, Validators.maxLength(260)]],
      locationCategoryId: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      employeesDeceased: [{ value: '', disabled: this.isReadOnly }, [Validators.required, Validators.min(0)]],
      employeesInjured: [{ value: '', disabled: this.isReadOnly }, [Validators.required, Validators.min(1)]],
      medicalBenefit: [{ value: '', disabled: this.isReadOnly }],
    });

    this.setMember(this.employer);
  }

  readForm() {
    const formModel = this.form.getRawValue();
    this.event.numberOfDeceasedEmployees = formModel.employeesDeceased ? formModel.employeesDeceased : 0;
    this.event.numberOfInjuredEmployees = formModel.employeesInjured ? formModel.employeesInjured : 0;
    this.event.description = formModel.detailsOfAccident ? formModel.detailsOfAccident : '';
    this.event.locationCategory = formModel.locationCategoryId ? formModel.locationCategoryId : 0;
    this.event.memberSiteId = this.employer.rolePlayerId ? this.employer.rolePlayerId : 0;
    if (formModel.dateOfAccident && formModel.timeOfAccident) {
      const startDateString = this.datePipeService.transform(formModel.dateOfAccident, Constants.dateString);
      const eventDate = new Date(startDateString + 'T' + formModel.timeOfAccident);
      this.event.eventDate = eventDate.getCorrectUCTDate();
    }
    this.event.dateAdvised = new Date();
    this.event.createdDate = new Date();
    this.event.modifiedDate = new Date();
    this.event.createdBy = this.currentUser;
    this.event.modifiedBy = this.currentUser;

    this.isSaving$.next(false);
  }

  getEventDetails(eventId: number) {
    if (eventId > 0) {
      this.claimService.getEvent(eventId).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        if (result) {
          this.event = result;
          this.createForm();
          this.disableAllControls();
        }
      });
    }
  }

  patchForm() {
    if (this.event) {
      this.form.patchValue({
        dateOfAccident: this.event.eventDate !== Constants.minDate ? this.event.eventDate : null,
        timeOfAccident: this.event.eventDate !== Constants.minDate ? this.datePipeService.transform(this.event.eventDate, Constants.time24HRString) : null,
        detailsOfAccident: this.event.description,
        employeesInjured: this.event.numberOfInjuredEmployees,
        employeesDeceased: this.event.numberOfDeceasedEmployees,
        locationCategoryId: this.event.locationCategory,
        memberSite: this.employer.rolePlayerId ? this.employer.rolePlayerId : 0
      });
    }
  }

  disableAllControls() {
    this.disableFormControl('dateOfAccident');
    this.disableFormControl('timeOfAccident');
    this.disableFormControl('detailsOfAccident');
    this.disableFormControl('employeesInjured');
    this.disableFormControl('employeesDeceased');
    this.disableFormControl('locationCategoryId');
    this.disableFormControl('memberSite');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  setMember(employer: RolePlayer) {
    this.isLoading$.next(true);
    this.employer = employer;
    this.form.patchValue({
      medicalBenefit: this.getRolePlayerMemberBenefitDetails(employer.rolePlayerBenefitWaitingPeriod)
    });
    this.getSubsidiaries();
  }

  getSubsidiaries() {
    this.memberService.getSubsidiaries(this.event.memberSiteId).subscribe(results => {
      if (results && results.length > 0) {
        this.subsidiaries = results;
      } else {
        this.subsidiaries = [];
        this.subsidiaries.push(this.employer.company);
      }
      this.patchForm();
      this.isLoading$.next(false);
    });
  }

  add() {
    this.toggle();
  }

  toggle() {
    this.hideForm = !this.hideForm;
    this.reset();
  }

  validateTimeAndDate() {
    const today = new Date();
    const todayDate = this.datePipeService.transform(today, Constants.dateString);
    this.maxTime = this.datePipeService.transform(today, Constants.time24HRString);
    const formModel = this.form.getRawValue();
    if (formModel.dateOfAccident && formModel.timeOfAccident) {
      const startDateString = this.datePipeService.transform(formModel.dateOfAccident, Constants.dateString);
      if (startDateString === todayDate) {
        if (formModel.timeOfAccident > this.maxTime) {
          this.form.get('timeOfAccident').setValidators([Validators.required, TimeValidators.isTimeBefore(this.maxTime)]);
          this.form.get('timeOfAccident').updateValueAndValidity();
        } else {
          this.form.get('timeOfAccident').setValidators([Validators.required]);
          this.form.get('timeOfAccident').updateValueAndValidity();
        }
      } else {
        this.form.get('timeOfAccident').setValidators([Validators.required]);
        this.form.get('timeOfAccident').updateValueAndValidity();
      }
    }
  }

  cancel() {
    this.resetForm();
    this.patchForm();
  }

  reset() {
    this.form.reset();
  }

  getLookups() {
    this.loadLocationCategories();
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

  edit() {
    this.form.enable();
    this.isReadOnly = false;
  }

  loadLocationCategories(): void {
    this.lookUpService.getLocationCategories().subscribe(data => {
      this.locationCategories = data;
    });
  }

  resetForm() {
    this.isReadOnly = true;
    this.form.disable();
  }

  save() {
    this.isSaving$.next(true);
    this.readForm();
    this.resetForm();
  }

  employeeValidation(): boolean {
    const employeesInjuredValue = this.form.controls.employeesInjured.value;
    if (typeof employeesInjuredValue === 'number') {
      return Number(employeesInjuredValue) < 1;
    }
  }

  employeeRequired(): boolean {
    if (this.form.controls.employeesInjured.hasError('required') && this.form.controls.employeesInjured.touched) {
      return true;
    } else {
      return false;
    }
  }

  employeesDeceasedRequired(): boolean {
    if (this.form.controls.employeesDeceased.hasError('required') && this.form.controls.employeesDeceased.touched) {
      return true;
    } else {
      return false;
    }
  }

  employeesDeceasedValidation(): boolean {
    const employeesDeceasedValue = this.form.controls.employeesDeceased.value;
    if (typeof employeesDeceasedValue === 'number') {
      return Number(employeesDeceasedValue) < 0;
    }
  }

  format(text: string) {
    if (text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }
}
