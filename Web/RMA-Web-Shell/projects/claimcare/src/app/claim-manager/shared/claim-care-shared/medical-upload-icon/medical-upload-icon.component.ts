import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { MedicalUploadDialogComponent } from './medical-upload-dialog/medical-upload-dialog.component';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { EventModel } from '../../entities/personEvent/event.model';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AccidentService } from '../../../Services/accident.service';
import { MedicalReportTypeEnum } from './medical-report-type.enum';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';

@Component({
  selector: 'medical-upload-icon',
  templateUrl: './medical-upload-icon.component.html',
  styleUrls: ['./medical-upload-icon.component.css']
})
export class MedicalUploadIconComponent extends UnSubscribe {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isWizard = false;
  @Input() medicalReportType: MedicalReportTypeEnum;

  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private readonly confirmationDialogService: ConfirmationDialogsService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly accidentService: AccidentService,
  ) {
    super();
  }

  uploadMedicalReport() {
    switch (this.medicalReportType) {
      case MedicalReportTypeEnum.FirstMedicalReport:
        (!this.selectedPersonEvent.firstMedicalReport || this.selectedPersonEvent.firstMedicalReport.medicalReportForm.reportTypeId !== +MedicalFormReportTypeEnum.FirstAccidentMedicalReport) ? this.openMedicalDialog() : this.popupMessage(this.medicalReportType);
        break;
      case MedicalReportTypeEnum.ProgressMedicalReport:
        this.openMedicalDialog();
        break;
      case MedicalReportTypeEnum.FinalMedicalReport:
        this.openMedicalDialog();
        break;
      case MedicalReportTypeEnum.SickNoteReport:
        (!this.selectedPersonEvent.firstMedicalReport || this.selectedPersonEvent.firstMedicalReport.medicalReportForm.reportTypeId !== +MedicalFormReportTypeEnum.SickNoteMedicalReport) ? this.openMedicalDialog() : this.popupMessage(this.medicalReportType);
        break;
    }
  }

  openMedicalDialog() {
    const dialogRef = this.dialog.open(MedicalUploadDialogComponent, {
      width: '1300px',
      maxHeight: '700px',
      disableClose: true,
      data: {
        selectedPersonEvent: this.selectedPersonEvent,
        event: this.event,
        isWizard: this.isWizard,
        medicalReportType: this.medicalReportType,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh.emit(true);
      }
    })
  }

  popupMessage(reportType): void {
    this.confirmationDialogService.confirmWithoutContainer('Replace', ' Are you sure you want to replace the current First Medical Report',
      'Center', 'Center', 'Confirm', 'Cancel').subscribe(
        result => {
          if (result === true) {
            if (this.isWizard) {
              this.deleteDocument(reportType);
            } else {
              this.selectedPersonEvent.firstMedicalReport.medicalReportForm.isDeleted = true;
              this.accidentService.UpdateFirstMedicalReportForm(this.selectedPersonEvent.firstMedicalReport).subscribe(removed => {
                if(removed)
                {
                  this.selectedPersonEvent.firstMedicalReport = null;
                }
                });
            }
          }
        });
  }

  deleteDocument(reportType) {
    let item = new GenericDocument();
    item.id = this.selectedPersonEvent.firstMedicalReport.medicalReportForm.documentId;
    item.documentSet = DocumentSetEnum.ClaimMedicalDocuments;
    item.documentType = (reportType === MedicalReportTypeEnum.FirstMedicalReport) ? DocumentTypeEnum.FirstMedicalReport : DocumentTypeEnum.SickNoteReport;
    item.documentStatus = DocumentStatusEnum.Deleted;
    item.isDeleted = true;
    this.documentManagementService.updateDocumentGeneric(item).subscribe((result) => {
      this.selectedPersonEvent.progressMedicalReportForms;
      this.selectedPersonEvent.firstMedicalReport = undefined;
      this.refresh.emit(true);
    });
  }

  getFirstMedicalReportFormByReportType(reportType) {
    const reportTypeId = (reportType === MedicalReportTypeEnum.FirstMedicalReport) ? +MedicalFormReportTypeEnum.FirstAccidentMedicalReport : +MedicalFormReportTypeEnum.SickNoteMedicalReport;            
    this.accidentService.getFirstMedicalReportFormByReportType(this.selectedPersonEvent.personEventId, reportTypeId).subscribe(result => {
      if (result) {
        this.selectedPersonEvent.firstMedicalReport = result;
        if (reportType === MedicalReportTypeEnum.FirstMedicalReport) {
          (!this.selectedPersonEvent.firstMedicalReport || this.selectedPersonEvent.firstMedicalReport.medicalReportForm.reportTypeId !== MedicalFormReportTypeEnum.FirstAccidentMedicalReport) ? this.openMedicalDialog() : this.popupMessage(reportType);
        }
        if ((reportType === MedicalReportTypeEnum.SickNoteReport)) {
          (!this.selectedPersonEvent.firstMedicalReport || this.selectedPersonEvent.firstMedicalReport.medicalReportForm.reportTypeId !== MedicalFormReportTypeEnum.SickNoteMedicalReport) ? this.openMedicalDialog() : this.popupMessage(reportType);
        }
      } else {
        this.openMedicalDialog();
      }
    });
  }
}
