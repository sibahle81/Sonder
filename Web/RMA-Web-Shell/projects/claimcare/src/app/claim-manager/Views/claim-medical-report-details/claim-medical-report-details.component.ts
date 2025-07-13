import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '../../../constants';
import { ICD10CodeEntity } from '../../shared/entities/icd10-code-model';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { EventTypeEnum } from '../../shared/enums/event-type-enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';

@Component({
  selector: 'claim-medical-report-details',
  templateUrl: './claim-medical-report-details.component.html',
  styleUrls: ['./claim-medical-report-details.component.css']
})
export class ClaimMedicalReportDetailsComponent implements OnInit, OnChanges {

  @Input() event: EventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;
  startDate = new Date();
  currentUser: string;

  hideForm = true;
  hasPermission = true;
  requiredPermission = '';

  isViewMode: boolean;
  isEditMode: boolean;
  isAddMode: boolean;

  icdCodes: ICD10Code[] = [];
  medicalServiceProviderId = 0;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly healthCareProvider: HealthcareProviderService,
    private readonly medicalService: ICD10CodeService,
    private readonly authService: AuthService,
    private readonly medicalFormService: MedicalFormService,
    public dialog: MatDialog,
    public readonly datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.createForm();
    this.getMedicalReportFormForClaim();
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    this.currentUser = this.authService.getUserEmail().toLowerCase();
    this.getLookups();
    if (this.isWizard) {
      this.isViewMode = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event) { return; }
    this.event = this.event;
  }

  checkPermissions(permission: string): boolean {
    return true;
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      practiceNumber: [{ value: '', disabled: true }],
      practiceName: [{ value: '', disabled: true }],
      reportDate: [{ value: '', disabled: true }],
      treatmentDate: [{ value: '', disabled: true }],
      medicalReportId: [{ value: '', disabled: true }],
      icd10Codes: [{ value: '', disabled: true }],
      tebaInvoiceNumber: [{ value: '', disabled: true }],
      boxNumber: [{ value: '', disabled: true }],
      trackingNumber: [{ value: '', disabled: true }],
      dateReceived: [{ value: '', disabled: true }],
    });
  }

  readForm() {
    const formDetails = this.form.getRawValue();
    this.event.personEvents[0].medicalReports[0].medicalServiceProviderId = this.medicalServiceProviderId;
    this.event.personEvents[0].medicalReports[0].reportDate = formDetails.reportDate;
    this.event.personEvents[0].medicalReports[0].treatmentDate = formDetails.treatmentDate;
    this.event.personEvents[0].medicalReports[0].medicalReportId = formDetails.medicalReportId;
    this.event.personEvents[0].medicalReports[0].dateReceived = formDetails.dateReceived;
    this.event.personEvents[0].medicalReports[0].estimatedDaysOff = formDetails.daysBookedOff;
  }

  getMedicalServiceProvider() {
    const practiceNumber = this.form.controls.practiceNumber.value as string;
    this.healthCareProvider.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
      if (healthCareProvider) {
        this.form.patchValue({
          practiceNumber: healthCareProvider.practiceNumber,
          practiceName: healthCareProvider.name
        });
        this.medicalServiceProviderId = healthCareProvider.rolePlayerId;
      }
    });
  }

  getLookups() {
  }

  getMedicalReportFormForClaim() {
    if (this.event) {
      this.isSaving$.next(true);
      this.medicalFormService.getMedicalReportFormForClaim(SourceSystemEnum.Modernisation, this.event.personEvents[0].personEventId,
         this.event.eventType === EventTypeEnum.Accident ? MedicalFormReportTypeEnum.FirstAccidentMedicalReport : MedicalFormReportTypeEnum.FirstDiseaseMedicalReport).subscribe(medicalForm => {
        if (medicalForm) {
          this.form.patchValue({
            practiceNumber: medicalForm.healthcareProviderPracticeNumber,
            practiceName: medicalForm.healthcareProviderName,
            reportDate: medicalForm.reportDate,
            treatmentDate: medicalForm.consultationDate,
            medicalReportId: medicalForm.medicalReportFormId,
            dateReceived: this.datepipe.transform(medicalForm.reportDate, Constants.dateString),
            icd10Codes: medicalForm.icd10Codes,
          });
        }
        this.isSaving$.next(false);
      });
    }
  }

  getIcdCodes(subcategoryId: number) {
    const icdModel = new ICD10CodeEntity();
    icdModel.EventType = EventTypeEnum.Disease;
    icdModel.ICD10SubCategoryId = subcategoryId;
    this.medicalService.getICD10CodesByEventTypeDRGAndSubCategory(icdModel).subscribe(codes => {
      this.icdCodes = codes;
    });
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  add() {
    this.isAddMode = true;
    this.toggle();
  }

  toggle() {
    this.hideForm = !this.hideForm;
    this.reset();
  }

  cancel() {
    this.reset();
    this.resetForm();
    this.isEditMode = false;
  }

  reset() {
  }

  view() {
    this.isViewMode = !this.isViewMode;
  }

  edit() {
    this.isEditMode = true;
    this.enableFormControl('practiceNumber');
    this.enableFormControl('reportDate');
    this.enableFormControl('treatmentDate');
    this.enableFormControl('daysBookedOff');
  }

  resetForm() {
    this.isEditMode = false;
    this.disableFormControl('practiceNumber');
    this.disableFormControl('practiceName');
    this.disableFormControl('reportDate');
    this.disableFormControl('treatmentDate');
    this.disableFormControl('medicalReportId');
    this.disableFormControl('icd10Codes');
    this.disableFormControl('tebaInvoiceNumber');
    this.disableFormControl('boxNumber');
    this.disableFormControl('trackingNumber');
    this.disableFormControl('dateReceived');
  }

  save() {
    this.isSaving$.next(true);
    this.isEditMode = false;
    this.isAddMode = false;
    this.readForm();
  }

  public expand() {
    this.isViewMode = !this.isViewMode;
  }
}
