import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { TermArrangement } from '../../../models/term-arrangement';

@Component({
  selector: 'terms-arrangement-documents',
  templateUrl: '../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class TermsArrangementDocumentsComponent extends DocumentManagementComponent<TermArrangement> implements AfterViewChecked {
  @Input() invoiceNumber: string;

  system = ServiceTypeEnum[ServiceTypeEnum.BillingManager];
  documentSet: DocumentSetEnum.TermsArrangementDocuments;

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
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    this.documentsRequest.documentSet = DocumentSetEnum.TermsArrangementDocuments;
    this.getDataValues();
  }

  ngAfterViewChecked() {
    this.getDocuments();
 }

  getDocumentKeys(): { [key: string]: string } {
    return { TermsArrangementCode: `${this.invoiceNumber}` };
  }

  getSystemName(): string {
    return this.system;
  }

  getDocuments() {
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    this.documentsRequest.documentSet = DocumentSetEnum.TermsArrangementDocuments;
  }

}
