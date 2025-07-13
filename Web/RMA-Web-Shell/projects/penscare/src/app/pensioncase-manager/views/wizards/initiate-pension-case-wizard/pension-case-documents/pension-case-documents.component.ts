import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';

@Component({
  selector: 'app-pension-case-documents',
  templateUrl: './pension-case-documents.component.html',
  styleUrls: ['./pension-case-documents.component.css']
})
export class PensionCaseDocumentsComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {

  @Input() pensionCaseContext: PensionCaseContextEnum;
  pensionCaseModel: InitiatePensionCaseData;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);

  }

  ngOnInit() {
  }

  createForm(id: number): void {
  }
  onLoadLookups(): void {
  }
  populateModel(): void {
  }
  populateForm(): void {
    if (this.model && this.model.pensionCase) {
      this.pensionCaseModel = this.model;
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
