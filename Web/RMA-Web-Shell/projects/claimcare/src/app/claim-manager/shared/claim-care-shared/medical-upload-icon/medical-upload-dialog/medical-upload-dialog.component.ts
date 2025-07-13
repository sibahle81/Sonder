import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MedicalReportTypeEnum } from '../medical-report-type.enum';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';

@Component({
  templateUrl: './medical-upload-dialog.component.html',
  styleUrls: ['./medical-upload-dialog.component.css']
})
export class MedicalUploadDialogComponent extends UnSubscribe {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedPersonEvent: PersonEventModel;
  selectedMedicalReport : ProgressMedicalReportForm;
  selectedFinalMedicalReport : FinalMedicalReportForm;
  event: EventModel;
  isWizard: boolean;
  isReadOnly: boolean;
  medicalReportType: MedicalReportTypeEnum;

  firstMedicalReport = MedicalReportTypeEnum.FirstMedicalReport;
  progressMedicalReport = MedicalReportTypeEnum.ProgressMedicalReport;
  finalMedicalReport = MedicalReportTypeEnum.FinalMedicalReport;
  sickNoteReport = MedicalReportTypeEnum.SickNoteReport;

  constructor(
    public dialogRef: MatDialogRef<MedicalUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super();
    this.selectedMedicalReport = this.data.selectedMedicalReport ? this.data.selectedMedicalReport : new ProgressMedicalReportForm();
    this.selectedFinalMedicalReport = this.data.selectedFinalMedicalReport ? this.data.selectedFinalMedicalReport : new FinalMedicalReportForm();
    this.selectedPersonEvent = this.data.selectedPersonEvent;
    this.event = this.data.event;
    this.isWizard = this.data.isWizard;
    this.isReadOnly = this.data.isReadOnly;
    this.medicalReportType = this.data.medicalReportType;
  }

  close($event: any) {
    if($event){
      this.dialogRef.close($event);
    } else {
      this.dialogRef.close(null);
    }
  }
}
