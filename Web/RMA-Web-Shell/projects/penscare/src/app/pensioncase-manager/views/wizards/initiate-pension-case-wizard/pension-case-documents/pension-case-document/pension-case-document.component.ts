import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PopupDeleteDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-delete-document/popup-delete-document.component';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { PopupRejectDocumentsComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-reject-documents/popup-reject-documents.component';
import { RejectDocument } from 'projects/claimcare/src/app/claim-manager/shared/entities/reject-document';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { PopupUploadDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-upload-document/popup-upload-document.component';
import { UploadFirstMedicalReportComponent } from 'projects/shared-components-lib/src/lib/document-management/upload-first-medical-report/upload-first-medical-report.component';
import { UploadProgressReportDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/upload-progress-report-document/upload-progress-report-document.component';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { MatDialog } from '@angular/material/dialog';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';

@Component({
  selector: 'pension-case-document',
  templateUrl: './../../../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html',
  styleUrls: ['./../../../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.css']
})
export class PensionCaseDocumentComponent extends DocumentManagementComponent<EventModel> implements AfterViewInit {

  @Input() pensionCaseModel: InitiatePensionCaseData;
  @Input() pensionCaseContext: PensionCaseContextEnum;
  @Input() childExtensionModel: ChildToAdultPensionLedger;

  @Output() checkReportInDigiCare: EventEmitter<any> = new EventEmitter();

  system = ServiceTypeEnum[ServiceTypeEnum.PensCareManager];
  documentSet: DocumentSetEnum.PensionCaseDocuments;
  isPersonEvent = false;
  medicalReport = 'First Medical Report';
  requiredPermission = 'Reject Document';
  hasPermission = false;

  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    alertService: AlertService,
    public claimCareService: ClaimCareService,
    documentManagementService: DocumentManagementService,
    public activatedroute: ActivatedRoute
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
    this.showAdditionalDocumentsButton = false;
  }

  ngAfterViewInit() {
    if (this.pensionCaseContext === PensionCaseContextEnum.ManageChildExtenion) {
      this.system = ServiceTypeEnum[ServiceTypeEnum.ChildExtensionManager];
      this.documentsRequest = new DocumentsRequest();
      this.documentsRequest.system = this.system;
      this.documentsRequest.keys = this.getDocumentKeys();
      this.documentsRequest.documentSet = DocumentSetEnum.ChildExtensionDocuments;
    } else {
      this.documentsRequest = new DocumentsRequest();
      this.documentsRequest.system = this.system;
      this.documentsRequest.keys = this.getDocumentKeys();
      this.documentsRequest.documentSet = DocumentSetEnum.PensionCaseDocuments;
    }
    this.getDataValues();
  }

  getDocumentKeys(): { [key: string]: string } {
    switch (this.pensionCaseContext) {
      case PensionCaseContextEnum.ManageChildExtenion:
        return { LedgerId: `${this.childExtensionModel.ledgerId}` };
      default:
        return { PensionCaseNumber: `${this.pensionCaseModel.pensionCase.pensionCaseNumber}` };
    }
  }

  getSystemName(): string {
    return this.system;
  }

  openDialogDeleteDouments(row: Document) {
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
    if (this.pensionCaseContext === PensionCaseContextEnum.ManageChildExtenion) {
      this.documentsRequest.personEventId = this.childExtensionModel.ledgerId;
    }
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
        if (this.pensionCaseContext === PensionCaseContextEnum.ManageChildExtenion) {
          this.documentsRequest.personEventId = this.childExtensionModel.ledgerId;
        }
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

  onMenuSelect(item: any, title: any) {

    if (title === 'Download') {
      this.getSelectedData(item);
    } else if (title === 'View') {
      this.getSelectedDataToView(item);
    } else if (title === 'Accept') {
      this.onAccept(item);
    } else if (title === 'Waive') {
      this.onWaive(item);
    } else if (title === 'Delete') {
      this.onDelete(item);
    } else if (title === 'Reject') {
      this.openDialogRejectDocuments(item);
    }
  }

  alertViewMode(action) {
    this.alertService.loading(`Cannot ${action} document in view mode.`)
  }

  isViewMode() {
    return this.pensionCaseContext === PensionCaseContextEnum.Manage
  }

  openDialogUploadDocuments(item: any) {
    if (this.isViewMode()) {
      this.alertViewMode('upload');
      return;
    }
    const dialogRef = this.dialog.open(PopupUploadDocumentComponent, {
      width: '1024px',
      data: { item, documentRequest: this.documentsRequest }
    });
    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('Uploading document');
      if (data) {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      } else { this.privateAppEventsManager.loadingStop(); }
    });
  }

  filterMenu(item: any) {

    this.menus = null;
    if(this.isViewMode()) {
      this.menus = [
        { title: 'Download', url: '', disable: false },
        { title: 'View', url: '', disable: false },
      ];
      return;
    }
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
            // { title: 'Upload Document', url: '', disable: false }
          ];
      }
    }
  }
}



