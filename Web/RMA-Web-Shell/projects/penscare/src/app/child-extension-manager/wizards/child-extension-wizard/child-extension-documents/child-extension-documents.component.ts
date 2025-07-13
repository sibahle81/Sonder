import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-child-extension-documents',
  templateUrl: './child-extension-documents.component.html',
  styleUrls: ['./child-extension-documents.component.css']
})
export class ChildExtensionDocumentsComponent extends WizardDetailBaseComponent<ChildToAdultPensionLedger> implements OnInit {
  pensionCaseContext = PensionCaseContextEnum.ManageChildExtenion;
  childExtensionModel: ChildToAdultPensionLedger;
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
    if (this.model) {
      this.childExtensionModel = this.model;
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
