import { Component, Input } from '@angular/core';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'view-documents',
  templateUrl: '../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class ViewDocumentsComponent extends DocumentManagementComponent<any> {
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
    if(this.documentSetId == DocumentSetEnum.InterBankTransfer || this.documentSetId == DocumentSetEnum.CreditNoteReallocation || this.documentSetId == DocumentSetEnum.MaintainRefundOverpayment){
        this.system = ServiceTypeEnum[ServiceTypeEnum.BillingManager]
      }else{
        this.system = ServiceTypeEnum[ServiceTypeEnum.PolicyManager]
      }
      this.documentsRequest = new DocumentsRequest();
      this.documentsRequest.system = this.system;
      this.documentsRequest.keys = this.getDocumentKeys();
      this.documentsRequest.documentSet = DocumentSetEnum[DocumentSetEnum[this.documentSetId]];
      this.getDataValues();
  }
}
