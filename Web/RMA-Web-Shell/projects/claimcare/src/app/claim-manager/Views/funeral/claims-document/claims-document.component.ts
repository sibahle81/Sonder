import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PopupDeleteDocumentComponent } from 'projects/shared-components-lib/src/lib/document-management/popup-delete-document/popup-delete-document.component';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'claims-document',
  templateUrl: '../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})

export class ClaimsDocumentsComponent extends DocumentManagementComponent<PersonEventModel> {

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
    this.showAdditionalDocumentsButton = true;
    this.showOutstandingDocumentsButton = true;
  }

  populateForm(): void {
    this.documentSet = this.model.documentSetEnum;
    this.loadingStart('loading...please wait');
    this.getInitialData();
  }

  getDocumentKeys(): { [key: string]: string } {
    return {
      PersonEvent: `${this.model.personEventReferenceNumber}`
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
    this.documentsRequest.personEventId = this.model.personEventId;
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

  filterMenu(item: any) {
    this.menus = null;
    switch (item.documentStatus) {
      case DocumentStatusEnum.Accepted:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
          { title: 'Accept', url: '', disable: true },
          { title: 'Waive', url: '', disable: true },
          { title: 'Delete', url: '', disable: false },
          { title: 'Upload Document', url: '', disable: true }
        ];
        break;
      case DocumentStatusEnum.Waived:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
          { title: 'Accept', url: '', disable: true },
          { title: 'Waive', url: '', disable: true },
          { title: 'Delete', url: '', disable: false },
          { title: 'Upload Document', url: '', disable: true }
        ];
        break;
      case DocumentStatusEnum.Deleted:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
          { title: 'Accept', url: '', disable: false },
          { title: 'Waive', url: '', disable: true },
          { title: 'Delete', url: '', disable: true },
          { title: 'Upload Document', url: '', disable: false }
        ];
        break;
      case DocumentStatusEnum.Received:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
          { title: 'Accept', url: '', disable: false },
          { title: 'Waive', url: '', disable: true },
          { title: 'Delete', url: '', disable: false },
          { title: 'Upload Document', url: '', disable: true }
        ];
        break;
      case DocumentStatusEnum.Awaiting:
        this.menus = [
          { title: 'Download', url: '', disable: true },
          { title: 'View', url: '', disable: true },
          { title: 'Accept', url: '', disable: true },
          { title: 'Waive', url: '', disable: item.required === false ? true : false },
          { title: 'Delete', url: '', disable: true },
          { title: 'Upload Document', url: '', disable: false }
        ];
        break;
      default:
        this.menus = [
          { title: 'Download', url: '', disable: true },
          { title: 'View', url: '', disable: true },
          { title: 'Accept', url: '', disable: true },
          { title: 'Waive', url: '', disable: item.required === false ? true : false },
          { title: 'Delete', url: '', disable: true },
          { title: 'Upload Document', url: '', disable: false }
        ];
    }
  }
}
