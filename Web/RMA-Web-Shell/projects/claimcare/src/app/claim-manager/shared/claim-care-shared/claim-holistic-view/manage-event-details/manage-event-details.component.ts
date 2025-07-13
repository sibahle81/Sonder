import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Constants } from 'projects/claimcare/src/app/constants';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerBenefitWaitingPeriodEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/roleplayer-benefit-waiting-period.enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { TimeValidators } from 'projects/shared-utilities-lib/src/lib/validators/time-validator';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { EventModel } from '../../../entities/personEvent/event.model';

@Component({
  selector: 'manage-event-details',
  templateUrl: './manage-event-details.component.html',
  styleUrls: ['./manage-event-details.component.css']
})
export class ManageEventDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() event: EventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Output() eventUpdate: EventEmitter<EventModel> = new EventEmitter();

  formEvent: UntypedFormGroup;
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  maxTime = '';
  isSTP = false;
  employeesInjuredInValid = false;
  employeesDeceasedInValid = false;
  maxDate = new Date();
  communicationType: Number;
  subsidiaries: Company[] = [];
  locationCategories: Lookup[] = [];
  filteredLocationCategories: Lookup[] = [];
  claimantDetails = new RolePlayer();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly memberService: MemberService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly datePipe: DatePipe,
    private readonly lookupService: LookupService,
    public dialog: MatDialog
  ) {
    super()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isSTP = this.event.personEvents[0].isStraightThroughProcess
    this.createFormEvent();
    this.getLocationCategories();
    this.getMemberDetails();
    this.maxDate = new Date(this.event.eventDate);
  }

  createFormEvent() {
    if (this.formEvent) { return; }

    if (this.event.personEvents[0].personEventAccidentDetail) {
      this.formEvent = this.formBuilder.group({
        eventNumber: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        memberSite: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        dateOfAccident: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        timeOfAccident: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        detailsOfAccident: [{ value: '', disabled: this.isReadOnly }, [Validators.required,  Validators.maxLength(260)]],
        locationCategory: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        employeesDeceased: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        employeesInjured: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        medicalBenefit: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      });
    } else {
      this.formEvent = this.formBuilder.group({
        eventNumber: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        memberSite: [{ value: '', disabled: this.isReadOnly }, Validators.required],
        dateOfAccident: [{ value: '', disabled: this.isReadOnly }],
        timeOfAccident: [{ value: '', disabled: this.isReadOnly }],
        detailsOfAccident: [{ value: '', disabled: this.isReadOnly }, [Validators.required, Validators.maxLength(260)]],
        locationCategory: [{ value: '', disabled: this.isReadOnly }],
        employeesDeceased: [{ value: '', disabled: this.isReadOnly }],
        employeesInjured: [{ value: '', disabled: this.isReadOnly },],
        medicalBenefit: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      });
    }
  }

  getLocationCategories(): void {
    this.lookupService.getLocationCategories().pipe(takeUntil(this.unSubscribe$)).pipe(takeUntil(this.unSubscribe$)).subscribe(data => {
      this.locationCategories = data;
      this.filteredLocationCategories = data;
    });
  }

  onKey(value) {
    this.filteredLocationCategories = this.search(value);
  }

  search(value: string) {
    let filter = value.toLowerCase();
    if (String.isNullOrEmpty(filter)) {
      return this.filteredLocationCategories = this.locationCategories;
    } else {
      return this.filteredLocationCategories.filter(option => option.name.toLocaleLowerCase().includes(filter));
    }
  }

  getMemberDetails() {
    this.rolePlayerService.getRolePlayer(this.event.memberSiteId).pipe(takeUntil(this.unSubscribe$)).subscribe(rolePlayer => {
      if (rolePlayer) {
        this.claimantDetails = rolePlayer;
        this.getSubsidiaries(rolePlayer, this.event);
      }
    })
  }

  getSubsidiaries(rolePlayer: RolePlayer, personEvent: EventModel) {
    this.claimantDetails = rolePlayer;
    this.memberService.getSubsidiaries(rolePlayer.rolePlayerId).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result.length > 0) {
        this.subsidiaries = result;
        this.patchFormEvent(personEvent, rolePlayer);
      } else {
        this.subsidiaries = [];
        this.subsidiaries.push(this.claimantDetails.company);
        this.patchFormEvent(personEvent, rolePlayer);
      }
      this.isLoading$.next(false);
    });
  }

  readFormEvent(event: EventModel) {
    const formModel = this.formEvent.getRawValue();
    const startDateString = this.datePipe.transform(formModel.dateOfAccident, Constants.dateString);
    const eventDate = new Date(startDateString + 'T' + formModel.timeOfAccident);

    event.eventDate = eventDate.getCorrectUCTDate();
    event.description = formModel.detailsOfAccident ? formModel.detailsOfAccident : '';
    event.numberOfDeceasedEmployees = formModel.employeesDeceased ? formModel.employeesDeceased : 0;
    event.numberOfInjuredEmployees = formModel.employeesInjured ? formModel.employeesInjured : 0;
    event.locationCategory = formModel.locationCategory;
    event.memberSiteId = formModel.memberSite;
    return event;
  }

  validateTimeAndDate() {
    const today = new Date();
    const todayDate = this.datePipe.transform(today, Constants.dateString);
    this.maxTime = this.datePipe.transform(today, Constants.time24HRString);
    const formModel = this.formEvent.getRawValue();
    if (formModel.dateOfAccident && formModel.timeOfAccident) {
      const startDateString = this.datePipe.transform(formModel.dateOfAccident, Constants.dateString);
      if (startDateString === todayDate) {
        if (formModel.timeOfAccident > this.maxTime) {
          this.formEvent.get('timeOfAccident').setValidators([Validators.required, TimeValidators.isTimeBefore(this.maxTime)]);
          this.formEvent.get('timeOfAccident').updateValueAndValidity();
        } else {
          this.formEvent.get('timeOfAccident').setValidators([Validators.required]);
          this.formEvent.get('timeOfAccident').updateValueAndValidity();
        }
      } else {
        this.formEvent.get('timeOfAccident').setValidators([Validators.required]);
        this.formEvent.get('timeOfAccident').updateValueAndValidity();
      }
    }
  }

  employeesInjuredChanged() {
    const employeesInjuredValue = this.formEvent.controls.employeesInjured.value;
    if (typeof employeesInjuredValue === 'number') {
      Number(employeesInjuredValue) >= 1 ? this.employeesInjuredInValid = false : this.employeesInjuredInValid = true;
    } else {
      this.employeesInjuredInValid = true;
    }
  }

  employeesDeceasedChanged() {
    const employeesDeceasedValue = this.formEvent.controls.employeesDeceased.value;
    if (typeof employeesDeceasedValue === 'number') {
      Number(employeesDeceasedValue) >= 0 ? this.employeesDeceasedInValid = false : this.employeesDeceasedInValid = true;
    } else {
      this.employeesDeceasedInValid = true;
    }
  }

  patchFormEvent(personEvent: EventModel, claimant: RolePlayer) {
    const hours = ("0" + new Date(personEvent.eventDate).getHours()).slice(-2);
    const minutes = ("0" + new Date(personEvent.eventDate).getMinutes()).slice(-2);
    const eventTime = hours + ':' + minutes;

    this.formEvent.patchValue({
      eventNumber: personEvent.eventReferenceNumber,
      memberSite: this.event.memberSiteId ? this.event.memberSiteId : this.event.memberSiteId ? this.event.memberSiteId : 0,
      employeesDeceased: personEvent.numberOfDeceasedEmployees,
      employeesInjured: personEvent.numberOfInjuredEmployees,
      medicalBenefit: this.getRolePlayerMedicalWaiting(claimant),
      dateOfAccident: personEvent.eventDate,
      timeOfAccident: eventTime,
      detailsOfAccident: personEvent.description,
      locationCategory: personEvent.locationCategory,
    });
  }

  getRolePlayerMedicalWaiting(claimant: RolePlayer): string {
    const rolePlayerBenefitWaitingPeriod = claimant.rolePlayerBenefitWaitingPeriod;
    if (!rolePlayerBenefitWaitingPeriod)
      return 'No Medical Waiting Period Defined';
    return this.formatText(RolePlayerBenefitWaitingPeriodEnum[rolePlayerBenefitWaitingPeriod]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClientItemTypeEnum.Client,
        itemId: this.claimantDetails.rolePlayerId,
        heading: 'Event Audit Details',
        propertiesToDisplay: ['DisplayName', 'TellNumber', 'CellNumber', 'EmailAddress',
          'PreferredCommunicationTypeId', 'RolePlayerIdentificationTypeEnum', 'RepresentativeId', 'AccountExecutiveId',
          'RolePlayerBenefitWaitingPeriod', 'ClientType']
      }
    });
  }

  edit(): void {
    this.isReadOnly = false;
    this.formEvent.enable();
  }

  view() {
    this.isReadOnly = !this.isReadOnly;
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.isReadOnly = true;
    this.formEvent.disable();
  }

  save() {
    this.isSaving$.next(true);
    this.claimService.getEvent(this.event.eventId).pipe(takeUntil(this.unSubscribe$)).subscribe(event => {
      const eventDetails = this.readFormEvent(event);
      this.claimService.updateEventWizard(eventDetails).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        if (result) {
          this.eventUpdate.emit(eventDetails);
          this.reset();
          this.isLoading$.next(false);
        }
      });
      this.eventUpdate.emit(eventDetails);
      this.reset();
      this.isSaving$.next(false);
    });
  }
}
