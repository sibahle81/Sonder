import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'create-case-documents',
  templateUrl: '../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class CreateCaseDocumentsComponent extends DocumentManagementComponent<Case> {

  @Output() changeDocuments = new EventEmitter();
  @Input() showAdditionalDocuments: boolean;
  
  documentSet: DocumentSetEnum = 0; // default
  system = ServiceTypeEnum[ServiceTypeEnum.PolicyManager];

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
    this.changeDocument = this.changeDocuments;
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
        break;
      case CaseType.GroupNewBusiness:
        this.documentSet = DocumentSetEnum.PolicyCaseGroup;
        break;
      case CaseType.MaintainPolicyChanges:
        this.documentSet = DocumentSetEnum.PolicyMaintanance;
        break;
      case CaseType.CancelPolicy:
        this.documentSet = DocumentSetEnum.PolicyCancellation;
        break;
      case CaseType.MemberRelations:
        this.documentSet = DocumentSetEnum.MemberRelations;
        break;
      case CaseType.MovePolicies:
        this.documentSet = DocumentSetEnum.MoveBrokerPolicies;
        break;
      case CaseType.ReinstatePolicy:
        this.documentSet = DocumentSetEnum.PolicyReinstatement;
        break;
      case CaseType.ContinuePolicy:
        this.documentSet = DocumentSetEnum.PolicyContinuation;
        break;
      case CaseType.MaintainRefundOverPayment:
        this.documentSet = DocumentSetEnum.MaintainRefundOverpayment;
        break;
      case CaseType.GroupPolicyMember:
        this.documentSet = DocumentSetEnum.PolicyMaintanance;
        break;
      case CaseType.LapsePolicy:
        this.documentSet = DocumentSetEnum.LapsePolicyDocumentSet;
        break;
      case CaseType.CancelCoidPolicy:
        this.documentSet = DocumentSetEnum.CoidPolicyCancellation;
        break;
      case CaseType.ChangePolicyStatus:
        this.documentSet = DocumentSetEnum.PolicyStatusChange;
        break;
      case CaseType.MovePolicyScheme:
        this.documentSet = DocumentSetEnum.MovePolicyScheme;
        break;
      case CaseType.UpgradeDowngradePolicy:
        this.documentSet = DocumentSetEnum.UpgradeDowngradePolicy;
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
