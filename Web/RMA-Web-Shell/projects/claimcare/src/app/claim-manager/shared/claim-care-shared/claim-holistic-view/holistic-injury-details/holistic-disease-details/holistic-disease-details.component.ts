import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DatePipe } from '@angular/common';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { takeUntil } from 'rxjs/operators';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { ICD10Category } from 'projects/medicare/src/app/medi-manager/models/icd10-category';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { EventCause } from '../../../../entities/eventCause';
import { ParentInsuranceType } from '../../../../entities/parentInsuranceType';
import { ClaimBucketClassModel } from '../../../../entities/personEvent/claimBucketClass.model';
import { ICD10CodeEntity } from '../../../../entities/icd10-code-model';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { DiseaseType } from '../../../../entities/diseaseType';
import { MatDialog } from '@angular/material/dialog';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { PersonEventDiseaseDetailModel } from '../../../../entities/personEvent/personEventDiseaseDetail.model';

@Component({
  selector: 'holistic-disease-details',
  templateUrl: './holistic-disease-details.component.html',
  styleUrls: ['./holistic-disease-details.component.css']
})
export class HolisticDiseaseDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() eventType: EventTypeEnum;
  @Input() eventDate: Date;
  @Input() icd10List = [];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isDiagnosticLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isClaimTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  viewMode = ModeEnum.View;
  form: UntypedFormGroup;

  causeOfDiseases: EventCause[];
  drgFatal: ICD10DiagnosticGroup;
  typeOfDiseases: DiseaseType[];

  claimTypes: Lookup[] = [];
  filteredBodySides: Lookup[];

  icdCodes: ICD10Code[] = [];
  filteredIcdCodes: ICD10Code[];

  insuranceTypes: ParentInsuranceType[] = [];
  filteredInsuranceTypes: ParentInsuranceType[];

  benefits: ClaimBucketClassModel[];
  filteredBenefits: ClaimBucketClassModel[];

  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  filteredDiagnostics: ICD10DiagnosticGroup[];

  severities: Lookup[] = [];
  filteredSeverities: Lookup[];

  icdCategories: ICD10Category[] = [];
  filteredIcdCategories: ICD10Category[];

  icdSubCategories: ICD10SubCategory[] = [];
  filteredIcdSubCategories: ICD10SubCategory[];
  selectedIcd10List: any[];

  drg = 0;
  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    public readonly datepipe: DatePipe,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    if (this.icd10List?.length > 0) {
      this.selectedIcd10List = this.icd10List;
    }
    this.createForm();
    this.getLookups();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      injuryDescription: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      injuryType: [{ value: '', disabled: this.isReadOnly }],
      dateDiagnosis: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      causeOfDisease: [{ value: '', disabled: this.isReadOnly }],
      diagnosticGroup: [{ value: '', disabled: true }, Validators.required],
      icdCategory: [{ value: '', disabled: true }, Validators.required],
      icdSubCategory: [{ value: '', disabled: true }, Validators.required],
      icdCode: [{ value: '', disabled: true }, Validators.required],
      typeOfDisease: [{ value: '', disabled: true }, Validators.required],
      severity: [{ value: '', disabled: true }, Validators.required],
    });

    if (this.isWizard && !this.isReadOnly) {
      this.editForm();
    }
  }

  editForm() {
    this.form.enable();
    this.isReadOnly = false;
  }

  getCategories() {
    if (this.selectedPersonEvent.physicalDamages) {
      this.getIcdCategories(this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId);
    }
  }

  getLookups() {
    this.getTypeOfDisease();
    this.getCauseOfDisease();
    this.getCategories();
    forkJoin([
      this.medicalService.getICD10DiagonosticGroupsByEventType(EventTypeEnum.Disease),
      this.lookupService.getInjurySeverities(),
      this.claimService.getClaimBucketClasses()
    ]).subscribe(
      result => {
        this.diagnosticGroups = result[0];
        this.filteredDiagnostics = result[0];
        this.drgFatal = this.diagnosticGroups.find(d => d.code === 'DRG00');

        this.severities = result[1];
        this.filteredSeverities = result[1];

        this.benefits = result[2];
        this.filteredBenefits = result[2];

        this.isLoading$.next(false);
        this.patchForm();
      }
    );
  }

  patchForm() {
    this.form.patchValue({
      injuryDescription: this.selectedPersonEvent.physicalDamages[0].description,
      injuryType: this.selectedPersonEvent.personEventBucketClassId > 0 ? this.benefits.find(a => a.claimBucketClassId === this.selectedPersonEvent.personEventBucketClassId).name : null,
      dateDiagnosis: this.selectedPersonEvent.personEventDiseaseDetail ? this.selectedPersonEvent.personEventDiseaseDetail.dateDiagnosis : null,
      severity: this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType : null,
      causeOfDisease: this.selectedPersonEvent.personEventDiseaseDetail ? this.selectedPersonEvent.personEventDiseaseDetail.causeOfDiseaseId : null,
      diagnosticGroup: this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId : null,
    });
  }

  readForm() {
    if (!this.form.valid) { return; }
    const formDetails = this.form.getRawValue();
    const injuryType = this.benefits.find(b => b.name === formDetails.injuryType)?.claimBucketClassId;

    this.selectedPersonEvent.personEventBucketClassId = injuryType ? injuryType : 0;
    this.selectedPersonEvent.insuranceTypeId = formDetails.typeOfDisease != null ? formDetails.typeOfDisease : 0;

    this.selectedPersonEvent.personEventDiseaseDetail = this.selectedPersonEvent.personEventDiseaseDetail ? this.selectedPersonEvent.personEventDiseaseDetail : new PersonEventDiseaseDetailModel();
    this.selectedPersonEvent.personEventDiseaseDetail.dateDiagnosis = formDetails.dateDiagnosis;
    this.selectedPersonEvent.personEventDiseaseDetail.causeOfDiseaseId = formDetails.causeOfDisease != null ? formDetails.causeOfDisease : 0;
    this.selectedPersonEvent.personEventDiseaseDetail.typeOfDisease = formDetails.typeOfDisease;
    this.selectedPersonEvent.personEventDiseaseDetail.causeOfDiseaseId = formDetails.causeOfDisease;

    this.selectedPersonEvent.physicalDamages = this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages : [];
    this.selectedPersonEvent.physicalDamages[0].icdCategoryId = formDetails.icdCategory;
    this.selectedPersonEvent.physicalDamages[0].description = formDetails.injuryDescription;
    this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId = formDetails.icdSubCategory;
    this.selectedPersonEvent.physicalDamages[0].injuries[0].icd10CodeId = formDetails.icdCode;
    this.selectedPersonEvent.physicalDamages[0].icd10DiagnosticGroupId = formDetails.diagnosticGroup;
    this.selectedPersonEvent.physicalDamages[0].injuries[0].injurySeverityType = formDetails.severity;
  }

  diseaseTypeChange($event: any) {
    if ($event) {
      this.getCausesOfDisease($event.value);
      this.enableFormControl('causeOfDisease');
    }
  }

  getCausesOfDisease(diseaseTypeId: number) {
    this.claimService.getCausesOfDiseases(diseaseTypeId).subscribe(causes => {
      this.causeOfDiseases = causes;
    });
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  disableFormControl(controlName: string) {
    if (this.form.controls[controlName]) {
      this.form.get(controlName).disable();
    } else {
      this.form.get(controlName).disable();
    }
  }

  getTypeOfDisease() {
    this.claimService.getTypeOfDiseasesByInsuranceTypeId(this.selectedPersonEvent.insuranceTypeId).subscribe(result => {
      if (result) {
        this.typeOfDiseases = result;
        this.form.patchValue({
          typeOfDisease: this.selectedPersonEvent.personEventDiseaseDetail.typeOfDisease ? this.selectedPersonEvent.personEventDiseaseDetail.typeOfDisease : null,
        });
      }
    });
  }

  getCauseOfDisease() {
    if (this.selectedPersonEvent.personEventDiseaseDetail?.typeOfDisease !== null) {
      this.claimService.getCausesOfDiseases(this.selectedPersonEvent.personEventDiseaseDetail.typeOfDisease).subscribe(result => {
        if (result) {
          this.causeOfDiseases = result;
          this.form.patchValue({
            causeOfDisease: this.selectedPersonEvent.personEventDiseaseDetail.causeOfDiseaseId ? this.selectedPersonEvent.personEventDiseaseDetail.causeOfDiseaseId : null,
          });
        }
      });
    }
  }

  onInsuranceTypeKey(value) {
    this.filteredInsuranceTypes = this.dropDownSearch(value, 'insuranceType');
  }

  onBenefitsKey(value) {
    this.filteredBenefits = this.dropDownSearch(value, 'benefits');
  }

  onDiagnosticKey(value) {
    this.filteredDiagnostics = this.dropDownSearch(value, 'diagnostics');
  }

  onCodeCategoryKey(value) {
    this.filteredIcdCategories = this.dropDownSearch(value, 'codeCategory');
  }

  onSubCategoryKey(value) {
    this.filteredIcdSubCategories = this.dropDownSearch(value, 'subCategory');
  }

  onIcdCodeKey(value) {
    this.filteredIcdCodes = this.dropDownSearch(value, 'icdCode');
  }

  onSeverityKey(value) {
    this.filteredSeverities = this.dropDownSearch(value, 'severity');
  }

  onBodySideKey(value) {
    this.filteredBodySides = this.dropDownSearch(value, 'bodySide');
  }

  onSeverityNotCapturerKey(value) {
    this.filteredSeverities = this.dropDownSearch(value, 'severityNotCapturer');
  }

  onDiagnosticsNotCapturerKey(value) {
    this.filteredDiagnostics = this.dropDownSearch(value, 'diagnosticsNotCapturer');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();
    switch (name) {
      case 'insuranceType':
        return this.setData(filter, this.filteredInsuranceTypes, this.insuranceTypes, 'code');
      default: break;
      case 'benefits':
        return this.setData(filter, this.filteredBenefits, this.claimTypes, 'name');
      case 'diagnostics':
        return this.setData(filter, this.filteredDiagnostics, this.diagnosticGroups, 'code');
      case 'codeCategory':
        return this.setData(filter, this.filteredIcdCategories, this.icdCategories, 'icd10SubCategoryCode');
      case 'subCategory':
        return this.setData(filter, this.filteredIcdSubCategories, this.icdSubCategories, 'icd10CategoryCode');
      case 'icdCode':
        return this.setData(filter, this.filteredIcdCodes, this.icdCodes, 'icd10Code');
      case 'severity':
        return this.setData(filter, this.filteredSeverities, this.severities, 'name');
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
      if (type === 'icd10SubCategoryCode') {
        return filteredList.filter(option => option.icd10SubCategoryCode.toLocaleLowerCase().includes(filter));
      }
      if (type === 'icd10CategoryCode') {
        return filteredList.filter(option => option.icd10CategoryCode.toLocaleLowerCase().includes(filter));
      }
      if (type === 'icd10Code') {
        return filteredList.filter(option => option.icd10Code.toLocaleLowerCase().includes(filter));
      }
    }
  }

  drgChanged($event: any) {
    this.getIcdCategories($event.value);
    this.disableFormControl('icdSubCategory');
    this.disableFormControl('icdCode');
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

  getIcdCategories(icd10DiagnosticGroupId: number) {
    this.drg = icd10DiagnosticGroupId;
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = icd10DiagnosticGroupId;
    this.medicalService.getICD10CategoriesByEventTypeAndDiagnosticGroup(icdModel).subscribe(categories => {
      this.icdCategories = categories;
      this.filteredIcdCategories = categories;
      this.form.patchValue({
        icdCategory: this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages[0].icdCategoryId : null,
      });
      this.getIcdSubCategories(this.selectedPersonEvent.physicalDamages[0].icdCategoryId);
    });
  }

  getIcdSubCategories(icdCategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10CategoryId = icdCategoryId;
    this.medicalService.getICD10SubCategoriesByEventTypeDRGAndCategory(icdModel).subscribe(subCategories => {
      this.icdSubCategories = subCategories;
      this.filteredIcdSubCategories = subCategories;
      this.form.patchValue({
        icdSubCategory: this.selectedPersonEvent.physicalDamages ? this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId : null,
      });
      this.getIcdCodes(this.selectedPersonEvent.physicalDamages[0].icdSubCategoryId);
    });
  }

  getIcdCodes(subcategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10DiagnosticGroupId = this.drg;
    icdModel.ICD10SubCategoryId = subcategoryId;
    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
      this.filteredIcdCodes = codes;
      this.form.patchValue({
        icdCode: this.selectedPersonEvent.physicalDamages && this.selectedPersonEvent.physicalDamages[0].injuries[0].icd10CodeId > 0 ? this.selectedPersonEvent.physicalDamages[0].injuries[0].icd10CodeId : null,
      });
    });
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.isReadOnly = true;
    this.form.disable();
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();

    if (this.selectedPersonEvent) {
      this.claimService.updatePersonEvent(this.selectedPersonEvent).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        this.reset();
        this.isLoading$.next(false);
      });
    }
  }

  openAuditDialog(selectedPersonEvent: PersonEventModel) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.PersonEventDiseaseDetail,
        itemId: selectedPersonEvent.personEventId,
        heading: 'Death Details Audit',
        propertiesToDisplay: ['NatureOfDisease', 'TypeOfDiseaseId', 'CauseOfDiseaseId', 'DateDiagnosis']
      }
    });
  }

}
