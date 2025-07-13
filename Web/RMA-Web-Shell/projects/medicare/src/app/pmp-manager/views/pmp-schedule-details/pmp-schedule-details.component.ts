import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { TebaLocationDetails } from "projects/medicare/src/app/pmp-manager/models/teba-location-details";
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'pmp-schedule-details',
  templateUrl: './pmp-schedule-details.component.html',
  styleUrls: ['./pmp-schedule-details.component.css']
})

export class PMPScheduleDetailsComponent extends WizardDetailBaseComponent<PensionClaim> {

  @Input() passedPensionClaim: PensionClaim;
  public form: UntypedFormGroup;
  loadingData$ = new BehaviorSubject<boolean>(false);
  showSearchProgress = false;
  disabled: boolean = true;
  pensionCaseNumberErrorMessage: string;
  selectedTab = 0;
  isInternalUser: boolean = true;
  icd10List = [];
  displayedColumns: { def: string, show: boolean }[];
  eventId: number = 0;
  personEventId: number;
  selectedEvent: EventModel;
  selectedPersonEvent: PersonEventModel;
  startDate= new Date();
  isProsthesis = false;
  isAttended = false;
  isExcludePMPSchedule = false;
  dataSource: MatTableDataSource<TebaLocationDetails>;

  getDisplayedColumns(): string[] {    
    this.displayedColumns = [
      { def: 'officialName', show: true },
      { def: 'description', show: true },
      { def: 'workNumber', show: true },
      { def: 'faxNumber', show: true },
      { def: 'email', show: true },
    ];
    return this.displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
  } 

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    readonly confirmservice: ConfirmationDialogsService,
    private datePipe: DatePipe
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.dataSource = new MatTableDataSource<TebaLocationDetails>();
  }
  
  ngOnInit(): void {
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
  }  

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.passedPensionClaim?.currentValue) {
      if (isNullOrUndefined(this.model)) {
        this.model = new PensionClaim();
        if (isNullOrUndefined(this.form))
          this.createForm()
      }
      this.model = changes?.passedPensionClaim?.currentValue;
      this.populateForm();
      this.disableForm(true);
    }
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult { 
    return validationResult;
  }

  populateForm(): void {
    if (this.model) {
      this.isProsthesis = this.model.isScheduleON;
      this.isAttended = this.model.attendedClinic;
      this.isExcludePMPSchedule = this.model.excludePMPSchedule;
      if (this.form.controls.scheduleDate.value.value == '')
        this.form.controls.scheduleDate.setValue(this.model.scheduleDate == null ? '' : this.model.scheduleDate.toString() != '1899-12-31T22:30:00.000Z' ? this.model.scheduleDate : '');
      this.form.controls.service.setValue(this.model.serviceName);
      this.form.controls.drgCode.setValue(this.model.drg);
      this.form.controls.icd10Driver.setValue(this.model.icD10Driver);
      this.form.controls.pmpLocation.setValue(this.model.pmpLocation);
      this.form.controls.pmpRegion.setValue(this.model.pmpRegion);
      this.form.controls.pmpMCA.setValue(this.model.pmpmca);
      this.form.controls.pmpSPA.setValue(this.model.pmpspa);
      this.form.controls.tebaBranch.setValue(this.model.tebaBranchName);
      this.form.controls.tebaBranchName.setValue(this.model.tebaBranchName);
      this.form.controls.tebaAddress.setValue(this.model.tebaAddress);
      this.form.controls.tebaCity.setValue(this.model.tebaCity);
      this.form.controls.tebaProvince.setValue(this.model.tebaProvince);
      this.form.controls.tebaCountry.setValue(this.model.tebaCountry);
      this.form.controls.tebaPostalCode.setValue(this.model.tebaPostalCode);
      this.form.controls.tebaPMPRegion.setValue(this.model.tebaPMPRegion);
    }
    this.loadTebaLocationDetails();
  }

  populateModel(): void {
    if (!this.model) return;
    const formModel = this.form.getRawValue();
       
    if (formModel.scheduleDate != '')
      this.model.scheduleDate = DateUtility.getDate(this.datePipe.transform(formModel.scheduleDate, 'MM/dd/yyyy'));
    if (formModel.isProsthesisRequired != '')
      this.model.isScheduleON = formModel.isProsthesisRequired;
    if (formModel.isAttendedClinic.value == undefined && formModel.isAttendedClinic != '')
      this.model.attendedClinic = formModel.isAttendedClinic;
    if (formModel.isExcluded.value == undefined && formModel.isExcluded.value != '')
      this.model.excludePMPSchedule = formModel.isExcluded;
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
        isProsthesisRequired: new UntypedFormControl(''),
        scheduleDate: [{ value: '' }],
        service: [{ value: '', disabled: this.disabled }],
        isAttendedClinic: [{ value: '' }],
        isExcluded: [{ value: '' }],
        clinicVenue: [{ value: '' }],
        drgCode: [{ value: '', disabled: this.disabled }],
        icd10Driver: [{ value: '', disabled: this.disabled }],
        pmpLocation: [{ value: '', disabled: this.disabled }],
        pmpRegion: [{ value: '', disabled: this.disabled }],
        pmpSPA: [{ value: '', disabled: this.disabled }],
        pmpMCA: [{ value: '', disabled: this.disabled }],
        tebaBranch: [{ value: '', disabled: this.disabled }],
        tebaBranchName: [{ value: '', disabled: this.disabled }],
        tebaAddress: [{ value: '', disabled: this.disabled }],
        tebaCity: [{ value: '', disabled: this.disabled }],
        tebaProvince: [{ value: '', disabled: this.disabled }],
        tebaCountry: [{ value: '', disabled: this.disabled }],
        tebaPostalCode: [{ value: '', disabled: this.disabled }],
        tebaPMPRegion: [{ value: '', disabled: this.disabled }]
      });
  }
  
  loadTebaLocationDetails() {
    if (this.model && this.model.tebaLocationDetails !== null && this.model.tebaLocationDetails !== undefined && this.model.tebaLocationDetails.length > 0) {
      this.dataSource.data = this.model.tebaLocationDetails;
    }
  }

  disableForm(disableVal: boolean) {
    if (disableVal) {
      this.form.disable();
    }
    else {
      this.form.enable();
    }
  }  

}
