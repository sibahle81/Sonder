
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { ClaimInvestigationModel } from '../../../shared/entities/funeral/claim-investigation-model';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';

@Component({
  selector: 'claim-investigation-claims-document',
  templateUrl: './../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html',
  styleUrls: ['./../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.css']
})

export class ClaimInvestigationClaimsDocumentComponent extends DocumentManagementComponent<ClaimInvestigationModel> {

  documentSet = null;
  system = ServiceTypeEnum[ServiceTypeEnum.ClaimManager];
  currentItemId: number;
  id: number;
  keys: any;

  constructor(
    privateAppEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    dialog: MatDialog,
    alertService: AlertService,
    documentManagementService: DocumentManagementService,
    public documentManagementServices: DocumentManagementService,
    public dialogs: MatDialog,
    public activatedroute: ActivatedRoute,
  ) {
    super(privateAppEventsManager, authService, activatedRoute, dialog, alertService, documentManagementService);
  }

  populateForm(): void {
    this.documentSet =  this.model.claimDocumentSet;
    this.getInitialData();
  }

  getDocumentKeys(): { [key: string]: string } {
    return {
      PersonEvent: `${this.model.personEventId}`
    };
  }

  getSystemName(): string {
    return this.system;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  filterMenu(item: any) {
    this.menus = null;
    switch (item.documentStatus) {
      case DocumentStatusEnum.Accepted:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
        ];
        break;
      case DocumentStatusEnum.Waived:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
        ];
        break;
      case DocumentStatusEnum.Deleted:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
        ];
        break;
      case DocumentStatusEnum.Received:
        this.menus = [
          { title: 'Download', url: '', disable: false },
          { title: 'View', url: '', disable: false },
        ];
        break;
      case DocumentStatusEnum.Awaiting:
        this.menus = [
          { title: 'Download', url: '', disable: true },
          { title: 'View', url: '', disable: true },
        ];
        break;
      default:
        this.menus = [
          { title: 'Download', url: '', disable: true },
          { title: 'View', url: '', disable: true },
        ];
    }
  }
}
