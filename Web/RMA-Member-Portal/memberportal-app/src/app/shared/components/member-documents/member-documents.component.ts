import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DocumentManagementComponent } from "src/app/shared/components/document-management/document-management.component";
import { DocumentManagementService } from "src/app/shared/components/document-management/document-management.service";
import { DocumentsRequest } from "src/app/shared/models/documents-request.model";
import { DocumentSetEnum } from "src/app/shared/enums/document-set.enum";
import { ServiceType } from "src/app/shared/enums/service-type.enum";
import { AlertService } from "src/app/shared/services/alert.service";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { RolePlayer } from 'src/app/shared/models/roleplayer';


@Component({
    selector: 'member-documents',
    templateUrl: '../../../shared/components/document-management/document-management.component.html'
  })


  export class MemberDocumentsComponent extends DocumentManagementComponent<RolePlayer> implements AfterViewInit {

    @Input() memberNumber: string;
    system = ServiceType[ServiceType.QuoteManager];
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
      return { Member: `${this.memberNumber}`};
    }
  
    getSystemName(): string {
      return this.system;
    }
  
  }