import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ClaimItemTypeEnum, ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { InjuryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/injury-status-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { PersonEventAccidentDetail } from '../../../../entities/funeral/person-event-accident-detail';
import { Injury } from '../../../../entities/injury';
import { ParentInsuranceType } from '../../../../entities/parentInsuranceType';
import { ClaimBucketClassModel } from '../../../../entities/personEvent/claimBucketClass.model';
import { PhysicalDamage } from '../../../../entities/physical-damage';
import { InjurySeverityTypeEnum } from '../../../../enums/injury-severity-type-enum';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { Constants } from 'projects/claimcare/src/app/constants';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { DeathTypeEnum } from '../../../../enums/deathType.enum';
import { PersonEventDeathDetailModel } from '../../../../entities/personEvent/personEventDeathDetail.model';

@Component({
  selector: 'holistic-accident-details',
  templateUrl: './holistic-accident-details.component.html',
  styleUrls: ['./holistic-accident-details.component.css']
})
export class HolisticAccidentDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() eventType: EventTypeEnum;
  @Input() eventDate: Date;
  @Input() icd10List = [];
  @Input() deathDetailsValid = new BehaviorSubject(false);

  @Output() showEmployeeList = new EventEmitter<boolean>();
  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isClaimTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDiagnosticLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  injuries: Injury[] = [];
  severities: Lookup[] = [];
  bodySides: Lookup[] = [];
  viewMode = ModeEnum.View;

  insuranceTypes: ParentInsuranceType[] = [];
  filteredInsuranceTypes: ParentInsuranceType[];

  claimTypes: Lookup[] = [];
  filteredClaimTypes: Lookup[];

  benefits: ClaimBucketClassModel[];
  filteredBenefits: ClaimBucketClassModel[];

  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  filteredDiagnostics: ICD10DiagnosticGroup[];

  filteredSeverities: Lookup[];
  filteredBodySides: Lookup[];

  claimType: Lookup;
  fatal = 'Fatals';
  currentUser: string;
  isStatutory = false;
  noPhysicalDataDetected = false;
  maxDate = new Date();
  user: User;
  drg = 0;
  drgFatal: ICD10DiagnosticGroup;

  originalBenefitList: ClaimBucketClassModel[];
  viewInsuranceDetails: boolean;
  physicalDamages: PhysicalDamage[] = [];
  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;
  selectedIcd10List: any[];
  ccaPermission = 'Cca Pool';
  scaPermission = 'Sca Pool';
  ledToDeath = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly authService: AuthService,
    public readonly datePipService: DatePipe,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.user = this.authService.getCurrentUser();
    this.currentUser = this.authService.getUserEmail().toLowerCase();
    this.createForm();
    if (this.icd10List?.length > 0) {
      this.selectedIcd10List = this.icd10List;
    }
    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0]?.icd10DiagnosticGroupId > 0) {
      this.getLookups();
    } else {
      this.noPhysicalDataDetected = true;
      this.isLoading$.next(false);
    }
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      insuranceType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateNotified: [{ value: '', disabled: this.isReadOnly }, [Validators.required, DateValidator.checkIfDateLessThan('dateNotified', this.datePipService.transform(this.eventDate, Constants.dateString))]],
      claimType: [{ value: '', disabled: true }, Validators.required],
      benefits: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      diagnostics: [{ value: '', disabled: this.isReadOnly }],
      injuryDescription: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      severity: [{ value: '', disabled: this.isReadOnly }],
      bodySide: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateOfDeath: [{ value: '', disabled: this.isReadOnly }],
      certificateNumber: [{ value: '', disabled: this.isReadOnly }],
      causeOfDeath: [{ value: '', disabled: this.isReadOnly }]
    });

    if (this.isWizard && !this.isReadOnly) {
      this.editDetails();
    }
  }

  editForm() {
    this.form.enable();
    this.isReadOnly = false;
    this.isDead(this.selectedPersonEvent.personEventDeathDetail ? true : false)
  }

  editOpen(): void {
    this.isReadOnly = false;
    this.form.enable();
  }

  CheckInsuranceType($event: any) {
    const insuranceType = this.insuranceTypes.find(i => i.code === $event.value);
    if (insuranceType === undefined) {
      this.form.get('insuranceType').setValue('');
      this.filteredInsuranceTypes = this.insuranceTypes;
    } else { this.getClaimTypes(insuranceType.parentInsuranceTypeId, true); }
  }

  checkClaimType($event: any) {
    this.claimType = undefined;
    this.claimType = this.claimTypes.find(c => c.name === $event.value);
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
  }

  checkBenefits($event: any) {
    let benefit = this.benefits.find(d => d.name === $event.value);
    if (benefit === undefined) {
      this.form.get('benefits').setValue('');
      this.setBenefit(benefit);
    } else {
      if (benefit.name === this.fatal) {
        this.isFatal(true);
      } else {
        this.isFatal(false);
      }
      this.setSeverityOfInjury(benefit);
    }
  }

  setBenefit(benefit: ClaimBucketClassModel) {
    if (this.claimType && this.claimType.id === ClaimTypeEnum.IODCOID) {
      this.benefits = this.benefits.filter(a => a.productClass === ProductClassEnum.Statutory);
      this.filteredBenefits = this.benefits;
      this.isStatutory = true;
    } else {
      this.benefits = this.originalBenefitList;
      this.filteredBenefits = this.originalBenefitList;
      this.isStatutory = false;
    }
  }

  setSeverityOfInjury(benefit: ClaimBucketClassModel) {
    if (benefit.injurySeverityType > 0) {
      let type = this.severities.find(s => s.id === benefit.injurySeverityType)
      this.form.controls.severity.setValue(type.name);
      this.form.get('severity').disable();
    } else {
      this.form.get('severity').setValue(null);
      this.form.get('severity').enable();
    }
  }

  checkDiagnostic($event: any) {
    let diagValue = null;
    if ($event.value !== null) {
      diagValue = this.diagnosticGroups.find(d => $event.value.includes(d.code));
      if (diagValue === undefined) {
        this.form.controls.diagnostics.setValue('');
        this.filteredDiagnostics = this.diagnosticGroups;
      } else {
        this.form.patchValue({
          diagnostics: diagValue.code
        })
      }
    }
  }

  checkSeverity($event: any) {
    let severity = this.severities.find(d => d.name === $event.value);
    if (severity === undefined) {
      this.form.get('severity').setValue('');
      this.filteredSeverities = this.severities;
    }
  }

  CheckBodySide($event: any) {
    let bodySide = this.bodySides.find(d => d.name === $event.value);
    if (bodySide === undefined) {
      this.form.get('bodySide').setValue('');
      this.filteredBodySides = this.bodySides;
    }
  }

  onInsuranceTypeKey(value) {
    this.filteredInsuranceTypes = this.dropDownSearch(value, 'insuranceType');
  }

  onClaimTypeKey(value) {
    this.filteredClaimTypes = this.dropDownSearch(value, 'claimType');
  }

  onBenefitsKey(value) {
    this.filteredBenefits = this.dropDownSearch(value, 'benefits');
  }

  onDiagnosticKey(value) {
    this.filteredDiagnostics = this.dropDownSearch(value, 'diagnostics');
  }

  onSeverityKey(value) {
    this.filteredSeverities = this.dropDownSearch(value, 'severity');
  }

  onBodySideKey(value) {
    this.filteredBodySides = this.dropDownSearch(value, 'bodySide');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();
    switch (name) {
      case 'insuranceType':
        return this.setData(filter, this.filteredInsuranceTypes, this.insuranceTypes, 'code');
      case 'claimType':
        return this.setData(filter, this.filteredClaimTypes, this.claimTypes, 'name');
      case 'benefits':
        return this.setData(filter, this.filteredBenefits, this.claimTypes, 'name');
      case 'diagnostics':
        return this.setData(filter, this.filteredDiagnostics, this.diagnosticGroups, 'code');
      case 'severity':
        return this.setData(filter, this.filteredSeverities, this.severities, 'name');
      case 'bodySide':
        return this.setData(filter, this.filteredBodySides, this.bodySides, 'name');
      default: break;
    }
  }

  setData(filter: string, filteredList: any, originalList: any, type: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      if (type === 'code') {
        return filteredList.filter(option => option.code.toLocaleLowerCase().includes(filter));
      }
      if (type === 'name') {
        return filteredList.filter(option => option.name.toLocaleLowerCase().includes(filter));
      }
    }
  }

  readForm(): PersonEventModel {
    if (this.selectedPersonEvent) {
      const formDetails = this.form.getRawValue();
      let diagnosticGroup = this.diagnosticGroups.find(d => (formDetails.diagnostics as string).includes(d.code));
      let severity = this.severities.find(d => d.name === formDetails.severity);

      this.selectedPersonEvent.personEventAccidentDetail = this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail : new PersonEventAccidentDetail();
      this.selectedPersonEvent.physicalDamages = this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages : this.physicalDamages;
      this.selectedPersonEvent.insuranceTypeId = this.insuranceTypes.find(i => i.code === formDetails.insuranceType).parentInsuranceTypeId;
      this.selectedPersonEvent.dateCaptured = formDetails.dateNotified;
      this.selectedPersonEvent.claimType = this.claimTypes.find(c => c.name === formDetails.claimType).id;
      this.selectedPersonEvent.personEventBucketClassId = this.benefits.find(b => b.name === formDetails.benefits).claimBucketClassId;
      this.selectedPersonEvent.dateReceived = formDetails.dateNotified;
      this.selectedPersonEvent.createdBy = this.currentUser;
      this.selectedPersonEvent.createdDate = new Date();
      this.selectedPersonEvent.modifiedDate = new Date();
      this.selectedPersonEvent.modifiedBy = this.currentUser;

      this.selectedPersonEvent.physicalDamages[0].description = formDetails.injuryDescription;
      this.selectedPersonEvent.physicalDamages[0].createdBy = this.currentUser;
      this.selectedPersonEvent.physicalDamages[0].createdDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].modifiedDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].modifiedBy = this.currentUser;
      this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId = diagnosticGroup.icd10DiagnosticGroupId;
      this.filteredDiagnostics = this.diagnosticGroups;

      this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType = severity.id;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].bodySideAffectedType = this.bodySides.find(b => b.name === formDetails.bodySide).id;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].injuryStatus = InjuryStatusEnum.NotValidated;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].createdBy = this.currentUser;
      this.selectedPersonEvent.physicalDamages[0].injuries[0].createdDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].injuries[0].modifiedDate = new Date();
      this.selectedPersonEvent.physicalDamages[0].injuries[0].modifiedBy = this.currentUser;

         // Death Details
         if (this.ledToDeath) {
          this.selectedPersonEvent.personEventDeathDetail = this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail : new PersonEventDeathDetailModel();
          this.selectedPersonEvent.personEventDeathDetail.deathDate = new Date(formDetails.dateOfDeath).getCorrectUCTDate();
          this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo = formDetails.certificateNumber;
          this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription = formDetails.causeOfDeath;
          this.selectedPersonEvent.personEventDeathDetail.deathType = DeathTypeEnum.Natural;
          this.selectedPersonEvent.isFatal = true;
        }
      return this.selectedPersonEvent;
    }
  }

  patchForm() {
    if (this.selectedPersonEvent) {
      this.patchFormControls();
    }
  }

  patchFormControls() {
    let diag = null;
    if (this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0]?.icd10DiagnosticGroupId > 0) {
      let diagnostic = this.diagnosticGroups.find(d => d.icd10DiagnosticGroupId === this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId);
      diag = diagnostic.code;
    }
    let bodySide = this.selectedPersonEvent.physicalDamages ? this.bodySides.find(b => b.id === this.selectedPersonEvent.physicalDamages[0]?.injuries[0]?.bodySideAffectedType).name : null;
    let insuranceType = this.insuranceTypes.find(i => i.parentInsuranceTypeId === this.selectedPersonEvent.insuranceTypeId).code;
    let benefits = this.benefits.find(b => b.claimBucketClassId === this.selectedPersonEvent.personEventBucketClassId).name;
    const claimType = this.claimTypes.find(c => c.id === this.selectedPersonEvent.claimType);

    this.form.patchValue({
      insuranceType: insuranceType,
      dateNotified: this.selectedPersonEvent.dateCaptured ? this.selectedPersonEvent.dateCaptured : new Date(),
      claimType: claimType ? claimType.name : this.form.controls.claimType.reset(),
      benefits: benefits,
      diagnostics: diag ? diag : null,
      injuryDescription: this.selectedPersonEvent.physicalDamages[0].description,
      severity: this.selectedPersonEvent.physicalDamages ? this.severities.find(d => d.id === this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType).name : null,
      bodySide: bodySide,
      dateOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathDate : null,
      certificateNumber: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo : null,
      causeOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription : null,
    });

    if (this.selectedPersonEvent.insuranceTypeId) {
      this.getClaimTypes(this.selectedPersonEvent.insuranceTypeId, false);
    }

    if (this.selectedPersonEvent.personEventDeathDetail) {
      this.ledToDeath = true;
    }
  }

  getClaimTypes(insuranceType: number, enable: boolean) {
    this.isClaimTypeLoading$.next(true);
    this.lookupService.getClaimTypesByEventAndParentInsuranceType(this.eventType, insuranceType).subscribe(claimTypes => {
      this.claimTypes = claimTypes;
      this.filteredClaimTypes = claimTypes;
      this.isClaimTypeLoading$.next(false);

      if (enable) { this.form.controls.claimType.enable(); }
    });
  }

  viewInsuranceDetail(personEvent: PersonEventModel) {
    this.viewInsuranceDetails = true;
    this.selectedPersonEvent = personEvent;
  }

  resetForm() {
    this.form.disable();
  }

  resetRoadAccidentForm() {
    this.form.controls.isBusiness.reset();
    this.form.controls.isTraining.reset();
    this.form.controls.toWork.reset();
    this.form.controls.onCallout.reset();
    this.form.controls.onStandBy.reset();
    this.form.controls.onPublicRoad.reset();
    this.form.controls.onPrivateRoad.reset();
    this.form.controls.vehicleMake.reset();
    this.form.controls.vehicleRegistration.reset();
    this.form.controls.otherVehicleMake.reset();
    this.form.controls.otherVehicleRegistration.reset();
    this.form.controls.policeReference.reset();
    this.form.controls.policeStationName.reset();
  }

  getLookups() {
    if (this.selectedPersonEvent.insuranceTypeId) {
      this.getClaimTypes(this.selectedPersonEvent.insuranceTypeId, false);
    }

    this.isDiagnosticLoading$.next(true);
    forkJoin([
      this.claimService.getInsuranceTypesByEventTypeId(EventTypeEnum.Accident),
      this.medicalService.getICD10DiagonosticGroupsByEventType(EventTypeEnum.Accident),
      this.lookupService.getInjurySeverities(),
      this.lookupService.getBodySides(),
      this.claimService.getClaimBucketClasses(),
    ]).subscribe(
      result => {
        this.insuranceTypes = result[0];
        this.filteredInsuranceTypes = result[0];

        this.diagnosticGroups = result[1];
        this.filteredDiagnostics = result[1];
        this.drgFatal = this.diagnosticGroups.find(d => d.code === 'DRG00');

        this.severities = result[2];
        this.filteredSeverities = result[2];

        this.bodySides = result[3];
        this.filteredBodySides = result[3];

        this.benefits = result[4];
        this.originalBenefitList = result[4];
        this.filteredBenefits = result[4];

        this.isDiagnosticLoading$.next(false);
        this.isLoading$.next(false);

        this.patchForm();
      }
    );
  }

  isDead(isDead: boolean) {
    this.isFatal(isDead);
    if (isDead) {
      this.disableFormControl('benefits');
    } else {
      this.enableFormControl('benefits');
    }
  }

  reset() {
    this.isReadOnly = true;
    this.form.disable();
  }

  cancel() {
    this.reset();
  }

  save() {
    this.isLoading$.next(true);
    const details = this.readForm();
    this.selectedPersonEvent = details;

    if (details && details !== undefined) {
      this.claimService.updatePersonEvent(details).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        this.reset();
        this.isLoading$.next(false);
      });
    }
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    } else {
      this.form.get(controlName).disable();
    }
  }

  enableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).enable();
    } else {
      this.form.get(controlName).enable();
    }
  }

  disableICD() {
    this.form.patchValue({
      diagnostics: null,
    });
  }

  editDetails() {
    this.form.enable();
    this.isReadOnly = false;
    this.form.controls.claimType.disable();
  }

  isFatal(ledToDeathChecked: boolean) {
    this.ledToDeath = ledToDeathChecked;
   
    if (ledToDeathChecked) {
      this.diagnosticGroups.push(this.drgFatal);
      this.disableICD();
      const benefit = this.benefits.find(b => b.name === this.fatal);
      if (this.diagnosticGroups.length > 0) {
        const drg00 = this.diagnosticGroups.find(d => d.code === 'DRG00');
        this.form.patchValue({
          benefits: benefit.name,
          diagnostics: drg00.code,
        });
        this.disableFormControl('diagnostics');

        let type = this.severities.find(s => s.id === InjurySeverityTypeEnum.Severe)
        this.form.patchValue({
          severity: type.name,
        });
        this.form.get('severity').disable();
      }
    }
  }

  refresh($event: boolean) {
    this.patchForm();
  }

  openAuditDialog(selectedPersonEvent: PersonEventModel) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.PersonEvent,
        itemId: selectedPersonEvent.personEventId,
        heading: 'Accident Details Audit',
        propertiesToDisplay: ['ClaimType', 'PersonEventBucketClassId', 'InsuranceTypeId', 'IsSpectacles', 'IsDentures', 'IsAssault',
          'IsOccurAtNormalWorkplace', 'IsOccurPerformingScopeofDuty', 'IsRoadAccident', 'IsOnBusinessTravel', 'IsTrainingTravel', 'IsTravelToFromWork',
          'IsOnCallout', 'IsOnStandby', 'IsPublicRoad', 'IsPrivateRoad', 'VehicleMake', 'VehicleRegNo', 'ThirdPartyVehicleMake', 'ThirdPartyVahicleRegNo',
          'PoliceReferenceNo', 'PoliceStationName']
      }
    });
  }

  hasEditPermissions(): boolean {
    if (userUtility.hasPermission(this.ccaPermission)
      || userUtility.hasPermission(this.scaPermission)) {
      return true;
    }
    else {
      return false;
    }
  }
}
