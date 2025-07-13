import { Quote } from '@angular/compiler';
import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { DocumentManagementComponent } from 'src/app/shared/components/document-management/document-management.component';
import { DocumentManagementService } from 'src/app/shared/components/document-management/document-management.service';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { ServiceType } from 'src/app/shared/enums/service-type.enum';
import { DocumentsRequest } from 'src/app/shared/models/documents-request.model';
import { Policy } from 'src/app/shared/models/policy';
import { AlertService } from 'src/app/shared/services/alert.service';
import { BrokerPolicyListComponent } from '../broker-policy-list/broker-policy-list.component';

@Component({
  selector: 'app-policy-documents-upload',
  templateUrl: '../../shared/components/document-management/document-management.component.html',
  styleUrls: ['../../shared/components/document-management/document-management.component.css']
})
export class PolicyDocumentsUploadComponent extends DocumentManagementComponent<Policy> implements AfterViewInit  {
  @Input() policyId: number;
  data: any;
  system = ServiceType[ServiceType.PolicyManager];
  documentSet: DocumentSetEnum.ConsolidatedFuneralPolicyDocuments;
 
  ngAfterViewInit() {
    this.documentsRequest = new DocumentsRequest();
    this.documentsRequest.system = this.system;
    this.documentsRequest.keys = this.getDocumentKeys();
    this.documentsRequest.documentSet = DocumentSetEnum.ConsolidatedFuneralPolicyDocuments;
    this.getDataValues();
  }

  getDocumentKeys(): { [key: string]: string } {
    return { PolicyId: `${this.data.policyId}`};
  }

  getSystemName(): string {
    return this.system;
  }


  constructor(
    public dialogRef: MatDialogRef<BrokerPolicyListComponent>,
    @Inject(MAT_DIALOG_DATA) data,
 
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
      this.data = data;
  }

  ngOnInit(): void {
  }

}
