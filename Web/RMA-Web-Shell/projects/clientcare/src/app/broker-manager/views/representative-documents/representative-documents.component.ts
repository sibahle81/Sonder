import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { Representative } from '../../models/representative';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'representative-documents',
  templateUrl: '../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html'
})
export class RepresentativeDocumentsComponent extends DocumentManagementComponent<Representative> {
  documentSet = DocumentSetEnum.NaturalRepresentative;
  system = ServiceTypeEnum[ServiceTypeEnum.BrokerageManager];

  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    dialog: MatDialog,
    alertService: AlertService,
    documentManagementService: DocumentManagementService,
    public activatedroute: ActivatedRoute) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
  }

  getDocumentKeys(): { [key: string]: string } {
    return {
      RepresentativeCode: this.model.code
    };
  }

  getSystemName(): string {
    return this.system;
  }

  getPersonEventId(): number {
    return null;
  }

}
