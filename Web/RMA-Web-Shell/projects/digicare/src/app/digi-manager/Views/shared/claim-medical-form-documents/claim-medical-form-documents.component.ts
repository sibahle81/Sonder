import { AfterViewChecked, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'claim-medical-form-documents',
  templateUrl: '../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class ClaimMedicalFormDocumentsComponent extends DocumentManagementComponent<ProgressMedicalReportForm> implements OnInit {
  @Input() personEvent: any;
  @Input() documentSetType: DocumentSetEnum;

  system = ServiceTypeEnum[ServiceTypeEnum.DigiCareManager];
  documentSet: DocumentSetEnum.DigiCareFirstMedicalReport;

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
  }

 ngOnInit(): void {
  this.showAdditionalDocumentsButton = false;
  this.documentsRequest = new DocumentsRequest();
  this.documentsRequest.system = this.system;
  this.documentsRequest.keys = this.getDocumentKeys();
  this.documentsRequest.documentSet = this.documentSetType;
  this.getDataValues();
 }

  getDocumentKeys(): { [key: string]: string } {
    return { PersonEvent: `${this.personEvent}` };
  }

  getSystemName(): string {
    return this.system;
  }

  filterMenu(item: any) {
    this.menus = null;
    this.menus = [
      { title: 'Download', url: '', disable: false },
      { title: 'View', url: '', disable: false }
    ];
  }

}
