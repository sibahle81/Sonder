import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { PreAuthLevelOfCare } from 'projects/medicare/src/app/preauth-manager/models/preauth-levelofcare';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { TariffSearch } from 'projects/medicare/src/app/preauth-manager/models/tariff-search';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { CrosswalkSearch } from 'projects/medicare/src/app/medi-manager/models/crosswalk-search';
import { isNullOrUndefined } from 'util';
import { TreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-protocol.interface';
import { ClinicalUpdateTreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-protocol.interface';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MutualInclusiveExclusiveCode } from 'projects/medicare/src/app/medi-manager/models/mutual-inclusive-exclusive-code';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PreAuthBreakdownTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-breakdown-type-enum';
import { TariffSearchTypeEnum } from 'projects/medicare/src/app/medi-manager/constants/tariff-search-type-enum';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
 
@Component({
  selector: 'preauth-breakdown',
  templateUrl: './preauth-breakdown.component.html',
  styleUrls: ['./preauth-breakdown.component.css'],
  providers: [DatePipe],
})

export class PreauthBreakdownComponent extends WizardDetailBaseComponent<PreAuthorisation>  implements OnChanges {
  public form: UntypedFormGroup;
  @Input() healthCareProvider: HealthCareProvider;
  @Input() preAuthBreakdownType: string;
  @Input() preAuthClaimDetail: PreAuthClaimDetail;
  @Input() showLevelOfCare: boolean = false;
  @Input() authControlMode: boolean = false;
  @Input() showTreatingProtocols: boolean = false;
  @Input() preAuthId: number;
  @Input() isClinicalUpdate: boolean = false;
  @Input() expandNewLineItemControl: boolean = true;
  @Input() subAuthModel: PreAuthorisation;
  @Input() showResetButton: boolean = true;
  @Input() authType: string = 'Hospitalization';
  @Input() personEventId: number;

  @Output() dateChange: EventEmitter<MatDatepickerInputEvent<Date>>;
  @Output() onPreAuthorisationBreakdownChange = new EventEmitter<any>();

  @ViewChild('tariffSearchComponent', { static: true }) private tariffSearchComponent;
  @ViewChild('crosswalkSearchComponent', { static: true }) private crosswalkSearchComponent;

  dataSourceLengthOfStay: MatTableDataSource<PreAuthLevelOfCare>;
  lengthOfStayColumns = ['tariffCode', 'levelOfCare', 'dateTimeAdmitted', 'dateTimeDischarged', 'lengthOfStay'];
  tariffSearchCurrent: TariffSearch;
  crosswalkSearchCurrent: CrosswalkSearch[];
  preAuthorisationBreakdownList: PreAuthorisationBreakdown[];
  displayedColumns:{def:string,show:boolean}[];
  dataSource: MatTableDataSource<PreAuthorisationBreakdown>;
  hideCPTSearchControl: boolean;
  hideTariffSearchControl: boolean;
  hideQtyAndAmount: boolean;
  hideRequestedQuantity:boolean;
  tariffTypeId: number;
  tariffTypeIds: string;
  preAuthFromDate: Date;
  practitionerTypeId: number;
  preAuthLevelOfCare: PreAuthLevelOfCare;
  levelOfCareList: PreAuthLevelOfCare[];
  levelOfCareList$: PreAuthLevelOfCare[];// Observable<Array<any>>;
  currentLevelOfCare: PreAuthLevelOfCare;
  isHospitalAuth: boolean;
  isduplicateLine: boolean;
  tariffSearchType: string;
  isInternalUser: boolean = false;
  existingpreAuthBreakdownList: PreAuthorisationBreakdown[];
  preAuthType: PreauthTypeEnum;
  isAdmissionCode: boolean;
  isFullDayAlways: boolean;
  showLevelOfCareGrid: boolean = false;
  treatingProtocols: TreatmentProtocol[];
  filteredTreatingProtocols: TreatmentProtocol[];
  checkedTreatingProtocols: Array<ClinicalUpdateTreatmentProtocol> = []
  currentSelectedLevelOfCare: string;
  practitionerName:string;
  dateAuthorisedFrom: Date;
  dateAuthorisedTo: Date;
  showEditControls: boolean = false;
  showHideCPT:boolean = true;
  showAddItemTitlesAndControls: boolean = true;
  currentEditedItem: PreAuthorisationBreakdown;
  currentUrl = this.router.url;
  checkOnEditPreauth = (this.currentUrl.includes("edit-preauth")) ? true : false;
  counter = 0;
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    public datepipe: DatePipe,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private router: Router) {
    super(appEventsManager, authService, activatedRoute);
  }

    getDisplayedColumns(): string[] {
    
    this.displayedColumns = [
      { def: 'itemCode', show: true },
      { def: 'description', show: true },
      { def: 'treatmentCode', show: true },
      { def: 'treatmentCodeDescription', show: true },//cpt code description
      { def: 'requestedTreatments', show: true },
      { def: 'dateAuthorisedFrom', show: true },
      { def: 'dateAuthorisedTo', show: true },

      { def: 'tariffAmount', show: this.authService.getCurrentUser().isInternalUser ? true : false },
      { def: 'requestedAmount', show: this.authService.getCurrentUser().isInternalUser ? true : false },

      { def: 'authorisedQuantity', show: this.checkBreakdownItemsExist() || this.authControlMode },
      { def: 'authorisedAmount', show: this.checkBreakdownItemsExist() || this.authControlMode },
      { def: 'quantityChangedReason', show: this.checkBreakdownItemsExist() || this.authControlMode },
      { def: 'select', show: this.checkBreakdownItemsExist() || this.authControlMode },

      { def: 'edit', show: true },
      { def: 'delete', show: true },

    ];
    return this.displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
  }


  onLoadLookups(): void {
  }

  populateModel(): void {
    if (!this.preAuthorisationBreakdownList || this.preAuthorisationBreakdownList.length === 0) return;
    this.model.preAuthorisationBreakdowns = this.preAuthorisationBreakdownList;
    this.showHideCPTCode();
  }

  populateForm(): void {
    if (!this.model || !this.model.preAuthorisationBreakdowns) {
      this.preAuthorisationBreakdownList = this.model.preAuthorisationBreakdowns;
      this.practitionerName = this.model.healthCareProviderName;
    }
    this.showHideCPTCode();
    this.loadExistingBreakdownList(null);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    if (this.authType == PreauthTypeEnum[PreauthTypeEnum.Hospitalization])
      this.preAuthType = PreauthTypeEnum.Hospitalization;
    else if (this.authType == PreauthTypeEnum[PreauthTypeEnum.TreatingDoctor])
      this.preAuthType = PreauthTypeEnum.TreatingDoctor;

    var practitionerType = this.healthcareProviderService.preAuthPractitionerTypeSetting;
    if (this.preAuthorisationBreakdownList === null || this.preAuthorisationBreakdownList === undefined || this.preAuthorisationBreakdownList.length <= 0) {
      if (this.isInternalUser) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least one line item.`);
      }
      else if (!this.isInternalUser && practitionerType.isHospital && this.preAuthType == PreauthTypeEnum.Hospitalization) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least one line item.`);
      }
      else if (!this.isInternalUser && practitionerType.isTreatingDoctor && this.preAuthType == PreauthTypeEnum.TreatingDoctor) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least one line item.`);
      }
    }

    if (this.levelOfCareList != null) {
      this.levelOfCareList.forEach((x) => {
        if (x.dateTimeAdmitted === null
          || x.dateTimeDischarged === null) {
          if (this.preAuthBreakdownType === undefined) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push(`Please capture admission Date and Time and discharge Date and Time for Hospital Auth`);
          }
        }
      });
    }

    if(this.showLevelOfCare && this.preAuthType == PreauthTypeEnum.Hospitalization) {
      
    let admissionDateTime = this.combineDateAndTime(this.form.controls.admissionDate.value, this.form.controls.admissionTime.value);
    let dischargeDateTime = this.combineDateAndTime(this.form.controls.dischargeDate.value, this.form.controls.dischargeTime.value);

    DateCompareValidator.compareDates(this.form.controls.dateAuthorisedFrom.value, this.form.controls.dateAuthorisedTo.value, 'Authorisation to date cannot be before the authorisation from date', validationResult);
    DateCompareValidator.validateDateIfLessthanOrEqual(admissionDateTime, dischargeDateTime, 'Discharge Date and Time cannot be before the Admission Date and Time', validationResult);
    }
    
    return validationResult;
  }

  ngOnInit() {
    this.preAuthorisationBreakdownList = [];
    this.levelOfCareList = [];
    this.createForm();
    this.dataSource = new MatTableDataSource<PreAuthorisationBreakdown>();
    this.dataSourceLengthOfStay = new MatTableDataSource<PreAuthLevelOfCare>();
    this.hideCPTSearchControl = true;
    this.hideTariffSearchControl = false;
    this.showHideCPTCode();
    this.tariffTypeId = 0;
    this.tariffTypeIds = '0';
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
    if (currentUser.isInternalUser) {
      this.hideQtyAndAmount = false;
    }
    else
      this.hideQtyAndAmount = true;
    this.mediCarePreAuthService
      .getTreatmentProtocols()
      .subscribe((values: Array<TreatmentProtocol>) => this.treatingProtocols = values)
    this.authType = MedicareUtilities.getPreauthTypeName(this.currentUrl);
    this.showLevelOfCare = (this.authType == PreauthTypeEnum[PreauthTypeEnum.Hospitalization]) ? true : false;
    this.hideRequestedQuantity = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.TreatingDoctor) {
      //controlling showLevelOfCare options by preAuthBreakdownType input passed from selector:preauth-breakdown
      this.showLevelOfCare = false;
    }
  }

  checkIfHospitalAuthAndShowControls(): void {
    this.isHospitalAuth = true;
    this.tariffSearchType = this.preAuthBreakdownType;
    if (this.preAuthBreakdownType === undefined) {
      this.tariffSearchType = TariffSearchTypeEnum.Hospital;
    }
    if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.TreatingDoctor) {
      this.isHospitalAuth = false;
      this.showLevelOfCare = false;
    }
    else if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.PhysioOT) {
      this.isHospitalAuth = false;
    }
    if (this.isHospitalAuth) {
      this.populateLevelOfCare();
    }
    this.showHideCPTCode();
  }

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      preAuthBreakdownId: [{ value: 0, disabled: true }],
      TreatmentCodeId: new UntypedFormControl(''),
      MedicalItemId: new UntypedFormControl(''),
      TariffId: new UntypedFormControl(''),
      RequestedTreatments: new UntypedFormControl(''),
      IsAuthorised: new UntypedFormControl(''),
      requestedQuantity: new UntypedFormControl(''),
      tariffSearchComponent: new UntypedFormControl(),
      tariffCode: new UntypedFormControl({ value: '', disabled: true }),
      crosswalkSearchComponent: new UntypedFormControl(),
      dateAuthorisedFrom: new UntypedFormControl(''),
      dateAuthorisedTo: new UntypedFormControl(''),
      isCPTCode: new UntypedFormControl(''),
      requestedAmount: new UntypedFormControl({ value: '', disabled: true }),
      levelOfCare: new UntypedFormControl(),
      admissionDate: new UntypedFormControl({ value: '', disabled: false }),
      admissionTime: new UntypedFormControl(),
      dischargeDate: new UntypedFormControl({ value: '', disabled: false }),
      dischargeTime: new UntypedFormControl(),
      tariffSearchControl: new UntypedFormControl(),
      lengthOfStay: new UntypedFormControl({ value: '', disabled: true })
    });
    this.checkIfHospitalAuthAndShowControls();
    this.loadExistingBreakdownList(null);
    this.showHideCPTCode();
  }

  clearForm(): void {
    this.form.patchValue({
      TreatmentCodeId: '',
      MedicalItemId: '',
      TariffId: '',
      RequestedTreatments: '',
      IsAuthorised: '',
      requestedQuantity: '',
      tariffSearchComponent: new UntypedFormControl(),
      crosswalkSearchComponent: new UntypedFormControl(),
      requestedAmount: '',
      levelOfCare: new UntypedFormControl(),
      admissionDate: '',
      admissionTime: '',
      dischargeDate: '',
      dischargeTime: '',
      lengthOfStay: '',
      dateAuthorisedFrom: '',
      dateAuthorisedTo: '',
      isCPTCode: '',
    });
    this.preAuthFromDate = null;
    this.hideCPTControl();
    this.populateLevelOfCare();
  }

  hideCPTControl(): void {
    this.hideCPTSearchControl = true;
    this.hideTariffSearchControl = false;
    this.hideQtyAndAmount = false;
    this.hideRequestedQuantity = false;
    if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.TreatingDoctor) {
      this.showLevelOfCare = false;
    }
    else if (this.preAuthBreakdownType){ //only change level of care if preAuthBreakdownType is set explicitly
      this.showLevelOfCare = true;
    }
  }

  public setCurrentBreakdownItem(tariffSearch: TariffSearch): void {
    if (!isNullOrUndefined(this.form)) {
      let healthCareProviderId = 0;
      this.tariffSearchCurrent = tariffSearch;
      this.form.controls.requestedQuantity.setValue(tariffSearch.defaultQuantity);
      this.form.controls.requestedAmount.setValue(tariffSearch.tariffAmount);
      this.hideTariffSearchControl = false;
      if (!this.model) {
        if (this.preAuthClaimDetail) {
          this.personEventId = this.preAuthClaimDetail.personEventId;
        }
        if (this.healthCareProvider) {
          healthCareProviderId = this.healthCareProvider.rolePlayerId;
        }
      }
      else {
        this.personEventId = this.model.personEventId;
        healthCareProviderId = this.model.healthCareProviderId;
      }

      if (this.model !== undefined) {
        if (this.form.controls.dateAuthorisedFrom.value && this.form.controls.dateAuthorisedTo.value) {
          this.mediCarePreAuthService.checkIfDuplicateLineItem(this.personEventId, healthCareProviderId, this.tariffSearchCurrent.tariffId, this.datepipe.transform(this.form.controls.dateAuthorisedFrom.value, 'yyyy-MM-dd'), this.datepipe.transform(this.form.controls.dateAuthorisedTo.value, 'yyyy-MM-dd')).subscribe((result: boolean) => this.isduplicateLine = result);
        }
        else {
          this.confirmservice.confirmWithoutContainer('PreAuth Date Validation', `Please select a PreAuth From and To Date.`,
            'Center', 'Center', 'OK').subscribe(() => {

            });
        }
      }
    }
    if (this.preAuthBreakdownType == undefined) {
      //tariff AdmissionCode drives whether showLevelOfCare is enabled/disabled
      this.isAdmissionCode = tariffSearch.isAdmissionCode;

      if (tariffSearch.isAdmissionCode) {
        this.isFullDayAlways = tariffSearch.isFullDayAlways;
        this.populateLevelOfCare();
        if (!isNullOrUndefined(this.form))
          this.form.controls['levelOfCare'].setValue(tariffSearch.levelOfCareId);
          if (!isNullOrUndefined(this.levelOfCareList$))
          {
            let levelOfCareTemp = this.levelOfCareList$.find(x => x.levelOfCareId == tariffSearch.levelOfCareId);
            let _levelOfCare = { "value": { "name": levelOfCareTemp.levelOfCare, "id": tariffSearch.levelOfCareId } };
            this.setCurrentLevelOfCare(_levelOfCare);
          }
      }
    }

    if (this.form != undefined)
      this.calculateRequestedAmount(parseFloat(this.form.controls.requestedQuantity.value));
  }


  public setCPTItems(tariffSearch: CrosswalkSearch[]): void {
    this.crosswalkSearchCurrent = tariffSearch;
    this.hideTariffSearchControl = true;
  }

  public getCurrentHealthCareProviderId(): number {
    return this.model.healthCareProviderId;
  }

  private emitBreakDownDataToParent(): any {
    const treatmentProtocols = this.checkedTreatingProtocols;
    const breakdownItems = this.preAuthorisationBreakdownList;

    return {
      treatmentProtocols,
      breakdownItems
    }
  }

  addBreakdownItem(): void {
    if (this.tariffSearchCurrent && this.tariffSearchCurrent.tariffCode && this.form.controls.requestedQuantity.value
      && this.form.controls.dateAuthorisedFrom.value) {
      this.mediCarePreAuthService.IsAuthorisationCodeLimitValid(this.form.controls.requestedQuantity.value, this.tariffSearchCurrent.tariffCode,
        this.datepipe.transform(this.form.controls.dateAuthorisedFrom.value, 'yyyy-MM-dd'), this.practitionerTypeId, this.personEventId).subscribe((data: boolean) => {
          if (!data) {
            this.confirmservice.confirmWithoutContainer('Quantity Limit Reached Validation', `Authorisation quantity limit reached for Item Code ` + this.tariffSearchCurrent.tariffCode,
              'Center', 'Center', 'OK').subscribe(() => {

              });
            this.addItemToBreakdownList();
          }
          else
            this.addItemToBreakdownList();
        });
    }
    else if (this.crosswalkSearchCurrent) {
      this.addItemToBreakdownList();
    }
  }

  addItemToBreakdownList(): void {
    let isOverlappingDate = false;
    let preAuthorisationBreakdown = new PreAuthorisationBreakdown;
    preAuthorisationBreakdown.preAuthBreakdownUnderAssessReasons = [];//for storing UnderAssessReason - empty
    let preAuthBreakdownId = this.form.controls.preAuthBreakdownId.value;
    if (this.tariffSearchCurrent) {
      if (this.tariffSearchCurrent.tariffId
        && this.tariffSearchCurrent.tariffCode
        && this.tariffSearchCurrent.tariffDescription
        && this.form.controls.requestedQuantity.value
        && this.form.controls.dateAuthorisedFrom.value
        && this.form.controls.dateAuthorisedTo.value
        && this.form.controls.requestedAmount.value) {
        preAuthorisationBreakdown.preAuthBreakdownId = (preAuthBreakdownId > 0) ? preAuthBreakdownId : this.counter -= 1,//check if = edit new local or edit db saved record
        preAuthorisationBreakdown.tariffId = this.tariffSearchCurrent.tariffId;
        preAuthorisationBreakdown.tariffCode = this.tariffSearchCurrent.tariffCode;
        preAuthorisationBreakdown.tariffDescription = this.tariffSearchCurrent.tariffDescription;
        preAuthorisationBreakdown.requestedTreatments = this.form.controls.requestedQuantity.value as number;
        preAuthorisationBreakdown.medicalItemId = this.tariffSearchCurrent.medicalItemId;
        preAuthorisationBreakdown.treatmentCodeId = 0;
        preAuthorisationBreakdown.dateAuthorisedFrom = this.form.controls.dateAuthorisedFrom.value;
        preAuthorisationBreakdown.dateAuthorisedTo = this.form.controls.dateAuthorisedTo.value;
        preAuthorisationBreakdown.authorisedTreatments = 0;
        preAuthorisationBreakdown.requestedAmount = parseFloat((preAuthorisationBreakdown.requestedTreatments * this.tariffSearchCurrent.tariffAmount).toFixed(2));
        preAuthorisationBreakdown.authorisedAmount = 0;
        preAuthorisationBreakdown.isAuthorised = false;
        preAuthorisationBreakdown.authorisedReason = "";
        preAuthorisationBreakdown.isRejected = false;
        preAuthorisationBreakdown.rejectedReason = "";
        preAuthorisationBreakdown.reviewComments = "";
        preAuthorisationBreakdown.solId = 0;
        preAuthorisationBreakdown.tariffAmount = this.tariffSearchCurrent.tariffAmount;
        preAuthorisationBreakdown.isClinicalUpdate = false;
        preAuthorisationBreakdown.isDeleted = false;

        if (!this.isTreatmentDatesValid(preAuthorisationBreakdown)) {
          this.confirmservice.confirmWithoutContainer('Treatment Date Validation', `Treatment From and To Date shouldn't be prior or after the Authorization From and To Date.`,
            'Center', 'Center', 'OK').subscribe(() => {

            });
          this.clearForm();
          this.tariffSearchComponent.clearForm();
          return;
        }

        //check if treatment dates are overlapping
        if (!isNullOrUndefined(this.preAuthorisationBreakdownList) && this.preAuthorisationBreakdownList !== undefined) {
          isOverlappingDate = this.checkOverlappingTreatmentDates(this.preAuthorisationBreakdownList, preAuthorisationBreakdown, this.isAdmissionCode);
        }

        if (this.authControlMode) {
          preAuthorisationBreakdown.authorisedQuantity = preAuthorisationBreakdown.requestedTreatments;
          preAuthorisationBreakdown.authorisedAmount = parseFloat((preAuthorisationBreakdown.requestedTreatments * this.tariffSearchCurrent.tariffAmount).toFixed(2));
        }

        if (!isNullOrUndefined(this.preAuthorisationBreakdownList) && this.preAuthorisationBreakdownList !== undefined) {
          let isDuplicateLineItem = this.isDuplicateLineItem(preAuthorisationBreakdown, this.preAuthorisationBreakdownList);
          if (!isDuplicateLineItem) {
            if (!isOverlappingDate) {
              this.preAuthorisationBreakdownList.push(preAuthorisationBreakdown);

              if (this.showLevelOfCare) {
                preAuthorisationBreakdown.levelOfCare = [];
                this.preAuthLevelOfCare = this.currentLevelOfCare;
                let admissionDateTime = this.combineDateAndTime(this.form.controls.admissionDate.value, this.form.controls.admissionTime.value);
                let dischargeDateTime = this.combineDateAndTime(this.form.controls.dischargeDate.value, this.form.controls.dischargeTime.value);
                this.preAuthLevelOfCare.dateTimeAdmitted = admissionDateTime;
                this.preAuthLevelOfCare.dateTimeDischarged = dischargeDateTime;
                this.preAuthLevelOfCare.tariffCode = this.tariffSearchCurrent.tariffCode;
                this.preAuthLevelOfCare.levelOfCare = this.currentLevelOfCare.levelOfCare;
                this.preAuthLevelOfCare.isDeleted = false;
                let lengthOfStay = this.getLengthOfStay(admissionDateTime, dischargeDateTime).replace(' days', '');
                this.preAuthLevelOfCare.lengthOfStay = parseFloat(lengthOfStay);
                preAuthorisationBreakdown.levelOfCare.push(this.preAuthLevelOfCare);
                this.levelOfCareList.push(this.preAuthLevelOfCare);
                this.showLevelOfCareGrid = true;
              }
              else {
                preAuthorisationBreakdown.levelOfCare = null;
              }
            }

          }
          else {
            this.confirmservice.confirmWithoutContainer('Duplicate line item Validation', `This line item already exists. Please use a different item or date range`,
              'Center', 'Center', 'OK').subscribe(() => {

              });
          }
        }
        else {
          this.preAuthorisationBreakdownList = [];

          if (this.isduplicateLine) {
            this.confirmservice.confirmWithoutContainer('Duplicate line item Validation', `This line item already exists. Please use a different item or date range`,
              'Center', 'Center', 'OK').subscribe(() => {

              });
          }
          else {
            //check if treatment dates are overlapping
            if (!isNullOrUndefined(this.preAuthorisationBreakdownList) && this.preAuthorisationBreakdownList !== undefined && !this.checkOverlappingTreatmentDates(this.preAuthorisationBreakdownList, preAuthorisationBreakdown, this.isAdmissionCode)) {
              this.preAuthorisationBreakdownList.push(preAuthorisationBreakdown);

              if (this.showLevelOfCare) {
                preAuthorisationBreakdown.levelOfCare = [];
                this.preAuthLevelOfCare = this.currentLevelOfCare;
                let admissionDateTime = this.combineDateAndTime(this.form.controls.admissionDate.value, this.form.controls.admissionTime.value);
                let dischargeDateTime = this.combineDateAndTime(this.form.controls.dischargeDate.value, this.form.controls.dischargeTime.value);
                this.preAuthLevelOfCare.dateTimeAdmitted = admissionDateTime;
                this.preAuthLevelOfCare.dateTimeDischarged = dischargeDateTime;
                this.preAuthLevelOfCare.tariffCode = this.tariffSearchCurrent.tariffCode;
                this.preAuthLevelOfCare.levelOfCare = this.currentLevelOfCare.levelOfCare;
                let lengthOfStay = this.getLengthOfStay(admissionDateTime, dischargeDateTime).replace(' days', '');
                this.preAuthLevelOfCare.lengthOfStay = parseFloat(lengthOfStay);
                preAuthorisationBreakdown.levelOfCare.push(this.preAuthLevelOfCare);
                this.levelOfCareList.push(this.preAuthLevelOfCare);
                this.showLevelOfCareGrid = true;
              }
              else {
                preAuthorisationBreakdown.levelOfCare = null;
              }
            }
          }
        }
      }

      //Check Mutual Exclusive Code
      this.isMutualExclusiveCode(this.preAuthorisationBreakdownList, preAuthorisationBreakdown.tariffCode);
      this.tariffSearchCurrent = null;
    }
    else {
      if (this.crosswalkSearchCurrent && this.crosswalkSearchCurrent.length > 0) {
        if (!this.preAuthorisationBreakdownList || this.preAuthorisationBreakdownList === undefined) {
          this.preAuthorisationBreakdownList = [];
        }
        this.crosswalkSearchCurrent.forEach((breakdown) => {
          preAuthorisationBreakdown = new PreAuthorisationBreakdown;
          if (((breakdown.tariffId
            && breakdown.tariffCode
            && breakdown.tariffDescription
            && breakdown.requestedAmount) || breakdown.treatmentCode)
            && breakdown.defaultQuantity
            && this.form.controls.dateAuthorisedFrom.value
            && this.form.controls.dateAuthorisedTo.value) {
            preAuthorisationBreakdown.tariffId = breakdown.tariffId;
            preAuthorisationBreakdown.tariffCode = breakdown.tariffCode;
            preAuthorisationBreakdown.tariffDescription = breakdown.tariffDescription;
            let requestedQuantity = breakdown.requestedAmount / breakdown.tariffAmount;
            preAuthorisationBreakdown.requestedTreatments = isNaN(requestedQuantity) ? 1 : requestedQuantity;
            preAuthorisationBreakdown.treatmentCodeId = breakdown.treatmentCodeId;
            preAuthorisationBreakdown.dateAuthorisedFrom = this.form.controls.dateAuthorisedFrom.value;
            preAuthorisationBreakdown.dateAuthorisedTo = this.form.controls.dateAuthorisedTo.value;
            preAuthorisationBreakdown.authorisedTreatments = 0;
            preAuthorisationBreakdown.requestedAmount = breakdown.requestedAmount as number;
            preAuthorisationBreakdown.authorisedAmount = 0;
            preAuthorisationBreakdown.isAuthorised = false;
            preAuthorisationBreakdown.authorisedReason = "";
            preAuthorisationBreakdown.isRejected = false;
            preAuthorisationBreakdown.rejectedReason = "";
            preAuthorisationBreakdown.reviewComments = "";
            preAuthorisationBreakdown.solId = 0;
            preAuthorisationBreakdown.tariffAmount = breakdown.tariffAmount;
            preAuthorisationBreakdown.isClinicalUpdate = false;
            preAuthorisationBreakdown.treatmentCode = breakdown.treatmentCode;
            preAuthorisationBreakdown.treatmentCodeDescription = breakdown.treatmentCodeDescription;
            preAuthorisationBreakdown.isDeleted = false;

            if (this.authControlMode) {
              preAuthorisationBreakdown.authorisedQuantity = preAuthorisationBreakdown.requestedTreatments;
              preAuthorisationBreakdown.authorisedAmount = preAuthorisationBreakdown.requestedAmount;
            }

            //check if treatment dates are overlapping
            if (this.preAuthorisationBreakdownList !== undefined) {
              isOverlappingDate = this.checkOverlappingTreatmentDates(this.preAuthorisationBreakdownList, preAuthorisationBreakdown, this.isAdmissionCode);
            }

            let isDuplicateLineItem = this.isDuplicateLineItem(preAuthorisationBreakdown, this.preAuthorisationBreakdownList);
            if (!isDuplicateLineItem) {
              if (!isOverlappingDate) {
                this.preAuthorisationBreakdownList.push(preAuthorisationBreakdown);

                if (this.showLevelOfCare) {
                  this.preAuthLevelOfCare = this.currentLevelOfCare;
                  preAuthorisationBreakdown.levelOfCare = [];
                  let admissionDateTime = this.combineDateAndTime(this.form.controls.admissionDate.value, this.form.controls.admissionTime.value);
                  let dischargeDateTime = this.combineDateAndTime(this.form.controls.dischargeDate.value, this.form.controls.dischargeTime.value);
                  this.preAuthLevelOfCare.dateTimeAdmitted = admissionDateTime;
                  this.preAuthLevelOfCare.dateTimeDischarged = dischargeDateTime;
                  let lengthOfStay = this.getLengthOfStay(admissionDateTime, dischargeDateTime).replace(' days', '');
                  this.preAuthLevelOfCare.lengthOfStay = parseFloat(lengthOfStay);
                  preAuthorisationBreakdown.levelOfCare.push(this.preAuthLevelOfCare);
                  this.levelOfCareList.push(this.preAuthLevelOfCare);
                  this.showLevelOfCareGrid = true;
                }
                else {
                  preAuthorisationBreakdown.levelOfCare = null;
                }
              }
            }
            else {
              this.confirmservice.confirmWithoutContainer('Duplicate line item Validation', `This line item already exists. Please use a different item or date range`,
                'Center', 'Center', 'OK').subscribe(() => {

                });
            }
          }
        });
        this.crosswalkSearchCurrent = null;
        this.crosswalkSearchComponent.reset();
      }
    }

    if (this.authType == PreauthTypeEnum[PreauthTypeEnum.Hospitalization] && this.preAuthBreakdownType != PreAuthBreakdownTypeEnum.TreatingDoctor)
    {
      if(this.model){
        //for execute rules method because it looks at this property -> preAuthorisationBreakdowns
        this.model.preAuthorisationBreakdowns = this.preAuthorisationBreakdownList;
        //for hostipal auth
        this.onExecutePreauthBreakdownUnderAssessReason(this.model);
      }
    }

    this.bindData();
    this.clearForm();
    this.tariffSearchComponent.clearForm();
    this.showTreatingProtocols = false;
    this.onPreAuthorisationBreakdownChange.emit(this.emitBreakDownDataToParent());
  }

  onExecutePreauthBreakdownUnderAssessReason(preAuthorisationModel)
  {
    this.loading$.next(true);
    this.mediCarePreAuthService.executePreauthBreakdownUnderAssessReasonValidations(preAuthorisationModel).subscribe(preauthBreakdownValidationResults => {

      this.loading$.next(false);

      if (preauthBreakdownValidationResults.length > 0) {
        //clearing previously set underAssessReasons
        for (let x = 0; x < this.model.preAuthorisationBreakdowns.length; x++) {
          this.model.preAuthorisationBreakdowns[x].preAuthBreakdownUnderAssessReasons.length = 0;
        }

        preauthBreakdownValidationResults.forEach(element => {
          this.alertService.error(element.underAssessReason);
        
          for (let index = 0; index < this.model.preAuthorisationBreakdowns.length; index++) {
            if (element.preAuthBreakdownId == this.model.preAuthorisationBreakdowns[index].preAuthBreakdownId) {
              this.model.preAuthorisationBreakdowns[index].preAuthBreakdownUnderAssessReasons.push(element);
            }
          }

        });
      }

    });
  }

  CalculateLengthOfStay(event: any): void {
    if (this.form.controls.admissionDate.value
      && this.form.controls.dischargeDate.value
      && this.form.controls.admissionTime.value
      && this.form.controls.dischargeTime.value) {

      let admissionDateTime = this.combineDateAndTime(this.form.controls.admissionDate.value, this.form.controls.admissionTime.value);
      let dischargeDateTime = this.combineDateAndTime(this.form.controls.dischargeDate.value, this.form.controls.dischargeTime.value);

      if (dischargeDateTime <= admissionDateTime) {
        this.confirmservice.messageBoxWithoutContainer('Discharge Date and Time Validation', `Discharge Date and Time cannot be before the Admission Date and Time`,
          'Center', 'Center', 'OK').subscribe(() => {
            this.form.controls.admissionDate.reset();
            this.form.controls.dischargeDate.reset();
            this.form.controls.admissionTime.reset();
            this.form.controls.dischargeTime.reset();
           });

          return;
      }

      var lengthOfStay = this.getLengthOfStay(admissionDateTime, dischargeDateTime);

      this.form.controls.lengthOfStay.setValue(lengthOfStay);
      if (this.showLevelOfCare) {
        this.form.controls.requestedQuantity.patchValue(parseFloat(lengthOfStay));
        this.calculateRequestedAmount(parseFloat(lengthOfStay));
      }

    }
  }

  getLengthOfStay(admissionDateTime: Date, dischargeDateTime: Date): string {
    var losAdmissionDateTime = new Date(admissionDateTime);
    var losDischargeDateTime = new Date(dischargeDateTime);

    if (this.getMeridiem(losAdmissionDateTime) == 'AM')
      losAdmissionDateTime.setHours(0, 0);
    else
      losAdmissionDateTime.setHours(12, 0);

    if (this.getMeridiem(losDischargeDateTime) == 'AM')
      losDischargeDateTime.setHours(12, 0);
    else
      losDischargeDateTime.setHours(24, 0);

    var admissionDate = +new Date(losAdmissionDateTime);
    var dischargeDate = +new Date(losDischargeDateTime);

    var seconds = Math.floor((dischargeDate - (admissionDate)) / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    hours = hours - (days * 24);

    if (this.isFullDayAlways && hours == 12) {
      days++;
      hours = 0;
    }

    return days + (hours == 12 ? 0.5 : 0) + ' days';
  }

  getMeridiem(dateTime: Date): string {
    var hours = dateTime.getHours();
    return hours >= 12 ? 'PM' : 'AM';
  }

  combineDateAndTime(date: string, time: string): Date {
    let fullDateTime = new Date(this.datepipe.transform(date, 'yyyy-MM-dd') + " " + time);
    return fullDateTime;
  }

  bindData(): void {
    if (this.dataSource !== undefined && this.preAuthorisationBreakdownList !== undefined) {
      //force update for breakdowns
      this.dataSource.data = [...this.preAuthorisationBreakdownList.filter(list => list.isDeleted == false)];
      this.dataSource = new MatTableDataSource<PreAuthorisationBreakdown>(this.dataSource.data);
      this.dataSourceLengthOfStay.data = [...this.levelOfCareList.filter(list => list.isDeleted == false)];
      this.dataSourceLengthOfStay = new MatTableDataSource<PreAuthLevelOfCare>(this.dataSourceLengthOfStay.data);
    }
  }

  checkIfCanEdit(obj: PreAuthorisationBreakdown): boolean {
    let canedit = false;
    if (!obj.isAuthorised) {
      canedit = true;
    }
    else {
      if (this.isInternalUser) {
        canedit = true;
      }
      else {
        canedit = false;
      }
    }
    return canedit;
  }

  checkIfCanDelete(obj: PreAuthorisationBreakdown): boolean {
    let canDelete = false;
    if (!obj.isAuthorised) {
      canDelete = true;
    }
    else {
      if (this.isInternalUser) {
        canDelete = true;
      }
      else {
        canDelete = false;
      }
    }
    return canDelete;
  }

  deleteItem(obj: PreAuthorisationBreakdown): void {
    this.confirmservice.confirmWithoutContainer('Confirm Delete?', 'Are you sure you want to delete this item from the list?',
    'Center', 'Center', 'Yes', 'No').subscribe(result => {
      if (result === true) {
        if (obj.preAuthBreakdownId > 0) {//committed DB soft delete - positive +
          let breakdownIndex = this.preAuthorisationBreakdownList.indexOf(obj);
          let levelOfCareIndex = this.levelOfCareList.findIndex(x => x.tariffCode === obj.tariffCode);
          if (breakdownIndex > -1) {
              this.preAuthorisationBreakdownList[breakdownIndex].isDeleted = true;
          }
          if (levelOfCareIndex > -1) {
            this.preAuthorisationBreakdownList[breakdownIndex].levelOfCare[levelOfCareIndex].isDeleted = true;
            this.levelOfCareList[levelOfCareIndex].isDeleted = true;
          }
        }
        else{//in-memory/wizard delete - nagitive -
          const i = this.preAuthorisationBreakdownList.findIndex(e => +e.preAuthBreakdownId == +obj.preAuthBreakdownId);
          let levelOfCareIndex = this.levelOfCareList.findIndex(x => x.tariffCode === this.preAuthorisationBreakdownList[i].tariffCode);
          this.levelOfCareList.splice(levelOfCareIndex, 1);
          this.preAuthorisationBreakdownList.splice(i, 1);//delete or remove on preAuthBreakdownId match          
        }

        this.bindData();
        this.alertService.success(`Line Item deleted successfully`);
      }
    });

  }

  editItem(obj: PreAuthorisationBreakdown): void {
    if (!this.form) {
      return;
    }
    this.setTariffTypeId(obj.dateAuthorisedFrom);
    this.tariffSearchCurrent = new TariffSearch();
    this.tariffSearchCurrent.tariffCode = obj.tariffCode;
    this.tariffSearchCurrent.tariffDescription = obj.tariffDescription;
    this.tariffSearchCurrent.tariffAmount = obj.tariffAmount;
    this.tariffSearchCurrent.tariffId = obj.tariffId;
    this.tariffSearchCurrent.medicalItemId = obj.medicalItemId;
    this.tariffSearchCurrent.treatmentCodeId = obj.treatmentCodeId;
    this.form.controls.dateAuthorisedFrom.patchValue(obj.dateAuthorisedFrom);
    this.form.controls.dateAuthorisedTo.patchValue(obj.dateAuthorisedTo);
    this.form.controls.tariffCode.patchValue(obj.tariffCode);
    if (!isNullOrUndefined(obj.levelOfCare) && obj.levelOfCare.length > 0) {
      let editedLevelOfCare = obj.levelOfCare[0] as any as PreAuthLevelOfCare;
      if (!isNullOrUndefined(editedLevelOfCare)) {
        this.form.controls.levelOfCare.setValue(editedLevelOfCare.levelOfCareId);
        this.form.controls.admissionDate.setValue(editedLevelOfCare.dateTimeAdmitted);
        this.form.controls.dischargeDate.setValue(editedLevelOfCare.dateTimeDischarged);
        if (!isNullOrUndefined(editedLevelOfCare.dateTimeAdmitted)) {
          let timeAdmitted = this.datePipe.transform(new Date(editedLevelOfCare.dateTimeAdmitted), "HH:mm");
          this.form.controls.admissionTime.setValue(timeAdmitted);
        }
        if (!isNullOrUndefined(editedLevelOfCare.dateTimeDischarged)) {
          let timeDischarged = this.datePipe.transform(new Date(editedLevelOfCare.dateTimeDischarged), "HH:mm");
          this.form.controls.dischargeTime.setValue(timeDischarged);
        }
        this.CalculateLengthOfStay(null);
      }
    }
    else {
      //logic might come later after all checks are done - to be confirmed
      this.form.controls.requestedQuantity.patchValue(obj.requestedTreatments);
      this.form.controls.requestedAmount.patchValue(obj.requestedAmount);      
    }
    this.currentEditedItem = obj;
    this.showEditControls = true;
    this.showAddItemTitlesAndControls = false;
    this.hideCPTSearchControl = true;
    this.hideTariffSearchControl = false;
  }

  updateItem(): void {
    if (!this.form) {
      return;
    }
    let updateResult = false;
    if (!isNullOrUndefined(this.currentEditedItem)) {
      this.currentEditedItem.dateAuthorisedFrom = this.form.controls.dateAuthorisedFrom.value;
      this.currentEditedItem.tariffCode = this.tariffSearchCurrent.tariffCode;//this.form.controls.tariffCode.value;
      this.currentEditedItem.tariffId = this.tariffSearchCurrent.tariffId;
      this.currentEditedItem.tariffAmount = this.tariffSearchCurrent.tariffAmount;
      this.currentEditedItem.dateAuthorisedTo = this.form.controls.dateAuthorisedTo.value;
      this.currentEditedItem.requestedTreatments = this.form.controls.requestedQuantity.value as number;
      this.currentEditedItem.requestedAmount = parseFloat((this.currentEditedItem.requestedTreatments * this.tariffSearchCurrent.tariffAmount).toFixed(2));
      if (!isNullOrUndefined(this.currentEditedItem.levelOfCare) && this.currentEditedItem.levelOfCare.length > 0) {
        let levelOfCareIndexFromList = this.levelOfCareList.findIndex(x => x.tariffCode == this.currentEditedItem.tariffCode);
        if (levelOfCareIndexFromList > -1) {
          let admissionDateTime = this.combineDateAndTime(this.form.controls.admissionDate.value, this.form.controls.admissionTime.value);
          let dischargeDateTime = this.combineDateAndTime(this.form.controls.dischargeDate.value, this.form.controls.dischargeTime.value);
          let levelOfCareEdit = new PreAuthLevelOfCare();
          levelOfCareEdit.dateTimeAdmitted = admissionDateTime;
          levelOfCareEdit.dateTimeDischarged = dischargeDateTime;
          levelOfCareEdit.tariffCode = this.currentEditedItem.tariffCode;
          levelOfCareEdit.levelOfCareId = this.form.controls.levelOfCare.value;
          levelOfCareEdit.createdBy = this.model?.createdBy;
          levelOfCareEdit.createdDate = this.model?.createdDate;
          levelOfCareEdit.modifiedBy = this.model?.modifiedBy;
          levelOfCareEdit.modifiedDate = this.model?.modifiedDate;          
          let lengthOfStay = this.getLengthOfStay(admissionDateTime, dischargeDateTime).replace(' days', '');
          levelOfCareEdit.lengthOfStay = parseFloat(lengthOfStay);
          let levelOfCareTemp = this.levelOfCareList$.find(x => x.levelOfCareId == levelOfCareEdit.levelOfCareId);
          levelOfCareEdit.levelOfCare = levelOfCareTemp.levelOfCare;
          levelOfCareEdit.isDeleted = false;
          this.levelOfCareList[levelOfCareIndexFromList] = levelOfCareEdit;
          this.currentEditedItem.levelOfCare = this.levelOfCareList;
        }
      }
      let breakdownIndex = this.preAuthorisationBreakdownList?.indexOf(this.currentEditedItem);
      if (breakdownIndex > -1) {
        this.preAuthorisationBreakdownList[breakdownIndex] = this.currentEditedItem;
        this.bindData();
        updateResult = true;
      }
      else {
        updateResult = false;
      }
    }
    else {
      updateResult = false;
    }

    if (updateResult) {
      this.alertService.success(`Line item updated successfully`, 'Edit Line item', true);
    }
    else {
      this.alertService.error(`Failed to update line item`, 'Edit Line item', true);
    }
    this.showEditControls = false;
    this.showAddItemTitlesAndControls = true;
    this.showHideCPTCode();
    this.hideCPTSearchControl = true;
    this.hideTariffSearchControl = false;

    if(this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.TreatingDoctor && isNullOrUndefined(this.model))
    {
      // setting the model when within the SubAuth(e.g treating doctor auth)
      this.subAuthModel.subPreAuthorisations[0].preAuthorisationBreakdowns = this.preAuthorisationBreakdownList;
      this.onExecutePreauthBreakdownUnderAssessReason(this.subAuthModel.subPreAuthorisations[0]);
    }
    else{
      this.model.preAuthorisationBreakdowns = this.preAuthorisationBreakdownList;
      this.onExecutePreauthBreakdownUnderAssessReason(this.model);
    }    

    this.form.reset();
  }

  showHideCPTControl(event: MatCheckboxChange): void {
    if (event.checked) {
      this.hideCPTSearchControl = false;
      this.hideTariffSearchControl = true;
      this.hideQtyAndAmount = true;
      this.showLevelOfCare = false;
      this.hideRequestedQuantity=true;
    }
    else {
      this.hideCPTSearchControl = true;
      this.hideTariffSearchControl = false;
      this.hideQtyAndAmount = false;
      this.showLevelOfCare = true;
      this.hideRequestedQuantity=false;
    }
  }

  getPreAuthBreakdownList(): PreAuthorisationBreakdown[] {
    return this.preAuthorisationBreakdownList;
  }

  getPreAuthFromDate(): Date {
    return new Date(this.form.controls.dateAuthorisedFrom.value);
  }

  setTariffTypeId(event): void {
    if (event) {
      let currentModel = this.model ?  this.model : this.subAuthModel;

      this.preAuthFromDate = !isNullOrUndefined(event?.value) ? new Date(event.value):new Date(event);
      let preAuthFromDate = !isNullOrUndefined(event?.value) ? new Date(event.value):new Date(event);
      let injuryDate: Date;
      let healthCareProviderId: number;
      let isChronic: boolean;
      let _now = new Date();

      if (currentModel) {
        if (this.preAuthBreakdownType === undefined) {
          if (currentModel.injuryDate || currentModel.eventDate) {
            injuryDate = !isNullOrUndefined(currentModel.injuryDate) ? currentModel.injuryDate : currentModel.eventDate;
            if (currentModel.healthCareProviderId && currentModel.practitionerTypeId) {
              healthCareProviderId = currentModel.healthCareProviderId;
              this.practitionerTypeId = currentModel.practitionerTypeId;
              isChronic = MedicareUtilities.isChronic(new Date(injuryDate), preAuthFromDate);
              this.healthcareProviderService.getHealthCareProviderAgreedTariff(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: number) => this.tariffTypeId = res);
              this.healthcareProviderService.getHealthCareProviderAgreedTariffTypeIds(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: string) => this.tariffTypeIds = res);
            }
            else {
              this.confirmservice.confirmWithoutContainer('HealthCare Provider Details Validation', `Please capture HealthCare Provider Details`,
                'Center', 'Center', 'OK').subscribe(() => {

                });
            }
          }
          else {
            this.confirmservice.confirmWithoutContainer('Claim Details Validation', `Please capture Claim Details`,
              'Center', 'Center', 'OK').subscribe(() => {

              });
          }
        }
        else if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.TreatingDoctor) {
          if (this.healthCareProvider) {            
            injuryDate = _now;
            this.practitionerTypeId = this.healthCareProvider.providerTypeId;
            healthCareProviderId = this.healthCareProvider.rolePlayerId;
            isChronic = MedicareUtilities.isChronic(new Date(injuryDate), preAuthFromDate);
            this.healthcareProviderService.getHealthCareProviderAgreedTariff(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: number) => this.tariffTypeId = res);
            this.healthcareProviderService.getHealthCareProviderAgreedTariffTypeIds(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: string) => this.tariffTypeIds = res);
          }
          else {
            this.confirmservice.confirmWithoutContainer('HealthCare Provider Details Validation', `Please capture HealthCare Provider Details`,
              'Center', 'Center', 'OK').subscribe(() => {

              });
          }
        }
        else if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.PhysioOT) {
          if (this.healthCareProvider) {
            injuryDate = _now;
            this.practitionerTypeId = this.healthCareProvider.providerTypeId;
            healthCareProviderId = this.healthCareProvider.rolePlayerId;
            isChronic = MedicareUtilities.isChronic(new Date(injuryDate), preAuthFromDate);
            this.healthcareProviderService.getHealthCareProviderAgreedTariff(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: number) => this.tariffTypeId = res);
            this.healthcareProviderService.getHealthCareProviderAgreedTariffTypeIds(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: string) => this.tariffTypeIds = res);
          }
          else {
            this.confirmservice.confirmWithoutContainer('HealthCare Provider Details Validation', `Please capture HealthCare Provider Details`,
              'Center', 'Center', 'OK').subscribe(() => {

              });
          }
        }
      }
      else {
        if (this.healthCareProvider) {
          injuryDate = _now;
          this.practitionerTypeId = this.healthCareProvider.providerTypeId;
          healthCareProviderId = this.healthCareProvider.rolePlayerId;
          isChronic = MedicareUtilities.isChronic(new Date(injuryDate), preAuthFromDate);
          this.healthcareProviderService.getHealthCareProviderAgreedTariff(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: number) => this.tariffTypeId = res);
          this.healthcareProviderService.getHealthCareProviderAgreedTariffTypeIds(healthCareProviderId, isChronic, this.datePipe.transform(preAuthFromDate, 'yyyy-MM-dd')).subscribe((res: string) => this.tariffTypeIds = res);
        }
        else {
          this.confirmservice.confirmWithoutContainer('HealthCare Provider Details Validation', `Please capture HealthCare Provider Details`,
            'Center', 'Center', 'OK').subscribe(() => {

            });
        }
      }
    }
  }

  populateLevelOfCare(): void {
    if (this.isHospitalAuth) {
      let levelofCarelistTemp = [];
      this.mediCarePreAuthService.getLevelOfCareList().subscribe(
        (x) => {
          levelofCarelistTemp = x;
        },
        () => { },
        () => {
          if (levelofCarelistTemp) {
            this.levelOfCareList$ = levelofCarelistTemp;
            this.levelOfCareList$.forEach(x => {
              x.levelOfCare = x.name;
            });
          }
        });
    }
  }

  setCurrentLevelOfCare(event): void {
    if (this.isHospitalAuth) {
      let levelOfCareTemp = this.levelOfCareList$.find(x => x.levelOfCareId == event.value.id);
      if (isNullOrUndefined(levelOfCareTemp)) {
        levelOfCareTemp = this.levelOfCareList$.find(x => x.levelOfCareId == event.value);
      }
      this.currentLevelOfCare = { ...this.currentLevelOfCare, levelOfCare: levelOfCareTemp.levelOfCare, levelOfCareId: levelOfCareTemp.levelOfCareId };

      if (!isNullOrUndefined(levelOfCareTemp)) {
        this.currentLevelOfCare = levelOfCareTemp as PreAuthLevelOfCare;
        this.filteredTreatingProtocols = this.treatingProtocols.filter((item) => item.levelOfCareId == event.value);
        if (this.isClinicalUpdate)
          this.showTreatingProtocols = this.filteredTreatingProtocols.length > 0 ? true : false;
        else
          this.showTreatingProtocols = false;
      }
    }
  }

  onCheckChange(event) {
    const selectedCheckbox: TreatmentProtocol = event.source.value;
    if (event.checked) {
      const item: ClinicalUpdateTreatmentProtocol = {
        treatmentProtocolId: selectedCheckbox.treatmentProtocolId,
        treatmentProtocolDescription: selectedCheckbox.name
      };
      this.checkedTreatingProtocols.push(item);
    }
    else {
      this.checkedTreatingProtocols = this.checkedTreatingProtocols.filter(x => x.treatmentProtocolId !== selectedCheckbox.treatmentProtocolId);
    }
  }

  isDuplicateLineItem(preAuthorisationBreakdown: PreAuthorisationBreakdown, preauthBreakdownList: PreAuthorisationBreakdown[]): boolean {
    let isDuplicate = true;
    if (preauthBreakdownList.length > 0) {
      preauthBreakdownList.forEach((breakdown) => {
        isDuplicate = true;
        if (preAuthorisationBreakdown.tariffId !== breakdown.tariffId || preAuthorisationBreakdown.treatmentCode !== breakdown.treatmentCode) {
          isDuplicate = false;
        }
        else {
          if (preAuthorisationBreakdown.dateAuthorisedFrom.valueOf() === breakdown.dateAuthorisedFrom.valueOf()) {
            isDuplicate = true;
          }
          else if (preAuthorisationBreakdown.dateAuthorisedTo.valueOf() === breakdown.dateAuthorisedTo.valueOf()) {
            isDuplicate = true;
          }
          else {
            isDuplicate = false;
          }
        }
      });
    }
    else {
      isDuplicate = false;
    }
    if (this.isduplicateLine) {
      isDuplicate = true;
    }
    return isDuplicate;
  }

  isTreatmentDatesValid(preAuthorisationBreakdown: PreAuthorisationBreakdown): boolean {
    var isValid = false;
    if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.ClinicalUpdate)
      isValid = true;
    else if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.TreatingDoctor) {
      if (this.dateAuthorisedFrom != undefined && this.dateAuthorisedTo != undefined
        && this.dateAuthorisedFrom <= preAuthorisationBreakdown.dateAuthorisedFrom
        && this.dateAuthorisedTo >= preAuthorisationBreakdown.dateAuthorisedFrom
        && this.dateAuthorisedFrom <= preAuthorisationBreakdown.dateAuthorisedTo
        && this.dateAuthorisedTo >= preAuthorisationBreakdown.dateAuthorisedTo)
        isValid = true;
    }
    else {
      if (this.model.dateAuthorisedFrom <= preAuthorisationBreakdown.dateAuthorisedFrom
        && this.model.dateAuthorisedTo >= preAuthorisationBreakdown.dateAuthorisedFrom
        && this.model.dateAuthorisedFrom <= preAuthorisationBreakdown.dateAuthorisedTo
        && this.model.dateAuthorisedTo >= preAuthorisationBreakdown.dateAuthorisedTo)
        isValid = true;
    }
    return isValid;
  }

  checkOverlappingTreatmentDates(preAuthorisationBreakdowns: PreAuthorisationBreakdown[], currentPreAuthBreakdownLine: PreAuthorisationBreakdown, isAdmissionCode: boolean): boolean {
    var isValid = false;
    if (this.preAuthBreakdownType === PreAuthBreakdownTypeEnum.ClinicalUpdate || !isAdmissionCode)
      return isValid;
    for (let preAuthBreakDown of preAuthorisationBreakdowns) {
      if (currentPreAuthBreakdownLine.dateAuthorisedFrom >= preAuthBreakDown.dateAuthorisedFrom
        && currentPreAuthBreakdownLine.dateAuthorisedFrom <= preAuthBreakDown.dateAuthorisedTo) {
        isValid = true;
      }
      if (currentPreAuthBreakdownLine.dateAuthorisedTo >= preAuthBreakDown.dateAuthorisedTo
        && currentPreAuthBreakdownLine.dateAuthorisedTo <= preAuthBreakDown.dateAuthorisedTo) {
        isValid = true;
      }
    }
    if (isValid) {
      this.confirmservice.confirmWithoutContainer('Overlapping Dates Validation', 'Treatment dates are overlapping with other preauth breakdown lines',
        'Center', 'Center', 'OK').subscribe(() => {

        });
    }
    return isValid;
  }

  isMutualExclusiveCode(preAuthorisationBreakdowns: PreAuthorisationBreakdown[], itemCode: string): boolean {
    var isValid = false;
    if (preAuthorisationBreakdowns !== null && preAuthorisationBreakdowns !== undefined && preAuthorisationBreakdowns.length > 1) {
      this.mediCarePreAuthService.getMutualExclusiveCodes(itemCode)
        .subscribe((mutualExclusiveCodes: MutualInclusiveExclusiveCode[]) => {
          if (mutualExclusiveCodes !== null && mutualExclusiveCodes !== undefined && mutualExclusiveCodes.length > 0) {
            for (let breakdownItem of preAuthorisationBreakdowns) {
              for (let mutualExclusiveCode of mutualExclusiveCodes) {
                if (mutualExclusiveCode.matchedCode === breakdownItem.tariffCode && itemCode !== breakdownItem.tariffCode) {
                  isValid = true;
                  this.confirmservice.confirmWithoutContainer('Mutual Exclusive Codes Validation', mutualExclusiveCode.mainCode + `and ` + breakdownItem.tariffCode +
                    ` are Mutual Exclusive Codes. Please capture different tariff code.`,
                    'Center', 'Center', 'OK').subscribe(() => {

                    });
                  break;
                }
                if (mutualExclusiveCode.mainCode === breakdownItem.tariffCode && itemCode !== breakdownItem.tariffCode) {
                  isValid = true;
                  this.confirmservice.confirmWithoutContainer('Mutual Exclusive Codes Validation', mutualExclusiveCode.matchedCode + `and ` + breakdownItem.tariffCode +
                    ` are Mutual Exclusive Codes. Please capture different tariff code.`,
                    'Center', 'Center', 'OK').subscribe(() => {

                    });
                  break;
                }
              }
            }
          }
        }
        );
    }
    return isValid;
  }

  loadData(existingpreAuthBreakdownList: PreAuthorisationBreakdown[]): void {
    if (existingpreAuthBreakdownList.length > 0) {
      this.preAuthorisationBreakdownList = this.dataSource.data = existingpreAuthBreakdownList;
      
      if(this.preAuthorisationBreakdownList?.length > 0){
        this.preAuthorisationBreakdownList = this.preAuthorisationBreakdownList.filter(list => list.isDeleted == false);
      }
      
      this.preAuthorisationBreakdownList.forEach((preAuthBreakdown) => {
        if(preAuthBreakdown.levelOfCare?.length > 0){
          preAuthBreakdown.levelOfCare.forEach((loc) => {
            if(!loc.isDeleted){
              if(this.levelOfCareList.findIndex(item => item.preAuthLevelOfCareId == loc.preAuthLevelOfCareId) == -1){
                this.levelOfCareList.push(...preAuthBreakdown.levelOfCare);                
              }
            }
          });
        }
      }); 
      this.dataSourceLengthOfStay.data = this.levelOfCareList;
      if(this.levelOfCareList.length > 0){
        this.showLevelOfCareGrid = true;
      }
    }
  }

  calculateAuthorisedQty(authorisedQuantity: number, preAuthBreakdown: PreAuthorisationBreakdown) {
    preAuthBreakdown.authorisedQuantity = authorisedQuantity;
    preAuthBreakdown.authorisedAmount = parseFloat((authorisedQuantity * preAuthBreakdown.tariffAmount).toFixed(2));
  }

  authorisedQtyChangeValidation(authorisedQuantity: number, preAuthBreakdown: PreAuthorisationBreakdown) {
    if (authorisedQuantity != preAuthBreakdown.requestedTreatments) {
      this.confirmservice.confirmWithoutContainer('Authorised Quantity Validation', `Please Capture Quantity Change Reason`,
        'Center', 'Center', 'OK').subscribe(() => {

        });
    }
  }

  onQuantitychangeReason(quantityChanged: any, preAuthBreakdown: PreAuthorisationBreakdown) {
    preAuthBreakdown.quantityChangedReason = quantityChanged;
  }

  getReviewedPreAuthBreakdownList(): PreAuthorisationBreakdown[] {
    return this.preAuthorisationBreakdownList;
  }

  onSelectPreAuthBreakdown(event: any, preAuthorisationBreakdown: PreAuthorisationBreakdown) {
    preAuthorisationBreakdown.isAuthorised = event.checked;
  }

  loadExistingBreakdownList(preAuthorisationBreakdowns) {
    if (this.model 
      && this.model.preAuthorisationBreakdowns !== null 
      && this.model.preAuthorisationBreakdowns !== undefined 
      && this.model.preAuthorisationBreakdowns.length > 0) {

      this.preAuthorisationBreakdownList = this.model.preAuthorisationBreakdowns;    
      
      if(this.preAuthorisationBreakdownList?.length > 0){
        this.preAuthorisationBreakdownList = this.preAuthorisationBreakdownList.filter(list => list.isDeleted == false);
      }

      if(this.levelOfCareList?.length == 0){
        this.model.preAuthorisationBreakdowns.forEach((preAuthBreakdown) => {

          if(preAuthBreakdown.levelOfCare?.length > 0){
            preAuthBreakdown.levelOfCare.forEach((loc) => {
              if(!loc.isDeleted){
              if(this.levelOfCareList.findIndex(item => item.preAuthLevelOfCareId == loc.preAuthLevelOfCareId) == -1){
                this.levelOfCareList.push(...preAuthBreakdown.levelOfCare);                
              }
            }
            });
          }
        });
      }
      if(this.levelOfCareList?.length > 0){
        this.showLevelOfCareGrid = true;
      }
    }
    else if (preAuthorisationBreakdowns !== null && preAuthorisationBreakdowns !== undefined && preAuthorisationBreakdowns.length > 0) {
      this.preAuthorisationBreakdownList = preAuthorisationBreakdowns;
      if(this.preAuthorisationBreakdownList?.length > 0){
        this.preAuthorisationBreakdownList = this.preAuthorisationBreakdownList.filter(list => list.isDeleted == false);
      }
    }
    if (this.preAuthorisationBreakdownList !== undefined && this.preAuthorisationBreakdownList !== null) {
      this.bindData();
    }
  }

  resetForm(): void {
    this.form.reset();
    this.tariffSearchComponent.clearForm();
  }

  calculateRequestedAmount(authorisedQuantity: number) {
    if (Number.isInteger(+authorisedQuantity) && +authorisedQuantity > 0)
        this.form.controls.requestedAmount.patchValue((authorisedQuantity * this.tariffSearchCurrent.tariffAmount).toFixed(2));    
  }

  getExistingPreAuthBreakdownList(): void {
    this.existingpreAuthBreakdownList = [];
    if (this.preAuthId > 0 && !this.isClinicalUpdate) {
      this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId).subscribe((data) => {
        if (data !== null) {
          let result = data as PreAuthorisation;
          this.loadData(result.preAuthorisationBreakdowns);
        }
      });
    }
  }

  getExistingClinicalUpdateBreakdownList(clinicalUpdateBreakdowns: PreAuthorisationBreakdown[]): void {
    if (clinicalUpdateBreakdowns.length > 0) {

      this.loadData(clinicalUpdateBreakdowns);
      if (isNullOrUndefined(this.levelOfCareList)) {
        this.levelOfCareList = [];
      }
    }
  }

  getHealthCareProvider(healthCareProviderId: number): void {
    if (healthCareProviderId > 0) {
      this.healthcareProviderService.getHealthCareProviderById(healthCareProviderId).subscribe((result) => {
        if (result !== null && result.rolePlayerId > 0) {
          this.healthCareProvider = result;
        }
      });
    }
  }

  setAdmissionDateAndDischargeDate(): void {
    this.form.controls.admissionDate.patchValue(this.form.controls.dateAuthorisedFrom.value);
    this.form.controls.dischargeDate.patchValue(this.form.controls.dateAuthorisedTo.value);
    this.CalculateLengthOfStay(null);
    //disable calculation functionality for now until futher notice
    //this.form.controls.requestedQuantity.patchValue(this.calculateDaysDifference(this.form.controls.dateAuthorisedFrom.value, this.form.controls.dateAuthorisedTo.value));
  }

  calculateDaysDifference(dateFrom: Date, dateTo: Date): number {
    dateTo = new Date(dateTo);
    dateFrom = new Date(dateFrom);
    let totalDaysDifference: number = Math.floor((Date.UTC(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()) - Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())) / (1000 * 60 * 60 * 24));
    //date ++ increment so same From-To date is 1
    totalDaysDifference += 1;
    //default to 1 if date is zero or less
    totalDaysDifference = (totalDaysDifference > 0) ? totalDaysDifference : 1;
    return totalDaysDifference;
  }

  setAuthorisationDates(dateAuthorisedFrom: Date, dateAuthorisedTo: Date): void {
    if (dateAuthorisedFrom != undefined)
      this.dateAuthorisedFrom = dateAuthorisedFrom;

    if (dateAuthorisedTo != undefined)
      this.dateAuthorisedTo = dateAuthorisedTo;
  }

  checkBreakdownItemsExist(){
    return this.preAuthId > 0 && (this.preAuthorisationBreakdownList?.length > 0 || this.model?.preAuthorisationBreakdowns?.length > 0) ? true : false
  }

  showHideCPTCode() {
    switch (MedicareUtilities.getPreauthTypeName(this.currentUrl)) {
      case PreauthTypeEnum[PreauthTypeEnum.Treatment]:
        this.showHideCPT = false;
        break;
      case PreauthTypeEnum[PreauthTypeEnum.ChronicMedication]:
        this.showHideCPT = false;
        break;
      case PreauthTypeEnum[PreauthTypeEnum.Prosthetic]:
        this.showHideCPT = false;
        break;
      default:
        this.showHideCPT = true;
        break;
    }
  }

}
