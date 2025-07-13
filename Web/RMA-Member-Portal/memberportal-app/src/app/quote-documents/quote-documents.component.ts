import { Quote } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AppEventsManager } from '../shared-utilities/app-events-manager/app-events-manager';
import { DocumentManagementComponent } from '../shared/components/document-management/document-management.component';
import { DocumentManagementService } from '../shared/components/document-management/document-management.service';
import { DocumentSetEnum } from '../shared/enums/document-set.enum';
import { ServiceType } from '../shared/enums/service-type.enum';
import { DocumentsRequest } from '../shared/models/documents-request.model';
import { AlertService } from '../shared/services/alert.service';

@Component({
  selector: 'quote-documents',
  templateUrl: '../shared/components/document-management/document-management.component.html'
})
export class QuoteDocumentsComponent extends DocumentManagementComponent<Quote> implements AfterViewInit {

  @Input() quoteCode: string;
  @Output() documentsUploaded: boolean;
  system = ServiceType[ServiceType.QuoteManager];
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
    this.getDocuments();
  }

  getDocumentKeys(): { [key: string]: string } {
    return { Quote: `${this.quoteCode}`};
  }

  getSystemName(): string {
    return this.system;
  }

  getDocuments() {
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    this.documentsRequest.documentSet = DocumentSetEnum.AcceptedQuoteDocuments;
    this.getDataValues();
  }

  checkAllDocumentsUpload(): boolean {
    this.dataSource.data.forEach(a => {
      a.createdDate !== null && a.required ? this.documentsUploaded = true : this.documentsUploaded = false;
    });
    return this.documentsUploaded;
  }

}
