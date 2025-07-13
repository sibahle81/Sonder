import { Quote } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, Input, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'quote-documents',
  templateUrl: '../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class QuoteDocumentsComponent extends DocumentManagementComponent<Quote> implements AfterViewInit {

  @Input() quoteCode: string;
  @Output() documentsUploaded: boolean;

  system = ServiceTypeEnum[ServiceTypeEnum.QuoteManager];
  documentSet: DocumentSetEnum.AcceptedQuoteDocuments;
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

  ngAfterViewInit() {
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    this.documentsRequest.documentSet = DocumentSetEnum.AcceptedQuoteDocuments;
    this.getDataValues();
  }

  getDocumentKeys(): { [key: string]: string } {
    return { Quote: `${this.quoteCode}`};
  }

  getSystemName(): string {
    return this.system;
  }

  checkAllDocumentsUpload(): boolean {
    this.dataSource.data.forEach(a => {
      a.createdDate !== null && a.required ? this.documentsUploaded = true : this.documentsUploaded = false;
    });
    return this.documentsUploaded;
  }

}
