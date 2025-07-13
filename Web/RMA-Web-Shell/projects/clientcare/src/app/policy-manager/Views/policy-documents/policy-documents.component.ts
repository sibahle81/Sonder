import { AfterContentChecked, ChangeDetectorRef, Component, Input } from '@angular/core';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { Case } from '../../shared/entities/case';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentSetDocumentType } from 'projects/shared-models-lib/src/lib/common/document-set-document-type';
import { DocumentRefreshReasonEnum } from 'projects/shared-models-lib/src/lib/enums/document-refresh-reason.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { RefreshDocumentReasonComponent } from 'projects/shared-components-lib/src/lib/dialogs/refresh-document-reason/refresh-document-reason.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'policy-documents',
  styleUrls: ['./policy-documents.component.css'],
  templateUrl: '../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class PolicyDocumentsComponent extends DocumentManagementComponent<Case> {
  @Input() documentSetId: number;
  @Input() keyName: string;
  @Input() keyValue: string;

  system = ServiceTypeEnum[ServiceTypeEnum.PolicyManager];
  documentSet: DocumentSetEnum;

  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    dialog: MatDialog,
    alertService: AlertService,
    documentManagementService: DocumentManagementService,
    public activatedroute: ActivatedRoute
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
    this.showAdditionalDocumentsButton = false;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    this.getDocuments();
  }

  getDocumentKeys(): { [key: string]: string } {
    return { [this.keyName]: `${this.keyValue}` };
  }

  getSystemName(): string {
    return this.system;
  }

  getDocuments() {
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    this.documentsRequest.documentSet = DocumentSetEnum[DocumentSetEnum[this.documentSetId]];
    this.getDataValues();
  }

  openRefreshDocumentDialog(event: MouseEvent, documentType: DocumentSetDocumentType): void {
    event.stopPropagation();
    if (this.isRefreshing.value > 0) { 
      this.alertService.error('Please wait for current refresh process to finish', 'Document Refresh');
      return;
    }

    const dialogRef = this.dialog.open(RefreshDocumentReasonComponent, {
      width: '360px'
    });

    dialogRef.afterClosed().subscribe(documentRefreshReason => {
      if (documentRefreshReason) {
        this.isRefreshing.next(documentType.docTypeId);
        this.documentManagementService.refreshPolicyDocument(this.keyValue, documentType.docTypeId, documentRefreshReason).subscribe({
          next: (success) => {
            this.alertService.success('Document successfully refreshed', 'Document Refresh');
            this.getDocuments();
          },
          error: (response: HttpErrorResponse) => {
            this.alertService.error('message', 'Document Refresh Error');
            this.isRefreshing.next(0);
          },
          complete: () => {
            this.isRefreshing.next(0);
          }
        });
      }
    });
  }
}
