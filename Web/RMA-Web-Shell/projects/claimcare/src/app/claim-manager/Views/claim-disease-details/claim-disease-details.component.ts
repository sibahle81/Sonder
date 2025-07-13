import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '../../../constants';
import { ClaimCareService } from '../../Services/claimcare.service';
import { DiseaseType } from '../../shared/entities/diseaseType';
import { EventCause } from '../../shared/entities/eventCause';
import { ICD10CodeEntity } from '../../shared/entities/icd10-code-model';
import { Injury } from '../../shared/entities/injury';
import { ParentInsuranceType } from '../../shared/entities/parentInsuranceType';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { PhysicalDamage } from '../../shared/entities/physical-damage';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { RolePlayerBenefitWaitingPeriodEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/roleplayer-benefit-waiting-period.enum';
import { DatePipe } from '@angular/common';
import { PersonEventDiseaseDetailModel } from '../../shared/entities/personEvent/personEventDiseaseDetail.model';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';

@Component({
  selector: 'claim-disease-details',
  templateUrl: './claim-disease-details.component.html',
  styleUrls: ['./claim-disease-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ClaimDiseaseDetailsComponent implements OnChanges {

  @Input() event: EventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;
  startDate = new Date();
  hideForm = true;
  currentUser: string;

  isValid = false;
  hasDiagnostic = false;
  hasPermission = true;

  isViewMode: boolean;

  member: RolePlayer;
  subsidiaries: Company[] = [];
  insuranceTypes: ParentInsuranceType[] = [];
  typeOfDiseases: DiseaseType[] = [];
  causeOfDiseases: EventCause[] = [];
  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  icdCategories: ICD10Category[] = [];
  icdSubCategories: ICD10SubCategory[] = [];
  physicalDamages: PhysicalDamage[] = [];
  injuries: Injury[] = [];
  icdCodes: ICD10Code[] = [];
  severities: Lookup[] = [];
  viewClaimantDetails: boolean;
  damage = new PhysicalDamage();
  injury = new Injury();
  drg = 0;

  maxDate = new Date();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly memberService: MemberService,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly authService: AuthService,
    public dialog: MatDialog,
    public readonly datePipeService: DatePipe,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event) { return; }
    this.getLookups();
    this.currentUser = this.authService.getUserEmail().toLowerCase();
  }

  createForm() {
    this.form = this.formBuilder.group({
      memberName: [{ value: '', disabled: true }],
      memberSite: [{ value: '', disabled: true }, Validators.required],
      insuranceType: [{ value: '', disabled: true }, Validators.required],
      typeOfDisease: [{ value: '', disabled: true }, Validators.required],
      causeOfDisease: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: this.isReadOnly }, [Validators.required, Validators.maxLength(50)]],
      dateDiagnosis: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      briefDescription: [{ value: '', disabled: this.isReadOnly }, Validators.maxLength(50)],
      icdCategory: [{ value: '', disabled: true }, Validators.required],
      icdSubCategory: [{ value: '', disabled: true }, Validators.required],
      icdCode: [{ value: '', disabled: true }, Validators.required],
      severity: [{ value: '', disabled: true }, Validators.required],
      diagnosticGroup: [{ value: '', disabled: true }, Validators.required],
      medicalBenefit: [{ value: '', disabled: true }],
    });

    this.patchForm();
  }

  readForm() {
    const formDetails = this.form.getRawValue();
    const startDateString = this.datePipeService.transform(formDetails.dateDiagnosis, Constants.dateString);
    const dateDiagnosis = new Date(startDateString);
    this.event.memberSiteId = this.member.rolePlayerId ? this.member.rolePlayerId : 0;
    this.event.description = formDetails.description;
    this.event.dateAdvised = dateDiagnosis.getCorrectUCTDate();
    this.event.eventDate = dateDiagnosis.getCorrectUCTDate();
    this.event.createdDate = new Date();
    this.event.modifiedDate = new Date();
    this.event.createdBy = this.currentUser;
    this.event.modifiedBy = this.currentUser;
    this.event.numberOfInjuredEmployees = +1;

    this.event.personEvents[0].eventType = EventTypeEnum.Disease;
    this.event.personEvents[0].dateCaptured = new Date();
    this.event.personEvents[0].dateReceived = new Date();
    this.event.personEvents[0].createdBy = this.currentUser;
    this.event.personEvents[0].createdDate = new Date();
    this.event.personEvents[0].modifiedDate = new Date();
    this.event.personEvents[0].modifiedBy = this.currentUser;
    this.event.personEvents[0].insuranceTypeId = formDetails.insuranceType;
    this.event.personEvents[0].claimType = ClaimTypeEnum.COIDDisease;

    this.event.personEvents[0].personEventDiseaseDetail = this.event.personEvents[0].personEventDiseaseDetail ? this.event.personEvents[0].personEventDiseaseDetail : new PersonEventDiseaseDetailModel();
    this.event.personEvents[0].personEventDiseaseDetail.personEventId = +this.event.personEvents[0].personEventId;
    this.event.personEvents[0].personEventDiseaseDetail.typeOfDisease = formDetails.typeOfDisease;
    this.event.personEvents[0].personEventDiseaseDetail.causeOfDiseaseId = formDetails.causeOfDisease;
    this.event.personEvents[0].personEventDiseaseDetail.natureOfDisease = formDetails.description;
    this.event.personEvents[0].personEventDiseaseDetail.dateDiagnosis = dateDiagnosis;

    this.event.personEvents[0].physicalDamages = this.event.personEvents[0].physicalDamages ? this.event.personEvents[0].physicalDamages : [new PhysicalDamage()];
    this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId = formDetails.diagnosticGroup;
    this.event.personEvents[0].physicalDamages[0].icdCategoryId = formDetails.icdCategory;
    this.event.personEvents[0].physicalDamages[0].icdSubCategoryId = formDetails.icdSubCategory;
    this.event.personEvents[0].physicalDamages[0].description = formDetails.briefDescription;
    this.event.personEvents[0].physicalDamages[0].createdBy = this.currentUser;
    this.event.personEvents[0].physicalDamages[0].createdDate = new Date();
    this.event.personEvents[0].physicalDamages[0].modifiedDate = new Date();
    this.event.personEvents[0].physicalDamages[0].modifiedBy = this.currentUser;

    this.event.personEvents[0].physicalDamages[0].injuries = this.event.personEvents[0].physicalDamages[0].injuries ? this.event.personEvents[0].physicalDamages[0].injuries : [new Injury()];
    this.event.personEvents[0].physicalDamages[0].injuries[0].injurySeverityType = formDetails.severity;
    this.event.personEvents[0].physicalDamages[0].injuries[0].icd10CodeId = formDetails.icdCode;
    this.event.personEvents[0].physicalDamages[0].injuries[0].createdBy = this.currentUser;
    this.event.personEvents[0].physicalDamages[0].injuries[0].createdDate = new Date();
    this.event.personEvents[0].physicalDamages[0].injuries[0].modifiedDate = new Date();
    this.event.personEvents[0].physicalDamages[0].injuries[0].modifiedBy = this.currentUser;
    this.event.personEvents[0].physicalDamages[0].injuries[0].icd10DiagnosticGroupId = formDetails.diagnosticGroup;
    this.event.personEvents[0].physicalDamages[0].injuries[0].icdCategoryId = formDetails.icdCategory;
    this.event.personEvents[0].physicalDamages[0].injuries[0].icdSubCategoryId = formDetails.icdSubCategory;

    if (this.event.personEvents[0].eventType === EventTypeEnum.Disease 
        && this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId == Constants.ICD10CodeDiseaseFatalDRG) {
      this.event.personEvents[0].isFatal = true;
    } else {
      this.event.personEvents[0].isFatal = false;
    }

    this.isSaving$.next(false);
  }

  patchForm() {
    if (this.event && this.event.personEvents) {
      this.form.patchValue({
        memberSite: this.event.memberSiteId,
        insuranceType: this.event.personEvents[0].insuranceTypeId ? this.event.personEvents[0].insuranceTypeId : null,
        typeOfDisease: this.event.personEvents[0].personEventDiseaseDetail?.typeOfDisease ? this.event.personEvents[0].personEventDiseaseDetail?.typeOfDisease : null,
        causeOfDisease: this.event.personEvents[0].personEventDiseaseDetail?.causeOfDiseaseId ? this.event.personEvents[0].personEventDiseaseDetail?.causeOfDiseaseId : null,
        description: this.event.description,
        dateDiagnosis: this.event.personEvents[0].personEventDiseaseDetail?.dateDiagnosis ? this.event.personEvents[0].personEventDiseaseDetail?.dateDiagnosis : null,
        briefDescription: this.event.personEvents[0].physicalDamages ? this.event.personEvents[0].physicalDamages[0].description : null,
        icdCategory: this.event.personEvents[0].physicalDamages ? this.event.personEvents[0].physicalDamages[0].icdCategoryId : null,
        icdSubCategory: this.event.personEvents[0].physicalDamages ? this.event.personEvents[0].physicalDamages[0].icdSubCategoryId : null,
        icdCode: this.event.personEvents[0].physicalDamages && this.event.personEvents[0].physicalDamages[0].injuries[0].icd10CodeId > 0 ? this.event.personEvents[0].physicalDamages[0].injuries[0].icd10CodeId : null,
        severity: this.event.personEvents[0].physicalDamages ? this.event.personEvents[0].physicalDamages[0].injuries[0].injurySeverityType : null,
        diagnosticGroup: this.event.personEvents[0].physicalDamages ? this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId : null,
      });

      this.checkValid();
    }

    if (this.event.personEvents && this.event.personEvents[0].physicalDamages) {

      if (this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId > 0) {
        this.getIcdCategories(this.event.personEvents[0].physicalDamages[0].icd10DiagnosticGroupId);
      }
      if (this.event.personEvents[0].physicalDamages[0].icdCategoryId > 0) {
        this.getIcdSubCategories(this.event.personEvents[0].physicalDamages[0].icdCategoryId);
      }
      if (this.event.personEvents[0].physicalDamages[0].icdSubCategoryId > 0) {
        this.getIcdCodes(this.event.personEvents[0].physicalDamages[0].icdSubCategoryId);
      }
    }

    if (this.event.personEvents && this.event.personEvents[0].personEventDiseaseDetail) {
      if (this.event.personEvents[0].insuranceTypeId > 0) {
        this.getTypeOfDiseases(this.event.personEvents[0].insuranceTypeId);
      }
      if (this.event.personEvents[0].personEventDiseaseDetail.typeOfDisease > 0) {
        this.getCausesOfDisease(this.event.personEvents[0].personEventDiseaseDetail.typeOfDisease);
      }
    }

    this.setMember(this.event.companyRolePlayer);
  }

  setMember(member: RolePlayer) {
    this.member = member;
    this.form.patchValue({
      memberName: member.company.name,
      medicalBenefit: this.getRolePlayerMemberBenefitDetails(member.rolePlayerBenefitWaitingPeriod)
    });
    this.getSubsidiaries();
  }

  getRolePlayerMemberBenefitDetails(rolePlayerBenefitWaitingPeriod: RolePlayerBenefitWaitingPeriodEnum): string {
    if (!rolePlayerBenefitWaitingPeriod)
      return 'No Medical Waiting Period Defined';
    return this.format(RolePlayerBenefitWaitingPeriodEnum[rolePlayerBenefitWaitingPeriod]);
  }

  getSubsidiaries() {
    this.memberService.getSubsidiaries(this.event.memberSiteId).subscribe(result => {
      if (result.length > 0) {
        this.subsidiaries = result;
      } else {
        this.subsidiaries = [];
        this.subsidiaries.push(this.member.company);
      }
      this.isLoading$.next(false);
    });
  }

  getLookups() {
    this.getInsuranceTypes();
  }

  getInsuranceTypes() {
    this.claimService.getInsuranceTypesByEventTypeId(EventTypeEnum.Disease).subscribe(insuranceTypes => {
      this.insuranceTypes = insuranceTypes;
      this.getDiagnosticGroupsByEventTypeId(EventTypeEnum.Disease);
    });
  }

  getTypeOfDiseases(insuranceTypeId: number) {
    this.claimService.getTypeOfDiseasesByInsuranceTypeId(insuranceTypeId).subscribe(types => {
      this.typeOfDiseases = types;
    });
  }

  getCausesOfDisease(diseaseTypeId: number) {
    this.claimService.getCausesOfDiseases(diseaseTypeId).subscribe(causes => {
      this.causeOfDiseases = causes;
    });
  }

  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    this.medicalService.getICD10DiagonosticGroupsByEventType(eventType).subscribe(groups => {
      this.diagnosticGroups = groups;
      this.getSeverities();
    });
  }

  getIcdCategories(icd10DiagnosticGroupId: number) {
    this.drg = icd10DiagnosticGroupId;
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;
    this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
    });
  }

  getIcdSubCategories(icdCategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10CategoryId = icdCategoryId;
    this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
    });
  }

  getIcdCodes(subcategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10SubCategoryId = subcategoryId;
    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
    });
  }

  getSeverities() {
    this.lookupService.getInjurySeverities().subscribe(severities => {
      this.severities = severities;

      if (this.isWizard) {
        this.isViewMode = true;
        this.viewClaimantDetails = true;
      }

      this.createForm();

      if (this.isWizard) {
        this.edit();
      }

      this.isLoading$.next(false);
    });
  }

  // Dropdown events
  drgChanged($event: any) {
    this.getIcdCategories($event.value);
    this.hasDiagnostic = true;
    this.enableFormControl('icdCategory');
  }

  categoryChanged($event: any) {
    this.getIcdSubCategories($event.value);
    this.enableFormControl('icdSubCategory');
  }

  subCategoryChanged($event: any) {
    if ($event) {
      this.getIcdCodes($event.value);
      this.enableFormControl('icdCode');
    }
  }

  insuranceTypeChange($event: any) {
    if ($event) {
      this.getTypeOfDiseases($event.value);
      this.enableFormControl('typeOfDisease');
    }
  }

  diseaseTypeChange($event: any) {
    if ($event) {
      this.getCausesOfDisease($event.value);
      this.enableFormControl('causeOfDisease');
    }
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  cancel() {
    this.reset();
    this.resetForm();
    this.patchForm();
  }

  reset() {
  }

  view() {
    this.isViewMode = !this.isViewMode;
    this.viewClaimantDetails = !this.viewClaimantDetails;
  }

  edit() {
    this.isReadOnly = false;
    this.form.enable();
    this.form.controls.memberName.disable();
    this.form.controls.typeOfDisease.disable();
    this.form.controls.causeOfDisease.disable();
    this.form.controls.icdCategory.disable();
    this.form.controls.icdSubCategory.disable();
    this.form.controls.icdCode.disable();
    this.form.controls.medicalBenefit.disable();

    if (this.event.personEvents[0]?.physicalDamages) {
      if (this.event.personEvents[0]?.physicalDamages[0]?.icd10DiagnosticGroupId > 0) {
        this.enableFormControl('icdCategory');
      }
      if (this.event.personEvents[0]?.physicalDamages[0]?.icdCategoryId > 0) {
        this.enableFormControl('icdSubCategory');
      }
      if (this.event.personEvents[0]?.physicalDamages[0]?.icdSubCategoryId > 0) {
        this.enableFormControl('icdCode');
      }
      if (this.event.personEvents[0]?.personEventDiseaseDetail?.typeOfDisease > 0) {
        this.enableFormControl('typeOfDisease');
      }
      if (this.event.personEvents[0]?.personEventDiseaseDetail?.causeOfDiseaseId > 0) {
        this.enableFormControl('causeOfDisease');
      }
    }
  }

  resetForm() {
    this.isReadOnly = true;
    this.form.disable();
  }

  save() {
    this.isSaving$.next(true);
    this.readForm();
    this.resetForm();
    this.checkValid();
  }

  checkValid() {
    const invalid = [];
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    this.isValidEmit.emit(invalid.length <= 0);
  }

  format(text: string) {
    if (text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }
}
