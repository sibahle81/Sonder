import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { BodySideAffectedTypeEnum } from 'projects/shared-models-lib/src/lib/enums/body-side-affected-type-enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { InjuryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/injury-status-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Constants } from '../../../constants';
import { ClaimCareService } from '../../Services/claimcare.service';
import { CauseOfDeathModel } from '../../shared/entities/funeral/cause-of-death.model';
import { PersonEventAccidentDetail } from '../../shared/entities/funeral/person-event-accident-detail';
import { ICD10CodeEntity } from '../../shared/entities/icd10-code-model';
import { Injury } from '../../shared/entities/injury';
import { ParentInsuranceType } from '../../shared/entities/parentInsuranceType';
import { ClaimBucketClassModel } from '../../shared/entities/personEvent/claimBucketClass.model';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { PersonEventDeathDetailModel } from '../../shared/entities/personEvent/personEventDeathDetail.model';
import { PhysicalDamage } from '../../shared/entities/physical-damage';
import { DeathTypeEnum } from '../../shared/enums/deathType.enum';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { InjurySeverityTypeEnum } from '../../shared/enums/injury-severity-type-enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
  selector: 'claim-insurance-details',
  templateUrl: './claim-insurance-details.component.html',
  styleUrls: ['./claim-insurance-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ClaimInsuranceDetailsComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() event: EventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;
  
  isClaimTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDiagnosticLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  displayedColumns = ['name', 'surname', 'idPassportNumber', 'isVopdVerified', 'actions'];
  displayedColumnsIcd10 = ['description', 'bodySideAffectedType', 'injurySeverityType', 'actions'];
  fatal = 'Fatals';
  form: UntypedFormGroup;
  formChecks: UntypedFormGroup;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild(MatTable, { static: false }) table: MatTable<RolePlayer>;
  @ViewChild(MatTable, { static: false }) physicalDamagesTable: MatTable<PhysicalDamage>;
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  dataSource: MatTableDataSource<PersonEventModel>;

  @ViewChild('insuranceTypeElement', { static: false }) insuranceTypeElement: ElementRef;
  @ViewChild('claimTypeElement', { static: false }) claimTypeElement: ElementRef;
  @ViewChild('benefitDueElement', { static: false }) benefitDueElement: ElementRef;
  @ViewChild('diagnosticElement', { static: false }) diagnosticElement: ElementRef;
  @ViewChild('severityElement', { static: false }) severityElement: ElementRef;
  @ViewChild('bodySideElement', { static: false }) bodySideElement: ElementRef;
  @ViewChild('icdCategoriesElement', { static: false }) icdCategoriesElement: ElementRef;
  @ViewChild('icdSubCategoriesElement', { static: false }) icdSubCategoriesElement: ElementRef;
  @ViewChild('icdCodeElement', { static: false }) icdCodeElement: ElementRef;
  @ViewChild('diagnosticCapturerElement', { static: false }) diagnosticCapturerElement: ElementRef;
  @ViewChild('severityCapturerElement', { static: false }) severityCapturerElement: ElementRef;
  @ViewChild('bodySideCapturerElement', { static: false }) bodySideCapturerElement: ElementRef;

  BodySideListChange$ = new BehaviorSubject<boolean>(false);
  SeverityListChange$ = new BehaviorSubject<boolean>(false);
  DiagnosticListChange$ = new BehaviorSubject<boolean>(false);
  InsuranceListChange$ = new BehaviorSubject<boolean>(false);
  ClaimTypeChange$ = new BehaviorSubject<boolean>(false);
  BenefitListChange$ = new BehaviorSubject<boolean>(false);

  elementKeyUp: Subscription;
  filteredInsuranceTypes: ParentInsuranceType[];
  filteredClaimTypes: Lookup[];
  filteredBenefits: ClaimBucketClassModel[];
  filteredDiagnostics: ICD10DiagnosticGroup[];
  filteredSeverities: Lookup[];
  filteredBodySides: Lookup[];
  filteredIcdCategories: ICD10Category[];
  filteredIcdSubCategories: ICD10SubCategory[];
  filteredIcdCodes: ICD10Code[];
  claimType: Lookup;

  currentUser: string;
  hasPermission = true;
  hasData = false;
  requiredPermission = '';

  isViewMode: boolean;
  isEditMode: boolean;
  isAddMode: boolean;
  insuranceTypes: ParentInsuranceType[] = [];
  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  icdCategories: ICD10Category[] = [];
  icdSubCategories: ICD10SubCategory[] = [];
  physicalDamages: PhysicalDamage[] = [];
  physicalDamage: PhysicalDamage;
  injuries: Injury[] = [];
  icdCodes: ICD10Code[] = [];
  severities: Lookup[] = [];
  bodySides: Lookup[] = [];
  claimTypes: Lookup[] = [];
  isRoadAccident = false;
  ledToDeath = false;
  isAssaulted = false;
  isHijacked = false;
  roadAccidentFormValid = true;
  isDiagnostic = false;
  canAdd = false;
  editInjury = true;
  isStatutory = false;
  maxDate = new Date();
  user: User;
  drg = 0;
  drgFatal: ICD10DiagnosticGroup;
  benefits: ClaimBucketClassModel[];
  originalBenefitList: ClaimBucketClassModel[];
  viewInsuranceDetails: boolean;
  employee: RolePlayer;
  selectedPersonEvent: PersonEventModel;
  causeOfDeathTypes: CauseOfDeathModel[];

  physicalDamagesDataSource: PhysicalDamage[] = [];
  beneficiariesDataSource: RolePlayer[] = [];
  physicalDamagesFiltered: PhysicalDamage[] = [];
  menus: { title: string, action: string, disable: boolean }[];
  allowCapturer = true;
  @ViewChild(MatTable) beneficiariesTable: MatTable<RolePlayer>;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    public readonly datepipe: DatePipe,
    private readonly alertService: AlertService,
    private readonly confirmservice: ConfirmationDialogsService,
    private changeDedectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.beneficiariesDataSource = new Array();
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    this.currentUser = this.authService.getUserEmail().toLowerCase();
    if (this.isWizard) {
      this.isViewMode = true;
    }
  }

  ngAfterViewInit(): void {
    this.getLookups();
    this.generateAutoCompleteSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event) { return; }

    this.dataSource = new MatTableDataSource(this.event.personEvents);
    this.dataSource.paginator = this.paginator;
    this.user = this.authService.getCurrentUser();
    this.createForm();
    this.getEmployeeDetails();
    this.event = this.event;

    this.claimService.EmployeeListChange$.subscribe(result => {
      if (result) {
        this.getEmployeeDetails();
      }
    });
  }

  getLookups() {
    this.getInsuranceTypes();
    this.getDiagnosticGroupsByEventTypeId(EventTypeEnum.Accident);
    this.getSeverities();
    this.getBodySides();
    this.getBenefits();
    this.getCauseOfDeath();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      insuranceType: [{ value: '', disabled: true }, Validators.required],
      dateNotified: [{ value: '', disabled: true }, [Validators.required, DateValidator.checkIfDateLessThan('dateNotified', this.datepipe.transform(this.event.eventDate, Constants.dateString))]],
      claimType: [{ value: '', disabled: true }, Validators.required],
      benefits: [{ value: '', disabled: true }, Validators.required],
      dateOfDeath: [{ value: '', disabled: true }],
      certificateNumber: [{ value: '', disabled: true }],
      causeOfDeath: [{ value: '', disabled: true }],
      diagnostics: [{ value: '', disabled: true }],
      diagnosticsNotCapturer: [{ value: '', disabled: true }],
      injuryDescription: [{ value: '', disabled: true }, Validators.required],
      codeCategory: [{ value: '', disabled: true }],
      subCategory: [{ value: '', disabled: true }],
      icdCode: [{ value: '', disabled: true }],
      severity: [{ value: '', disabled: true }],
      severityNotCapturer: [{ value: '', disabled: true }],
      bodySide: [{ value: '', disabled: true }, Validators.required],
    });

    this.formChecks = this.formBuilder.group({
      atWorkPlace: [{ value: false, disabled: true }],
      inScopeOfDuty: [{ value: false, disabled: true }],
      denturesDamaged: [{ value: false, disabled: true }],
      ledToDeath: [{ value: false, disabled: true }],
      isAssault: [{ value: false, disabled: true }],
      isHijack: [{ value: false, disabled: true }],
      roadAccident: [{ value: false, disabled: true }],
      isBusiness: [{ value: false, disabled: true }],
      isTraining: [{ value: false, disabled: true }],
      toWork: [{ value: false, disabled: true }],
      onCallout: [{ value: false, disabled: true }],
      onStandBy: [{ value: false, disabled: true }],
      onPublicRoad: [{ value: false, disabled: true }],
      onPrivateRoad: [{ value: false, disabled: true }],
      vehicleMake: [{ value: '', disabled: true }],
      vehicleRegistration: [{ value: '', disabled: true }],
      otherVehicleMake: [{ value: '', disabled: true }],
      otherVehicleRegistration: [{ value: '', disabled: true }],
      policeReference: [{ value: '', disabled: true }],
      policeStationName: [{ value: '', disabled: true }],
    });
    this.setValidationsForUser();
  }


  CheckResult(listName: string) {
    setTimeout(() => {
      switch (listName) {
        case Constants.insuranceType:
          const insuranceType = this.insuranceTypes.find(i => i.code === this.form.get('insuranceType').value);
          if (insuranceType === undefined) {
            this.form.get('insuranceType').setValue('');
            this.filteredInsuranceTypes = this.insuranceTypes;
          } else { this.getClaimTypes(insuranceType.parentInsuranceTypeId); }
          break;
        case Constants.claimType:
          this.claimType = undefined;
          this.claimType = this.claimTypes.find(c => c.name === this.form.get('claimType').value);
          if (this.claimType === undefined) {
            this.form.get('claimType').setValue('');
            this.filteredClaimTypes = this.claimTypes;
          } else {
            if (this.claimType.id === ClaimTypeEnum.IODCOID) {
              if (this.benefits.length > 0) {
                this.benefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
                this.filteredBenefits = this.benefits;
                this.isStatutory = true;
              }
            } else {
              this.benefits = this.originalBenefitList;
              this.filteredBenefits = this.originalBenefitList;
              this.isStatutory = false;
            }
          }
          break;
        case Constants.benefits:
          let benefit = this.benefits.find(d => d.name === this.form.get('benefits').value);
          if (benefit === undefined) {
            this.form.get('benefits').setValue('');
            if (this.claimType && this.claimType.id === ClaimTypeEnum.IODCOID) {
              this.benefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
              this.filteredBenefits = this.benefits;
              this.isStatutory = true;
            } else {
              this.benefits = this.originalBenefitList;
              this.filteredBenefits = this.originalBenefitList;
              this.isStatutory = false;
            }
          } else {
            if (benefit.name === this.fatal) {
              this.isFatal(true);
            } else {
              this.isFatal(false);
            }

            if (benefit.injurySeverityType > 0) {
              let type = this.severities.find(s => s.id === benefit.injurySeverityType)
              this.form.get('severity').setValue(type.name);
              this.form.get('severity').disable();
              this.form.get('severityNotCapturer').setValue(type.name);
              this.form.get('severityNotCapturer').disable();
            } else {
              this.form.get('severity').setValue(null);
              this.form.get('severity').enable();
              this.form.get('severityNotCapturer').setValue(null);
              this.form.get('severityNotCapturer').enable();
            }
          }
          break;
        case Constants.diagnosticNotCapturer:
          if (!this.user.isInternalUser) {
            this.canAdd = true;
          }
          let value = null;
          let formValue = this.form.get('diagnosticsNotCapturer').value as string;
          if (formValue !== null) {
            value = this.diagnosticGroups.find(d => formValue.includes(d.code));
            if (value === undefined) {
              this.form.get('diagnosticsNotCapturer').setValue('');
              this.filteredDiagnostics = this.diagnosticGroups;
            } else {
              this.form.patchValue({
                diagnosticsNotCapturer: value.code + ':' + value.description
              })
              this.getIcdCategories(value.icd10DiagnosticGroupId, true);
            }
          }
          break;
        case Constants.diagnostic:
          let diagValue = null;
          let diagFormValue = this.form.get('diagnostics').value as string;
          if (diagFormValue !== null) {
            diagValue = this.diagnosticGroups.find(d => diagFormValue.includes(d.code));
            if (diagValue === undefined) {
              this.form.get('diagnostics').setValue('');
              this.filteredDiagnostics = this.diagnosticGroups;
            } else {
              this.form.patchValue({
                diagnostics: diagValue.code + ':' + diagValue.description
              })
              this.getIcdCategories(diagValue.icd10DiagnosticGroupId, true);
            }
          }
          break;
        case Constants.severity:
          let severity = this.severities.find(d => d.name === this.form.get('severity').value);
          if (severity === undefined) {
            this.form.get('severity').setValue('');
            this.filteredSeverities = this.severities;
          }
          break;
        case Constants.severityNotCapturer:
          let severityNotCapturer = this.severities.find(d => d.name === this.form.get('severityNotCapturer').value);
          if (severityNotCapturer === undefined) {
            this.form.get('severityNotCapturer').setValue('');
            this.filteredSeverities = this.severities;
          }
          break;
        case Constants.bodySide:
          let bodySide = this.bodySides.find(d => d.name === this.form.get('bodySide').value);
          if (bodySide === undefined) {
            this.form.get('bodySide').setValue('');
            this.filteredBodySides = this.bodySides;
          } else { };
          break;
        case Constants.category:
          let codeCategory = this.icdCategories.find(d => d.icd10CategoryCode === this.form.get('codeCategory').value);
          if (codeCategory === undefined) {
            this.form.get('codeCategory').setValue('');
            this.filteredIcdCategories = this.icdCategories;
          } else {
            this.getIcdSubCategories(codeCategory.icd10CategoryId, true);
          };
          break;
        case Constants.subCategory:
          let subCategory = this.icdSubCategories.find(d => d.icd10SubCategoryCode === this.form.get('subCategory').value);
          if (subCategory === undefined) {
            this.form.get('subCategory').setValue('');
            this.filteredIcdSubCategories = this.icdSubCategories;
          } else {
            this.getIcdCodes(subCategory.icd10SubCategoryId, true);
          };
          break;
        case Constants.code:
          let code = this.icdCodes.find(d => d.icd10Code === this.form.get('icdCode').value);
          if (code === undefined) {
            this.form.get('icdCode').setValue('');
            this.filteredIcdCodes = this.icdCodes;
          } else { this.canAdd = true; };
          break;
      }
    }, 1000);
  }

  getEmployeeDetails() {
    this.isLoading$.next(true);
    this.dataSource.data = [];
    if (this.event.personEvents.length > 0) {
      this.event.personEvents.forEach(personEvent => {
        if (personEvent.rolePlayer.person) {
          this.updateTable(true);
          this.isLoading$.next(false);
        }
      });
    } else {
      this.dataSource.data = [];
      this.isLoading$.next(false);
    }
  }

  updateTable(isFromGetEmployee: boolean) {
    this.dataSource.data = this.event.personEvents;
    if (!isFromGetEmployee) {
      this.claimService.updateEmployeeDetails(true);
    }
    if (this.dataSource.data.length > 0) {
      if (this.table) {
        this.table.renderRows();
      }
    }
  }

  readForm(): PersonEventModel {
    if (this.selectedPersonEvent) {
      const formCheckDetails = this.formChecks.getRawValue();
      const formDetails = this.form.getRawValue();
      this.selectedPersonEvent.personEventAccidentDetail = this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail : new PersonEventAccidentDetail();
      this.selectedPersonEvent.physicalDamages = this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages : this.physicalDamages;
      const injury = new Injury();
      const damage = new PhysicalDamage();
      damage.injuries = [];

      // formCheckDetails
      this.selectedPersonEvent.personEventAccidentDetail.isOccurAtNormalWorkplace = formCheckDetails.atWorkPlace ? formCheckDetails.atWorkPlace : false;
      this.selectedPersonEvent.personEventAccidentDetail.isOccurPerformingScopeofDuty = formCheckDetails.inScopeOfDuty ? formCheckDetails.inScopeOfDuty : false;
      this.selectedPersonEvent.isSpectacles = false;
      this.selectedPersonEvent.isDentures = formCheckDetails.denturesDamaged ? formCheckDetails.denturesDamaged : false;
      this.selectedPersonEvent.isAssault = formCheckDetails.isAssault ? formCheckDetails.isAssault : false;
      this.selectedPersonEvent.isHijack = formCheckDetails.isHijack ? formCheckDetails.isHijack : false;
      this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident = formCheckDetails.roadAccident ? formCheckDetails.roadAccident : false;
      this.selectedPersonEvent.personEventAccidentDetail.isOnBusinessTravel = formCheckDetails.isOnBusinessTravel ? formCheckDetails.isOnBusinessTravel : false;
      this.selectedPersonEvent.personEventAccidentDetail.isTrainingTravel = formCheckDetails.isTraining ? formCheckDetails.isTraining : false;
      this.selectedPersonEvent.personEventAccidentDetail.isTravelToFromWork = formCheckDetails.toWork ? formCheckDetails.toWork : false;
      this.selectedPersonEvent.personEventAccidentDetail.isOnCallout = formCheckDetails.onCallout ? formCheckDetails.onCallout : false;
      this.selectedPersonEvent.personEventAccidentDetail.isOnStandby = formCheckDetails.onStandBy ? formCheckDetails.onStandBy : false;
      this.selectedPersonEvent.personEventAccidentDetail.isPublicRoad = formCheckDetails.onPublicRoad ? formCheckDetails.onPublicRoad : false;
      this.selectedPersonEvent.personEventAccidentDetail.isPrivateRoad = formCheckDetails.onPrivateRoad ? formCheckDetails.onPrivateRoad : false;
      this.selectedPersonEvent.personEventAccidentDetail.vehicleMake = formCheckDetails.vehicleMake;
      this.selectedPersonEvent.personEventAccidentDetail.vehicleRegNo = formCheckDetails.vehicleRegistration;
      this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVehicleMake = formCheckDetails.otherVehicleMake;
      this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVahicleRegNo = formCheckDetails.otherVehicleRegistration;
      this.selectedPersonEvent.personEventAccidentDetail.policeReferenceNo = formCheckDetails.policeReference;
      this.selectedPersonEvent.personEventAccidentDetail.policeStationName = formCheckDetails.policeStationName;

      // Insurance Details
      this.selectedPersonEvent.physicalDamages = [];
      this.selectedPersonEvent.insuranceTypeId = this.insuranceTypes.find(i => i.code === formDetails.insuranceType).parentInsuranceTypeId;
      this.selectedPersonEvent.dateCaptured = formDetails.dateNotified;
      this.selectedPersonEvent.claimType = this.claimTypes.find(c => c.name === formDetails.claimType).id;
      this.selectedPersonEvent.personEventBucketClassId = this.benefits.find(b => b.name === formDetails.benefits).claimBucketClassId;

      damage.description = formDetails.injuryDescription;
      damage.icdCategoryId = formDetails.codeCategory !== null ? this.icdCategories.find(i => i.icd10CategoryCode === formDetails.codeCategory).icd10CategoryId : 0;
      damage.icdSubCategoryId = formDetails.subCategory !== null ? this.filteredIcdSubCategories.find(i => i.icd10SubCategoryCode === formDetails.subCategory).icd10SubCategoryId : 0;
      damage.createdBy = this.currentUser;
      damage.createdDate = new Date();
      damage.modifiedDate = new Date();
      damage.modifiedBy = this.currentUser;

      if (!this.allowCapturer) {
        // let formValue = this.form.get('diagnosticsNotCapturer').value as string;
        let diagnosticGroup = this.diagnosticGroups.find(d => (formDetails.diagnostics as string).includes(d.code))
        damage.icd10DiagnosticGroupId = diagnosticGroup.icd10DiagnosticGroupId;
        this.filteredDiagnostics = this.diagnosticGroups;

        let severity = this.severities.find(d => d.name === formDetails.severity)
        injury.injurySeverityType = severity.id;

        let icdCode = formDetails.icdCode !== null ? this.icdCodes.find(i => i.icd10Code === formDetails.icdCode) : null
        injury.icd10CodeId = icdCode ? icdCode.icd10CodeId : 0;

      } else {
        let diagnosticGroup = this.diagnosticGroups.find(d => (formDetails.diagnosticsNotCapturer as string).includes(d.code))
        damage.icd10DiagnosticGroupId = diagnosticGroup.icd10DiagnosticGroupId;
        this.filteredDiagnostics = this.diagnosticGroups;

        let severity = this.severities.find(d => d.name === formDetails.severityNotCapturer)
        injury.injurySeverityType = severity.id;
        injury.icd10CodeId = Constants.externalIcd10CodeInvalid;
      }

      injury.bodySideAffectedType = this.bodySides.find(b => b.name === formDetails.bodySide).id;
      injury.injuryStatus = InjuryStatusEnum.NotValidated;
      injury.createdBy = this.currentUser;
      injury.createdDate = new Date();
      injury.modifiedDate = new Date();
      injury.modifiedBy = this.currentUser;

      damage.injuries.push(injury);
      this.selectedPersonEvent.physicalDamages.push(damage);

      if (this.physicalDamagesDataSource.length >= 0) {
        this.physicalDamagesDataSource.forEach(item => {
          const damage = new PhysicalDamage();
          damage.icd10DiagnosticGroupId = item.icd10DiagnosticGroupId;
          damage.description = item.description;
          damage.icdCategoryId = item.icdCategoryId > 0 ? item.icdCategoryId : null;
          damage.icdSubCategoryId = item.icdSubCategoryId > 0 ? item.icdSubCategoryId : null;
          damage.createdBy = this.currentUser;
          damage.createdDate = new Date();
          damage.modifiedDate = new Date();
          damage.modifiedBy = this.currentUser;
          damage.injuries = [];

          const injury = new Injury();
          injury.injurySeverityType = item.injuries[0].injurySeverityType;
          injury.bodySideAffectedType = item.injuries[0].bodySideAffectedType;
          injury.injuryStatus = InjuryStatusEnum.NotValidated;
          injury.icd10CodeId = item.injuries[0].icd10CodeId !== 0 ? item.injuries[0].icd10CodeId : Constants.externalIcd10CodeInvalid;
          injury.createdBy = this.currentUser;
          injury.createdDate = new Date();
          injury.modifiedDate = new Date();
          injury.modifiedBy = this.currentUser;

          damage.injuries.push(injury);
          this.selectedPersonEvent.physicalDamages.push(damage);
        });
      }

      this.selectedPersonEvent.dateReceived = formDetails.dateNotified;
      this.selectedPersonEvent.createdBy = this.currentUser;
      this.selectedPersonEvent.createdDate = new Date();
      this.selectedPersonEvent.modifiedDate = new Date();
      this.selectedPersonEvent.modifiedBy = this.currentUser;

      // Death Details
      if (formCheckDetails.ledToDeath) {
        this.selectedPersonEvent.personEventDeathDetail = this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail : new PersonEventDeathDetailModel();
        this.selectedPersonEvent.personEventDeathDetail.deathDate = formDetails.dateOfDeath;
        this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo = formDetails.certificateNumber;
        this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription = formDetails.causeOfDeath;
        this.selectedPersonEvent.personEventDeathDetail.deathType = DeathTypeEnum.Natural;
      }
      return this.selectedPersonEvent;
    }
  }

  patchForm() {
    if (this.event && this.event.personEvents.length > 0) {
      this.isRoadAccident = this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident;

      if (this.selectedPersonEvent.physicalDamages.length > 1) {
        this.physicalDamagesFiltered = this.selectedPersonEvent.physicalDamages;
        let data = [];
        if (this.user.isInternalUser && this.selectedPersonEvent.physicalDamages[0].icdCategoryId !== null) {
          data = this.physicalDamagesFiltered.filter(s => s.icdCategoryId !== this.selectedPersonEvent.physicalDamages[0].icdCategoryId &&
            s.icdSubCategoryId !== this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId);
        } else {
          data = this.physicalDamagesFiltered.filter(s => s.icd10DiagnosticGroupId !== this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId);
        }

        if (data.length > 0) {
          let count = 0;
          data.forEach(result => {
            count = count + 1;
            result.count = count;
          });
          this.physicalDamagesDataSource = data;
          this.hasData = true;
        }
      }
      this.canAdd = this.selectedPersonEvent.physicalDamages.length > 0;
      this.PatchFormCheckControls();
      this.patchFormControls();
    }
  }

  PatchFormCheckControls() {
    this.formChecks.patchValue({
      atWorkPlace: this.selectedPersonEvent.personEventAccidentDetail.isOccurAtNormalWorkplace ? this.selectedPersonEvent.personEventAccidentDetail.isOccurAtNormalWorkplace : false,
      inScopeOfDuty: this.selectedPersonEvent.personEventAccidentDetail.isOccurPerformingScopeofDuty ? this.selectedPersonEvent.personEventAccidentDetail.isOccurPerformingScopeofDuty : false,
      denturesDamaged: this.selectedPersonEvent.isDentures ? this.selectedPersonEvent.isDentures : false,
      isAssault: this.selectedPersonEvent.isAssault ? this.selectedPersonEvent.isAssault : false,
      isHijack : this.selectedPersonEvent.isHijack ? this.selectedPersonEvent.isHijack : false,
      roadAccident: this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident ? this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident : false,
      isBusiness: this.selectedPersonEvent.personEventAccidentDetail.isOnBusinessTravel ? this.selectedPersonEvent.personEventAccidentDetail.isOnBusinessTravel : false,
      isTraining: this.selectedPersonEvent.personEventAccidentDetail.isTrainingTravel ? this.selectedPersonEvent.personEventAccidentDetail.isTrainingTravel : false,
      toWork: this.selectedPersonEvent.personEventAccidentDetail.isTravelToFromWork ? this.selectedPersonEvent.personEventAccidentDetail.isTravelToFromWork : false,
      onCallout: this.selectedPersonEvent.personEventAccidentDetail.isOnCallout ? this.selectedPersonEvent.personEventAccidentDetail.isOnCallout : false,
      onStandBy: this.selectedPersonEvent.personEventAccidentDetail.isOnStandby ? this.selectedPersonEvent.personEventAccidentDetail.isOnStandby : false,
      onPublicRoad: this.selectedPersonEvent.personEventAccidentDetail.isPublicRoad ? this.selectedPersonEvent.personEventAccidentDetail.isPublicRoad : false,
      onPrivateRoad: this.selectedPersonEvent.personEventAccidentDetail.isPrivateRoad ? this.selectedPersonEvent.personEventAccidentDetail.isPrivateRoad : false,
      vehicleMake: this.selectedPersonEvent.personEventAccidentDetail.vehicleMake ? this.selectedPersonEvent.personEventAccidentDetail.vehicleMake : null,
      vehicleRegistration: this.selectedPersonEvent.personEventAccidentDetail.vehicleRegNo ? this.selectedPersonEvent.personEventAccidentDetail.vehicleRegNo : null,
      otherVehicleMake: this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVehicleMake ? this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVehicleMake : null,
      otherVehicleRegistration: this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVahicleRegNo ? this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVahicleRegNo : null,
      policeReference: this.selectedPersonEvent.personEventAccidentDetail.policeReferenceNo ? this.selectedPersonEvent.personEventAccidentDetail.policeReferenceNo : null,
      policeStationName: this.selectedPersonEvent.personEventAccidentDetail.policeStationName ? this.selectedPersonEvent.personEventAccidentDetail.policeStationName : null,
    });
  }

  patchFormControls() {
    this.SeverityListChange$.subscribe(result => {
      if (result) {
        this.form.patchValue({
          severity: this.selectedPersonEvent.physicalDamages ? this.severities.find(d => d.id === this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType).name : null,
          severityNotCapturer: this.selectedPersonEvent.physicalDamages ? this.severities.find(d => d.id === this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType).name : null,
        });
      }
    })
    this.DiagnosticListChange$.subscribe(result => {
      if (result) {
        let diag = null;
        if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId > 0) {
          let diagnostic = this.diagnosticGroups.find(d => d.icd10DiagnosticGroupId === this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId);
          diag = diagnostic.code + ':' + diagnostic.description;
        }
        this.form.patchValue({
          diagnostics: diag,
          diagnosticsNotCapturer: diag,
        });
      }
    })
    this.BodySideListChange$.subscribe(result => {
      if (result) {
        let bodySide = this.selectedPersonEvent.physicalDamages ? this.bodySides.find(b => b.id === this.selectedPersonEvent.physicalDamages[0].injuries[0].bodySideAffectedType).name : null;
        this.form.patchValue({
          bodySide: bodySide
        });
      }
    })
    this.InsuranceListChange$.subscribe(result => {
      if (result) {
        let insuranceType = this.insuranceTypes.find(i => i.parentInsuranceTypeId === this.selectedPersonEvent.insuranceTypeId).code;
        this.form.patchValue({
          insuranceType: insuranceType
        });
      }
    })
    this.BenefitListChange$.subscribe(result => {
      if (result) {
        let benefits = this.benefits.find(b => b.claimBucketClassId === this.selectedPersonEvent.personEventBucketClassId).name;
        this.form.patchValue({
          benefits: benefits
        });
      }
    })
    this.ClaimTypeChange$.subscribe(result => {
      if (result) {
        const claimType = this.claimTypes.find(c => c.id === this.selectedPersonEvent.claimType);
        if (claimType) {
          // Get the Claim-Type of a saved person-event.
          this.form.patchValue({
            claimType: claimType.name
          });
        }
        else {
          this.form.controls.claimType.reset();
        }
      }
    })

    this.form.patchValue({
      dateNotified: this.selectedPersonEvent.dateCaptured,
      dateOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathDate : null,
      certificateNumber: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo : null,
      causeOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription : null,
      injuryDescription: this.selectedPersonEvent.physicalDamages[0].description,
    });

    if (this.selectedPersonEvent.insuranceTypeId) {
      this.getClaimTypes(this.selectedPersonEvent.insuranceTypeId);
    }
    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId > 0) {
      this.getIcdCategories(this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId, false);
    }

    if (this.selectedPersonEvent.personEventDeathDetail) {
      this.ledToDeath = true;
      this.formChecks.patchValue({
        ledToDeath: true
      });
    }
  }

  // Populating all the drop downs
  getBenefits() {
    this.claimService.getClaimBucketClasses().subscribe(benefits => {
      this.benefits = benefits;
      this.originalBenefitList = benefits;
      this.filteredBenefits = benefits;
      if (benefits.length > 0) { this.BenefitListChange$.next(true); }
      this.prePopulateAutocomplete(
        this.benefitDueElement.nativeElement,
        this.filteredBenefits,
        this.form.controls['benefits']
      )
    });
  }

  getInsuranceTypes() {
    this.claimService.getInsuranceTypesByEventTypeId(EventTypeEnum.Accident).subscribe(insuranceTypes => {
      this.insuranceTypes = insuranceTypes;
      this.filteredInsuranceTypes = insuranceTypes;
      if (insuranceTypes.length > 0) { this.InsuranceListChange$.next(true); }
      this.prePopulateAutocomplete(
        this.insuranceTypeElement.nativeElement,
        this.filteredInsuranceTypes,
        this.form.controls['insuranceType']
      )
    });
  }

  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    this.isDiagnosticLoading$.next(true);
    this.medicalService.getICD10DiagonosticGroupsByEventType(eventType).subscribe(groups => {
      this.diagnosticGroups = groups;
      this.drgFatal = this.diagnosticGroups.find(d => d.code === 'DRG00');
      this.isDiagnostic = true;
      this.filteredDiagnostics = groups;
      if (groups.length > 0) { this.DiagnosticListChange$.next(true); }
      this.checkCapturer();
      this.isDiagnosticLoading$.next(false);
    }, (error) => {
      this.isDiagnosticLoading$.next(false);
    });
  }

  getClaimTypes(insuranceType: number) {
    this.isClaimTypeLoading$.next(true);
    this.lookupService.getClaimTypesByEventAndParentInsuranceType(this.event.eventType, insuranceType).subscribe(claimTypes => {
      this.claimTypes = claimTypes;
      this.filteredClaimTypes = claimTypes;
      if (claimTypes.length > 0) { this.ClaimTypeChange$.next(true); }
      if (this.isWizard) {
        this.enableFormControl('claimType');
      } else {
        this.disableFormControl('claimType');
      }
      this.isClaimTypeLoading$.next(false);
    }, (error) => {
      this.isClaimTypeLoading$.next(false);
    });
  }

  getSeverities() {
    this.lookupService.getInjurySeverities().subscribe(severities => {
      this.severities = severities;
      this.filteredSeverities = severities;
      if (severities.length > 0) { this.SeverityListChange$.next(true); }
      this.populateSeverityByCapturer();
    });
  }

  getBodySides() {
    this.lookupService.getBodySides().subscribe(bodySides => {
      this.bodySides = bodySides;
      this.filteredBodySides = bodySides;
      if (bodySides.length > 0) { this.BodySideListChange$.next(true); }
      this.prePopulateAutocomplete(
        this.bodySideElement.nativeElement,
        this.filteredBodySides,
        this.form.controls['bodySide']
      )
    });
  }

  getIcdCategories(icd10DiagnosticGroupId: number, fromDropDown: boolean) {
    this.drg = icd10DiagnosticGroupId;
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = this.event.eventType;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;
    this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
      this.filteredIcdCategories = categories;
      this.prePopulateAutocomplete(
        this.icdCategoriesElement.nativeElement,
        this.filteredIcdCategories,
        this.form.controls['codeCategory']
      )

      if (fromDropDown) {
        this.form.patchValue({
          codeCategory: null,
          subCategory: null,
          icdCode: null,
        });
        this.disableFormControl('codeCategory');
        this.disableFormControl('subCategory');
        this.disableFormControl('icdCode');
        this.form.controls.codeCategory.setErrors({ notUnique: true });
      }
      if (!this.isReadOnly) {
        this.enableFormControl('codeCategory');

      }
      if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icdCategoryId > 0 && !fromDropDown) {
        this.getIcdSubCategories(this.selectedPersonEvent.physicalDamages[0].icdCategoryId, false);
      }
    });
  }

  getIcdSubCategories(icdCategoryId: number, fromDropDown: boolean) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = this.event.eventType;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10CategoryId = icdCategoryId;
    this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
      this.filteredIcdSubCategories = subCategories;
      this.prePopulateAutocomplete(
        this.icdSubCategoriesElement.nativeElement,
        this.filteredIcdSubCategories,
        this.form.controls['subCategory']
      )
      if (!this.isReadOnly) {
        this.enableFormControl('subCategory');
      }
      if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId > 0 && !fromDropDown) {
        this.getIcdCodes(this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId, false);
      }
    });
  }

  getIcdCodes(subcategoryId: number, fromDropDown: boolean) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = this.event.eventType;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10SubCategoryId = subcategoryId;
    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
      this.filteredIcdCodes = codes;

      if (!this.isReadOnly) {
        this.enableFormControl('icdCode');
      }

      if (!fromDropDown) {
        let category = this.icdCategories.find(i => i.icd10CategoryId === this.event.personEvents[0].physicalDamages[0].icdCategoryId).icd10CategoryCode
        let subCategory = this.icdSubCategories.find(i => i.icd10SubCategoryId === this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId).icd10SubCategoryCode
        let code = this.icdCodes && this.icdCodes.length > 0 ? this.icdCodes.find(i => i.icd10CodeId === this.event.personEvents[0].physicalDamages[0].injuries[0].icd10CodeId).icd10Code : 0
        this.form.patchValue({
          codeCategory: this.selectedPersonEvent.physicalDamages ? category : null,
          subCategory: this.selectedPersonEvent.physicalDamages ? subCategory : null,
          icdCode: this.selectedPersonEvent.physicalDamages && this.event.personEvents[0].physicalDamages[0].injuries[0].icd10CodeId > 0 ? code : null,
        });
        this.prePopulateAutocomplete(
          this.icdCodeElement.nativeElement,
          this.filteredIcdCodes,
          this.form.controls['icdCode']
        )
      }
    });
  }

  checkCapturer() {
    if (!this.allowCapturer) {
      this.prePopulateAutocomplete(
        this.diagnosticElement.nativeElement,
        this.filteredDiagnostics,
        this.form.controls[Constants.diagnostic]
      )
    } else {
      this.prePopulateAutocomplete(
        this.diagnosticCapturerElement.nativeElement,
        this.filteredDiagnostics,
        this.form.controls[Constants.diagnosticNotCapturer]
      )
    }
  }

  populateSeverityByCapturer() {
    if (!this.allowCapturer) {
      this.prePopulateAutocomplete(
        this.severityElement.nativeElement,
        this.filteredSeverities,
        this.form.controls[Constants.severity]
      )
    } else {
      this.prePopulateAutocomplete(
        this.severityCapturerElement.nativeElement,
        this.filteredSeverities,
        this.form.controls[Constants.severityNotCapturer]
      )
    }
  };

  checkPermissions(permission: string): boolean {
    return userUtility.hasPermission(permission);
  }

  getCauseOfDeath() {
    this.claimService.GetCauseOfDeath(DeathTypeEnum.Natural).subscribe(causeOfDeaths => {
      this.causeOfDeathTypes = causeOfDeaths;
    });
  }

  ledToDeathChange($event: any) {
    this.isFatal($event.checked);
    if ($event.checked) {
      this.disableFormControl('benefits');
    } else {
      this.form.patchValue({
        benefits: null
      });
      this.enableFormControl('benefits');
    }
  }

  setValidationsForUser() {
    const validators = [Validators.required];
    if (!this.allowCapturer) {
      this.applyValidationToFormControl(this.form, validators, 'codeCategory');
      this.applyValidationToFormControl(this.form, validators, 'subCategory');
      this.applyValidationToFormControl(this.form, validators, 'icdCode');
      this.applyValidationToFormControl(this.form, validators, 'diagnostics');
      this.applyValidationToFormControl(this.form, validators, 'severity');
    } else {
      this.clearValidationToFormControl(this.form, 'codeCategory');
      this.clearValidationToFormControl(this.form, 'subCategory');
      this.clearValidationToFormControl(this.form, 'icdCode');
      this.clearValidationToFormControl(this.form, 'severity');
      this.clearValidationToFormControl(this.form, 'diagnostics');
    }
    if (this.allowCapturer) {
      this.applyValidationToFormControl(this.form, validators, 'diagnosticsNotCapturer');
      this.applyValidationToFormControl(this.form, validators, 'severityNotCapturer');
      this.applyValidationToFormControl(this.form, validators, 'injuryDescription');
    } else {
      this.applyValidationToFormControl(this.form, validators, 'diagnosticsNotCapturer');
      this.applyValidationToFormControl(this.form, validators, 'severityNotCapturer');
      this.applyValidationToFormControl(this.form, validators, 'injuryDescription');
    }
  }

  viewInsuranceDetail(personEvent: PersonEventModel) {
    this.viewInsuranceDetails = true;
    this.selectedPersonEvent = personEvent;
    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId > 0) {
      this.getIcdCategories(this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId, false);
    }
    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icdCategoryId > 0) {
      this.getIcdSubCategories(this.selectedPersonEvent.physicalDamages[0].icdCategoryId, false);
    }
    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId > 0) {
      this.getIcdCodes(this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId, false);
    }
    this.patchForm();
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  resetForm() {
    this.isEditMode = false;
    // Form controls
    this.disableFormControl('insuranceType');
    this.disableFormControl('dateNotified');
    this.disableFormControl('claimType');
    this.disableFormControl('benefits');
    this.disableFormControl('dateOfDeath');
    this.disableFormControl('certificateNumber');
    this.disableFormControl('causeOfDeath');
    this.disableFormControl('diagnostics');
    this.disableFormControl('diagnosticsNotCapturer');
    this.disableFormControl('injuryDescription');
    this.disableFormControl('codeCategory');
    this.disableFormControl('subCategory');
    this.disableFormControl('severity');
    this.disableFormControl('severityNotCapturer');
    this.disableFormControl('bodySide');

    // Form checks controls
    this.disableFormControl('denturesDamaged');
    this.disableFormControl('ledToDeath');
    this.disableFormControl('isAssault');
    this.disableFormControl('isHijack');
    this.disableFormControl('roadAccident');
    this.disableFormControl('isBusiness');
    this.disableFormControl('isTraining');
    this.disableFormControl('toWork');
    this.disableFormControl('onCallout');
    this.disableFormControl('onStandBy');
    this.disableFormControl('onPublicRoad');
    this.disableFormControl('onPrivateRoad');
    this.disableFormControl('vehicleMake');
    this.disableFormControl('vehicleRegistration');
    this.disableFormControl('otherVehicleMake');
    this.disableFormControl('otherVehicleRegistration');
    this.disableFormControl('policeReference');
    this.disableFormControl('policeStationName');
  }

  reset() {
    this.form.controls.insuranceType.reset();
    this.form.controls.dateNotified.reset();
    this.form.controls.claimType.reset();
    this.form.controls.benefits.reset();
    this.form.controls.dateOfDeath.reset();
    this.form.controls.certificateNumber.reset();
    this.form.controls.causeOfDeath.reset();
    this.form.controls.diagnostics.reset();
    this.form.controls.diagnosticsNotCapturer.reset();
    this.form.controls.injuryDescription.reset();
    this.form.controls.codeCategory.reset();
    this.form.controls.subCategory.reset();
    this.form.controls.severity.reset();
    this.form.controls.severityNotCapturer.reset();
    this.form.controls.bodySide.reset();
    this.formChecks.controls.inScopeOfDuty.reset();
    this.formChecks.controls.atWorkPlace.reset();
    this.formChecks.controls.denturesDamaged.reset();
    this.formChecks.controls.ledToDeath.reset();
    this.formChecks.controls.isAssault.reset();
    this.formChecks.controls.isHijack.reset();

    this.clearPhysicalDamages();

    if (this.isRoadAccident) {
      this.resetRoadAccidentForm();
    }

    if (!(this.dataSource.data.length > 1)) {
      this.formChecks.controls.roadAccident.reset();
    }
    this.ledToDeath = false;
    this.isAssaulted = false;
    this.isHijacked = false;
  }

  resetRoadAccidentForm() {
    this.formChecks.controls.isBusiness.reset();
    this.formChecks.controls.isTraining.reset();
    this.formChecks.controls.toWork.reset();
    this.formChecks.controls.onCallout.reset();
    this.formChecks.controls.onStandBy.reset();
    this.formChecks.controls.onPublicRoad.reset();
    this.formChecks.controls.onPrivateRoad.reset();
    this.formChecks.controls.vehicleMake.reset();
    this.formChecks.controls.vehicleRegistration.reset();
    this.formChecks.controls.otherVehicleMake.reset();
    this.formChecks.controls.otherVehicleRegistration.reset();
    this.formChecks.controls.policeReference.reset();
    this.formChecks.controls.policeStationName.reset();
  }

  edit(personEvent: PersonEventModel) {
    this.isEditMode = true;
    this.viewInsuranceDetails = true;
    this.selectedPersonEvent = personEvent;
    this.enableFormControl('atWorkPlace');
    this.enableFormControl('inScopeOfDuty');
    this.enableFormControl('insuranceType');
    this.enableFormControl('dateNotified');
    this.enableFormControl('claimType');
    this.enableFormControl('benefits');
    this.enableFormControl('dateOfDeath');
    this.enableFormControl('certificateNumber');
    this.enableFormControl('causeOfDeath');
    this.enableFormControl('injuryDescription');
    this.enableFormControl('severity');
    this.enableFormControl('severityNotCapturer');
    this.enableFormControl('bodySide');
    this.enableFormControl('diagnostics');
    this.enableFormControl('diagnosticsNotCapturer');
    this.enableFormControl('codeCategory');

    // Form checks controls
    this.enableFormControl('denturesDamaged');
    this.enableFormControl('ledToDeath');
    this.enableFormControl('isAssault');
    this.enableFormControl('isHijack');
    this.enableFormControl('roadAccident');
    this.enableFormControl('isBusiness');
    this.enableFormControl('isTraining');
    this.enableFormControl('toWork');
    this.enableFormControl('onCallout');
    this.enableFormControl('onStandBy');
    this.enableFormControl('onPublicRoad');
    this.enableFormControl('onPrivateRoad');
    this.enableFormControl('vehicleMake');
    this.enableFormControl('vehicleRegistration');
    this.enableFormControl('otherVehicleMake');
    this.enableFormControl('otherVehicleRegistration');
    this.enableFormControl('policeReference');
    this.enableFormControl('policeStationName');

    this.patchForm();
  }

  save() {
    this.isSaving$.next(true);
    this.isEditMode = false;
    this.isAddMode = false;
    const personEventDetails = this.readForm();
    const index = this.event.personEvents.findIndex(a => a.personEventId === personEventDetails.personEventId);
    this.event.personEvents[index] = personEventDetails;
    this.toggle();
    this.resetForm();
    this.reset();
  }

  delete() {
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    } else {
      this.formChecks.get(controlName).disable();
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    } else {
      this.formChecks.get(controlName).enable();
    }
  }

  add(personEvent: PersonEventModel) {
    this.isAddMode = true;
    this.selectedPersonEvent = personEvent;
    this.toggle();
    this.form.patchValue({
      dateNotified: new Date()
    });

    this.enableFormControl('insuranceType');
    this.enableFormControl('dateNotified');
    this.enableFormControl('benefits');
    this.enableFormControl('dateOfDeath');
    this.enableFormControl('certificateNumber');
    this.enableFormControl('causeOfDeath');
    this.enableFormControl('injuryDescription');
    this.enableFormControl('severity');
    this.enableFormControl('severityNotCapturer');
    this.enableFormControl('bodySide');
    this.enableFormControl('diagnostics');
    this.enableFormControl('diagnosticsNotCapturer');
    this.enableFormControl('codeCategory');
    this.enableFormControl('atWorkPlace');
    this.enableFormControl('inScopeOfDuty');
    this.enableFormControl('denturesDamaged');
    this.enableFormControl('ledToDeath');
    this.enableFormControl('isAssault');
    this.enableFormControl('isHijack');
    this.enableFormControl('roadAccident');
    this.enableFormControl('isBusiness');
    this.enableFormControl('isTraining');
    this.enableFormControl('toWork');
    this.enableFormControl('onCallout');
    this.enableFormControl('onStandBy');
    this.enableFormControl('onPublicRoad');
    this.enableFormControl('onPrivateRoad');
    this.enableFormControl('vehicleMake');
    this.enableFormControl('vehicleRegistration');
    this.enableFormControl('otherVehicleMake');
    this.enableFormControl('otherVehicleRegistration');
    this.enableFormControl('policeReference');
    this.enableFormControl('policeStationName');

    this.clearPhysicalDamages();
  }

  clearPhysicalDamages() {
    this.physicalDamages = [];
    this.physicalDamagesFiltered = [];
    this.physicalDamagesDataSource = [];
    this.hasData = false;
  }

  toggle() {
    this.viewInsuranceDetails = !this.viewInsuranceDetails;
    this.reset();
    this.resetForm();
  }

  cancel() {
    this.reset();
    this.resetForm();
    this.isEditMode = false;
    this.toggle();
  }


  filterMenu(item: PersonEventModel) {
    this.menus = null;
    const insuranceExists = this.checkIfInsuranceDetailsExist(item);
    this.menus = [];
    this.menus.push({ title: 'Add Injury Details', action: 'add', disable: this.isReadOnly || insuranceExists ? true : false });
    if(userUtility.hasPermission('Edit Injury Details'))
    {
      this.menus.push( { title: 'Edit Injury Details', action: 'edit', disable: this.isReadOnly || !insuranceExists ? true : false });
    }
    this.menus.push({ title: 'View Injury Details', action: 'view', disable: insuranceExists ? false : true });
  }

  filterIcdMenu(item: PersonEventModel) {
    this.menus = null;
    const insuranceExists = this.checkIfInsuranceDetailsExist(item);
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: this.isReadOnly },
        { title: 'Delete', action: 'delete', disable: this.isReadOnly }
      ];
  }

  checkIfInsuranceDetailsExist(personEvent: PersonEventModel): boolean {
    return personEvent.personEventAccidentDetail ? true : false;
  }

  isRoadAccidentValid($event: any) {
    this.roadAccidentFormValid = $event;
  }

  onMenuItemClick(item: PersonEventModel, menu: any): void {
    this.isExistingClaim(item);

    switch (menu.action) {
      case 'add':
        this.add(item);
        break;
      case 'edit':
        if (this.editInjury) {
          this.edit(item);
        } else {
          this.alertService.loading('Cannot edit existing claim details');
        }

        break;
      case 'view':
        this.viewInsuranceDetail(item);
        this.disableFormControl('claimType');
        this.disableFormControl('codeCategory');
        this.disableFormControl('subCategory');
        this.disableFormControl('icdCode');
        this.canAdd = false;
        break;
    }
  }

  isExistingClaim(item: PersonEventModel) {
    if (item.claims && item.claims.length >= 0) {
      this.editInjury = false;
    } else {
      this.editInjury = true;
    }
  }

  onIcdMenuItemClick(item: PhysicalDamage, menu: any): void {
    switch (menu.action) {
      case 'view':
      case 'edit':
        this.physicalDamage = item;
        break;
      case 'delete':
        if (item.count !== 0) {
          this.deleteItem(item);
        } else {
          let count = 0;
          this.physicalDamagesDataSource.forEach(result => {
            count = count + 1;
            result.count = count;
            this.deleteItem(result);
          });
        }
        break;
    }
  }

  deleteItem(item: PhysicalDamage) {
    const index = this.physicalDamagesDataSource.findIndex(i => i.count === item.count);
    this.physicalDamagesDataSource.splice(index, 1);
    this.updatePhysicalDamagesTable();
    this.form.markAsDirty();
  }

  closeView() {
    this.viewInsuranceDetails = !this.viewInsuranceDetails;
  }

  onPublicRoadChange(): void {
    const formDetails = this.formChecks.getRawValue();
    const onPublicRoad = formDetails.onPublicRoad;
    if (onPublicRoad) {
      this.formChecks.get('onPrivateRoad').setValue(false);
    }
  }

  onPrivateRoadChange(): void {
    const formDetails = this.formChecks.getRawValue();
    const onPrivateRoad = formDetails.onPrivateRoad;
    if (onPrivateRoad) {
      this.formChecks.get('onPublicRoad').setValue(false);
    }
  }

  onCalloutChange(): void {
    const formDetails = this.formChecks.getRawValue();
    const onCallout = formDetails.onCallout;
    if (onCallout) {
      this.formChecks.get('onStandBy').setValue(false);
    }
  }

  onStandByChange(): void {
    const formDetails = this.formChecks.getRawValue();
    const onStandBy = formDetails.onStandBy;
    if (onStandBy) {
      this.formChecks.get('onCallout').setValue(false);
    }
  }

  isFatal(ledToDeathChecked: boolean) {
    this.ledToDeath = ledToDeathChecked;
    this.formChecks.get('ledToDeath').setValue(this.ledToDeath);
    if (ledToDeathChecked) {
      this.diagnosticGroups.push(this.drgFatal);
      this.disableICD();
      const benefit = this.benefits.find(b => b.name === this.fatal);
      if(this.diagnosticGroups.length > 0){
        const drg00 = this.diagnosticGroups.find(d => d.code === 'DRG00');
        this.getIcdCategories(drg00.icd10DiagnosticGroupId, false);

        this.form.patchValue({
          benefits: benefit.name,
          diagnostics: drg00.code + ':' + drg00.description,
          diagnosticsNotCapturer: drg00.code + ':' + drg00.description
        });
        this.disableFormControl('diagnostics');
        this.disableFormControl('diagnosticsNotCapturer');

        const causeOfDeathValidators = [Validators.minLength(5), Validators.maxLength(260)];
        const dateOfDeathValidators = [Validators.required, DateValidator.checkIfDateLessThan('dateOfDeath', this.datepipe.transform(this.event.eventDate, Constants.dateString))];
        this.applyValidationToFormControl(this.form, dateOfDeathValidators, 'dateOfDeath');
        this.applyValidationToFormControl(this.form, causeOfDeathValidators, 'causeOfDeath');

        let type = this.severities.find(s => s.id === InjurySeverityTypeEnum.Severe)
        this.form.get('severity').setValue(type.name);
        this.form.get('severity').disable();
        this.form.get('severityNotCapturer').setValue(type.name);
        this.form.get('severityNotCapturer').disable();

      }

    } else {
      const index = this.diagnosticGroups.indexOf(this.drgFatal);
      this.diagnosticGroups.splice(index, 1);

      this.form.patchValue({
        dateOfDeath: null,
        certificateNumber: null,
        causeOfDeath: null,
      });
      this.disableICD();
      this.enableFormControl('diagnostics');
      this.enableFormControl('diagnosticsNotCapturer');
      this.enableFormControl('benefits');
      this.clearValidationToFormControl(this.form, 'dateOfDeath');
      this.clearValidationToFormControl(this.form, 'certificateNumber');
      this.clearValidationToFormControl(this.form, 'causeOfDeath');

      this.form.get('severity').setValue(null);
      this.form.get('severity').enable();
      this.form.get('severityNotCapturer').setValue(null);
      this.form.get('severityNotCapturer').enable();
    }
  }

  disableICD() {
    this.form.patchValue({
      diagnostics: null,
      diagnosticsNotCapturer: null,
      codeCategory: null,
      subCategory: null,
      icdCode: null,
    });
    this.disableFormControl('codeCategory');
    this.disableFormControl('subCategory');
    this.disableFormControl('icdCode');
  }

  travelTypeChange(value: any, type: string): void {
    switch (type) {
      case 'isBusiness':
        if (value.checked) {
          this.formChecks.get('isTraining').setValue(false);
          this.formChecks.get('toWork').setValue(false);
        }
        break;
      case 'isTraining':
        if (value.checked) {
          this.formChecks.get('isBusiness').setValue(false);
          this.formChecks.get('toWork').setValue(false);
        }
        break;
      case 'toWork':
        if (value.checked) {
          this.formChecks.get('isBusiness').setValue(false);
          this.formChecks.get('isTraining').setValue(false);
        }
        break;
    }

  }

  isRoadAccidentChange($event: any) {
    this.isRoadAccident = $event.checked;
    if (this.isRoadAccident) {
      this.formChecks.get('isAssault').setValue(false);
      this.formChecks.get('isHijack').setValue(false);
    } else {
      this.resetRoadAccidentForm();
    }
  }

  isAssaultChange($event: any) {
    const isAssault = $event.checked;
    if (isAssault) {
      this.formChecks.get('roadAccident').setValue(false);
      this.isRoadAccident = false;
      this.resetRoadAccidentForm();
    }
  }

  isHijackChange($event: any) {
    const isHijack = $event.checked;
    if (isHijack) {
      this.formChecks.get('roadAccident').setValue(false);
      this.isRoadAccident = false;
      this.resetRoadAccidentForm();
    }
  }

  expand() {
    this.isViewMode = !this.isViewMode;
  }

  updatePhysicalDamagesTable() {
    if (this.physicalDamagesTable) {
      this.physicalDamagesTable.renderRows();
    }
    if (this.physicalDamagesDataSource.length < 1) {
      this.hasData = false;
    }
  }

  getBodySide(bodySideId: number): string {
    const statusText = BodySideAffectedTypeEnum[bodySideId];
    return statusText;
  }

  getSeverity(SeverityId: number): string {
    const statusText = InjurySeverityTypeEnum[SeverityId];
    return statusText;
  }

  // Tried not to duplicate the code but the code broke therefore duplicating for now
  generateAutoCompleteSubscriptions() {
    // insuranceTypes
    this.elementKeyUp = fromEvent(this.insuranceTypeElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredInsuranceTypes = this.insuranceTypes;
        return;
      }

      if (this.insuranceTypes.length > 0) {
        this.filteredInsuranceTypes = this.insuranceTypes.filter(option => String.contains(option.code, searchData));
      }
    });

    // claimTypes
    this.elementKeyUp.add(fromEvent(this.claimTypeElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredClaimTypes = this.claimTypes;
        return;
      }

      if (this.claimTypes.length > 0) {
        this.filteredClaimTypes = this.claimTypes.filter(option => String.contains(option.name, searchData));
      }
    }));

    // benefitsDue
    this.elementKeyUp.add(fromEvent(this.benefitDueElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        if (this.claimType && this.claimType.id === ClaimTypeEnum.IODCOID) {
          this.filteredBenefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
        } else { this.filteredBenefits = this.originalBenefitList; }
        return;
      }

      if (this.originalBenefitList.length > 0) {
        this.filteredBenefits = this.originalBenefitList.filter(option => String.contains(option.name, searchData));
      }
    }));

    // Diagnostics
    this.elementKeyUp.add(fromEvent(this.diagnosticElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredDiagnostics = this.diagnosticGroups;
        return;
      }
      this.filteredDiagnostics = this.diagnosticGroups.filter(option => String.contains(option.code, searchData));
    }));

    // DiagnosticsCapturer
    this.elementKeyUp.add(fromEvent(this.diagnosticCapturerElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredDiagnostics = this.diagnosticGroups;
        return;
      }
      this.filteredDiagnostics = this.diagnosticGroups.filter(option => String.contains(option.code, searchData));
    }));

    // Severity
    this.elementKeyUp.add(fromEvent(this.severityElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredSeverities = this.severities;
        return;
      }
      this.filteredSeverities = this.severities.filter(option => String.contains(option.name, searchData));
    }));

    // SeverityCapturer
    this.elementKeyUp.add(fromEvent(this.severityCapturerElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredSeverities = this.severities;
        return;
      }
      this.filteredSeverities = this.severities.filter(option => String.contains(option.name, searchData));
    }));

    // bodySide
    this.elementKeyUp.add(fromEvent(this.bodySideElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredBodySides = this.bodySides;
        return;
      }
      this.filteredBodySides = this.bodySides.filter(option => String.contains(option.name, searchData));
    }));

    // bodySide Capturer
    this.elementKeyUp.add(fromEvent(this.bodySideCapturerElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredBodySides = this.bodySides;
        return;
      }
      this.filteredBodySides = this.bodySides.filter(option => String.contains(option.name, searchData));
    }));


    // category
    this.elementKeyUp.add(fromEvent(this.icdCategoriesElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredIcdCategories = this.icdCategories;
        return;
      }
      this.filteredIcdCategories = this.icdCategories.filter(option => String.contains(option.icd10CategoryCode, searchData));
    }));

    // sub-Category
    this.elementKeyUp.add(fromEvent(this.icdSubCategoriesElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredIcdSubCategories = this.icdSubCategories;
        return;
      }
      this.filteredIcdSubCategories = this.icdSubCategories.filter(option => String.contains(option.icd10SubCategoryCode, searchData));
    }));

    // code
    this.elementKeyUp.add(fromEvent(this.icdCodeElement.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.filteredIcdCodes = this.icdCodes;
        return;
      }
      this.filteredIcdCodes = this.icdCodes.filter(option => String.contains(option.icd10Code, searchData));
    }));
  }

  prePopulateAutocomplete(nativeElement, options: any[], control: AbstractControl): void {
    const option = options.find(option => option.id === control.value);
    if (control.disabled) {
      nativeElement.disabled = true;
    }
    nativeElement.value = option ? option.name : '';
    this.changeDedectorRef.detectChanges();
  }
}

