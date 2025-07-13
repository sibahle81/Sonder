import { AfterViewInit, Component, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'member-documents',
  templateUrl: '../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})

export class MemberDocumentsComponent extends DocumentManagementComponent<RolePlayer> implements AfterViewInit {

  addPermission = 'Add Member';
  editPermission = 'Edit Member';
  viewPermission = 'View Member';

  @Input() rolePlayerId: number;
  @Output() requiredDocumentsUploaded = this.requiredDocumentsUploaded;

  system = ServiceTypeEnum[ServiceTypeEnum.QuoteManager];
  documentSet: DocumentSetEnum.MemberDocumentSet;

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
    this.documentsRequest.documentSet = DocumentSetEnum.MemberDocumentSet;
    this.getDataValues();
  }

  getDocumentKeys(): { [key: string]: string } {
    return { MemberId: `${this.rolePlayerId.toString()}` };
  }

  getSystemName(): string {
    return this.system;
  }

}
