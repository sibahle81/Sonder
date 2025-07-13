import { Component, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { DocumentManagementComponent } from "src/app/shared/components/document-management/document-management.component";
import { DocumentManagementService } from "src/app/shared/components/document-management/document-management.service";
import { CaseType } from "src/app/shared/enums/case-type.enum";
import { DocumentSetEnum } from "src/app/shared/enums/document-set.enum";
import { ServiceType } from "src/app/shared/enums/service-type.enum";
import { Case } from "src/app/shared/models/case";
import { DocumentsRequest } from "src/app/shared/models/documents-request.model";
import { AlertService } from "src/app/shared/services/alert.service";


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'create-case-documents',
  templateUrl: '../../shared/components/document-management/document-management.component.html'
})
export class CreateCaseDocumentsComponent extends DocumentManagementComponent<Case> {
  @Input() showAdditionalDocuments: boolean;
  documentSet: DocumentSetEnum = 0; // default
  system = ServiceType[ServiceType.PolicyManager];
  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    dialog: MatDialog,
    alertService: AlertService,
    documentManagementService: DocumentManagementService,
    public activatedRoute: ActivatedRoute
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
    this.showAdditionalDocumentsButton = this.showAdditionalDocuments;
  }

  getDocumentKeys(): { [key: string]: string } {
    if (!this.model) {
      return { CaseCode: '' };
    }
    return {
      CaseCode: `${this.model.code}`
    };
  }

  getSystemName(): string {
    return this.system;
  }

  refresh(caseType: number) {
    switch (caseType) {
      case CaseType.IndividualNewBusiness:
        this.documentSet = DocumentSetEnum.PolicyCaseIndividual;
        this.allDocumentsSupplied$.next(false);
        break;
      case CaseType.GroupNewBusiness:
        this.documentSet = DocumentSetEnum.PolicyCaseGroup;
        this.allDocumentsSupplied$.next(false);
        break;
      case CaseType.MaintainPolicyChanges:
        this.documentSet = DocumentSetEnum.PolicyMaintanance;
        break;
    }

    // Bug 11355 related-
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.keys;
    this.documentsRequest.documentSet = this.documentSet;

    this.getDataValues();
  }

  getPersonEventId(): number {
    return null;
  }
}
