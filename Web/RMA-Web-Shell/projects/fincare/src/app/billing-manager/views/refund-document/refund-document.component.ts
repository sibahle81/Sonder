import { Component, OnInit } from '@angular/core';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { Refund } from '../../models/refund';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';

@Component({
  selector: 'refund-document',
  templateUrl: './refund-document.component.html'
})
export class RefundDocumentComponent  extends DocumentManagementComponent<Refund> {
  documentSet = DocumentSetEnum.MaintainRefundOverpayment;
  system = ServiceTypeEnum[ServiceTypeEnum.BillingManager];

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
      refundOverPayment: `${this.model.rolePlayerId}`
    };
  }
  getSystemName(): string {
    return this.system;
  }

  getPersonEventId(): number {
    return null;
  }
}
