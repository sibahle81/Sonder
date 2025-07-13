
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { TraceDocumentModel } from '../../../shared/entities/trace-document-model';
import { PopupDeleteDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-delete-document/popup-delete-document.component';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';

@Component({
  selector: 'trace-document',
  templateUrl: './../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html',
  styleUrls: ['./../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.css']
})

export class TraceDocumentComponent extends DocumentManagementComponent<TraceDocumentModel> {

  documentSet = null;
  system = ServiceTypeEnum[ServiceTypeEnum.ClaimManager];
  currentItemId: number;
  id: number;
  keys: any;

  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    dialog: MatDialog,
    alertService: AlertService,
    documentManagementService: DocumentManagementService,
    public documentManagementServices: DocumentManagementService,
    public dialogs: MatDialog,
    public activatedroute: ActivatedRoute,
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
  }

  populateForm(): void {
    this.documentSet = DocumentSetEnum.TraceDocument;
    // this.loadingStart('loading...please wait');
    this.getInitialData();
  }

  getDocumentKeys(): { [key: string]: string } {
    return {
      TraceDocument: `${this.model.claimId}`
    };
  }

  getSystemName(): string {
    return this.system;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  openDialogDeleteDouments(row: Document) {
    this.documentsRequest.claimId = this.model.claimId;
    const dialogRef = this.dialogs.open(PopupDeleteDocumentComponent, {
      width: '1024px',
      data: { documentRequest: this.documentsRequest }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.privateAppEventsManager.loadingStart('removing documents');
      if (data) {
        row.documentStatus = DocumentStatusEnum.Deleted;
        this.documentManagementServices.UpdateDocument(row).subscribe(a => {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      });
      } else {
        this.getDataValues();
        this.privateAppEventsManager.loadingStop();
      }
    });
  }
}
