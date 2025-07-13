import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'lib-documents',
  templateUrl: '../document-management/document-management.component.html'
})
export class DocumentsComponent extends DocumentManagementComponent<any> implements OnChanges {
  @Input() documentSetId: number;
  @Input() keyName: string;
  @Input() keyValue: string;
  @Input() system: string;

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

  ngOnChanges(changes: SimpleChanges): void {
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
}
