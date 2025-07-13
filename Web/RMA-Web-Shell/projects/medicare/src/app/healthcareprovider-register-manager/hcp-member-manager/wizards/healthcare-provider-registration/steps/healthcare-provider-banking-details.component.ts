import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-healthcare-provider-banking-details',
  templateUrl: './healthcare-provider-banking-details.component.html',
  styleUrls: ['./healthcare-provider-banking-details.component.css']
})
export class HealthcareProviderBankingDetailsComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {

  
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingIndustryClassConfiguration$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  documentSet = DocumentSetEnum.HealthcareProviderRegistrationDocuments;
  documentTypeFilter: DocumentTypeEnum[] = [];
  requiredDocumentsUploaded = false;
  title:string = 'Review healthcare provider updated banking details: ';

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
