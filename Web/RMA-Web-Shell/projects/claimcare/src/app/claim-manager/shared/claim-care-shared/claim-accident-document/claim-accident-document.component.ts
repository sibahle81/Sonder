import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { PopupDeleteDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-delete-document/popup-delete-document.component';
import { PopupRejectDocumentsComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-reject-documents/popup-reject-documents.component';
import { PopupUploadDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-upload-document/popup-upload-document.component';
import { UploadFinalReportDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/upload-final-report-document/upload-final-report-document.component';
import { UploadFirstMedicalReportComponent } from 'projects/shared-components-lib/src/lib/document-management/upload-first-medical-report/upload-first-medical-report.component';
import { UploadProgressReportDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/upload-progress-report-document/upload-progress-report-document.component';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Constants } from '../../../../constants';
import { AccidentService } from '../../../Services/accident.service';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { EventModel } from '../../entities/personEvent/event.model';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { RejectDocument } from '../../entities/reject-document';
import { EventTypeEnum } from '../../enums/event-type-enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { DiseaseTypeEnum } from '../../enums/disease-type-enum';

@Component({
  selector: 'claim-accident-document',
  templateUrl: '../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class ClaimAccidentDocumentComponent extends DocumentManagementComponent<EventModel> implements AfterViewInit {

  @Input() personEvent: PersonEventModel;
  @Input() eventModel: EventModel;
  @Input() isWizard: boolean;

  @Output() checkReportInDigiCare: EventEmitter<any> = new EventEmitter();

  system = ServiceTypeEnum[ServiceTypeEnum.ClaimManager];
  documentSet: DocumentSetEnum.ClaimAccidentNotificationID;
  isPersonEvent = false;
  medicalReport = 'First Medical Report';
  requiredPermission = 'Reject Document';
  hasPermission = false;
  canCaptureFirstMedicalReport: boolean;
  firstMedicalReports: FirstMedicalReportForm[];
  progressMedicalReports: ProgressMedicalReportForm[];
  documentRequired = true;

  constructor(
    public privateAppEventsManager: AppEventsManager,
    public dialog: MatDialog,
    public alertService: AlertService,
    private readonly router: Router,
    private readonly claimCareService: ClaimCareService,
    private readonly confirmService: ConfirmationDialogsService,
    public documentManagementService: DocumentManagementService,
    private readonly accidentService: AccidentService,
    public authService: AuthService,
    public activatedRoute: ActivatedRoute,
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
    this.showAdditionalDocumentsButton = false;
  }

  ngAfterViewInit() {
    if (this.personEvent) {
      this.documentsRequest = new DocumentsRequest();
      this.documentsRequest.system = this.system;
      this.documentsRequest.keys = this.getDocumentKeys();
      if (this.eventModel.eventType === EventTypeEnum.Accident) {
        this.documentsRequest.documentSet = this.personEvent.documentSetEnum;
        if (this.personEvent.personEventBucketClassId === Constants.notificationOnly) {
          this.documentRequired = false;
          this.getDataValuesAndMarkRequireds(this.documentRequired);
        } else {
          this.getDataValues();
        }
      } else {
        this.setDocumentType(this.eventModel.personEvents[0]);
        this.getDataValues();
      }
      this.checkIsPersonEvent(this.personEvent.personEventId);
      this.checkIfFirstMedicalReportExists();
      this.checkIfProgressMedicalReportExists();
      this.hasPermission = this.checkPermissions(this.requiredPermission);
    }
  }

  getDocumentKeys(): { [key: string]: string } {
    return { PersonEvent: `${this.personEvent.personEventId}` };
  }

  checkPermissions(permission: string): boolean {
    return userUtility.hasPermission(permission);
  }

  getSystemName(): string {
    return this.system;
  }

  openDialogDeleteDouments(row: Document) {
    this.documentsRequest.personEventId = this.personEvent.personEventId;
    const dialogRef = this.dialog.open(PopupDeleteDocumentComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest, keys: this.keys }
    });

    dialogRef.afterClosed().subscribe(data => {
      row.documentStatus = DocumentStatusEnum.Deleted;
      this.documentManagementService.UpdateDocument(row).subscribe(() => {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      });
      this.getDataValues();
    });
  }

  openDialogRejectDocuments(row: Document) {
    this.documentsRequest.personEventId = this.personEvent.personEventId;
    const dialogRef = this.dialog.open(PopupRejectDocumentsComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest, keys: this.keys }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        row.documentStatus = DocumentStatusEnum.Rejected;
        this.documentManagementService.UpdateDocument(row).subscribe(() => {
          this.getDataValues();
          this.privateAppEventsManager.loadingStop();
        });
        this.getDataValues();
        const rejectDocument = new RejectDocument();
        rejectDocument.personEventId = this.personEvent.personEventId;
        rejectDocument.reason = data.text;

        this.claimCareService.sendDocumentRejectionEmail(rejectDocument).subscribe(result => {
          if (result === 200) {
            this.alertService.success('email was sent successfully');
          }
          if (result === 1) {
            this.alertService.success('SMS was sent successfully');
          }
        });
      }
    });
  }

  checkIsPersonEvent(personEventId: number) {
    this.claimCareService.checkIsPersonEvent(personEventId).subscribe(result => {
      if (result) {
        this.isPersonEvent = true;
      }
    });
  }

  onMenuSelect(item: any, title: any) {
    if (title === 'Download') {
      this.getSelectedData(item);
    } else if (title === 'View') {
      this.getSelectedDataToView(item);
    } else if (title === 'Accept') {
      this.onDocumentAccept(item);
    } else if (title === 'Waive') {
      this.onWaive(item);
    } else if (title === 'Delete') {
      this.onDelete(item);
    } else if (title === 'Reject') {
      this.openDialogRejectDocuments(item);
    }
  }

  openDialogUploadDocuments(item: any) {
    if (item.docTypeId === DocumentTypeEnum.FirstMedicalReport) {
      if (this.eventModel.eventType === EventTypeEnum.Accident) {
        if (userUtility.hasPermission(Constants.CaptureICD10CodesPermission)) {
          this.openFirstMedicalReportUpload(item);
        } else {
          this.alertService.loading('User does not have permission to capture ICD 10 Codes', 'User Permission');
        }
      } else if (this.eventModel.eventType === EventTypeEnum.Disease) {
        this.otherDocumentsUpload(item);
      }
    } else if (item.docTypeId === DocumentTypeEnum.ProgressMedicalReport) {
      if (userUtility.hasPermission(Constants.CaptureICD10CodesPermission)) {
        this.openProgressMedicalReportUpload(item);
      } else {
        this.alertService.loading('User does not have permission to capture ICD 10 Codes', 'User Permission');
      }
    } else if (item.docTypeId === DocumentTypeEnum.FinalMedicalReport) {
      if (userUtility.hasPermission(Constants.CaptureICD10CodesPermission)) {
        this.openFinalMedicalReportUpload(item);
      } else {
        this.alertService.loading('User does not have permission to capture ICD 10 Codes', 'User Permission');
      }
    } else {
      this.otherDocumentsUpload(item);
    }
  }

  openFirstMedicalReportUpload(item: any) {
    if (this.isWizard) {
      if (this.personEvent.personEventAccidentDetail) {
        const document = this.checkIfDocumentTypeBeenUploaded(DocumentTypeEnum.FirstMedicalReport);
        if (document) {
          this.confirmService.confirmWithoutContainer(' First medical report exists', 'First medical report uploaded already, do you want to replace it?', 'Center', 'Center', 'Yes', 'No').subscribe(
            result => {
              if (result === true) {
                var document = this.dataSource.documents.filter(x => x.docTypeId === DocumentTypeEnum.FirstMedicalReport)[0];
                document.documentStatus = DocumentStatusEnum.Deleted;
                this.personEvent.firstMedicalReport = null;
                this.documentManagementService.UpdateDocument(document).subscribe(() => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                });
                this.openFirstMedicalReportDialog(item);
              }
            });
        } else {
          this.openFirstMedicalReportDialog(item);
        }
      } else {
        this.alertService.loading('Please Capture Injury details before uploading document')
      }
    } else {
      this.openFirstMedicalReportDialog(item);
    }
  }

  otherDocumentsUpload(item: any) {
    const dialogRef = this.dialog.open(PopupUploadDocumentComponent, {
      width: '1024px',
      data: { item, documentRequest: this.documentsRequest }
    });
    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('Uploading document');
      if (data) {

        if (!this.isWizard) {
          if (this.personEvent.claims[0].claimStatus === ClaimStatusEnum.Closed) {
            this.accidentService.ReopenClaim(this.personEvent).subscribe();
          }
        }

        if (this.personEvent.isStraightThroughProcess) {
          this.accidentService.AutoAcceptDocuments(this.personEvent).subscribe(res => {
            this.getDataValues();
          });
        }
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      } else { this.privateAppEventsManager.loadingStop(); }
    });
  }

  openFirstMedicalReportDialog(item: any) {
    if (this.canCaptureFirstMedicalReport) {
      const dialogRef = this.dialog.open(UploadFirstMedicalReportComponent, {
        width: '1024px',
        disableClose: true,
        data: {
          item, documentRequest: this.documentsRequest, personEvent: this.personEvent,
          eventType: this.eventModel.eventType, event: this.eventModel
        }
      });

      dialogRef.afterClosed().subscribe(data => {
        this.privateAppEventsManager.loadingStart('Sending report to digicare');
        if (data) {
          data.medicalReportForm.personEventId = this.personEvent.personEventId;
          data.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.FirstAccidentMedicalReport;
          this.personEvent.firstMedicalReport = new FirstMedicalReportForm();
          if (!this.isWizard) {
            this.accidentService.ValidateFirstMedicalReportSTP(data).subscribe((result) => {
              if (result) {
                this.personEvent.firstMedicalReport = result;
                this.checkReportInDigiCare.emit(result);
                if (this.personEvent.claims[0].claimStatus === ClaimStatusEnum.Closed) {
                  this.accidentService.ReopenClaim(this.personEvent).subscribe(() => {
                    this.getDataValues();
                    this.privateAppEventsManager.loadingStop();
                  }, (error) => {
                    this.getDataValues();
                    this.privateAppEventsManager.loadingStop();
                  });

                } else {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                }
              }
            });
          } else {
            this.personEvent.firstMedicalReport = data;
            this.checkReportInDigiCare.emit(data);
            this.getDataValues();
            this.privateAppEventsManager.loadingStop();
          }
        } else { this.privateAppEventsManager.loadingStop(); }
      });
    } else {
      if (!this.personEvent.isStraightThroughProcess) {
        this.confirmService.confirmWithoutContainer(' First medical report exists', 'First medical report uploaded already, do you want to replace it?', 'Center', 'Center', 'Yes', 'No').subscribe(
          result => {
            if (result === true) {
              this.removeFirstMedicalReport();
              this.reUploadFirstMedicalReportDialog(item);
            }
          });
      } else {
        this.alertService.success('First medical report uploaded already for STP claim');
      }
    }
  }

  openProgressMedicalReportUpload(item: any) {
    const document = this.checkIfDocumentTypeBeenUploaded(DocumentTypeEnum.FirstMedicalReport);
    if (document) {
      const dialogRef = this.dialog.open(UploadProgressReportDocumentComponent, {
        width: '1024px',
        disableClose: true,
        data: {
          item, documentRequest: this.documentsRequest, personEvent: this.personEvent, eventDate: this.eventModel.eventDate,
          firstMedicalConsultationDate: this.firstMedicalReports ? this.firstMedicalReports[0].medicalReportForm.consultationDate :
            this.personEvent.firstMedicalReport.medicalReportForm.consultationDate, eventDetail: this.eventModel
        }
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.medicalReportForm.personEventId = this.personEvent.personEventId;
          this.privateAppEventsManager.loadingStart('Sending report to digicare');
          this.accidentService.ValidateProgressMedicalReportSTP(data).subscribe((result) => {
            if (result) {
              this.checkReportInDigiCare.emit(result);
              if (this.personEvent.claims[0].claimStatus === ClaimStatusEnum.Closed) {
                this.accidentService.ReopenClaim(this.personEvent).subscribe(() => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                }, (error) => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                });

              } else {
                this.getDataValues();
                this.privateAppEventsManager.loadingStop();
              }
            }
          }, (error) => {
            this.privateAppEventsManager.loadingStop();
          });
        }
      });
    } else {
      this.alertService.loading('First Medical Report needs to be uploaded');
    }
  }

  openFinalMedicalReportUpload(item: any) {
    const document = this.checkIfDocumentTypeBeenUploaded(DocumentTypeEnum.FirstMedicalReport);
    let progressMedicalConsultationDate: any;
    if (this.progressMedicalReports.length > 0) {
      progressMedicalConsultationDate = this.progressMedicalReports[0].medicalReportForm.consultationDate;
    }
    if (document) {
      const dialogRef = this.dialog.open(UploadFinalReportDocumentComponent, {
        width: '1024px',
        disableClose: true,
        data: {
          item, documentRequest: this.documentsRequest, personEvent: this.personEvent, eventDate: this.eventModel.eventDate,
          eventDetail: this.eventModel, firstMedicalConsultationDate: this.firstMedicalReports ? this.firstMedicalReports[0].medicalReportForm.consultationDate :
            this.personEvent.firstMedicalReport.medicalReportForm.consultationDate, progresMedicalConsultationDate: progressMedicalConsultationDate
        }
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.medicalReportForm.personEventId = this.personEvent.personEventId;
          this.privateAppEventsManager.loadingStart('Sending report to digicare');
          this.accidentService.ValidateFinalMedicalReportSTP(data).subscribe((result) => {
            if (result) {
              this.checkReportInDigiCare.emit(result);
              if (this.personEvent.claims[0].claimStatus === ClaimStatusEnum.Closed) {
                this.accidentService.ReopenClaim(this.personEvent).subscribe(() => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                }, (error) => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                });
              } else {
                this.getDataValues();
                this.privateAppEventsManager.loadingStop();
              }
            }
          }, (error) => {
            this.privateAppEventsManager.loadingStop();
          });
        }
      });
    } else {
      this.alertService.loading('First Medical Report needs to be uploaded');
    }
  }

  checkIfFirstMedicalReportExists() {
    this.accidentService.GetFirstMedicalReportForms(this.personEvent.personEventId).subscribe((firstMedicalReport) => {
      if (firstMedicalReport.length !== 0 && this.router.url.includes('holistic-claim-view')) {
        this.canCaptureFirstMedicalReport = false;
        this.firstMedicalReports = firstMedicalReport;
      } else {
        this.canCaptureFirstMedicalReport = true;
      }
    }, (error) => {
    });
  }

  checkIfProgressMedicalReportExists() {
    this.accidentService.GetProgressMedicalReportForms(this.personEvent.personEventId).subscribe((progressMedicalReport) => {
      if (progressMedicalReport.length !== 0) {
        this.progressMedicalReports = progressMedicalReport;
      } else {
        this.progressMedicalReports = [];
      }
    }, (error) => {
    });
  }

  reUploadFirstMedicalReportDialog(item: any) {
    const dialogRef = this.dialog.open(UploadFirstMedicalReportComponent, {
      width: '1024px',
      disableClose: true,
      data: {
        item, documentRequest: this.documentsRequest, personEvent: this.personEvent,
        eventType: this.eventModel.eventType, event: this.eventModel
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('Sending report to digicare');
      if (data) {
        data.medicalReportForm.personEventId = this.personEvent.personEventId;
        data.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.FirstAccidentMedicalReport;
        this.personEvent.firstMedicalReport = new FirstMedicalReportForm();
        if (!this.isWizard) {
          this.accidentService.ValidateFirstMedicalReportSTP(data).subscribe((result) => {
            if (result) {
              this.personEvent.firstMedicalReport = result;
              this.checkReportInDigiCare.emit(result);
              if (this.personEvent.claims[0].claimStatus === ClaimStatusEnum.Closed) {
                this.accidentService.ReopenClaim(this.personEvent).subscribe(() => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                }, (error) => {
                  this.getDataValues();
                  this.privateAppEventsManager.loadingStop();
                });

              } else {
                this.getDataValues();
                this.privateAppEventsManager.loadingStop();
              }
            }
          });
        } else {
          this.personEvent.firstMedicalReport = data;
          this.checkReportInDigiCare.emit(data);
          this.getDataValues();
          this.privateAppEventsManager.loadingStop();
        }
      } else { this.privateAppEventsManager.loadingStop(); }
    });
  }

  removeFirstMedicalReport() {
    if (!this.personEvent.isStraightThroughProcess) {
      var document = this.dataSource.documents.filter(x => x.docTypeId === DocumentTypeEnum.FirstMedicalReport)[0];
      document.documentStatus = DocumentStatusEnum.Deleted;
      this.personEvent.firstMedicalReport = null;
      this.removeFirstMedicalReportDocument(document.id);
      this.documentManagementService.UpdateDocument(document).subscribe(() => {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      });
    }
  }

  removeFirstMedicalReportDocument(documentId: number) {
    this.accidentService.RemoveMedicalReportFormByDocumentId(this.personEvent.personEventId, documentId).subscribe(removed => {
    })
  }

  filterMenu(item: any) {

    this.menus = null;
    if (!this.isDisabled) {
      switch (item.documentStatus) {
        case DocumentStatusEnum.Accepted:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: false },
            { title: 'Delete', url: '', disable: false },
            { title: 'Reject', url: '', disable: !this.isPersonEvent || item.documentTypeName !== this.medicalReport || !this.hasPermission },
          ];
          break;
        case DocumentStatusEnum.Waived:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: false },
            { title: 'Reject', url: '', disable: true },
          ];
          break;
        case DocumentStatusEnum.Deleted:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: false },
            { title: 'Waive', url: '', disable: false },
            { title: 'Delete', url: '', disable: true },
            { title: 'Reject', url: '', disable: true },
          ];
          break;
        case DocumentStatusEnum.Received:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false },
            { title: 'Accept', url: '', disable: false },
            { title: 'Waive', url: '', disable: false },
            { title: 'Delete', url: '', disable: false },
            { title: 'Reject', url: '', disable: !this.isPersonEvent || item.documentTypeName !== this.medicalReport || !this.hasPermission },
          ];
          break;
        case DocumentStatusEnum.Awaiting:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Reject', url: '', disable: !this.isPersonEvent || item.documentTypeName !== this.medicalReport || !this.hasPermission },
          ];
          break;
        case DocumentStatusEnum.Rejected:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: true },
            { title: 'Delete', url: '', disable: true },
            { title: 'Reject', url: '', disable: true },
          ];
          break;
        default:
          this.menus = [
            { title: 'Download', url: '', disable: true },
            { title: 'View', url: '', disable: true },
            { title: 'Accept', url: '', disable: true },
            { title: 'Waive', url: '', disable: false },
            { title: 'Delete', url: '', disable: true },
            { title: 'Reject', url: '', disable: !this.isPersonEvent || item.documentTypeName !== this.medicalReport || !this.hasPermission },
          ];
      }
    } else {
      switch (item.documentStatus) {
        case DocumentStatusEnum.Accepted:
        case DocumentStatusEnum.Received:
          this.menus = [
            { title: 'Download', url: '', disable: false },
            { title: 'View', url: '', disable: false }
          ];
          break;
        default:
          this.menus = [
          ];
      }
    }
  }

  setDocumentType($event: PersonEventModel) {
    if ($event.personEventDiseaseDetail != null) {
      switch ($event.personEventDiseaseDetail.typeOfDisease) {
        case DiseaseTypeEnum.NIHL:
          $event.documentSetEnum = DocumentSetEnum.NIHL;
          break;
        case DiseaseTypeEnum.WorkRelatedUpperLimbDisorder:
          $event.documentSetEnum = DocumentSetEnum.WRULDdocuments;
          break;
        case DiseaseTypeEnum.TuberculosisHealthWorkersOnly:
        case DiseaseTypeEnum.TuberculosisOfTheHeart:
        case DiseaseTypeEnum.TuberculousPleurisy:
        case DiseaseTypeEnum.PulmonaryTuberculosisPlusOAD:
        case DiseaseTypeEnum.PulmonaryTuberculosis:
        case DiseaseTypeEnum.PulmonaryTuberculosisPlusPneumoconiosis:
        case DiseaseTypeEnum.PulmonaryTuberculosisPlusPneumoconiosisPlusOAD:
          $event.documentSetEnum = DocumentSetEnum.TuberculosisDocuments;
          break;
        case DiseaseTypeEnum.PTSD:
          $event.documentSetEnum = DocumentSetEnum.PtsdDocuments;
          break;
        case DiseaseTypeEnum.Malaria:
          $event.documentSetEnum = DocumentSetEnum.MalariaDocuments;
          break;
        case DiseaseTypeEnum.Virus:
          $event.documentSetEnum = DocumentSetEnum.CovidDocuments;
          break;
        case DiseaseTypeEnum.HeatExhaustionHeatStroke:
          $event.documentSetEnum = DocumentSetEnum.HeatClaimsDocuments;
          break;
        case DiseaseTypeEnum.OccupationalAsthma:
          $event.documentSetEnum = DocumentSetEnum.AsthmaDocuments;
          break;
        default:
          $event.documentSetEnum = DocumentSetEnum.ClaimDiseaseNotificationID;
          break;
      }
    }
  }
}
