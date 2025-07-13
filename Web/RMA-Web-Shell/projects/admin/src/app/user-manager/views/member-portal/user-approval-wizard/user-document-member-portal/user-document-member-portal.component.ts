import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { DocumentManagementComponent } from 'projects/shared-components-lib/src/lib/document-management/document-management.component';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MemberPortalConstants } from 'projects/shared-models-lib/src/lib/constants/member-portal-constants';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UserRegistrationDetails } from '../../user-registration-details.model';
import { UserProfileTypeEnum } from './../../../../../../../../shared-models-lib/src/lib/enums/user-profile-type-enum';

@Component({
  selector: 'app-user-document-member-portal',
  templateUrl: '../../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.html',
  styleUrls: ['../../../../../../../../shared-components-lib/src/lib/document-management/document-management.component.css']
})
export class UserDocumentMemberPortalComponent extends DocumentManagementComponent<UserRegistrationDetails> {

  documentSet = null;
  system = ServiceTypeEnum[ServiceTypeEnum.ClientManager];
  currentItemId: number;
  id: number;
  keys: any;
  hide: boolean;

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

    if (this.model.userProfileTypeId === UserProfileTypeEnum.Broker && this.model.isVopdPassed) {
      this.hide = true;
      this.message = MemberPortalConstants.brokerDocumentsVopdSuccess;
      return;
    }

    if (this.model.idTypeEnum === IdTypeEnum.Passport_Document) {
      this.documentSet = DocumentSetEnum.UserRegistrationPassportDocuments;
    } else {
      this.documentSet = DocumentSetEnum.UserVopdFailedDocuments;
    }

    this.getInitialData();
  }

  getDocumentKeys(): { [key: string]: string } {
    if (this.model.idTypeEnum === IdTypeEnum.SA_ID_Document) {
      return {
        UserMember: `${this.model.saId}`
      };
    } else {
      return {
        UserMember: `${this.model.passportNo}`
      };
    }
  }

  getSystemName(): string {
    return this.system;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }
}
