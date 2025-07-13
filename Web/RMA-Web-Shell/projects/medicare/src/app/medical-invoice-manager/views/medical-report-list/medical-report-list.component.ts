import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { WorkItemTypeEnum } from 'projects/digicare/src/app/work-manager/models/enum/work-item-type.enum';
import { MedicalUploadDialogComponent } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/medical-upload-icon/medical-upload-dialog/medical-upload-dialog.component';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { GenericModalMaterialComponentComponent } from '../../../shared/components/generic-modal-material-component/generic-modal-material-component.component';
import { HolisticMedicalReportContainerComponent } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-holistic-view/holistic-container-medical-reports/holistic-medical-report-container/holistic-medical-report-container.component';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';

@Component({
  selector: 'medical-report-list',
  templateUrl: './medical-report-list.component.html',
  styleUrls: ['./medical-report-list.component.css']
})
export class MedicalReportListComponent implements OnInit {

  @Input() isWizard = false;
  @Input() event: EventModel;
  @Input() medicalReports: MedicalReportForm[];
  medicalReportType = WorkItemTypeEnum;
  displayedColumns: string[] = ['practiceNumber', 'practiceName', 'reportDate', 'consultationDate', 'eventDate', 'reportTypeId', 'icd10Codes', 'viewReport'];


  form: UntypedFormGroup;
  startDate = new Date();
  currentUser: string;

  hideForm = true;
  hasPermission = true;
  requiredPermission = '';

  icdCodes: ICD10Code[] = [];
  medicalServiceProviderId = 0;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly healthCareProvider: HealthcareProviderService,
    public dialog: MatDialog,
    public readonly datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.createForm();
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
      eventDate: [{ value: '', disabled: true }],
      trackingNumber: [{ value: '', disabled: true }],
      dateReceived: [{ value: '', disabled: true }],
    });
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

  openMedicalDialog(medicalReport) {
    const selectedPersonEvent = this.event.personEvents.find(val => val.personEventId == medicalReport.personEventId);
    this.openDialog(selectedPersonEvent)

  }

  openDialog(personEvent: PersonEventModel) {
    let dialogRef = this.dialog.open(GenericModalMaterialComponentComponent, {
      panelClass: 'modal-material-template',
      data: {
        title: 'Clicked Linked Medical Report',
        component: HolisticMedicalReportContainerComponent,
        inputs: { // here an object with inputs data needed by your hosted component
          personEvent: personEvent,
          event: this.event,
          isReadOnly: true,
          isWizard: false
        }
      },
      width: '800px',
      height: '400px'
    })
  }

}
