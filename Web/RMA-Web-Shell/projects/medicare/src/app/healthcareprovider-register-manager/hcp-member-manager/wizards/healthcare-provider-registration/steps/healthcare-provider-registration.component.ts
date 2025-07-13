import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { BehaviorSubject } from 'rxjs';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  templateUrl: './healthcare-provider-registration.component.html',
  styleUrls: ['./healthcare-provider-registration.component.css'],
})
export class HealthcareProviderRegistrationComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingIndustryClassConfiguration$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  documentSet = DocumentSetEnum.BankStatement;
  documentSets: DocumentSetEnum[] = [DocumentSetEnum.BankStatement, DocumentSetEnum.MemberDocumentSet];
  documentTypeFilter: DocumentTypeEnum[] = [];
  requiredDocumentsUploaded = false;
  title:string = 'Review New Healthcare Provider Registration:'

  currentCoverPeriodEndDate: Date;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
   
   }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
        return validationResult;
  }


}
