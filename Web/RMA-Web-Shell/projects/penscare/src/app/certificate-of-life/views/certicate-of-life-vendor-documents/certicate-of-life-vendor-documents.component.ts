import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { RejectDocument } from 'projects/claimcare/src/app/claim-manager/shared/entities/reject-document';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { PopupDeleteDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-delete-document/popup-delete-document.component';
import { PopupRejectDocumentsComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-reject-documents/popup-reject-documents.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { PopupUploadDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-upload-document/popup-upload-document.component';


@Component({
  selector: 'app-certicate-of-life-vendor-documents',
  templateUrl: './../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html',
  styleUrls: ['./../../../../../../shared-components-lib/src/lib/document-management/document-management.component.css']
})
export class CerticateOfLifeVendorDocumentsComponent extends DocumentManagementComponent<EventModel> implements AfterViewInit {
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
    documentManagementService: DocumentManagementService,
    public activatedroute: ActivatedRoute
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
    this.showAdditionalDocumentsButton = false;
  }

  ngAfterViewInit() {
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    // TODO: Change to below CertificateOfLifeVendorDocuments
    // Set document properties on backend
    this.documentsRequest.documentSet = DocumentSetEnum.CertificateOfLifeVendorDocuments;
    this.getDataValues();
  }

  getDocumentKeys(): { [key: string]: string } {
    // TODO: Insert return documentIdentifier propert on backend
    return { documentIdentifier: 'vendorDocument' };
    // return { PensionCaseNumber: `${this.pensionCaseModel.pensionCase.pensionCaseNumber}` };
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
        rejectDocument.reason = data.text;
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

  openDialogUploadDocuments(item: any) {
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
    this.menus = [{ title: 'Download', url: '', disable: false }]
  }
}
