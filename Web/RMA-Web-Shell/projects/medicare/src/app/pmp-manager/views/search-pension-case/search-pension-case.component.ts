import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PMPService } from 'projects/medicare/src/app/pmp-manager/services/pmp-service';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';

@Component({
  selector: 'search-pension-case',
  templateUrl: './search-pension-case.component.html',
  styleUrls: ['./search-pension-case.component.css']
})

export class SearchPensionCaseComponent extends WizardDetailBaseComponent<PensionClaim> {

  public form: UntypedFormGroup;
  loadingData$ = new BehaviorSubject<boolean>(false);
  showSearchProgress = false;
  disabled: boolean = true;
  isLoadingCategories = false;
  pensionCaseNumberErrorMessage: string;
  selectedTab = 0;
  isInternalUser: boolean = true;
  icd10List = [];
  eventId: number = 0;
  personEventId: number;
  selectedEvent: EventModel;
  selectedPersonEvent: PersonEventModel;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly pmpService: PMPService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly claimCareService: ClaimCareService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }
  
  ngOnInit(): void {
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
  }

  onLoadLookups(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      const form = this.form.controls;
      ReportFormValidationUtility.FieldRequired('pensionCaseNumber', 'Pension Case Number', this.form, validationResult);
      if (!String.isNullOrEmpty(this.pensionCaseNumberErrorMessage)) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(this.pensionCaseNumberErrorMessage);
      }
    }
    return validationResult;
  }

  populateForm(): void {

  }

  search(pensionCaseNumber: string): void {
    if (!String.isNullOrWhiteSpace(pensionCaseNumber)) {
      this.showSearchProgress = true;
      this.pmpService.searchPensionCase(pensionCaseNumber, 0).subscribe(res => {
        if (res.personEventId > 0) {
          this.pensionCaseNumberErrorMessage = '';
          this.eventId = res.eventId;
          this.personEventId = res.personEventId;
          this.model.pensionerId = res.pensionerId;
          this.model.pensionCaseNumber = res.pensionCaseNumber;
          this.model.drg = res.drg;
          this.model.icD10Driver = res.icD10Driver;
          this.model.claimId = res.claimId;
          this.model.personEventId = res.personEventId;
          this.model.serviceName = res.serviceName;
          this.model.scheduleDate = res.scheduleDate;
          this.model.isScheduleON = res.isScheduleON;
          this.model.attendedClinic = res.attendedClinic;
          this.model.excludePMPSchedule = res.excludePMPSchedule;
          this.model.pmpLocation = res.pmpLocation;
          this.model.pmpRegion = res.pmpRegion;
          this.model.pmpmca = res.pmpmca;
          this.model.pmpspa = res.pmpspa;
          this.model.tebaLocationId = res.tebaLocationId;
          this.model.tebaBranchName = res.tebaBranchName;
          this.model.tebaAddress = res.tebaAddress;
          this.model.tebaCity = res.tebaCity;
          this.model.tebaProvince = res.tebaProvince;
          this.model.tebaCountry = res.tebaCountry;
          this.model.tebaPostalCode = res.tebaPostalCode;
          this.model.tebaPMPRegion = res.tebaPMPRegion;
          this.model.tebaLocationDetails = res.tebaLocationDetails;
          this.model.visits = res.visits;
          this.getPersonEvent();
        }
        else {
          this.pensionCaseNumberErrorMessage = 'Invalid pension case, please capture valid case number.';
          this.showSearchProgress = false;
          this.personEventId = 0;
        }
      });
    }
  }

  getPersonEvent() {
    this.claimCareService.getPersonEvent(this.personEventId).subscribe(result => {
        this.selectedPersonEvent = result;
        this.eventId = this.selectedPersonEvent.eventId
        this.getEvent();
    })
  } 

  getEvent() {
    this.claimCareService.getEventDetails(this.selectedPersonEvent.eventId).subscribe(result => {
        this.selectedEvent = result;
        this.showSearchProgress = false;
        this.loadingData$.next(false);
    })
  }

  setPersonEvent(personEvent: PersonEventModel) {
    this.selectedPersonEvent = personEvent;
  }

  populateModel(): void {
    if (!this.model) return;
    const formModel = this.form.getRawValue();    
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      pensionCaseNumber: new UntypedFormControl('', [Validators.required]),
      claimId: new UntypedFormControl(''),
      personEventId: new UntypedFormControl(''),
      eventTypeId: new UntypedFormControl('')
    });
  }
}
