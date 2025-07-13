import { Component, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { DocumentManagementComponent } from "src/app/shared/components/document-management/document-management.component";
import { DocumentManagementService } from "src/app/shared/components/document-management/document-management.service";
import { DocumentSetEnum } from "src/app/shared/enums/document-set.enum";
import { ServiceType } from "src/app/shared/enums/service-type.enum";
import { Case } from "src/app/shared/models/case";
import { DocumentsRequest } from "src/app/shared/models/documents-request.model";
import { AlertService } from "src/app/shared/services/alert.service";


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'policy-documents',
  templateUrl: '../../shared/components/document-management/document-management.component.html'
})
export class PolicyDocumentsComponent extends DocumentManagementComponent<Case> {
  @Input() documentSetId: number;
  @Input() keyName: string;
  @Input() keyValue: string;

  system = ServiceType[ServiceType.PolicyManager];
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
}
